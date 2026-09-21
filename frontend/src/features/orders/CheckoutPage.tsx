import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { cartApi, type ValidatedCartItem } from '../cart/cartApi';
import { discountsApi } from '../cart/discountsApi';
import { ordersApi, type ShippingAddress } from './ordersApi';
import { accountApi, type Address } from '../account/accountApi';
import { useToast } from '../../shared/context/ToastContext';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { Spinner } from '../../shared/components/ui/Spinner';
import { useLanguage } from '../../shared/context/LanguageContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FREE_SHIPPING_THRESHOLD = 80;
const ZIP_RE = /^[a-zA-Z0-9\s-]{3,20}$/;

const SHIPPING = {
  standard: { id: 'standard' as const, label: 'Standard Ground', fee: 8, eta: '3–5 business days' },
  express: { id: 'express' as const, label: 'Express Courier', fee: 15, eta: '1–2 business days' },
  white_glove: { id: 'white_glove' as const, label: 'White-Glove Archival', fee: 22, eta: '2–4 days · signature' },
};

type FieldErrors = Partial<
  Record<
    'email' | 'firstName' | 'lastName' | 'street' | 'city' | 'state' | 'zipCode' | 'country' | 'phone',
    string
  >
>;

function sanitizeText(value: string, max: number): string {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl" aria-busy="true" aria-label="Loading checkout">
      <div className="lg:col-span-7 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface-container-low p-space-lg space-y-4">
            <div className="h-5 w-40 rounded animate-shimmer" />
            <div className="h-10 w-full rounded animate-shimmer" />
            <div className="h-10 w-full rounded animate-shimmer" />
          </div>
        ))}
      </div>
      <div className="lg:col-span-5">
        <div className="rounded-xl bg-surface-container-low p-space-lg space-y-4">
          <div className="h-5 w-32 rounded animate-shimmer" />
          <div className="h-16 w-full rounded animate-shimmer" />
          <div className="h-16 w-full rounded animate-shimmer" />
          <div className="h-10 w-full rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full bg-surface-container rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
    hasError ? 'ring-2 ring-error/60' : ''
  }`;

export function CheckoutPage() {
  const { t, formatCurrency, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const locationDiscount = (location.state as { discountCode?: string } | null)?.discountCode;

  const [cartItems, setCartItems] = useState<ValidatedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Saved addresses from profile
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingId, setShippingId] = useState<keyof typeof SHIPPING>('standard');

  const [promoInput, setPromoInput] = useState(locationDiscount || '');
  const [promoCode, setPromoCode] = useState<string | null>(locationDiscount || null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Pre-fill name/email from user session
  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  // Load saved addresses from profile
  useEffect(() => {
    if (!isAuthenticated) return;
    accountApi.getProfile().then((profile) => {
      const active = (profile.addresses || []).filter((a) => !a.deletedAt);
      setSavedAddresses(active);
      // Auto-select first saved address
      if (active.length > 0) {
        setSelectedSavedIdx(0);
        const first = active[0];
        setAddress({
          street: first.street,
          city: first.city,
          state: first.state,
          zipCode: first.zipCode,
          country: first.country,
        });
      }
    }).catch(() => {
      // Silently fail — user can still type manually
    });
  }, [isAuthenticated]);

  const loadCart = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const items = await cartApi.getCart();
      if (signal?.aborted) return;
      const mapped = (items as Array<{ product?: { _id?: string }; productId?: string; quantity: number }>).map(
        (item) => ({
          productId: String(item.productId || item.product?._id || ''),
          quantity: item.quantity,
        })
      ).filter((i) => i.productId);

      const validatedItems = await cartApi.validateCart(mapped);
      if (signal?.aborted) return;
      setCartItems(validatedItems);
    } catch (err: unknown) {
      const e = err as { name?: string; code?: string };
      if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
      showToast({ message: t.checkout?.loadCartError || 'Failed to load cart', type: 'error' });
      setCartItems([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    loadCart(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, loadCart]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD && shippingId === 'standard'
      ? 0
      : SHIPPING[shippingId].fee;
  const safeDiscount = Math.min(discountAmount, subtotal);
  const total = Math.max(0, subtotal - safeDiscount) + shippingFee;

  const applyPromo = async (codeRaw: string) => {
    const code = codeRaw.trim().toUpperCase().slice(0, 20);
    if (code.length < 3 || cartItems.length === 0) {
      setPromoError(t.checkout?.invalidPromo || 'Enter a valid code.');
      return;
    }
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await discountsApi.validateCode(
        code,
        cartItems.map((i) => ({ product: i.productId, quantity: i.quantity }))
      );
      if (!res.applied || res.discountAmount <= 0) {
        setPromoError(t.checkout?.invalidExpiredPromo || 'Invalid or expired code.');
        setPromoCode(null);
        setDiscountAmount(0);
        return;
      }
      setPromoCode(code);
      setDiscountAmount(res.discountAmount);
      setPromoInput('');
    } catch {
      setPromoError(t.checkout?.invalidExpiredPromo || 'Invalid or expired code.');
      setPromoCode(null);
      setDiscountAmount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    if (locationDiscount && cartItems.length > 0 && !discountAmount) {
      applyPromo(locationDiscount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationDiscount, cartItems.length]);

  const validateForm = (): boolean => {
    const next: FieldErrors = {};
    const cleanEmail = sanitizeText(email, 100).toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) next.email = t.checkout?.emailInvalid || 'Enter a valid email address.';
    if (sanitizeText(firstName, 50).length < 1) next.firstName = t.checkout?.fieldRequired || 'First name is required.';
    if (sanitizeText(lastName, 50).length < 1) next.lastName = t.checkout?.fieldRequired || 'Last name is required.';

    const cleanStreet = sanitizeText(address.street, 200);
    if (cleanStreet.length < 5) next.street = 'Street address must be at least 5 characters.';

    const cleanCity = sanitizeText(address.city, 100);
    if (cleanCity.length < 2) next.city = 'City must be at least 2 characters.';
    else if (!/^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(cleanCity)) next.city = 'City should contain only letters, spaces, hyphens, or apostrophes.';

    const cleanState = sanitizeText(address.state, 100);
    if (cleanState.length < 2) next.state = 'State / Province must be at least 2 characters.';

    const cleanZip = sanitizeText(address.zipCode, 20);
    if (!ZIP_RE.test(cleanZip)) next.zipCode = 'Enter a valid postal code (letters, digits, spaces, hyphens).';

    if (sanitizeText(address.country, 100).length < 1) next.country = 'Country is required.';

    if (phone && phone.replace(/\D/g, '').length > 0) {
      const digits = phone.replace(/\D/g, '').length;
      if (digits < 7 || digits > 15) next.phone = 'Enter a valid phone number (7–15 digits) or leave blank.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast({ message: t.checkout?.signInFirst || 'Please sign in first', type: 'error' });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cartItems.length === 0) {
      showToast({ message: t.checkout?.cartEmptyToast || 'Your cart is empty', type: 'error' });
      return;
    }
    if (!validateForm() || submitting) return;

    const shippingAddress: ShippingAddress = {
      street: sanitizeText(address.street, 200),
      city: sanitizeText(address.city, 100),
      state: sanitizeText(address.state, 100),
      zipCode: sanitizeText(address.zipCode, 20),
      country: sanitizeText(address.country, 100),
    };

    try {
      setSubmitting(true);
      const order = await ordersApi.createOrder({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        ...(promoCode ? { discountCode: promoCode } : {}),
      });

      const { url } = await ordersApi.createCheckoutSession(order._id || order.id!);
      if (!url || !/^https:\/\//i.test(url)) {
        throw new Error(t.checkout?.invalidPayment || 'Invalid payment redirect');
      }
      await clearCart();
      window.location.href = url;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      const serverErrors = (error as any)?.response?.data?.errors;
      const message = status === 503
        ? 'Payments are temporarily unavailable. Please try again later.'
        : (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0)
          ? serverErrors[0].message
          : (error as any)?.response?.data?.message || t.checkout?.placeOrderError || 'Failed to place order or start payment';
      showToast({ message, type: 'error' });
      setSubmitting(false);
    }
  };

  const onAddress =
    (field: keyof ShippingAddress) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAddress((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      // When user edits manually, deselect saved address
      setSelectedSavedIdx(null);
    };

  const selectSavedAddress = (idx: number) => {
    const addr = savedAddresses[idx];
    setSelectedSavedIdx(idx);
    setAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
    });
    // Clear any existing field errors
    setErrors({});
  };

  const handleSaveAddressToProfile = async () => {
    const cleanStreet = sanitizeText(address.street, 200);
    const cleanCity = sanitizeText(address.city, 100);
    const cleanState = sanitizeText(address.state, 100);
    const cleanZip = sanitizeText(address.zipCode, 20);
    const cleanCountry = sanitizeText(address.country, 100);

    // Validate before saving
    const next: FieldErrors = {};
    if (cleanStreet.length < 5) next.street = 'Street address must be at least 5 characters.';
    if (cleanCity.length < 2) next.city = 'City must be at least 2 characters.';
    if (cleanState.length < 2) next.state = 'State / Province must be at least 2 characters.';
    if (!ZIP_RE.test(cleanZip)) next.zipCode = 'Enter a valid postal code.';
    if (!cleanCountry) next.country = 'Country is required.';
    if (Object.keys(next).length > 0) {
      setErrors((prev) => ({ ...prev, ...next }));
      showToast({ message: t?.checkout?.addrFixFields || 'Please fix the address fields before saving.', type: 'error' });
      return;
    }

    if (savedAddresses.length >= 10) {
      showToast({ message: t?.checkout?.addrMaxReached || 'You have reached the maximum of 10 saved addresses. Remove one first.', type: 'error' });
      return;
    }

    const newAddr: Address = { street: cleanStreet, city: cleanCity, state: cleanState, zipCode: cleanZip, country: cleanCountry };

    setSavingAddress(true);
    try {
      const profile = await accountApi.getProfile();
      const current = (profile.addresses || []).filter((a) => !a.deletedAt);
      if (current.length >= 10) {
        showToast({ message: t?.checkout?.addrMaxReached || 'You have reached the maximum of 10 saved addresses. Remove one first.', type: 'error' });
        return;
      }
      const updated = await accountApi.updateProfile({ addresses: [...current, newAddr] });
      const active = (updated.addresses || []).filter((a) => !a.deletedAt);
      setSavedAddresses(active);
      setSelectedSavedIdx(active.length - 1);
      showToast({ message: t?.checkout?.addrSaveSuccess || 'Address saved to your account!', type: 'success' });
    } catch {
      showToast({ message: t?.checkout?.addrSaveError || 'Could not save address to your account. Try again.', type: 'error' });
    } finally {
      setSavingAddress(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-margin-mobile py-space-2xl text-center animate-fade-in">
        <Icon name="lock" className="text-[40px] text-primary mx-auto mb-4" />
        <h1 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t.checkout?.signInToCheckout || 'Sign in to checkout'}</h1>
        <p className="font-body-md text-on-surface-variant mb-6">
          {t.checkout?.accountRequired || 'An Atelier account is required to commission editions and complete secure payment.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button as="link" to="/login">
            {t.checkout?.signInBtn || 'Sign In'}
          </Button>
          <Button as="link" to="/register" variant="outline">
            {t.checkout?.createAccountBtn || 'Create Account'}
          </Button>
        </div>
      </div>
    );
  }

  if (user && user.isEmailVerified === false) {
    return (
      <div className="max-w-lg mx-auto px-margin-mobile py-space-2xl text-center animate-fade-in">
        <Icon name="mail" className="text-[40px] text-primary mx-auto mb-4" />
        <h1 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t.checkout?.verifyEmailTitle || 'Verify your email to check out'}</h1>
        <p className="font-body-md text-on-surface-variant mb-6">
          {(t.checkout?.verifyEmailDesc || 'We sent a verification code to {{email}}. Confirm it before placing an order — your cart is saved.').replace('{{email}}', user.email)}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => navigate('/verify-email', { state: { email: user.email, from: '/checkout' } })}
          >
            {t.checkout?.verifyEmailBtn || 'Verify Email'}
          </Button>
          <Button as="link" to="/cart" variant="outline">
            {t.checkout?.returnToBag || 'Return to Bag'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile md:px-margin pb-space-2xl pt-space-md">
      <div className="mb-space-lg flex items-center justify-between gap-4 animate-slide-up">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors rtl:-scale-x-100"
        >
          <Icon name="chevron_left" size={16} />
          {t.checkout?.returnToBag || 'Return to Bag'}
        </Link>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">{t.checkout?.secureCheckout || 'Secure Checkout'}</h1>
      </div>

      <section aria-label={t?.common?.checkoutProgress || "Checkout progress"} className="w-full mb-space-xl animate-fade-in">
        <div className="bg-surface-container-low rounded-xl p-space-md md:p-space-lg">
          <ol className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            {[
              { n: '01', label: t.checkout?.shipping || 'Shipping' },
              { n: '02', label: t.checkout?.delivery || 'Delivery' },
              { n: '03', label: t.checkout?.payment || 'Payment' },
            ].map((step, i) => (
              <li key={step.n} className="flex items-center gap-space-sm">
                <span
                  className={`w-8 h-8 rounded-full font-label-caps text-label-caps flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  {step.n}
                </span>
                <span className="font-headline-sm text-sm text-on-surface">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {loading ? (
        <CheckoutSkeleton />
      ) : cartItems.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <Icon name="shopping_bag" className="text-6xl text-outline mb-space-sm mx-auto" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t.checkout?.emptyCart || 'Your cart is empty'}</h2>
          <p className="font-body-md text-on-surface-variant mb-6">{t.checkout?.addEditions || 'Add editions before checking out.'}</p>
          <Button as="link" to="/products">
            {t.checkout?.exploreCatalog || 'Explore Catalog'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start animate-fade-in" noValidate>
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* Contact */}
            <section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-2.5">
                <Icon name="person_outline" className="text-primary" size={20} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">1. {t.checkout?.contact || 'Contact'}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="contact-email">
                    {t.checkout?.email || 'Email'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    maxLength={100}
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    className={inputClass(Boolean(errors.email))}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="text-[11px] text-error" role="alert">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="contact-phone">
                    {t.checkout?.phoneOptional || 'Phone (optional)'}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    className={inputClass(Boolean(errors.phone))}
                  />
                  {errors.phone && <p className="text-[11px] text-error" role="alert">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* Shipping Destination */}
            <section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-2.5">
                <Icon name="location_on" className="text-primary" size={20} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">2. {t.checkout?.shippingDestination || 'Shipping destination'}</h2>
              </div>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="font-label-md text-label-md text-on-surface-variant">{t.checkout?.savedAddresses || 'Your saved addresses'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedSavedIdx === idx;
                      return (
                        <button
                          key={addr._id || idx}
                          type="button"
                          onClick={() => selectSavedAddress(idx)}
                          className={`text-left p-3 rounded-xl border transition-all text-xs leading-relaxed ${
                            isSelected
                              ? 'border-primary-container bg-primary/5 ring-2 ring-primary-container/40'
                              : 'border-outline-variant/30 bg-surface-container hover:border-primary-container/40 hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-on-surface uppercase tracking-wider text-[10px]">
                              {(t.checkout?.addressNum || 'Address {{idx}}').replace('{{idx}}', (idx + 1).toString())}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-0.5 text-primary text-[10px] font-semibold shrink-0">
                                <Icon name="check_circle" size={12} /> {t.checkout?.selected || 'Selected'}
                              </span>
                            )}
                          </div>
                          <p className="text-on-surface font-medium">{addr.street}</p>
                          <p className="text-on-surface-variant">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-on-surface-variant">{addr.country}</p>
                        </button>
                      );
                    })}

                    {/* Enter new address option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSavedIdx(null);
                        setAddress({ street: '', city: '', state: '', zipCode: '', country: 'US' });
                        setErrors({});
                      }}
                      className={`text-left p-3 rounded-xl border transition-all text-xs min-h-[80px] flex flex-col items-center justify-center gap-1 ${
                        selectedSavedIdx === null
                          ? 'border-primary-container bg-primary/5 ring-2 ring-primary-container/40'
                          : 'border-dashed border-outline-variant/40 bg-surface-container-lowest hover:border-primary-container/40 hover:bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icon name="add_location" size={18} className={selectedSavedIdx === null ? 'text-primary' : 'text-outline'} />
                      <span className={`font-semibold tracking-wider uppercase text-[10px] ${selectedSavedIdx === null ? 'text-primary' : ''}`}>
                        {t.checkout?.enterNewAddress || 'Enter new address'}
                      </span>
                    </button>
                  </div>
                  <div className="border-t border-outline-variant/20 pt-2 mt-2" />
                </div>
              )}

              {/* Address form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="first-name" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.firstName || 'First name'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="first-name"
                    autoComplete="given-name"
                    maxLength={50}
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
                    }}
                    className={inputClass(Boolean(errors.firstName))}
                  />
                  {errors.firstName && <p className="text-[11px] text-error" role="alert">{errors.firstName}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="last-name" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.lastName || 'Last name'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="last-name"
                    autoComplete="family-name"
                    maxLength={50}
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined }));
                    }}
                    className={inputClass(Boolean(errors.lastName))}
                  />
                  {errors.lastName && <p className="text-[11px] text-error" role="alert">{errors.lastName}</p>}
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="street" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.streetAddress || 'Street address'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="street"
                    autoComplete="street-address"
                    maxLength={200}
                    required
                    value={address.street}
                    onChange={onAddress('street')}
                    className={inputClass(Boolean(errors.street))}
                  />
                  {errors.street && <p className="text-[11px] text-error" role="alert">{errors.street}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.city || 'City'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="city"
                    autoComplete="address-level2"
                    maxLength={100}
                    required
                    value={address.city}
                    onChange={onAddress('city')}
                    className={inputClass(Boolean(errors.city))}
                  />
                  {errors.city && <p className="text-[11px] text-error" role="alert">{errors.city}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="state" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.stateProvince || 'State / Province'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="state"
                    autoComplete="address-level1"
                    maxLength={100}
                    required
                    value={address.state}
                    onChange={onAddress('state')}
                    className={inputClass(Boolean(errors.state))}
                  />
                  {errors.state && <p className="text-[11px] text-error" role="alert">{errors.state}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="zip" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.postalCode || 'Postal code'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="zip"
                    autoComplete="postal-code"
                    maxLength={20}
                    required
                    value={address.zipCode}
                    onChange={onAddress('zipCode')}
                    className={inputClass(Boolean(errors.zipCode))}
                  />
                  {errors.zipCode && <p className="text-[11px] text-error" role="alert">{errors.zipCode}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="country" className="font-label-md text-label-md text-on-surface-variant">
                    {t.checkout?.country || 'Country'} <span className="text-primary">*</span>
                  </label>
                  <select
                    id="country"
                    autoComplete="country"
                    value={address.country}
                    onChange={onAddress('country')}
                    className={inputClass(Boolean(errors.country))}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  {errors.country && <p className="text-[11px] text-error" role="alert">{errors.country}</p>}
                </div>
              </div>

              {/* Save address to profile button */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveAddressToProfile}
                  disabled={savingAddress}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-container font-medium transition-colors disabled:opacity-50"
                >
                  {savingAddress ? <Spinner size="sm" color="current" /> : <Icon name="bookmark_add" size={14} />}
                  {savingAddress ? (t.checkout?.saving || 'Saving…') : (t.checkout?.saveToAccount || 'Save this address to my account')}
                </button>
              </div>
            </section>

            {/* Delivery method */}
            <section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-2.5">
                <Icon name="local_shipping" className="text-primary" size={20} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">3. {t.checkout?.deliveryMethod || 'Delivery method'}</h2>
              </div>
              <div className="flex flex-col gap-space-sm">
                {(Object.values(SHIPPING) as Array<(typeof SHIPPING)[keyof typeof SHIPPING]>).map((method) => {
                  const fee =
                    method.id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : method.fee;
                  const selected = shippingId === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-space-md rounded-lg cursor-pointer transition-all border ${
                        selected
                          ? 'bg-surface-container-high border-primary-container/40'
                          : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center gap-space-md">
                        <input
                          type="radio"
                          name="shipping_method"
                          className="accent-primary"
                          checked={selected}
                          onChange={() => setShippingId(method.id)}
                        />
                        <div>
                          <span className="font-headline-sm text-sm text-on-surface font-semibold block">
                            {method.label}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{method.eta}</span>
                        </div>
                      </div>
                      <span className="font-headline-sm text-primary font-semibold tabular-nums">
                        {fee === 0 ? (t.checkout?.free || 'Free') : formatCurrency(fee)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Payment */}
            <section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon name="lock" className="text-primary" size={20} />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">4. {t.checkout?.payment || 'Payment'}</h2>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <Icon name="verified_user" size={14} className="text-primary" />
                  {t.checkout?.stripeSecure || 'Stripe Secure'}
                </span>
              </div>
              <div className="bg-surface-container p-3 rounded-lg text-on-surface-variant text-sm flex gap-2">
                <Icon name="info" className="text-primary shrink-0" size={18} />
                <span>
                  {t.checkout?.stripeInfo || "Card details are never collected on this site. You will complete payment on Stripe's encrypted checkout."}
                </span>
              </div>
            </section>

            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
              <Button type="submit" disabled={submitting} isLoading={submitting} className="w-full" size="lg" icon="lock">
                {t.checkout?.proceedToPayment || 'Proceed to Payment'} · {formatCurrency(total)}
              </Button>
              <p className="font-body-sm text-body-sm text-outline text-center leading-relaxed">
                {t.checkout?.termsAgree || 'By continuing you agree to MissingPiece purchase terms and the Lifetime Piece Replacement Policy.'}
              </p>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md flex flex-col gap-space-md sticky top-28">
              <div className="flex items-center justify-between pb-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t.checkout?.orderSummary || 'Order Summary'}</h2>
                <span className="font-label-caps text-label-caps uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-primary">
                  {cartItems.length} {cartItems.length === 1 ? (t.checkout?.item || 'item') : (t.checkout?.items || 'items')}
                </span>
              </div>

              <ul className="flex flex-col gap-space-md max-h-80 overflow-y-auto pe-1">
                {cartItems.map((item) => (
                  <li key={item.productId} className="flex items-center gap-space-md p-2 rounded-lg bg-surface-container">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-surface-container-lowest shrink-0 relative">
                      {item.imageUrl ? (
                        <img className="w-full h-full object-cover" src={item.imageUrl} alt="" />
                      ) : null}
                      <span className="absolute bottom-0.5 end-0.5 text-[10px] bg-surface/90 px-1 rounded text-primary font-bold">
                        {item.quantity}×
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-headline-sm text-sm text-on-surface truncate">{item.title}</span>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-outline">{t.checkout?.qty || 'Qty'} {item.quantity}</span>
                        <span className="text-sm text-primary font-semibold tabular-nums">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-space-xs border-t border-outline-variant/20">
                <label htmlFor="checkout-promo" className="sr-only">
                  Promo code
                </label>
                <input
                  id="checkout-promo"
                  className="flex-1 bg-surface-container rounded-lg px-space-md py-2 text-xs text-on-surface uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder={t.checkout?.promoPlaceholder || "Atelier code"}
                  maxLength={20}
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    if (promoError) setPromoError('');
                  }}
                />
                <button
                  type="button"
                  disabled={promoLoading || !promoInput.trim()}
                  onClick={() => applyPromo(promoInput)}
                  className="px-space-md py-2 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {promoLoading ? <Spinner size="sm" /> : (t.checkout?.apply || 'Apply')}
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-error" role="alert">
                  {promoError}
                </p>
              )}
              {promoCode && !promoError && (
                <p className="text-[11px] text-primary flex items-center gap-1">
                  <Icon name="check" size={12} /> {promoCode} (−{formatCurrency(safeDiscount)})
                  <button
                    type="button"
                    className="underline ms-1 text-outline"
                    onClick={() => {
                      setPromoCode(null);
                      setDiscountAmount(0);
                    }}
                  >
                    {t.checkout?.remove || 'Remove'}
                  </button>
                </p>
              )}

              <div className="bg-surface-container rounded-lg p-space-md flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{t.checkout?.subtotal || 'Subtotal'}</span>
                  <PriceDisplay amount={subtotal} size="sm" className="text-on-surface" />
                </div>
                {safeDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>{t.checkout?.discount || 'Discount'}</span>
                    <span className="tabular-nums">−{formatCurrency(safeDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{t.checkout?.courier || 'Courier'}</span>
                  <span className="tabular-nums text-on-surface">
                    {shippingFee === 0 ? (t.checkout?.complimentary || 'Complimentary') : formatCurrency(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
                    {t.checkout?.total || 'Total'}
                  </span>
                  <p className="text-[0.75rem] text-on-surface-variant">
                    {new Intl.DisplayNames([language === 'ar' ? 'ar-EG' : 'en-US'], { type: 'currency' }).of('USD')}
                  </p>
                </div>
                <PriceDisplay amount={total} size="xl" className="text-primary" />
              </div>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

// ── Country list ────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' }, { code: 'CV', name: 'Cabo Verde' }, { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' }, { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' }, { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' }, { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' }, { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' }, { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' }, { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' }, { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' }, { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' }, { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' }, { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' }, { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' }, { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' }, { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' }, { code: 'KG', name: 'Kyrgyzstan' }, { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' }, { code: 'LB', name: 'Lebanon' }, { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libya' }, { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' }, { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' }, { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' }, { code: 'MT', name: 'Malta' }, { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' }, { code: 'MU', name: 'Mauritius' }, { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' }, { code: 'MD', name: 'Moldova' }, { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' }, { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' }, { code: 'MM', name: 'Myanmar' }, { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' }, { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' }, { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' }, { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' }, { code: 'PW', name: 'Palau' }, { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' }, { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' }, { code: 'KN', name: 'Saint Kitts and Nevis' }, { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' }, { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' }, { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' }, { code: 'SO', name: 'Somalia' }, { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' }, { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' }, { code: 'SR', name: 'Suriname' }, { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }, { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' }, { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' }, { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' }, { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' }, { code: 'TV', name: 'Tuvalu' }, { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' }, { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }, { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' }, { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' },
];

export default CheckoutPage;

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { cartApi, type ValidatedCartItem } from './cartApi';
import { discountsApi } from './discountsApi';
import { productsApi, type Product } from '../products/productsApi';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { Motion } from '../../shared/components/ui/Motion';
import { Spinner } from '../../shared/components/ui/Spinner';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';
import { useAuth } from '../auth/AuthContext';

const FREE_SHIPPING_THRESHOLD = 80;
const MAX_QTY = 10;

function CartItemSkeleton() {
  return (
    <div className="p-4 sm:p-6 flex gap-5 border-b border-outline-variant/20 last:border-0" aria-hidden>
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl animate-shimmer shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-5 w-2/3 rounded animate-shimmer" />
        <div className="h-3 w-1/3 rounded animate-shimmer" />
        <div className="h-8 w-28 rounded animate-shimmer" />
      </div>
    </div>
  );
}

export function CartPage() {
  const { t } = useLanguage() as any;
  const { cart, updateQty, removeFromCart, addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [validated, setValidated] = useState<ValidatedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [addingRecId, setAddingRecId] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const revalidate = useCallback(
    async (signal?: AbortSignal) => {
      if (cart.length === 0) {
        setValidated([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const items = await cartApi.validateCart(
          cart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
        );
        if (signal?.aborted) return;
        setValidated(items);
      } catch (err: unknown) {
        const e = err as { name?: string; code?: string };
        if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
        // Fall back to context cart so the page stays usable offline-ish
        setValidated(cart);
        showToast({ message: 'Could not re-check stock. Showing saved bag.', type: 'info' });
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [cart, showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    revalidate(controller.signal);
    return () => controller.abort();
  }, [revalidate]);

  useEffect(() => {
    const controller = new AbortController();
    setRecsLoading(true);
    productsApi
      .getAll({ sort: 'newest', limit: 6, page: 1 }, controller.signal)
      .then((data) => {
        const inCart = new Set(cart.map((c) => c.productId));
        setRecommendations(data.items.filter((p) => !inCart.has(p._id)).slice(0, 3));
      })
      .catch(() => {
        if (!controller.signal.aborted) setRecommendations([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setRecsLoading(false);
      });
    return () => controller.abort();
  }, [cart]);

  // Re-check promo when bag changes
  useEffect(() => {
    if (!promoCode || validated.length === 0) {
      if (validated.length === 0) {
        setPromoCode(null);
        setDiscountAmount(0);
      }
      return;
    }
    let cancelled = false;
    discountsApi
      .validateCode(
        promoCode,
        validated.map((i) => ({ product: i.productId, quantity: i.quantity }))
      )
      .then((res) => {
        if (cancelled) return;
        if (res.applied) setDiscountAmount(res.discountAmount);
        else {
          setPromoCode(null);
          setDiscountAmount(0);
          setPromoError('Code no longer applies to this bag.');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPromoCode(null);
        setDiscountAmount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [validated, promoCode]);

  const handleUpdateQty = async (productId: string, newQty: number, maxStock: number) => {
    if (newQty < 1 || pendingId) return;
    const capped = Math.min(newQty, maxStock, MAX_QTY);
    if (newQty > maxStock) {
      showToast({ message: `Only ${maxStock} available in the vault`, type: 'error' });
      return;
    }
    setPendingId(productId);
    try {
      await updateQty(productId, capped);
    } catch {
      showToast({ message: 'Could not update quantity', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    if (pendingId) return;
    setPendingId(productId);
    try {
      await removeFromCart(productId);
      showToast({ message: 'Removed from bag', type: 'info' });
    } catch {
      showToast({ message: 'Could not remove item', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase().slice(0, 20);
    if (!code || code.length < 3) {
      setPromoError('Enter a valid collector code.');
      return;
    }
    if (validated.length === 0) return;

    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await discountsApi.validateCode(
        code,
        validated.map((i) => ({ product: i.productId, quantity: i.quantity }))
      );
      if (!res.applied || res.discountAmount <= 0) {
        setPromoError('Invalid or expired code.');
        setPromoCode(null);
        setDiscountAmount(0);
        return;
      }
      setPromoCode(code);
      setDiscountAmount(res.discountAmount);
      setPromoInput('');
      showToast({ message: 'Collector code applied', type: 'success' });
    } catch {
      setPromoError('Invalid or expired code.');
      setPromoCode(null);
      setDiscountAmount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleAddRecommendation = async (product: Product) => {
    if (addingRecId || product.stock < 1) return;
    setAddingRecId(product._id);
    try {
      await addItem(product, 1);
      showToast({ message: 'Added to bag', type: 'success' });
    } catch {
      showToast({ message: 'Could not add edition', type: 'error' });
    } finally {
      setAddingRecId(null);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast({ message: 'Sign in to complete checkout', type: 'info' });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout', { state: promoCode ? { discountCode: promoCode } : undefined });
  };

  const subtotal = validated.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const safeDiscount = Math.min(discountAmount, subtotal);
  const estimatedTotal = Math.max(0, subtotal - safeDiscount);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const itemCount = validated.reduce((s, i) => s + i.quantity, 0);

  const showSkeleton = (loading || cartLoading) && cart.length > 0 && validated.length === 0;

  if (!loading && !cartLoading && cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-margin-mobile lg:px-margin py-space-2xl text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center text-primary-container mb-space-lg">
          <Icon name="shopping_bag" size={36} />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm">
          {t.cart?.emptyTitle || 'Your Atelier Bag is Empty'}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-xl">
          {t.cart?.emptySubtitle ||
            'No wooden puzzle editions reserved yet. Explore the collection to begin.'}
        </p>
        <EmptyState
          icon="inventory_2"
          title={t.cart?.emptyStateTitle || 'Nothing here yet'}
          description={t.cart?.emptyStateDesc || 'Explore our collection to find your missing piece.'}
          actionText={t.cart?.explore || 'Explore Handcrafted Editions'}
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg sm:py-space-xl pb-space-2xl">
      <header className={`mb-space-lg space-y-2 ${reducedMotion ? '' : 'animate-slide-up'}`}>
        <h1 className="font-headline-lg text-headline-lg sm:text-display-lg-mobile text-on-surface tracking-tight">
          {t.cart?.title || 'Your Shopping Cart'}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {t.cart?.subtitle ||
            'Each edition is laser-cut to order and registered with an archival provenance seal.'}
        </p>
      </header>

      {/* Free shipping progress */}
      <div className="mb-space-lg p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-container-high text-primary-container shrink-0">
            <Icon name="local_shipping" size={20} />
          </div>
          <div>
            {qualifiesForFreeShipping ? (
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Icon name="check" size={16} />
                You qualify for complimentary white-glove delivery
              </p>
            ) : (
              <p className="text-xs text-on-surface">
                Add{' '}
                <span className="text-primary font-semibold">
                  ${remainingForFreeShipping.toFixed(2)}
                </span>{' '}
                more for complimentary white-glove delivery.
              </p>
            )}
            <p className="text-[11px] text-outline mt-0.5">Dispatched in a wax-sealed archival box.</p>
          </div>
        </div>
        <div
          className="w-full sm:w-48 bg-surface-container-lowest h-2 rounded-full overflow-hidden border border-outline-variant/30"
          role="progressbar"
          aria-valuenow={Math.round(shippingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward free shipping"
        >
          <div
            className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-500 ease-out"
            style={{ width: `${shippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-surface-container border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
            {showSkeleton
              ? Array.from({ length: Math.min(cart.length || 2, 3) }).map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))
              : validated.map((item, index) => {
                  const productHref = item.slug
                    ? `/products/${item.slug}`
                    : `/products`;
                  const busy = pendingId === item.productId;
                  const lineTotal = item.price * item.quantity;
                  const maxQty = Math.min(item.stock, MAX_QTY);

                  return (
                    <Motion key={item.productId} delayMs={reducedMotion ? 0 : index * 50}>
                      <div
                        className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-opacity ${
                          busy ? 'opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        <div className="flex gap-4 items-center min-w-0 flex-1">
                          <Link
                            to={productHref}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/40 shrink-0"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-outline">
                                <Icon name="inventory_2" size={24} />
                              </div>
                            )}
                          </Link>
                          <div className="space-y-1 min-w-0">
                            <h2 className="font-headline-sm text-base sm:text-lg text-on-surface truncate">
                              <Link to={productHref} className="hover:text-primary transition-colors">
                                {item.title}
                              </Link>
                            </h2>
                            <p className="text-[11px] text-outline">
                              {item.stock > 0
                                ? `${item.stock} remaining in vault`
                                : 'Out of stock'}
                            </p>
                            {busy && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-primary">
                                <Spinner size="sm" /> Updating…
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
                          <div className="flex items-center rounded-lg border border-outline-variant/40 bg-surface-container-low p-1">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1 || busy}
                              onClick={() =>
                                handleUpdateQty(item.productId, item.quantity - 1, item.stock)
                              }
                              className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
                            >
                              <Icon name="remove" size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-on-surface tabular-nums" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= maxQty || busy}
                              onClick={() =>
                                handleUpdateQty(item.productId, item.quantity + 1, item.stock)
                              }
                              className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
                            >
                              <Icon name="add" size={14} />
                            </button>
                          </div>

                          <div className="text-right min-w-[72px]">
                            <PriceDisplay amount={lineTotal} size="md" className="text-primary" />
                            <p className="text-[10px] text-outline tabular-nums">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(item.productId)}
                            disabled={busy}
                            className="p-2 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                            aria-label={`Remove ${item.title}`}
                          >
                            <Icon name="delete_outline" size={18} />
                          </button>
                        </div>
                      </div>
                    </Motion>
                  );
                })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { icon: 'security', label: 'Registered Lost Piece Guarantee' },
              { icon: 'verified', label: 'Heirloom Archival Presentation Box' },
              { icon: 'lock', label: 'Encrypted Vault Payment Checkout' },
            ].map((prop) => (
              <div
                key={prop.label}
                className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center gap-3 text-xs text-on-surface-variant"
              >
                <Icon name={prop.icon} size={20} className="text-primary-container shrink-0" />
                <span>{prop.label}</span>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-xl text-on-surface">You May Also Like</h2>
              <span className="text-xs text-outline">Curated recommendations</span>
            </div>
            {recsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-outline-variant/30 p-3 space-y-3">
                    <div className="aspect-video rounded-lg animate-shimmer" />
                    <div className="h-4 w-2/3 rounded animate-shimmer" />
                    <div className="h-8 w-full rounded animate-shimmer" />
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendations.map((puzzle, i) => (
                  <Motion key={puzzle._id} delayMs={reducedMotion ? 0 : i * 70}>
                    <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-3 flex flex-col justify-between gap-3 hover:border-primary-container/40 transition-colors h-full">
                      <Link to={`/products/${puzzle.slug}`} className="relative aspect-video rounded-lg overflow-hidden bg-surface-container-low block">
                        {puzzle.images?.[0] ? (
                          <img
                            src={puzzle.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-surface/80 text-primary-container border border-primary-container/20">
                          ${puzzle.price.toFixed(0)}
                        </span>
                      </Link>
                      <div>
                        <Link
                          to={`/products/${puzzle.slug}`}
                          className="font-headline-sm text-sm text-on-surface hover:text-primary line-clamp-1"
                        >
                          {puzzle.name}
                        </Link>
                        <PriceDisplay amount={puzzle.price} size="sm" className="text-primary mt-0.5" />
                      </div>
                      <button
                        type="button"
                        disabled={puzzle.stock < 1 || addingRecId === puzzle._id}
                        onClick={() => handleAddRecommendation(puzzle)}
                        className="w-full py-1.5 rounded-lg bg-surface-container-high hover:bg-primary-container text-on-surface-variant hover:text-on-primary-container text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {addingRecId === puzzle._id ? (
                          <Spinner size="sm" color="current" />
                        ) : (
                          <Icon name="add" size={14} />
                        )}
                        <span>{puzzle.stock < 1 ? 'Out of stock' : 'Add to Bag'}</span>
                      </button>
                    </div>
                  </Motion>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 shadow-xl space-y-6 sticky top-28 animate-fade-in">
            <h2 className="font-headline-sm text-xl text-on-surface pb-3 border-b border-outline-variant/30">
              {t.cart?.orderSummary || 'Order Summary'}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>
                  Editions Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <PriceDisplay amount={subtotal} size="sm" className="text-on-surface" />
              </div>
              {safeDiscount > 0 && (
                <div className="flex items-center justify-between text-primary">
                  <span>Collector privilege ({promoCode})</span>
                  <span className="tabular-nums">−${safeDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>White-glove shipping</span>
                <span>
                  {qualifiesForFreeShipping ? (
                    <span className="text-primary font-medium">Complimentary</span>
                  ) : (
                    t.cart?.calculatedAtCheckout || 'Calculated at checkout'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Lost Piece Guarantee</span>
                <span className="text-primary-container">Included</span>
              </div>
            </div>

            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-outline-variant/30" noValidate>
              <label htmlFor="promo-code" className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <Icon name="bookmark" size={12} className="text-primary-container" />
                Collector invitation or promo code
              </label>
              <div
                className={`flex rounded-lg overflow-hidden border ${
                  promoError ? 'border-error' : 'border-outline-variant/50 focus-within:border-primary-container'
                }`}
              >
                <input
                  id="promo-code"
                  type="text"
                  value={promoInput}
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    if (promoError) setPromoError('');
                  }}
                  placeholder="CODE"
                  className="w-full bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none uppercase tracking-wider"
                  aria-invalid={Boolean(promoError)}
                  aria-describedby={promoError ? 'promo-error' : undefined}
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput.trim()}
                  className="bg-surface-container-high hover:bg-surface-bright text-primary-container px-3.5 py-2 text-xs font-medium transition-colors shrink-0 disabled:opacity-50"
                >
                  {promoLoading ? <Spinner size="sm" /> : 'Apply'}
                </button>
              </div>
              {promoError && (
                <p id="promo-error" className="text-[11px] text-error" role="alert">
                  {promoError}
                </p>
              )}
              {promoCode && !promoError && (
                <p className="text-[11px] text-primary flex items-center gap-1">
                  <Icon name="check" size={12} />
                  Applied {promoCode}
                  <button
                    type="button"
                    className="underline ml-1 text-outline hover:text-on-surface"
                    onClick={() => {
                      setPromoCode(null);
                      setDiscountAmount(0);
                    }}
                  >
                    Remove
                  </button>
                </p>
              )}
            </form>

            <div className="pt-4 border-t border-outline-variant/30 flex items-baseline justify-between gap-3">
              <div>
                <span className="font-headline-sm text-lg text-on-surface">Estimated Total</span>
                <p className="text-[11px] text-outline">USD · Taxes at checkout</p>
              </div>
              <PriceDisplay amount={estimatedTotal} size="xl" className="text-primary" />
            </div>

            <Button
              onClick={handleCheckout}
              disabled={validated.length === 0 || loading}
              className="w-full"
              size="lg"
              icon="arrow_forward"
              iconPosition="right"
            >
              {t.cart?.checkout || 'Proceed to Checkout'}
            </Button>

            <p className="text-[11px] text-center text-outline">
              30-day archival return window · Lifetime registered piece guarantee
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;

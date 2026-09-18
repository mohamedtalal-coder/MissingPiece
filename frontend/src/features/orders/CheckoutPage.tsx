import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { cartApi } from '../cart/cartApi';
import { ordersApi, type ShippingAddress } from './ordersApi';
import { useToast } from '../../shared/context/ToastContext';

export function CheckoutPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const loadCart = React.useCallback(async () => {
    try {
      setLoading(true);
      const items = await cartApi.getCart();
      setCartItems(items);
    } catch (error) {
      console.error(error);
      showToast({ message: 'Failed to load cart', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadCart();
  }, [isAuthenticated, loadCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert(t.checkout.signInAlert || 'Please sign in first');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert(t.checkout.emptyCart || 'Your cart is empty');
      return;
    }

    try {
      setSubmitting(true);
      
      await ordersApi.createOrder({
        items: cartItems.map(item => ({
          productId: item.productId || item.product?._id || item.product,
          quantity: item.quantity
        })),
        shippingAddress: address
      });

      // Clear the cart on the frontend (ideally backend clears it or we call a clear endpoint, but we can just empty it manually for now)
      for (const item of cartItems) {
        await cartApi.removeItem(item.productId || item.product?._id || item.product);
      }

      alert(t.checkout.orderSuccess || 'Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error(error);
      showToast({ message: 'Failed to place order', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 font-sans space-y-8 text-[var(--text-main)]">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-serif font-bold text-[var(--text-main)]">
          {t.checkout.title || 'Checkout'}
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          {t.checkout.subtitle || 'Complete your order'}
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-md text-xs space-y-3">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">
              {t.checkout.authenticationRequired || 'Authentication Required'}
            </span>
          </div>
          <p className="text-[var(--text-muted)]">
            {t.checkout.signInRequired || 'Please sign in to continue'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#7e22ce] text-white px-4 py-2 rounded-md font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {t.checkout.signInNow || 'Sign in now'}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleCheckout}
          className="space-y-6 bg-[var(--bg-card)] border border-border p-8 rounded-md shadow-[0_0_25px_rgba(126,34,206,0.15)] text-xs"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Shipping Address</h3>
            
            <div className="space-y-2">
              <label className="text-[var(--text-main)] font-bold">Street</label>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-border rounded-md px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[var(--text-main)] font-bold">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-border rounded-md px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-main)] font-bold">State/Province</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-border rounded-md px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[var(--text-main)] font-bold">Zip Code</label>
                <input
                  type="text"
                  required
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-border rounded-md px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-main)] font-bold">Country</label>
                <input
                  type="text"
                  required
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-border rounded-md px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-[var(--text-main)] font-bold">
              {t.checkout.paymentMethod || 'Payment Method'}
            </label>
            <div className="p-3 bg-[var(--bg-main)] border border-border rounded-md text-[var(--text-muted)]">
              💵 {t.checkout.cashOnDelivery || 'Cash on Delivery'}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || cartItems.length === 0}
            className="w-full bg-primary flex justify-center items-center gap-2 from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3.5 rounded-md shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.checkout.confirmOrder || 'Confirm Order'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CheckoutPage;
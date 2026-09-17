import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export function CheckoutPage() {
  const { t } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser.location) {
        setAddress(parsedUser.location);
      }
    }

    const savedCart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    setCart(savedCart);
  }, []);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert(t.checkout.signInAlert);
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert(t.checkout.emptyCart);
      return;
    }

    const total = cart.reduce(
      (sum, item) =>
        sum + Number(item.price) * (item.qty || 1),
      0
    );

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      user: user.name,
      email: user.email,
      address: address || 'Cairo, Egypt',
      total: total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      items: cart,
    };

    const allOrders = JSON.parse(
      localStorage.getItem('allOrders') || '[]'
    );

    allOrders.push(newOrder);
    localStorage.setItem(
      'allOrders',
      JSON.stringify(allOrders)
    );

    localStorage.removeItem('cart');
    setCart([]);

    alert(t.checkout.orderSuccess);
    navigate('/orders');
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 font-sans space-y-8 text-[var(--text-main)]">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-serif font-bold text-[var(--text-main)]">
          {t.checkout.title}
        </h1>

        <p className="text-xs text-[var(--text-muted)]">
          {t.checkout.subtitle}
        </p>
      </div>

      {!user ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-md text-xs space-y-3">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />

            <span className="font-bold">
              {t.checkout.authenticationRequired}
            </span>
          </div>

          <p className="text-[var(--text-muted)]">
            {t.checkout.signInRequired}
          </p>

          <button
            onClick={() => navigate('/login')}
            className="bg-[#7e22ce] text-white px-4 py-2 rounded-md font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {t.checkout.signInNow}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleCheckout}
          className="space-y-6 bg-[var(--bg-card)] border border-border p-8 rounded-md shadow-[0_0_25px_rgba(126,34,206,0.15)] text-xs"
        >
          <div className="space-y-2">
            <label className="text-[var(--text-main)] font-bold">
              {t.checkout.shippingAddress}
            </label>

            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.checkout.addressPlaceholder}
              className="w-full bg-[var(--bg-main)] border border-border rounded-md px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#a855f7]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[var(--text-main)] font-bold">
              {t.checkout.paymentMethod}
            </label>

            <div className="p-3 bg-[var(--bg-main)] border border-border rounded-md text-[var(--text-muted)]">
              💵 {t.checkout.cashOnDelivery}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3.5 rounded-md shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer text-sm hover:opacity-90 transition-opacity"
          >
            {t.checkout.confirmOrder}
          </button>
        </form>
      )}
    </div>
  );
}

export default CheckoutPage;
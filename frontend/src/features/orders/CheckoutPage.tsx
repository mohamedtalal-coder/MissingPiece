import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

export function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. التأكد من قراءة المستخدم الحالي بدقة
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.location) {
        setAddress(parsedUser.location);
      }
    }

    // 2. جلب محتويات السلة
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // لو اليوزر مش مسجل فعلاً
    if (!user) {
      alert('Please sign in to complete your order.');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (Number(item.price) * (item.qty || 1)), 0);

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      user: user.name,
      email: user.email,
      address: address || 'Cairo, Egypt',
      total: total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      items: cart
    };

    // حفظ الطلب في قائمة الطلبات العامة للأدمن واليوزر
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    allOrders.push(newOrder);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));

    // تفريغ السلة بعد نجاح الطلب (حسب الـ User Stories)
    localStorage.removeItem('cart');
    setCart([]);

    alert('Order placed successfully! Cash on Delivery confirmed.');
    navigate('/orders');
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 font-sans space-y-8 text-white">
      <div className="border-b border-[#7e22ce]/30 pb-6">
        <h1 className="text-2xl font-serif font-bold">Checkout & Payment</h1>
        <p className="text-xs text-[#cbd5e1]">Complete your luxury puzzle order securely</p>
      </div>

      {!user ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-xs space-y-3">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">Authentication Required</span>
          </div>
          <p className="text-[#cbd5e1]">You must be signed in to proceed with checkout.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#7e22ce] text-white px-4 py-2 rounded-xl font-semibold cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-6 bg-[#130e21] border border-[#7e22ce]/40 p-8 rounded-3xl shadow-[0_0_25px_rgba(126,34,206,0.15)] text-xs">
          <div className="space-y-2">
            <label className="text-[#e9d5ff] font-bold">Shipping Address</label>
            <input 
              type="text" 
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your street and city" 
              className="w-full bg-[#0b0914] border border-[#7e22ce]/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#a855f7]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#e9d5ff] font-bold">Payment Method</label>
            <div className="p-3 bg-[#0b0914] border border-[#7e22ce]/30 rounded-xl text-[#cbd5e1]">
              💵 Cash on Delivery (COD)
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer text-sm"
          >
            Confirm & Place Order
          </button>
        </form>
      )}
    </div>
  );
}

export default CheckoutPage;
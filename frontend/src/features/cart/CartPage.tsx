import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const navigate = useNavigate();

  // تحميل السلة من localStorage فور فتح الصفحة ومع كل تحديث
  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  // تحديث الكمية (زيادة أو نقصان)
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...cartItems];
    updated[index].qty = newQty;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  // حذف منتج من السلة
  const handleRemove = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * (item.qty || 1)), 0);

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 font-sans space-y-8 text-white">
      <div className="flex items-center gap-3 border-b border-[#7e22ce]/30 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#130e21] border border-[#7e22ce]/50 flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
          <ShoppingBag className="w-6 h-6 text-[#c084fc]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">Shopping Cart</h1>
          <p className="text-xs text-[#cbd5e1]">Review your selected luxury puzzle items</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-[#130e21] border border-[#7e22ce]/40 rounded-3xl space-y-4">
          <p className="text-sm text-[#cbd5e1]">Your cart is currently empty.</p>
          <Link to="/products" className="inline-block bg-[#7e22ce] text-white text-xs px-6 py-3 rounded-xl font-semibold shadow-[0_0_15px_rgba(126,34,206,0.4)]">
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="bg-[#130e21] border border-[#7e22ce]/40 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-[0_0_15px_rgba(126,34,206,0.1)]">
                <img src={item.image || item.imageUrl || item.img} alt={item.title} className="w-20 h-20 object-cover rounded-xl border border-[#7e22ce]/30" />
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-serif font-bold text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-[#c084fc] font-semibold text-xs">${Number(item.price || 0).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2 bg-[#0b0914] border border-[#7e22ce]/30 px-2.5 py-1.5 rounded-xl">
                  <button onClick={() => handleUpdateQty(index, (item.qty || 1) - 1)} className="text-[#cbd5e1] hover:text-white cursor-pointer">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.qty || 1}</span>
                  <button onClick={() => handleUpdateQty(index, (item.qty || 1) + 1)} className="text-[#cbd5e1] hover:text-white cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button onClick={() => handleRemove(index)} className="text-red-400 hover:text-red-300 p-2 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[#130e21] border border-[#7e22ce]/40 p-6 rounded-3xl space-y-6 h-fit shadow-[0_0_20px_rgba(126,34,206,0.15)]">
            <h3 className="font-serif font-bold text-base border-b border-[#7e22ce]/20 pb-3">Order Summary</h3>
            <div className="flex justify-between text-xs text-[#cbd5e1]">
              <span>Subtotal</span>
              <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#cbd5e1]">
              <span>Shipping</span>
              <span className="text-emerald-400 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white border-t border-[#7e22ce]/20 pt-4">
              <span>Total</span>
              <span className="text-[#c084fc]">${subtotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
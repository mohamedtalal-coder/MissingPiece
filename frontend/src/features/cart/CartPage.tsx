import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { cartApi, type ValidatedCartItem } from './cartApi';

export function CartPage() {
  const { cart, updateQty, removeFromCart } = useCart();
  const [validated, setValidated] = useState<ValidatedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length === 0) {
      setValidated([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    cartApi
      .validateCart(cart.map(item => ({ productId: item.productId, quantity: item.quantity })))
      .then(setValidated)
      .catch(() => setValidated([]))
      .finally(() => setLoading(false));
  }, [cart]);

  const subtotal = validated.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 font-sans space-y-8 text-white">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-md bg-background border border-border flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
          <ShoppingBag className="w-6 h-6 text-[#c084fc]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">Shopping Cart</h1>
          <p className="text-xs text-[#cbd5e1]">Review your selected luxury puzzle items</p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-[#cbd5e1] text-center py-16">Loading your cart...</p>
      ) : cart.length === 0 ? (
        <div className="text-center py-16 bg-background border border-border rounded-md space-y-4">
          <p className="text-sm text-[#cbd5e1]">Your cart is currently empty.</p>
          <Link to="/products" className="inline-block bg-[#7e22ce] text-white text-xs px-6 py-3 rounded-md font-semibold shadow-[0_0_15px_rgba(126,34,206,0.4)]">
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {validated.map(item => (
              <div key={item.productId} className="bg-background border border-border p-4 rounded-md flex items-center justify-between gap-4 shadow-[0_0_15px_rgba(126,34,206,0.1)]">
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-md border border-border" />

                <div className="flex-1 space-y-1">
                  <h3 className="font-serif font-bold text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-[#c084fc] font-semibold text-xs">${item.price.toFixed(2)}</p>
                  {item.stock < item.quantity && (
                    <p className="text-red-400 text-[10px]">Only {item.stock} left in stock</p>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-[#0b0914] border border-border px-2.5 py-1.5 rounded-md">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="text-[#cbd5e1] hover:text-white cursor-pointer">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="text-[#cbd5e1] hover:text-white cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-300 p-2 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-background border border-border p-6 rounded-md space-y-6 h-fit shadow-[0_0_20px_rgba(126,34,206,0.15)]">
            <h3 className="font-serif font-bold text-base border-b border-border pb-3">Order Summary</h3>
            <div className="flex justify-between text-xs text-[#cbd5e1]">
              <span>Subtotal</span>
              <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#cbd5e1]">
              <span>Shipping</span>
              <span className="text-emerald-400 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white border-t border-border pt-4">
              <span>Total</span>
              <span className="text-[#c084fc]">${subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary from-[#7e22ce] to-[#a855f7] text-white py-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
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
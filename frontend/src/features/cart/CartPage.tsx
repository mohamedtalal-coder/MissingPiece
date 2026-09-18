import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { cartApi, type ValidatedCartItem } from './cartApi';
import { Icon } from '../../shared/components/ui/Icon';
import { useToast } from '../../shared/context/ToastContext';

export function CartPage() {
  const { cart, updateQty, removeFromCart } = useCart();
  const [validated, setValidated] = useState<ValidatedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

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
      .catch(() => {
        setValidated([]);
        showToast({ message: 'Failed to validate cart items', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, [cart, showToast]);

  const handleUpdateQty = async (productId: string, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {
      showToast({ message: `Only ${maxStock} items available in stock`, type: 'error' });
      return;
    }
    await updateQty(productId, newQty);
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
  };

  const subtotal = validated.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface font-body-md text-on-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (validated.length === 0) {
    return (
      <main className="bg-surface font-body-md text-on-surface min-h-[calc(100vh-80px)] pt-20">
        <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-2xl">
          <header className="mb-space-xl">
            <h1 className="font-display text-display text-on-surface font-semibold mb-space-xs">Your Cart is Empty</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">You haven't selected any pieces yet.</p>
          </header>
          <div className="py-space-2xl text-center">
            <Link to="/products" className="inline-block px-8 py-3 bg-primary-container text-on-primary-container font-label-md text-label-md rounded hover:bg-primary hover:text-on-primary transition-colors">
              Explore the Archive
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-surface font-body-md text-on-surface min-h-[calc(100vh-80px)] pt-20">
      <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-2xl">
        <header className="mb-space-xl">
          <h1 className="font-display text-display text-on-surface font-semibold mb-space-xs">Shopping Cart</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Review your selected pieces.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Header row desktop */}
            <div className="hidden sm:grid grid-cols-12 gap-space-md pb-space-sm border-b border-outline-variant/40 font-label-caps text-[0.6875rem] uppercase tracking-widest text-outline">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {validated.map(item => (
              <div key={item.productId} className="bg-surface-container rounded-lg p-space-md sm:p-space-lg flex flex-col gap-space-md relative overflow-hidden transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md items-center">
                  <div className="sm:col-span-6 flex items-center gap-space-md">
                    <div className="relative w-24 h-28 sm:w-28 sm:h-32 flex-shrink-0 bg-surface-container-low rounded overflow-hidden shadow-sm">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                        <Link to={`/products/${item.productId}`} className="hover:text-primary transition-colors">{item.title}</Link>
                      </h2>
                      <span className="sm:hidden font-label-md text-label-md text-on-surface mt-2">${item.price.toFixed(2)} / item</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:col-span-2 justify-center items-center font-label-md text-label-md text-on-surface-variant">
                    ${item.price.toFixed(2)}
                  </div>

                  <div className="sm:col-span-2 flex sm:justify-center items-center">
                    <div className="inline-flex items-center bg-surface-container-low rounded px-1 py-0.5 shadow-inner">
                      <button 
                        onClick={() => handleUpdateQty(item.productId, item.quantity - 1, item.stock)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors disabled:opacity-50"
                        type="button"
                      >
                        <Icon name="remove" className="text-[16px]" />
                      </button>
                      <input 
                        className="w-8 text-center bg-transparent font-label-md text-label-md text-on-surface focus:outline-none" 
                        readOnly 
                        type="text" 
                        value={item.quantity} 
                      />
                      <button 
                        onClick={() => handleUpdateQty(item.productId, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors disabled:opacity-50"
                        type="button"
                      >
                        <Icon name="add" className="text-[16px]" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden font-body-sm text-body-sm text-on-surface-variant">Total:</span>
                    <span className="font-title-editorial text-title-editorial text-primary font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-space-xs flex items-center justify-between sm:justify-start gap-space-lg text-body-sm font-body-sm text-on-surface-variant">
                  <button onClick={() => handleRemove(item.productId)} className="inline-flex items-center gap-1.5 hover:text-error transition-colors" type="button">
                    <Icon name="delete_outline" className="text-[17px]" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-low rounded-lg p-space-xl flex flex-col gap-space-md border border-outline-variant/30 sticky top-24">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/40 pb-space-sm">Order Summary</h2>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>Subtotal</span>
                  <span className="font-title-editorial text-title-editorial text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>Standard Shipping</span>
                  <span className="font-title-editorial text-title-editorial text-on-surface">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-outline-variant/40 pt-space-md mt-space-xs flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold uppercase tracking-wider">Total</span>
                  <span className="font-body-sm text-[11px] text-outline">USD</span>
                </div>
                <span className="font-display text-[2rem] leading-none text-primary font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full mt-space-sm h-[52px] rounded bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CartPage;
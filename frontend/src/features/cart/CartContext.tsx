import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, type ValidatedCartItem } from './cartApi';
import { useAuth } from '../auth/AuthContext';

interface CartContextType {
  cart: ValidatedCartItem[];
  addItem: (product: any, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<ValidatedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from local storage or backend
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // First, check if there's a guest cart to merge
        const saved = localStorage.getItem('mp_cart_guest');
        if (saved) {
          const guestCart = JSON.parse(saved);
          if (guestCart.length > 0) {
            await cartApi.mergeCart(guestCart.map((i: any) => ({ productId: i.productId, quantity: i.quantity })));
          }
          localStorage.removeItem('mp_cart_guest');
        }
        
        // Then fetch actual cart
        const backendItems = await cartApi.getCart();
        // Backend returns items like { product: { _id, name, price, images, stock }, quantity }
        // Map to ValidatedCartItem
        const formatted = backendItems.map((item: any) => ({
          productId: item.product._id,
          title: item.product.name,
          price: item.product.price,
          stock: item.product.stock,
          imageUrl: item.product.images[0],
          quantity: item.quantity
        }));
        setCart(formatted);
      } else {
        // Load from local storage
        const saved = localStorage.getItem('mp_cart_guest');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          if (parsed.length > 0) {
            // Try to validate/hydrate local cart against backend
            try {
              const validated = await cartApi.validateCart(parsed.map((i: any) => ({ productId: i.productId, quantity: i.quantity })));
              setCart(validated);
              localStorage.setItem('mp_cart_guest', JSON.stringify(validated));
            } catch {
              setCart(parsed);
            }
          } else {
            setCart([]);
          }
        } else {
          setCart([]);
        }
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (product: any, qty: number) => {
    if (isAuthenticated) {
      await cartApi.addItem(product._id, qty);
      await fetchCart();
    } else {
      setCart(prevCart => {
        const existingIndex = prevCart.findIndex(item => item.productId === product._id);
        let updated = [...prevCart];
        if (existingIndex > -1) {
          updated[existingIndex].quantity += qty;
        } else {
          updated.push({
            productId: product._id,
            title: product.name,
            price: product.price,
            stock: product.stock,
            imageUrl: product.images[0],
            quantity: qty
          });
        }
        localStorage.setItem('mp_cart_guest', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      await cartApi.removeItem(productId);
      await fetchCart();
    } else {
      setCart(prev => {
        const updated = prev.filter(item => item.productId !== productId);
        localStorage.setItem('mp_cart_guest', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    if (qty < 1) return;
    if (isAuthenticated) {
      await cartApi.updateItem(productId, qty);
      await fetchCart();
    } else {
      setCart(prev => {
        const updated = prev.map(item => (item.productId === productId ? { ...item, quantity: qty } : item));
        localStorage.setItem('mp_cart_guest', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!isAuthenticated) {
      localStorage.removeItem('mp_cart_guest');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeFromCart, updateQty, clearCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
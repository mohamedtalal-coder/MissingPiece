import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, type ValidatedCartItem } from './cartApi';
import { useAuth } from '../auth/AuthContext';

interface CartContextType {
  cart: ValidatedCartItem[];
  cartItemCount: number;
  addItem: (product: any, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  clearCart: () => void | Promise<void>;
  refreshCart: () => Promise<void>;
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
        const formatted = backendItems
          .filter((item: any) => item && item.product && item.product._id)
          .map((item: any) => ({
            productId: item.product._id,
            title: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            stock: item.product.stock,
            imageUrl: item.product.images?.[0] || '',
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
    // Cap quantity
    const finalQty = Math.min(qty, product.stock, 10);
    
    if (isAuthenticated) {
      await cartApi.addItem(product._id, finalQty);
      await fetchCart();
    } else {
      setCart(prevCart => {
        const existingIndex = prevCart.findIndex(item => item.productId === product._id);
        const updated = [...prevCart];
        if (existingIndex > -1) {
          const newQty = Math.min(updated[existingIndex].quantity + finalQty, product.stock, 10);
          updated[existingIndex].quantity = newQty;
        } else {
          updated.push({
            productId: product._id,
            title: product.name,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            imageUrl: product.images?.[0] || '',
            quantity: finalQty
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
    
    // We assume the caller checks against stock/max, but we cap it just in case
    const safeQty = Math.min(qty, 10);

    if (isAuthenticated) {
      await cartApi.updateItem(productId, safeQty);
      await fetchCart();
    } else {
      setCart(prev => {
        const updated = prev.map(item => {
          if (item.productId === productId) {
            return { ...item, quantity: Math.min(safeQty, item.stock) };
          }
          return item;
        });
        localStorage.setItem('mp_cart_guest', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && cart.length > 0) {
      try {
        await Promise.all(cart.map((item) => cartApi.removeItem(item.productId)));
      } catch (err) {
        console.error('Failed to clear server cart', err);
      }
    }
    setCart([]);
    localStorage.removeItem('mp_cart_guest');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartItemCount, addItem, removeFromCart, updateQty, clearCart, refreshCart: fetchCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
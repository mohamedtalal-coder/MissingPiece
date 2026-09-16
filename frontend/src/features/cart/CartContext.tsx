import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartContextType {
  cart: any[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: any) => void;
  updateQty: (productId: any, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const id = product.id || product._id || product.productId || product.title;
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex((item: any) => (item.id || item._id || item.productId || item.title) === id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].qty = (updated[existingIndex].qty || 1) + 1;
        return updated;
      } else {
        return [...prevCart, { ...product, id, qty: 1 }];
      }
    });
    alert(`Added "${product.title || 'Product'}" to cart!`);
  };

  const removeFromCart = (productId: any) => {
    setCart(prev => prev.filter((item: any) => (item.id || item._id || item.productId || item.title) !== productId));
  };

  const updateQty = (productId: any, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map((item: any) => {
      const id = item.id || item._id || item.productId || item.title;
      return id === productId ? { ...item, qty } : item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
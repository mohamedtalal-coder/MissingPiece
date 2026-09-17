import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi, type WishlistItem } from '../features/wishlist/wishlistApi';
import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './context/ToastContext';

interface WishlistContextType {
  wishlistItems: any[]; // The raw product objects for frontend use
  toggleWishlist: (product: any) => Promise<void>;
  isInWishlist: (id: string | number) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const items = await wishlistApi.get();
      // The backend returns an array of WishlistItem { product: Product }
      // We map it to just the product objects so frontend is happy
      setWishlistItems(items.map((item: WishlistItem) => item.product));
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Optimistic UI update
    const isCurrentlyWishlisted = isInWishlist(product._id || product.id);
    
    setWishlistItems(prev => {
      if (isCurrentlyWishlisted) {
        return prev.filter(item => (item._id || item.id) !== (product._id || product.id));
      } else {
        return [...prev, product];
      }
    });

    try {
      if (isCurrentlyWishlisted) {
        await wishlistApi.remove(product._id || product.id);
      } else {
        await wishlistApi.add(product._id || product.id);
      }
      // Re-sync just in case
      // await fetchWishlist();
    } catch (err) {
      // Revert on failure
      showToast({ message: 'Failed to update wishlist', type: 'error' });
      await fetchWishlist(); 
    }
  };

  const isInWishlist = (id: string | number) => {
    return wishlistItems.some(item => (item._id || item.id) === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
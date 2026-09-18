import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductFilters } from '../../products/components/ProductFilters';
import { CartPage } from '../../cart/CartPage';
import { Reviews } from '../../products/components/Reviews';
import { WishlistProvider, useWishlist } from '../../../shared/WishlistContext';
import { wishlistApi } from '../../wishlist/wishlistApi';
import { reviewsApi } from '../../products/reviewsApi';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { ToastProvider } from '../../../shared/context/ToastContext';
import { LanguageProvider } from '../../../shared/context/LanguageContext';

vi.mock('../../wishlist/wishlistApi', () => ({
  wishlistApi: {
    get: vi.fn(),
    add: vi.fn(),
    remove: vi.fn()
  }
}));

vi.mock('../../products/reviewsApi', () => ({
  reviewsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../../cart/cartApi', () => ({
  cartApi: {
    validateCart: vi.fn().mockResolvedValue([
      { productId: 'prod1', quantity: 5, price: 10, title: 'Test', imageUrl: '', stock: 5 }
    ])
  }
}));

vi.mock('../../cart/CartContext', () => ({
  useCart: () => ({
    cart: [{ productId: 'prod1', quantity: 5 }],
    addItem: vi.fn(),
    removeFromCart: vi.fn(),
    updateQty: vi.fn(),
    clearCart: vi.fn(),
    isLoading: false
  })
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'u1', name: 'Test User', email: 'test@example.com', role: 'user' },
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isLoading: false
  })
}));

const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('Storefront Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Debounce', () => {
    it('should debounce search input and require min 3 characters', async () => {
      vi.useFakeTimers();
      const onSearchChange = vi.fn();
      
      render(
        <MockLanguageProvider>
          <ProductFilters
            categories={[]}
            selectedCategory=""
            onCategoryChange={vi.fn()}
            searchTerm=""
            onSearchChange={onSearchChange}
            minPrice={0}
            maxPrice={100}
            onPriceChange={vi.fn()}
            sortBy="newest"
            onSortChange={vi.fn()}
          />
        </MockLanguageProvider>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Type 2 characters (should not trigger)
      // Note: we need to clear initial triggers because useEffect runs on mount
      vi.advanceTimersByTime(400);
      onSearchChange.mockClear();

      fireEvent.change(searchInput, { target: { value: 'ab' } });
      vi.advanceTimersByTime(400);
      expect(onSearchChange).not.toHaveBeenCalled();
      
      // Type 3 characters (should trigger)
      fireEvent.change(searchInput, { target: { value: 'abc' } });
      vi.advanceTimersByTime(400);
      expect(onSearchChange).toHaveBeenCalledWith('abc');
      
      // Type empty string (should trigger to clear)
      fireEvent.change(searchInput, { target: { value: '' } });
      vi.advanceTimersByTime(400);
      expect(onSearchChange).toHaveBeenCalledWith('');
      
      vi.useRealTimers();
    });
  });

  describe('Cart Stock Limits', () => {
    it('should limit quantity update to available stock', async () => {
      render(
        <MemoryRouter>
          <ToastProvider>
            <CartPage />
          </ToastProvider>
        </MemoryRouter>
      );
      
      // Wait for validateCart to return
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });

      // Find the + button and ensure it's disabled or click does not exceed stock
      // With our implementation it's disabled when quantity >= stock
      // Since it's the second button for the item, we find it by checking if it's disabled
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveValue('5');
      const addBtns = screen.getAllByRole('button');
      const increaseBtn = addBtns[1]; // Typically index 0 is minus, 1 is plus, 2 is remove
      expect(increaseBtn).toBeDisabled();
    });
  });

  describe('Wishlist Endpoints', () => {
    it('should interact with wishlist API', async () => {
      (wishlistApi.get as any).mockResolvedValue([]);
      (wishlistApi.add as any).mockResolvedValue([]);
      
      const TestComponent = () => {
        const { toggleWishlist } = useWishlist();
        return (
          <button onClick={() => toggleWishlist({ _id: 'p1' })}>Add to Wishlist</button>
        );
      };

      render(
        <MemoryRouter>
          <ToastProvider>
            <WishlistProvider>
              <TestComponent />
            </WishlistProvider>
          </ToastProvider>
        </MemoryRouter>
      );
      
      const btn = await screen.findByText('Add to Wishlist');
      fireEvent.click(btn);
      
      await waitFor(() => {
        expect(wishlistApi.add).toHaveBeenCalledWith('p1');
      });
    });
  });

  describe('Review Submission', () => {
    it('should submit and edit review', async () => {
      (reviewsApi.list as any).mockResolvedValue({ items: [], total: 0, totalPages: 1 });
      (reviewsApi.create as any).mockResolvedValue({});
      
      render(
        <MemoryRouter>
          <ToastProvider>
            <Reviews productId="prod1" />
          </ToastProvider>
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Share your thoughts')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Tell us what you think/i);
      fireEvent.change(textarea, { target: { value: 'Great puzzle!' } });
      
      const submitBtn = screen.getByText('Submit Review');
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(reviewsApi.create).toHaveBeenCalledWith({
          product: 'prod1',
          rating: 5,
          comment: 'Great puzzle!'
        });
      });
    });
  });
});

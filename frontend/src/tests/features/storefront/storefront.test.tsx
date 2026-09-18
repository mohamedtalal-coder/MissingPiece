import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductFilters } from '../../../features/products/components/ProductFilters';
import { CartPage } from '../../../features/cart/CartPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../../shared/context/ToastContext';
import { LanguageProvider } from '../../../shared/context/LanguageContext';

vi.mock('../../../features/cart/cartApi', () => ({
  cartApi: {
    validateCart: vi.fn().mockResolvedValue([
      { productId: 'prod1', quantity: 5, price: 10, title: 'Test', imageUrl: '', stock: 5 },
    ]),
  },
}));

vi.mock('../../../features/products/productsApi', () => ({
  productsApi: {
    getAll: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 6, totalPages: 0 }),
  },
}));

vi.mock('../../../features/cart/discountsApi', () => ({
  discountsApi: {
    validate: vi.fn(),
  },
}));

vi.mock('../../../features/cart/CartContext', () => ({
  useCart: () => ({
    cart: [{ productId: 'prod1', quantity: 5 }],
    addItem: vi.fn(),
    removeFromCart: vi.fn(),
    updateQty: vi.fn(),
    clearCart: vi.fn(),
    isLoading: false,
    refreshCart: vi.fn(),
  }),
}));

vi.mock('../../../features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'u1', name: 'Test User', email: 'test@example.com', role: 'user' },
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
  }),
}));

describe('Storefront', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces catalog search through ProductFilters', async () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();

    render(
      <LanguageProvider>
        <ProductFilters
          categories={[]}
          selectedCategory=""
          onCategoryChange={vi.fn()}
          searchTerm=""
          onSearchChange={onSearchChange}
          minPrice={0}
          maxPrice={200}
          onPriceChange={vi.fn()}
          sortBy="newest"
          onSortChange={vi.fn()}
        />
      </LanguageProvider>,
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    onSearchChange.mockClear();

    fireEvent.change(searchInput, { target: { value: 'ab' } });
    expect(onSearchChange).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearchChange).toHaveBeenCalledWith('ab');
  });

  it('disables increasing cart quantity at stock limit', async () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <ToastProvider>
            <CartPage />
          </ToastProvider>
        </MemoryRouter>
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    const increaseBtn = screen.getByRole('button', { name: /increase quantity/i });
    expect(increaseBtn).toBeDisabled();
  });
});

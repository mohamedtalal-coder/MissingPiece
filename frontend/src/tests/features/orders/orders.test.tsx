import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OrderHistoryPage from '../../../features/orders/OrderHistoryPage';
import OrderDetailPage from '../../../features/orders/OrderDetailPage';
import { ordersApi } from '../../../features/orders/ordersApi';
import { cartApi } from '../../../features/cart/cartApi';
import { orderShortId } from '../../../features/orders/orderStatus';
import { LanguageProvider } from '../../../shared/context/LanguageContext';
import { ToastProvider } from '../../../shared/context/ToastContext';

vi.mock('../../../features/orders/ordersApi', () => ({
  ordersApi: {
    getMyOrders: vi.fn(),
    getOrderById: vi.fn(),
    createOrder: vi.fn(),
  },
}));

vi.mock('../../../features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'test-user', name: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
  }),
}));

vi.mock('../../../features/cart/CartContext', () => ({
  useCart: () => ({
    cart: [],
    addItem: vi.fn(),
    removeFromCart: vi.fn(),
    updateQty: vi.fn(),
    clearCart: vi.fn(),
    refreshCart: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('../../../features/cart/cartApi', () => ({
  cartApi: {
    validateCart: vi.fn(),
    addItem: vi.fn(),
  },
}));

describe('Orders Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (route = '/') => {
    return render(
      <LanguageProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </LanguageProvider>,
    );
  };

  it('handles order list pagination', async () => {
    const mockOrders = Array.from({ length: 10 }).map((_, i) => ({
      _id: `507f1f77bcf86cd7994390${String(i).padStart(2, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'delivered' as const,
      total: 100,
      shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
      items: [],
    }));

    (ordersApi.getMyOrders as any).mockResolvedValue({
      items: mockOrders,
      total: 30,
      page: 1,
      limit: 10,
      totalPages: 3,
    });

    renderWithProviders('/orders');

    await waitFor(() => {
      expect(screen.getAllByText((text) => text.includes(orderShortId(mockOrders[0]!._id))).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();

    (ordersApi.getMyOrders as any).mockResolvedValue({
      items: [
        {
          ...mockOrders[0],
          _id: '507f1f77bcf86cd799439099',
        },
      ],
      total: 30,
      page: 2,
      limit: 10,
      totalPages: 3,
    });

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    await waitFor(() => {
      expect(ordersApi.getMyOrders).toHaveBeenCalledWith(2, 10);
      expect(screen.getByText((text) => text.includes(orderShortId('507f1f77bcf86cd799439099')))).toBeInTheDocument();
    });
  });

  it('shows a review action on delivered orders', async () => {
    (ordersApi.getMyOrders as any).mockResolvedValue({
      items: [{
        _id: '507f1f77bcf86cd799439011',
        createdAt: new Date().toISOString(),
        status: 'delivered',
        total: 100,
        shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
        items: [{ productId: '507f1f77bcf86cd799439012', slug: 'starry-night-jigsaw-puzzle', title: 'Puzzle', quantity: 1, price: 100 }],
      }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    renderWithProviders('/orders');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /review item/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /review item/i })).toHaveAttribute('href', '/products/starry-night-jigsaw-puzzle#reviews');
  });

  it('IDOR check - gracefully handles 403 when viewing someone elses order', async () => {
    (ordersApi.getOrderById as any).mockRejectedValue({
      response: { status: 403 },
    });

    renderWithProviders('/orders/other-user-order-id');

    await waitFor(() => {
      expect(screen.getByText('You do not have permission to view this order.')).toBeInTheDocument();
    });
  });

  it('Reorder flow shows an error toast when stock validation fails', async () => {
    const mockOrder = {
      _id: '507f1f77bcf86cd799439011',
      createdAt: new Date().toISOString(),
      status: 'delivered',
      total: 100,
      shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
      items: [{ productId: '507f1f77bcf86cd799439012', title: 'Puzzle', quantity: 1, price: 100 }],
    };

    (ordersApi.getOrderById as any).mockResolvedValue(mockOrder);
    (cartApi.validateCart as any).mockRejectedValue(new Error('stock changed'));

    renderWithProviders(`/orders/${mockOrder._id}`);

    const reorderBtn = await screen.findByRole('button', { name: /re-add to bag/i });
    fireEvent.click(reorderBtn);

    await waitFor(() => {
      expect(screen.getByText(/stock may have changed|could not be re-added/i)).toBeInTheDocument();
    });
  });
});

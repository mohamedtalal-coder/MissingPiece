import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OrderHistoryPage from '../OrderHistoryPage';
import OrderDetailPage from '../OrderDetailPage';
import { ordersApi } from '../ordersApi';
import { LanguageProvider } from '../../../shared/context/LanguageContext';

vi.mock('../ordersApi', () => ({
  ordersApi: {
    getMyOrders: vi.fn(),
    getOrderById: vi.fn(),
    createOrder: vi.fn(),
  },
}));

describe('Orders Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (route = '/') => {
    return render(
      <LanguageProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    );
  };

  it('handles order list pagination', async () => {
    const mockOrders = Array.from({ length: 10 }).map((_, i) => ({
      _id: `order-${i}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      total: 100,
      shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
      items: []
    }));

    (ordersApi.getMyOrders as any).mockResolvedValueOnce({
      items: mockOrders,
      totalPages: 3,
    });

    renderWithProviders('/orders');

    await waitFor(() => {
      expect(screen.getByText('order-0')).toBeInTheDocument();
    });

    // Check pagination elements
    expect(screen.getByText(/Page/i)).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // total pages
    
    // Test navigation
    (ordersApi.getMyOrders as any).mockResolvedValueOnce({
      items: [{ ...mockOrders[0], _id: 'order-page-2' }],
      totalPages: 3,
    });

    const nextBtn = screen.getByRole('button', { name: 'Next Page' });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(ordersApi.getMyOrders).toHaveBeenCalledWith(2, 10);
      expect(screen.getByText('order-page-2')).toBeInTheDocument();
    });
  });

  it('IDOR check - gracefully handles 403 when viewing someone elses order', async () => {
    // Mock a 403 error coming from API
    (ordersApi.getOrderById as any).mockRejectedValueOnce({
      response: { status: 403 }
    });

    renderWithProviders('/orders/other-user-order-id');

    await waitFor(() => {
      expect(screen.getByText('You do not have permission to view this order.')).toBeInTheDocument();
    });
  });

  it('Reorder flow displays error when stock or price has changed (400 error)', async () => {
    const mockOrder = {
      _id: 'old-order',
      createdAt: new Date().toISOString(),
      status: 'delivered',
      total: 100,
      shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
      items: [
        { productId: 'p1', title: 'Puzzle', quantity: 1, price: 100 }
      ]
    };

    (ordersApi.getOrderById as any).mockResolvedValueOnce(mockOrder);

    renderWithProviders('/orders/old-order');

    await waitFor(() => {
      expect(screen.getByText('Order Items')).toBeInTheDocument();
    });

    // Mock createOrder to fail
    (ordersApi.createOrder as any).mockRejectedValueOnce({
      response: { data: { message: 'Failed to reorder. Some items may be out of stock.' } }
    });

    const reorderBtn = screen.getByText('Reorder Items');
    fireEvent.click(reorderBtn);

    await waitFor(() => {
      expect(ordersApi.createOrder).toHaveBeenCalledWith({
        items: [{ product: 'p1', quantity: 1 }],
        shippingAddress: mockOrder.shippingAddress
      });
      expect(screen.getByText('Failed to reorder. Some items may be out of stock.')).toBeInTheDocument();
    });
  });
});

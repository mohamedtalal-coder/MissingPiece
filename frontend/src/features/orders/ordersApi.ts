import { apiClient } from '../../api/client';
import type { CartItemDto } from '../cart/cartApi';

export interface OrderItem {
  product?: string;
  productId?: string;
  title?: string;
  price?: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  id?: string;
  userId?: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export const ordersApi = {
  createOrder: async (orderData: {
    items: (CartItemDto | OrderItem)[];
    shippingAddress: ShippingAddress;
    discountCode?: string;
  }): Promise<Order> => {
    // Map productId to product for backend
    const mappedItems = orderData.items.map((item: any) => ({
      product: item.productId || item.product,
      quantity: item.quantity
    }));
    
    const response = await apiClient.post<{ success: boolean; data: Order }>('/orders', {
      ...orderData,
      items: mappedItems
    });
    return response.data.data;
  },

  createCheckoutSession: async (orderId: string): Promise<{ url: string }> => {
    const response = await apiClient.post<{ success: boolean; url: string }>('/payments/checkout-session', { orderId });
    return { url: response.data.url };
  },

  getMyOrders: async (page = 1, limit = 10): Promise<{ items: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get<{ success: boolean; items: Order[]; total: number; page: number; limit: number; totalPages: number }>('/orders', { params: { page, limit } });
    return response.data;
  },

  getAdminOrders: async (page = 1, limit = 10): Promise<{ items: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get<{ success: boolean; items: Order[]; total: number; page: number; limit: number; totalPages: number }>('/orders/admin/all', { params: { page, limit } });
    return response.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.patch<{ success: boolean; data: Order }>(`/orders/${orderId}/status`, { status: 'cancelled' });
    return response.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<{ success: boolean; data: Order }>(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },
};
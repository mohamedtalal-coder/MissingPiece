import { apiClient } from '../../api/client';
import type { CartItemDto } from '../cart/cartApi'; // أو استيرادها كـ type

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
}

export const ordersApi = {
  createOrder: async (orderData: {
    items: CartItemDto[] | OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    total: number;
  }): Promise<Order> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.put(`/orders/${orderId}/cancel`);
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },
};
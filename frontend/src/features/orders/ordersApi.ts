import { apiClient } from '../../api/client';
import type { CartItemDto } from '../cart/cartApi';

export interface OrderProductReference {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  images?: string[];
  price?: number;
}

export interface OrderItem {
  product?: string | OrderProductReference;
  productId?: string;
  productSlug?: string;
  slug?: string;
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
  totalAmount?: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeOrder(raw: any): Order {
  return {
    ...raw,
    total: isFiniteNumber(raw.total) ? raw.total : (isFiniteNumber(raw.totalAmount) ? raw.totalAmount : 0),
    items: (raw.items || []).map((item: any) => {
      const product = item.product && typeof item.product === 'object' ? item.product : undefined;
      const price = isFiniteNumber(item.price)
        ? item.price
        : (isFiniteNumber(item.priceAtPurchase) ? item.priceAtPurchase : (product && isFiniteNumber(product.price) ? product.price : 0));
      const productId = item.productId || (
        typeof item.product === 'string'
          ? item.product
          : product?._id || product?.id
      );
      const productSlug = typeof item.product === 'object' ? item.product?.slug : (item.slug || product?.slug);
      return {
        ...item,
        productId,
        productSlug: item.productSlug || productSlug,
        title: item.title || product?.name || 'Masterwork',
        imageUrl: item.imageUrl || product?.images?.[0],
        price,
      };
    }),
  };
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
    return normalizeOrder(response.data.data);
  },

  createCheckoutSession: async (orderId: string): Promise<{ url: string }> => {
    const response = await apiClient.post<{ success: boolean; url: string }>('/payments/checkout-session', { orderId });
    return { url: response.data.url };
  },

  getMyOrders: async (page = 1, limit = 10): Promise<{ items: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get<{ success: boolean; items: Order[]; total: number; page: number; limit: number; totalPages: number }>('/orders', { params: { page, limit } });
    return { ...response.data, items: response.data.items.map(normalizeOrder) };
  },

  getAdminOrders: async (page = 1, limit = 10): Promise<{ items: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get<{ success: boolean; items: Order[]; total: number; page: number; limit: number; totalPages: number }>('/orders/admin/all', { params: { page, limit } });
    return { ...response.data, items: response.data.items.map(normalizeOrder) };
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return normalizeOrder(response.data.data);
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.patch<{ success: boolean; data: Order }>(`/orders/${orderId}/cancel`);
    return normalizeOrder(response.data.data);
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<{ success: boolean; data: Order }>(`/orders/${orderId}/status`, { status });
    return normalizeOrder(response.data.data);
  },
};
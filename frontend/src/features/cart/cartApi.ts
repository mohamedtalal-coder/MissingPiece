import { apiClient } from '../../api/client';

export interface CartItemDto {
  productId: string;
  quantity: number;
}

export interface ValidatedCartItem extends CartItemDto {
  title: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get<{ success: boolean; items: any[] }>('/cart');
    return response.data.items;
  },
  addItem: async (productId: string, quantity: number) => {
    const response = await apiClient.post<{ success: boolean; items: any[] }>('/cart/items', { productId, quantity });
    return response.data.items;
  },
  updateItem: async (productId: string, quantity: number) => {
    const response = await apiClient.patch<{ success: boolean; items: any[] }>(`/cart/items/${productId}`, { quantity });
    return response.data.items;
  },
  removeItem: async (productId: string) => {
    const response = await apiClient.delete<{ success: boolean; items: any[] }>(`/cart/items/${productId}`);
    return response.data.items;
  },
  mergeCart: async (items: CartItemDto[]) => {
    const response = await apiClient.post<{ success: boolean; items: any[] }>('/cart/merge', { items });
    return response.data.items;
  },
  validateCart: async (items: CartItemDto[]) => {
    const response = await apiClient.post<{ success: boolean; items: any[] }>('/cart/validate', { items });
    return response.data.items.filter(item => item.valid).map(item => ({
      productId: item.productId,
      title: item.product.name,
      price: item.product.price,
      stock: item.product.stock,
      imageUrl: item.product.images[0],
      quantity: item.quantity
    }));
  },
};
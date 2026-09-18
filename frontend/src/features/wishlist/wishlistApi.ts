import { apiClient } from '../../api/client';
import type { Product } from '../products/productsApi';

export interface WishlistItem {
  _id: string; // The wishlist item id
  user: string;
  product: Product; // populated product
  addedAt: string;
}

export const wishlistApi = {
  get: async () => {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>('/wishlist');
    return response.data.data;
  },

  add: async (productId: string) => {
    const response = await apiClient.post<{ success: boolean; data: Product[] }>(`/wishlist/${productId}`);
    return response.data.data;
  },

  remove: async (productId: string) => {
    const response = await apiClient.delete<{ success: boolean; data: Product[] }>(`/wishlist/${productId}`);
    return response.data.data;
  }
};

export default wishlistApi;
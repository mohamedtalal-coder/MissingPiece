import { apiClient } from '../../api/client';

export interface CartItemDto {
  productId: string | number;
  quantity: number;
}

export interface ValidatedCartItem extends CartItemDto {
  title: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export const cartApi = {
  validateCart: async (items: CartItemDto[]) => {
    const response = await apiClient.post<ValidatedCartItem[]>('/cart/validate', { items });
    return response.data;
  },
};
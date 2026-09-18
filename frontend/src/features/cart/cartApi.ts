import { apiClient } from '../../api/client';

export interface CartItemDto {
  productId: string;
  quantity: number;
}

export interface ValidatedCartItem extends CartItemDto {
  title: string;
  slug?: string;
  price: number;
  stock: number;
  imageUrl: string;
}

function mapValidatedItem(item: {
  productId: string;
  quantity: number;
  product: { name: string; slug?: string; price: number; image?: string; stock: number };
}): ValidatedCartItem {
  return {
    productId: item.productId,
    title: item.product.name,
    slug: item.product.slug,
    price: item.product.price,
    stock: item.product.stock,
    imageUrl: item.product.image || '',
    quantity: item.quantity,
  };
}

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get<{ success: boolean; items: unknown[] }>('/cart');
    return response.data.items;
  },
  addItem: async (productId: string, quantity: number) => {
    const response = await apiClient.post<{ success: boolean; items: unknown[] }>('/cart/items', {
      productId,
      quantity,
    });
    return response.data.items;
  },
  updateItem: async (productId: string, quantity: number) => {
    const response = await apiClient.patch<{ success: boolean; items: unknown[] }>(
      `/cart/items/${productId}`,
      { quantity }
    );
    return response.data.items;
  },
  removeItem: async (productId: string) => {
    const response = await apiClient.delete<{ success: boolean; items: unknown[] }>(
      `/cart/items/${productId}`
    );
    return response.data.items;
  },
  mergeCart: async (items: CartItemDto[]) => {
    const response = await apiClient.post<{ success: boolean; items: unknown[] }>('/cart/merge', {
      items,
    });
    return response.data.items;
  },
  validateCart: async (items: CartItemDto[]): Promise<ValidatedCartItem[]> => {
    const response = await apiClient.post<{
      success: boolean;
      items: Array<{
        productId: string;
        quantity: number;
        valid: boolean;
        product?: {
          name: string;
          slug?: string;
          price: number;
          image?: string;
          stock: number;
        };
      }>;
    }>('/cart/validate', { items });

    return response.data.items
      .filter((item) => item.valid && item.product)
      .map((item) => mapValidatedItem(item as Parameters<typeof mapValidatedItem>[0]));
  },
};

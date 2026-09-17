import { apiClient } from '../../api/client';

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextCursor: string | null;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  search?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export const productsApi = {
  getAll: async (params: ListProductsParams = {}, signal?: AbortSignal): Promise<ProductListResult> => {
    const response = await apiClient.get<{ success: boolean } & ProductListResult>('/products', { params, signal });
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<{ success: boolean; categories: string[] }>('/products/categories');
    return response.data.categories;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get<{ success: boolean; product: Product }>(`/products/${slug}`);
    return response.data.product;
  },

  create: async (input: CreateProductInput): Promise<Product> => {
    const response = await apiClient.post<{ success: boolean; product: Product }>('/products', input);
    return response.data.product;
  },

  update: async (id: string, input: Partial<CreateProductInput>): Promise<Product> => {
    const response = await apiClient.patch<{ success: boolean; product: Product }>(`/products/${id}`, input);
    return response.data.product;
  },

  delete: async (id: string): Promise<Product> => {
    const response = await apiClient.delete<{ success: boolean; product: Product }>(`/products/${id}`);
    return response.data.product;
  },
};
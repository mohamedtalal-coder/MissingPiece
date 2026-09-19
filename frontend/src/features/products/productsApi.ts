
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
  averageRating?: number;
  reviewCount?: number;
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
  images?: File[];
  isActive?: boolean;
}

function createProductFormData(
  input: Partial<CreateProductInput>
): FormData {
  const formData = new FormData();

  if (input.name !== undefined) {
    formData.append('name', input.name);
  }

  if (input.description !== undefined) {
    formData.append('description', input.description);
  }

  if (input.price !== undefined) {
    formData.append('price', input.price.toString());
  }

  if (input.stock !== undefined) {
    formData.append('stock', input.stock.toString());
  }

  if (input.category !== undefined) {
    formData.append('category', input.category);
  }

  if (input.isActive !== undefined) {
    formData.append('isActive', input.isActive.toString());
  }

  if (input.images) {
    input.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  return formData;
}

export const productsApi = {
  getAll: async (
    params: ListProductsParams = {},
    signal?: AbortSignal
  ): Promise<ProductListResult> => {
    const response = await apiClient.get<
      { success: boolean } & ProductListResult
    >('/products', {
      params,
      signal,
    });

    return response.data;
  },

  getAdminAll: async (
    params: ListProductsParams = {},
    signal?: AbortSignal
  ): Promise<ProductListResult> => {
    const response = await apiClient.get<
      { success: boolean } & ProductListResult
    >('/products/admin/all', {
      params,
      signal,
    });

    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<{
      success: boolean;
      categories: string[];
    }>('/products/categories');

    return response.data.categories;
  },

  getBySlug: async (
    slug: string,
    signal?: AbortSignal
  ): Promise<Product> => {
    const response = await apiClient.get<{
      success: boolean;
      product: Product;
    }>(`/products/${slug}`, {
      signal,
    });

    return response.data.product;
  },

  create: async (
    input: CreateProductInput
  ): Promise<Product> => {
    const formData = createProductFormData(input);

    const response = await apiClient.post<{
      success: boolean;
      product: Product;
    }>('/products', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return response.data.product;
  },

  update: async (
    id: string,
    input: Partial<CreateProductInput>
  ): Promise<Product> => {
    const formData = createProductFormData(input);

    const response = await apiClient.patch<{
      success: boolean;
      product: Product;
    }>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return response.data.product;
  },

  delete: async (id: string): Promise<Product> => {
    const response = await apiClient.delete<{
      success: boolean;
      product: Product;
    }>(`/products/${id}`);

    return response.data.product;
  },
};


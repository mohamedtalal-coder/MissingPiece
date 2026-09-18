import { apiClient } from '../../api/client';

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResult {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reviewsApi = {
  list: async (productId: string, page = 1, limit = 10): Promise<ReviewListResult> => {
    const response = await apiClient.get('/api/reviews', {
      params: { product: productId, page, limit }
    });
    return response.data;
  },

  create: async (data: { product: string; rating: number; comment?: string }): Promise<Review> => {
    const response = await apiClient.post('/api/reviews', data);
    return response.data.review;
  },

  update: async (id: string, data: { rating?: number; comment?: string }): Promise<Review> => {
    const response = await apiClient.patch(`/api/reviews/${id}`, data);
    return response.data.review;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reviews/${id}`);
  }
};

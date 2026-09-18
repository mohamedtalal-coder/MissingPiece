import { apiClient } from '../../api/client';

export interface ContactMessageDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const staticApi = {
  sendMessage: async (data: ContactMessageDto) => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/contact', data);
    return response.data;
  },

  getContactMessages: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get<{ success: boolean; items: any[]; total: number; page: number; limit: number; totalPages: number }>('/contact', { params });
    return response.data;
  },

  updateMessageStatus: async (id: string | number, status: 'unread' | 'read' | 'resolved') => {
    const response = await apiClient.patch<{ success: boolean; message?: string }>(`/contact/${id}/status`, { status });
    return response.data;
  }
};
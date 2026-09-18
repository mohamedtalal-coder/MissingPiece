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

  getContactMessages: async () => {
    const response = await apiClient.get<{ success: boolean; items: any[] }>('/contact');
    return response.data.items;
  },
};
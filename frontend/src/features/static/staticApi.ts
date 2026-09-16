import { apiClient } from '../../api/client';

export interface ContactMessageDto {
  name: string;
  email: string;
  message: string;
}

export const staticApi = {
  sendMessage: async (data: ContactMessageDto) => {
    const response = await apiClient.post('/contact', data);
    return response.data;
  },

  getContactMessages: async () => {
    const response = await apiClient.get('/admin/messages');
    return response.data;
  },
};
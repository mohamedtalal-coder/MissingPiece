import { apiClient } from '../../api/client';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  role: 'guest' | 'buyer' | 'admin';
  addresses?: Address[];
  avatarUrl?: string;
  isEmailVerified?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const accountApi = {
  getProfile: async () => {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>('/account/profile');
    return response.data.data;
  },

  updateProfile: async (data: { name?: string; email?: string; addresses?: Address[] }) => {
    const response = await apiClient.put<{ success: boolean; data: UserProfile }>('/account/profile', data);
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordPayload) => {
    const response = await apiClient.patch<{ success: boolean; message: string }>('/account/password', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.patch<{ success: boolean; data: UserProfile }>(
      '/account/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },
};
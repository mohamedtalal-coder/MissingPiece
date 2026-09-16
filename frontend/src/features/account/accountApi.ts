import { apiClient } from '../../api/client';

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  role: 'guest' | 'buyer' | 'admin';
  address?: Address;
}

export const accountApi = {
  getProfile: async () => {
    const response = await apiClient.get<UserProfile>('/account/profile');
    return response.data;
  },

  updateProfile: async (data: { name: string; address: Address }) => {
    // Backend security ensures role/id are untouched
    const response = await apiClient.put<UserProfile>('/account/profile', data);
    return response.data;
  },
};
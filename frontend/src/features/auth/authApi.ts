import { apiClient } from '../../api/client';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string | number;
    name: string;
    email: string;
    role: 'guest' | 'buyer' | 'admin';
  };
}

export const authApi = {
  register: async (credentials: RegisterCredentials) => {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', credentials);
    return response.data.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },
};
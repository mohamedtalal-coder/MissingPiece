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
  emailSent?: boolean;
  user: {
    id: string | number;
    name: string;
    email: string;
    role: 'guest' | 'buyer' | 'admin';
    isEmailVerified?: boolean;
  };
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyEmailCredentials {
  email: string;
  otp: string;
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

  forgotPassword: async (credentials: ForgotPasswordCredentials) => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', credentials);
    return response.data;
  },

  resetPassword: async (credentials: ResetPasswordCredentials) => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', credentials);
    return response.data;
  },

  verifyEmail: async (credentials: VerifyEmailCredentials) => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/verify-email', credentials);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/resend-verification', { email });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn("Logout request failed", e);
    }
  }
};


import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data;
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data.data;
  },
};
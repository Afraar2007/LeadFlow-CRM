import axiosInstance from './axiosInstance';
import type { User } from '@/types/auth';

export const userApi = {
  updateProfile: async (data: Partial<User> & { currentPassword?: string; newPassword?: string }): Promise<User> => {
    const response = await axiosInstance.put('/auth/me', data);
    return response.data.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.put('/auth/password', { currentPassword, newPassword });
  },

  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users');
    return response.data.data;
  },
};
import api from './api';
import { User } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  async listPendingUsers(): Promise<User[]> {
    // Busca todos os usuários com status 'pending' de qualquer condomínio
    const response = await api.get('/api/v1/users', { 
      params: { status: 'pending' } 
    });
    return response.data;
  },

  async updateUserStatus(userId: string, status: 'approved' | 'denied'): Promise<User> {
    const response = await api.patch(`/api/v1/users/${userId}`, { status });
    return response.data;
  },
};
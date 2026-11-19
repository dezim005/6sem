import api from './api';
import { Condominium } from '../types';

export const condominiumService = {
  async listAll(): Promise<Condominium[]> {
    const response = await api.get('/api/v1/condominiums');
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  async create(data: { name: string; address: string }): Promise<Condominium> {
    const response = await api.post('/api/v1/condominiums', data);
    return response.data?.data || response.data;
  },
};
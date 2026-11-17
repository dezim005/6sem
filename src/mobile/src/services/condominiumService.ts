import api from './api';
import { Condominium } from '../types';

export const condominiumService = {
  async listAll(): Promise<Condominium[]> {
    const response = await api.get('/api/v1/condominiums');
    return response.data;
  },
};
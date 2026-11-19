import api from './api';
import { Spot } from '../types';

export const spotService = {
  async listAll(condominiumId?: string, status?: string): Promise<Spot[]> {
    const params: any = {};
    if (condominiumId) params.condominiumId = condominiumId;
    if (status) params.status = status;

    const response = await api.get('/api/v1/spots', { params });
    // Trata se o backend retornar array direto ou embrulhado em data
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  async getById(id: string): Promise<Spot> {
    const response = await api.get(`/api/v1/spots/${id}`);
    return response.data?.data || response.data;
  },

  async create(data: {
    number: string;
    type: string;
    location: string;
    description?: string;
    ownerId: string;
  }): Promise<Spot> {
    const response = await api.post('/api/ParkingSpots', data);
    return response.data?.data || response.data;
  },

  async updateAvailability(
    spotId: string,
    availability: Array<{
      id: string;
      spotId: string;
      startTime: string;
      endTime: string;
      isRecurring: boolean;
      recurrencePattern?: 'daily' | 'weekly' | 'monthly';
    }>
  ): Promise<Spot> {
    const response = await api.patch(
      `/api/ParkingSpots/${encodeURIComponent(spotId)}/availability`,
      { availability }
    );
    return response.data?.data || response.data;
  },
};
import api from './api';
import { Reservation } from '../types';

export const reservationService = {
  async createReservation(data: {
    spotId: string;
    userId: string;
    startTime: string;
    endTime: string;
    vehiclePlate?: string;
  }): Promise<Reservation> {
    const response = await api.post('/api/v1/reservations', data);
    return response.data?.data || response.data;
  },

  async listUserReservations(userId?: string): Promise<Reservation[]> {
    const params = userId ? { userId } : {};
    const response = await api.get('/api/v1/reservations', { params });
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  async cancelReservation(reservationId: string, userId: string): Promise<void> {
    await api.delete(`/api/v1/reservations/${reservationId}`, {
      params: { userId },
    });
  },
};
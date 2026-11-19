import api from './api';

export const notificationService = {
  async sendReservationConfirmed(data: {
    userId: string;
    userEmail: string;
    title: string;
    message: string;
  }): Promise<void> {
    await api.post('/notifications', {
      ...data,
      type: 'RESERVA_CONFIRMADA',
    });
  },
};

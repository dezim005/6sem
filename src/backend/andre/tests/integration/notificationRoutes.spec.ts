import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { notificationRoutes } from '../../routes/notification.routes';

// Mock COMPLETO do Prisma para cobrir todas as operações do CRUD
vi.mock('../../lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn().mockImplementation(async (args) => ({
        id: 'mock-id-2',
        userId: args.data.userId,
        title: args.data.title,
        message: args.data.message,
        type: args.data.type || 'RESERVA_CONFIRMADA',
        read: false,
        createdAt: new Date(),
      })),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'mock-id-2',
          userId: 'usr-test-999',
          title: 'Lembrete de Vaga',
          message: 'Sua vaga estará reservada a partir de amanhã.',
          type: 'LEMBRETE',
          read: false,
          createdAt: new Date(),
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({
        id: 'mock-id-2',
        userId: 'usr-test-999',
        title: 'Lembrete de Vaga',
        message: 'Sua vaga estará reservada a partir de amanhã.',
        type: 'LEMBRETE',
        read: false,
        createdAt: new Date(),
      }),
      update: vi.fn().mockImplementation(async (args) => ({
        id: args.where.id,
        userId: 'usr-test-999',
        title: 'Lembrete de Vaga',
        message: 'Sua vaga estará reservada a partir de amanhã.',
        type: 'LEMBRETE',
        read: true,
        createdAt: new Date(),
      })),
      delete: vi.fn().mockResolvedValue({
        id: 'mock-id-2',
      }),
    },
  },
}));

// Mock do Mail/Resend
vi.mock('../../lib/mail', () => ({
  transporter: {
    sendMail: vi.fn().mockResolvedValue({}),
  },
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({
        data: { id: 'mock-mail-id-2' },
        error: null,
      }),
    },
  },
}));

const app = express();
app.use(express.json());
app.use(notificationRoutes);

describe('Notification API Routes (Testes de Integração)', () => {
  let createdNotificationId: string;
  const testUserId = 'usr-test-999';

  // 1. Criar Notificação (POST)
  it('POST /notifications -> deve criar uma notificação com sucesso', async () => {
    const response = await request(app)
      .post('/notifications')
      .send({
        userId: testUserId,
        title: 'Lembrete de Vaga',
        message: 'Sua vaga estará reservada a partir de amanhã.',
        type: 'LEMBRETE',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.userId).toBe(testUserId);
    expect(response.body.read).toBe(false);

    createdNotificationId = response.body.id;
  });

  // 2. Listar Notificações do Usuário (GET)
  it('GET /notifications/user/:userId -> deve listar notificações do usuário', async () => {
    const response = await request(app)
      .get(`/notifications/user/${testUserId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // 3. Marcar Notificação como Lida (PATCH)
  it('PATCH /notifications/:id/read -> deve marcar a notificação como lida', async () => {
    const response = await request(app)
      .patch(`/notifications/${createdNotificationId}/read`);

    expect(response.status).toBe(200);
    expect(response.body.read).toBe(true);
  });

  // 4. Deletar Notificação (DELETE)
  it('DELETE /notifications/:id -> deve excluir a notificação', async () => {
    const response = await request(app)
      .delete(`/notifications/${createdNotificationId}`);

    expect(response.status).toBe(204);
  });
});
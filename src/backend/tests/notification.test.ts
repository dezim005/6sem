import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { NotificationController } from '../controllers/NotificationController';

// Mock do Prisma Client
vi.mock('../lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn().mockResolvedValue({
        id: 'mock-uuid-123',
        userId: 'usr-882319',
        title: 'Reserva Confirmada',
        message: 'Sua vaga foi reservada!',
        type: 'RESERVA_CONFIRMADA',
        read: false,
        createdAt: new Date(),
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock do Resend API
vi.mock('../lib/mail', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'msg-mock-123' }, error: null }),
    },
  },
}));

const app = express();
app.use(express.json());
const controller = new NotificationController();
app.post('/notifications', (req, res) => controller.create(req, res));

describe('Serviço de Notificações - Suíte de Testes', () => {
  it('Deve criar uma notificação e retornar status 201 Created', async () => {
    const response = await request(app)
      .post('/notifications')
      .send({
        userId: 'usr-882319',
        userEmail: 'andre.lopes.1521271@sga.pucminas.br',
        title: 'Reserva Confirmada',
        message: 'Sua vaga foi reservada!',
        type: 'RESERVA_CONFIRMADA',
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Reserva Confirmada');
  });

  it('Deve retornar status 400 Bad Request se faltarem campos obrigatórios', async () => {
    const response = await request(app)
      .post('/notifications')
      .send({
        userId: '', // Campo vazio inválido 
        title: '',
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
import { describe, it, expect, vi } from 'vitest';
import { NotificationController } from '../../controllers/NotificationController';

// Mock do Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn().mockResolvedValue({
        id: 'mock-id-1',
        userId: 'usr-001',
        title: 'Teste',
        message: 'Mensagem de teste',
        type: 'RESERVA_CONFIRMADA',
        read: false,
        createdAt: new Date(),
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock do Mail/Transporter
vi.mock('../../lib/mail', () => ({
  transporter: {
    sendMail: vi.fn().mockResolvedValue({}),
  },
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({
        data: { id: 'mock-mail-id' },
        error: null,
      }),
    },
  },
}));

describe('NotificationController (Testes Unitários)', () => {
  const controller = new NotificationController();

  it('deve retornar status 400 se faltarem campos obrigatórios na criação', async () => {
    // Objeto mock de Requisição sem userId e mensagem
    const req = {
      body: {
        title: 'Notificação sem corpo completo',
      },
    } as any;

    // Objeto mock de Resposta HTTP
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await controller.create(req, res);

    // Asserções
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Campos obrigatórios ausentes.',
    });
  });
});
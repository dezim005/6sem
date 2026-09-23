import { describe, it, expect, vi } from 'vitest';
import { NotificationController } from '../../controllers/NotificationController';

describe('NotificationController (Testes Unitários)', () => {
  const controller = new NotificationController();

  it('deve retornar status 400 se faltarem campos obrigatórios na criação', async () => {
    // Objeto mock de Requisição sem userId e mensagem
    const req = {
      body: {
        title: 'Notificação sem corpo completo'
      }
    } as any;

    // Objeto mock de Resposta HTTP
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    await controller.create(req, res);

    // Asserções
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Campos obrigatórios ausentes (userId, title, message).'
    });
  });
});
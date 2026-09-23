import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class NotificationController {
  // 1. CREATE: Criar Notificação (POST /notifications)
  async create(req: Request, res: Response) {
    try {
      const { userId, title, message, type } = req.body;

      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes (userId, title, message).' });
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: type || 'GERAL',
        },
      });

      return res.status(201).json(notification);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar notificação.' });
    }
  }

  // 2. READ: Listar Notificações do Usuário (GET /notifications/user/:userId)
  async listByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar notificações do usuário.' });
    }
  }

  // 3. UPDATE: Marcar Notificação como Lida (PATCH /notifications/:id/read)
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const notificationExists = await prisma.notification.findUnique({ where: { id } });

      if (!notificationExists) {
        return res.status(404).json({ error: 'Notificação não encontrada.' });
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return res.status(200).json(updatedNotification);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar status da notificação.' });
    }
  }

  // 4. DELETE: Remover Notificação (DELETE /notifications/:id)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const notificationExists = await prisma.notification.findUnique({ where: { id } });

      if (!notificationExists) {
        return res.status(404).json({ error: 'Notificação não encontrada.' });
      }

      await prisma.notification.delete({ where: { id } });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir notificação.' });
    }
  }
}
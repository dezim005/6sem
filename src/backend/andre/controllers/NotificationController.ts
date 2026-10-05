import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { resend } from '../lib/mail';

export class NotificationController {
  // CREATE: Criar Notificação e Enviar E-mail
  async create(req: Request, res: Response) {
    try {
      const { userId, userEmail, title, message, type } = req.body;

      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      }

      // 1. Salva a notificação no banco PostgreSQL (Neon)
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: type || 'RESERVA_CONFIRMADA',
        },
      });

      // 2. Responde imediatamente para o frontend
      res.status(201).json(notification);

      // 3. Dispara o e-mail via API HTTP (Porta 443 - NUNCA é bloqueada pelo Render)
      if (userEmail) {
        resend.emails.send({
          from: 'Vaga Livre <onboarding@resend.dev>', // Remetente de testes padrão do Resend
          to: userEmail,
          subject: `🚗 Vaga Livre: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #2b6cb0;">Reserva Confirmada!</h2>
              <p>${message}</p>
              <hr />
              <p><small>Mensagem automática enviada pelo sistema Vaga Livre.</small></p>
            </div>
          `,
        }).then((result) => {
          console.log(`E-mail enviado com sucesso via Resend:`, result);
        }).catch((mailError) => {
          console.error('Erro ao enviar e-mail via Resend:', mailError);
        });
      }

    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      return res.status(500).json({ error: 'Erro ao processar notificação.' });
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
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { transporter } from '../lib/mail';

export class NotificationController {
  // CREATE: Criar Notificação e Enviar E-mail
  async create(req: Request, res: Response) {
    try {
      const { userId, userEmail, title, message, type } = req.body;

      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes (userId, title, message).' });
      }

      // 1. Persiste a notificação no banco PostgreSQL (Neon)
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: type || 'RESERVA_CONFIRMADA',
        },
      });

      // 2. Responde IMEDIATAMENTE para o frontend (Evita timeout no navegador)
      res.status(201).json(notification);

      // 3. Dispara o e-mail em SEGUNDO PLANO
      if (userEmail && process.env.EMAIL_USER) {
        transporter.sendMail({
          from: `"Vaga Livre" <${process.env.EMAIL_USER}>`,
          to: userEmail,
          subject: `🚗 Vaga Livre: ${title}`,
          html: `
            <div>
              <h2>Reserva Confirmada!</h2>
              <p>${message}</p>
              <hr />
              <p><small>Mensagem automática enviada pelo sistema Vaga Livre.</small></p>
            </div>
          `,
        }).then(() => {
          console.log(`E-mail enviado com sucesso para ${userEmail}`);
        }).catch((mailError) => {
          console.error('Erro ao enviar e-mail em segundo plano:', mailError);
        });
      }

    } catch (error) {
      console.error('Erro ao processar/criar notificação no banco:', error);
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
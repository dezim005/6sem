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

      // 2. Dispara o e-mail de confirmação se o e-mail for fornecido
      if (userEmail) {
        await transporter.sendMail({
          from: `"Vaga Livre" <${process.env.EMAIL_USER}>`,
          to: userEmail,
          subject: `🚗 Vaga Livre: ${title}`,
          html: ` 
            <divstyle="font-family: Arial, sans-serif; padding: 20px; color: #333;"> 
            <h2>Confirmação de Reserva - Vaga Livre</h2>
            <p>Olá,</p>
            <p>Sua reserva foi processada com sucesso!</p>
            <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #2b6cb0; margin: 15px 0;">
              <strong>Detalhes:</strong> ${message}
            </div>
            <p>Obrigado por utilizar o sistema <strong>Vaga Livre</strong>.</p>
            </div>
          `,
        });
      }

      return res.status(201).json(notification);
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      return res.status(500).json({ error: 'Erro ao processar notificação ou enviar e-mail.' });
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
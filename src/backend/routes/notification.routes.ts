import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const notificationRoutes = Router();
const controller = new NotificationController();

// Endpoints CRUD
notificationRoutes.post('/notifications', (req, res) => controller.create(req, res));
notificationRoutes.get('/notifications/user/:userId', (req, res) => controller.listByUser(req, res));
notificationRoutes.patch('/notifications/:id/read', (req, res) => controller.markAsRead(req, res));
notificationRoutes.delete('/notifications/:id', (req, res) => controller.delete(req, res));

export { notificationRoutes };
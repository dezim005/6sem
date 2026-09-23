import express from 'express';
import { notificationRoutes } from './routes/notification.routes';

const app = express();

app.use(express.json());

// Registro das rotas de notificação
app.use(notificationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
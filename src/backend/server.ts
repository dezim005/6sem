import express from 'express';
import cors from 'cors'; // 1\. Importe o cors
import { notificationRoutes } from './routes/notification.routes';

const app = express();

// 2. Habilite o CORS antes de registrar as rotas 
app.use(cors()); 

app.use(express.json());

// Registro das rotas de notificação
app.use(notificationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
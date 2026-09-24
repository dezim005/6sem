import nodemailer from 'nodemailer';

// Configuração do transportador SMTP (Exemplo usando Gmail ou serviço SMTP)
export const transporter = nodemailer.createTransport({
  service: 'gmail', // ou host/port customizado
  auth: {
    user: process.env.EMAIL_USER, // Seu e-mail no .env
    pass: process.env.EMAIL_PASS, // Sua senha de aplicativo no .env
  },
});
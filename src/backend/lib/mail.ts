import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({ 
  host: 'smtp.gmail.com', 
  port: 587, 
  secure: false, // Define uso de STARTTLS na porta 587 (liberada no Render) 
  family: 4,
  pool: true, // Reutiliza a mesma conexão para múltiplos envios
  maxConnections: 1, 
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  }, 
  tls: { 
    rejectUnauthorized: false, // Evita bloqueio por certificados intermediários 
  }, 
});
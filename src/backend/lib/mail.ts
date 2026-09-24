import nodemailer from 'nodemailer';
import dns from 'dns'; 

// Força o Node.js a priorizar IPv4 (Resolve o erro ENETUNREACH/IPv6 no Render) 
dns.setDefaultResultOrder('ipv4first');

export const transporter = nodemailer.createTransport({ 
  host: 'smtp.gmail.com', 
  port: 587, 
  secure: false, // Define uso de STARTTLS na porta 587 (liberada no Render) 
  pool: true, // Reutiliza a mesma conexão para múltiplos envios
  maxConnections: 1, 
  maxMessages: 100,
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  }, 
  tls: { 
    rejectUnauthorized: false, // Evita bloqueio por certificados intermediários 
  }, 
});
import nodemailer from 'nodemailer'; 

export const transporter = nodemailer.createTransport({ 
  host: 'smtp.gmail.com', 
  port: 587, 
  secure: false, // Define uso de STARTTLS na porta 587 (liberada no Render) 
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  }, 
  tls: { 
    rejectUnauthorized: false, // Evita bloqueio por certificados intermediários 
  }, 
});
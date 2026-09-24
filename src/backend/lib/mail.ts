import { Resend } from 'resend';

// Inicializa a API do Resend usando a chave de ambiente 
export const resend = new Resend(process.env.RESEND_API_KEY);
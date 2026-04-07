import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const sendVerificationEmail = async (email: string, token: string) => {
  const appUrl = process.env.APP_URL || 'https://finansys.dksystem.online';
  const verificationLink = `${appUrl}/verify-email?token=${token}`;
  const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';

  if (!resend) {
    console.warn('Resend API key ausente. Email de verificação não será enviado.');
    return null;
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verifique seu email - Finansys',
      html: `
        <h1>Bem-vindo ao Finansys!</h1>
        <p>Por favor, verifique seu email clicando no link abaixo:</p>
        <a href="${verificationLink}" style="padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">Verificar Email</a>
        <p>Se você não criou esta conta, ignore este email.</p>
      `
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const appUrl = process.env.APP_URL || 'https://finansys.dksystem.online';
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
  if (!resend) {
    console.warn('Resend API key ausente. Email de reset não será enviado.');
    return null;
  }
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Redefinição de senha - Finansys',
      html: `
        <h1>Redefinição de senha</h1>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        <p>Se você não solicitou esta ação, ignore este email.</p>
      `
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

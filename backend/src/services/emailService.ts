import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `https://finansys.site/verify-email?token=${token}`;

  if (!resend) {
    console.warn('Resend API key ausente. Email de verificação não será enviado.');
    return null;
  }

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
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

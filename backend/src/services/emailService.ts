import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const sendVerificationEmail = async (email: string, token: string) => {
  const appUrl = process.env.APP_URL || 'https://finansys.dksystem.online';
  const verificationLink = `${appUrl}/verify-email?token=${token}`;
  const fromEmail = process.env.RESEND_FROM || 'suporte@dksystem.online';

  if (!resend) {
    console.warn('CRITICAL: Resend API key is missing. Registration emails will NOT be sent.');
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
        <p>Se vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o criou esta conta, ignore este email.</p>
      `
    });
    
    if (data.error) {
       console.error('Resend API returned error:', data.error);
       throw new Error(`Resend Error: ${data.error.message}`);
    } else {
       console.log('Verification email sent successfully to:', email);
    }
    
    return data;
  } catch (error: any) {
    console.error('Fatal error in sendVerificationEmail:', error?.message || error);
    return null;
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const appUrl = process.env.APP_URL || 'https://finansys.dksystem.online';
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  const fromEmail = process.env.RESEND_FROM || 'suporte@dksystem.online';

  if (!resend) {
    console.warn('CRITICAL: Resend API key is missing. Reset emails will NOT be sent.');
    return null;
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'RedefiniÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de senha - Finansys',
      html: `
        <h1>RedefiniÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de senha</h1>
        <p>Clique no botÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o abaixo para redefinir sua senha:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        <p>Se vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o solicitou esta aÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o, ignore este email.</p>
      `
    });

    if (data.error) {
       console.error('Resend API returned error (reset):', data.error);
       throw new Error(`Resend Error (Reset): ${data.error.message}`);
    } else {
       console.log('Reset password email sent successfully to:', email);
    }

    return data;
  } catch (error: any) {
    console.error('Fatal error in sendResetPasswordEmail:', error?.message || error);
    return null;
  }
};
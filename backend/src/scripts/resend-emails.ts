import { User } from '../models';
import { sendVerificationEmail } from '../services/emailService';
import sequelize from '../config/database';

/**
 * Script para re-enviar e-mails de verificaÃ§Ã£o para usuÃ¡rios que ainda nÃ£o confirmaram a conta.
 * Ãštil para limpar a fila apÃ³s a configuraÃ§Ã£o correta do domÃ­nio dksystem.online.
 */
async function resendVerifications() {
  console.log('--- Iniciando Script de Re-envio de E-mails ---');
  
  try {
    // Garante conexÃ£o com o banco
    await sequelize.authenticate();
    console.log('Banco de dados conectado.');

    // Busca usuÃ¡rios nÃ£o verificados que tenham um token
    const pendingUsers = await User.findAll({
      where: {
        isVerified: false
      }
    });

    console.log(`Encontrados ${pendingUsers.length} usuÃ¡rios pendentes.`);

    for (const user of pendingUsers) {
      if (user.verificationToken) {
        console.log(`Enviando para: ${user.email}...`);
        try {
          await sendVerificationEmail(user.email, user.verificationToken);
          console.log(`âœ… Sucesso: ${user.email}`);
        } catch (error) {
          console.error(`âŒ Falha ao enviar para ${user.email}:`, error);
        }
      } else {
        console.log(`âš ï¸ UsuÃ¡rio ${user.email} nÃ£o possui token de verificaÃ§Ã£o.`);
      }
    }

    console.log('--- Script Finalizado com Sucesso ---');
    process.exit(0);
  } catch (error) {
    console.error('Erro fatal ao rodar script:', error);
    process.exit(1);
  }
}

resendVerifications();

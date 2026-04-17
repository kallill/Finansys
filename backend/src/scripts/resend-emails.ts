import { User } from '../models';
import { sendVerificationEmail } from '../services/emailService';
import sequelize from '../config/database';

/**
 * Script para re-enviar e-mails de verificaÃƒÂ§ÃƒÂ£o para usuÃƒÂ¡rios que ainda nÃƒÂ£o confirmaram a conta.
 * ÃƒÅ¡til para limpar a fila apÃƒÂ³s a configuraÃƒÂ§ÃƒÂ£o correta do domÃƒÂ­nio dksystem.online.
 */
async function resendVerifications() {
  console.log('--- Iniciando Script de Re-envio de E-mails ---');
  
  try {
    // Garante conexÃƒÂ£o com o banco
    await sequelize.authenticate();
    console.log('Banco de dados conectado.');

    // Busca usuÃƒÂ¡rios nÃƒÂ£o verificados que tenham um token
    const pendingUsers = await User.findAll({
      where: {
        isVerified: false
      }
    });

    console.log(`Encontrados ${pendingUsers.length} usuÃƒÂ¡rios pendentes.`);

    for (const user of pendingUsers) {
      if (user.verificationToken) {
        console.log(`Enviando para: ${user.email}...`);
        try {
          await sendVerificationEmail(user.email, user.verificationToken);
          console.log(`Ã¢Å“â€¦ Sucesso: ${user.email}`);
        } catch (error) {
          console.error(`Ã¢ÂÅ’ Falha ao enviar para ${user.email}:`, error);
        }
      } else {
        console.log(`Ã¢Å¡Â Ã¯Â¸Â UsuÃƒÂ¡rio ${user.email} nÃƒÂ£o possui token de verificaÃƒÂ§ÃƒÂ£o.`);
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

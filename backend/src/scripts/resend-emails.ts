import { User } from '../models';
import { sendVerificationEmail } from '../services/emailService';
import sequelize from '../config/database';

/**
 * Script para re-enviar e-mails de verificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios que ainda nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o confirmaram a conta.
 * ÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡til para limpar a fila apÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³s a configuraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o correta do domÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­nio dksystem.online.
 */
async function resendVerifications() {
  console.log('--- Iniciando Script de Re-envio de E-mails ---');
  
  try {
    // Garante conexÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o com o banco
    await sequelize.authenticate();
    console.log('Banco de dados conectado.');

    // Busca usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o verificados que tenham um token
    const pendingUsers = await User.findAll({
      where: {
        isVerified: false
      }
    });

    console.log(`Encontrados ${pendingUsers.length} usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios pendentes.`);

    for (const user of pendingUsers) {
      if (user.verificationToken) {
        console.log(`Enviando para: ${user.email}...`);
        try {
          await sendVerificationEmail(user.email, user.verificationToken);
          console.log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Sucesso: ${user.email}`);
        } catch (error) {
          console.error(`ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€¦Ã¢â‚¬â„¢ Falha ao enviar para ${user.email}:`, error);
        }
      } else {
        console.log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â UsuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio ${user.email} nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o possui token de verificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.`);
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
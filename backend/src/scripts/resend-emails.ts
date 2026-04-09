import { User } from '../models';
import { sendVerificationEmail } from '../services/emailService';
import sequelize from '../config/database';

/**
 * Script para re-enviar e-mails de verificação para usuários que ainda não confirmaram a conta.
 * Útil para limpar a fila após a configuração correta do domínio dksystem.online.
 */
async function resendVerifications() {
  console.log('--- Iniciando Script de Re-envio de E-mails ---');
  
  try {
    // Garante conexão com o banco
    await sequelize.authenticate();
    console.log('Banco de dados conectado.');

    // Busca usuários não verificados que tenham um token
    const pendingUsers = await User.findAll({
      where: {
        isVerified: false
      }
    });

    console.log(`Encontrados ${pendingUsers.length} usuários pendentes.`);

    for (const user of pendingUsers) {
      if (user.verificationToken) {
        console.log(`Enviando para: ${user.email}...`);
        try {
          await sendVerificationEmail(user.email, user.verificationToken);
          console.log(`✅ Sucesso: ${user.email}`);
        } catch (error) {
          console.error(`❌ Falha ao enviar para ${user.email}:`, error);
        }
      } else {
        console.log(`⚠️ Usuário ${user.email} não possui token de verificação.`);
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

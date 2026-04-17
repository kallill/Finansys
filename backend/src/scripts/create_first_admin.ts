import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import CRMAdmin from '../models/CRMAdmin';

const seedAdmin = async () => {
  try {
    // Sync to ensure table exists
    await sequelize.sync({ alter: true });
    console.log('ðŸ“¦ Tabela sincronizada com sucesso.');

    // ConfiguraÃ§Ãµes do seu primeiro acesso:
    const nome = 'Kallil (CEO)';
    const email = 'admin@cerasus.com.br';
    const senhaAberto = 'senha1234'; 

    console.log(`ðŸ” Verificando se o admin ${email} jÃ¡ existe...`);
    const adminExists = await CRMAdmin.findOne({ where: { email } });

    if (adminExists) {
      console.log('âš ï¸ O usuÃ¡rio Administrador jÃ¡ existe! Rode o sistema com npm run dev e faÃ§a login.');
      process.exit(0);
    }

    console.log('â³ Criptografando a senha...');
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaAberto, salt);

    console.log('âœ… Inserindo o administrador mestre no banco de dados...');
    await CRMAdmin.create({
      nome,
      email,
      senha_hash: senhaHash,
      nivel_acesso: 'Admin'
    });

    console.log('ðŸŽ‰ SUCESSO! O seu primeiro Administrador foi criado.');
    console.log(`-- Use o email: ${email} e a senha: ${senhaAberto} para logar no Finansys CRM.`);
    
    process.exit(0);
  } catch (error) {
    console.error('âŒ Erro crÃ­tico ao criar admin:', error);
    process.exit(1);
  }
};

seedAdmin();

import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import CRMAdmin from '../models/CRMAdmin';

const seedAdmin = async () => {
  try {
    // Sync to ensure table exists
    await sequelize.sync({ alter: true });
    console.log('Ã°Å¸â€œÂ¦ Tabela sincronizada com sucesso.');

    // ConfiguraÃƒÂ§ÃƒÂµes do seu primeiro acesso:
    const nome = 'Kallil (CEO)';
    const email = 'admin@cerasus.com.br';
    const senhaAberto = 'senha1234'; 

    console.log(`Ã°Å¸â€Â Verificando se o admin ${email} jÃƒÂ¡ existe...`);
    const adminExists = await CRMAdmin.findOne({ where: { email } });

    if (adminExists) {
      console.log('Ã¢Å¡Â Ã¯Â¸Â O usuÃƒÂ¡rio Administrador jÃƒÂ¡ existe! Rode o sistema com npm run dev e faÃƒÂ§a login.');
      process.exit(0);
    }

    console.log('Ã¢ÂÂ³ Criptografando a senha...');
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaAberto, salt);

    console.log('Ã¢Å“â€¦ Inserindo o administrador mestre no banco de dados...');
    await CRMAdmin.create({
      nome,
      email,
      senha_hash: senhaHash,
      nivel_acesso: 'Admin'
    });

    console.log('Ã°Å¸Å½â€° SUCESSO! O seu primeiro Administrador foi criado.');
    console.log(`-- Use o email: ${email} e a senha: ${senhaAberto} para logar no Finansys CRM.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Ã¢ÂÅ’ Erro crÃƒÂ­tico ao criar admin:', error);
    process.exit(1);
  }
};

seedAdmin();

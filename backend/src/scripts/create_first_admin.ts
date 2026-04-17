import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import CRMAdmin from '../models/CRMAdmin';

const seedAdmin = async () => {
  try {
    // Sync to ensure table exists
    await sequelize.sync({ alter: true });
    console.log('ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€šÃ‚Â¦ Tabela sincronizada com sucesso.');

    // ConfiguraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes do seu primeiro acesso:
    const nome = 'Kallil (CEO)';
    const email = 'admin@cerasus.com.br';
    const senhaAberto = 'senha1234'; 

    console.log(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â Verificando se o admin ${email} jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ existe...`);
    const adminExists = await CRMAdmin.findOne({ where: { email } });

    if (adminExists) {
      console.log('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â O usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio Administrador jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ existe! Rode o sistema com npm run dev e faÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a login.');
      process.exit(0);
    }

    console.log('ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€šÃ‚Â³ Criptografando a senha...');
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaAberto, salt);

    console.log('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Inserindo o administrador mestre no banco de dados...');
    await CRMAdmin.create({
      nome,
      email,
      senha_hash: senhaHash,
      nivel_acesso: 'Admin'
    });

    console.log('ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â½ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â° SUCESSO! O seu primeiro Administrador foi criado.');
    console.log(`-- Use o email: ${email} e a senha: ${senhaAberto} para logar no Finansys CRM.`);
    
    process.exit(0);
  } catch (error) {
    console.error('ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€¦Ã¢â‚¬â„¢ Erro crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­tico ao criar admin:', error);
    process.exit(1);
  }
};

seedAdmin();
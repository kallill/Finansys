import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CRMAdmin } from '../models';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'E-mail e senha sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o obrigatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rios.' });
      return;
    }

    const admin = await CRMAdmin.findOne({ where: { email } });

    if (!admin) {
      res.status(401).json({ success: false, message: 'Credenciais invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lidas.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.senha_hash);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Credenciais invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lidas.' });
      return;
    }

    const defaultSecret = 'super_secret_finansys_key_change_me';
    const secret = process.env.CRM_JWT_SECRET || process.env.JWT_SECRET || defaultSecret;

    // Token for admin (lasts 12 hours)
    const token = jwt.sign(
      { id: admin.id, nivel_acesso: admin.nivel_acesso },
      secret,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivel_acesso: admin.nivel_acesso
      }
    });

  } catch (error) {
    console.error('Erro no login do admin:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

/**
 * Lista todos os administradores (Apenas para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel Admin)
 */
export const getAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.admin?.nivel_acesso !== 'Admin') {
      res.status(403).json({ message: 'Acesso negado. Apenas administradores podem gerenciar usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios.' });
      return;
    }

    const admins = await CRMAdmin.findAll({
      attributes: ['id', 'nome', 'email', 'nivel_acesso', 'createdAt']
    });

    res.json(admins);
  } catch (error) {
    console.error('Erro ao listar admins:', error);
    res.status(500).json({ message: 'Erro ao listar administradores.' });
  }
};

/**
 * Cria um novo administrador
 */
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.admin?.nivel_acesso !== 'Admin') {
      res.status(403).json({ message: 'Acesso negado.' });
      return;
    }

    const { nome, email, password, nivel_acesso } = req.body;

    const exists = await CRMAdmin.findOne({ where: { email } });
    if (exists) {
      res.status(400).json({ message: 'Este e-mail jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ em uso.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(password, salt);

    const newAdmin = await CRMAdmin.create({
      nome,
      email,
      senha_hash,
      nivel_acesso: nivel_acesso || 'Standard'
    });

    res.status(201).json({
      id: newAdmin.id,
      nome: newAdmin.nome,
      email: newAdmin.email,
      nivel_acesso: newAdmin.nivel_acesso
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ message: 'Erro ao criar administrador.' });
  }
};

/**
 * Remove um administrador
 */
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.admin?.nivel_acesso !== 'Admin') {
      res.status(403).json({ message: 'Acesso negado.' });
      return;
    }

    const { id } = req.params;

    // Impedir que o admin delete a si mesmo acidentalmente por aqui
    if (id === req.admin.id) {
      res.status(400).json({ message: 'VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o pode deletar sua prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³pria conta.' });
      return;
    }

    await CRMAdmin.destroy({ where: { id } });
    res.json({ success: true, message: 'Administrador removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar admin:', error);
    res.status(500).json({ message: 'Erro ao remover administrador.' });
  }
};

/**
 * Altera os dados do perfil logado (nome e senha)
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, password } = req.body;
    const adminId = req.admin?.id;

    if (!adminId) {
      res.status(401).json({ message: 'NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o autorizado.' });
      return;
    }

    const admin = await CRMAdmin.findByPk(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Administrador nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrado.' });
      return;
    }

    if (nome) admin.nome = nome;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.senha_hash = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivel_acesso: admin.nivel_acesso
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados do perfil.' });
  }
};
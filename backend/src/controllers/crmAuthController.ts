import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CRMAdmin } from '../models';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
      return;
    }

    const admin = await CRMAdmin.findOne({ where: { email } });

    if (!admin) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.senha_hash);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
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

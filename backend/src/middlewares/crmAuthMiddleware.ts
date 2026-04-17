import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendendo a interface Request para incluir os dados do Admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        nivel_acesso: string;
      };
    }
  }
}

export const checkCrmAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token nÃƒÂ£o fornecido ou formato invÃƒÂ¡lido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const defaultSecret = 'super_secret_finansys_key_change_me';
    const secret = process.env.CRM_JWT_SECRET || process.env.JWT_SECRET || defaultSecret;

    const decoded = jwt.verify(token, secret) as { id: string; nivel_acesso: string };
    
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token de Admin invÃƒÂ¡lido ou expirado.' });
  }
};

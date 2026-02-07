import { Request, Response } from 'express';
import sequelize from '../config/database';

export const health = async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ db: 'ok' });
  } catch {
    res.status(503).json({ db: 'error' });
  }
};

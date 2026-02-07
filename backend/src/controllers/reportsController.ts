import { Request, Response } from 'express';
import { Transaction } from '../models';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const transactionsReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { start, end, type, category } = req.query as Record<string, string>;
    const where: any = { userId };
    if (start || end) {
      const s = start ? new Date(start) : new Date(0);
      const e = end ? new Date(end) : new Date();
      where.date = { [Op.between]: [s, e] };
    }
    if (type && (type === 'income' || type === 'expense')) where.type = type;
    if (category) where.category = category;
    const transactions = await Transaction.findAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

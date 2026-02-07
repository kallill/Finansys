import { Request, Response } from 'express';
import { Transaction } from '../models';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    const toNumber = (v: any) => typeof v === 'string' ? parseFloat(v) : Number(v);
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      const amt = toNumber((t as any).amount);
      if (t.type === 'income') income += amt;
      else expense += amt;
    });
    const balance = income - expense;

    res.json({
      month: now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      totals: { income, expense, balance }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSeries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: { [Op.gte]: start }
      }
    });
    const bucket: Record<string, { income: number; expense: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      bucket[k] = { income: 0, expense: 0 };
    }
    const toNumber = (v: any) => typeof v === 'string' ? parseFloat(v) : Number(v);
    transactions.forEach(t => {
      const d = new Date((t as any).date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!bucket[k]) bucket[k] = { income: 0, expense: 0 };
      const amt = toNumber((t as any).amount);
      if (t.type === 'income') bucket[k].income += amt;
      else bucket[k].expense += amt;
    });
    const series = Object.entries(bucket).map(([key, v]) => {
      const [y, m] = key.split('-');
      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString('pt-BR', { month: 'short' });
      return { key, label, ...v };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

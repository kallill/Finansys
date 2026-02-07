import { Request, Response } from 'express';
import { Transaction } from '../models';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const summary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const transactions = await Transaction.findAll({
      where: { userId, date: { [Op.between]: [monthStart, monthEnd] } }
    });
    const toNumber = (v: any) => typeof v === 'string' ? parseFloat(v) : Number(v);
    let income = 0;
    let expense = 0;
    const categories: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const amt = toNumber((t as any).amount);
      const cat = (t as any).category || 'Geral';
      if (!categories[cat]) categories[cat] = { income: 0, expense: 0 };
      if (t.type === 'income') {
        income += amt;
        categories[cat].income += amt;
      } else {
        expense += amt;
        categories[cat].expense += amt;
      }
    });
    const balance = income - expense;
    const dist = Object.entries(categories).map(([category, v]) => ({ category, ...v }));
    res.json({ totals: { income, expense, balance }, categories: dist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

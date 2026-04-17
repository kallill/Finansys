import { Request, Response } from 'express';
import { Transaction } from '../models';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const listTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
    res.json({ transactions: transactions || [] });
  } catch (error: any) {
    console.error('Error fetching transactions (Check DB columns):', error);
    // Return empty list instead of 500 if possible, to keep the UI alive
    res.status(200).json({ transactions: [], error: 'Algumas funÃ§Ãµes podem estar indisponÃ­veis durante a migraÃ§Ã£o' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { description, amount, type, category, date, status, dueDate, creditCardId } = req.body;
    const tx = await Transaction.create({
      description,
      amount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      status: status || 'paid',
      dueDate: dueDate ? new Date(dueDate) : (date ? new Date(date) : new Date()),
      creditCardId: creditCardId || null,
      userId
    });
    res.status(201).json({ transaction: tx });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const tx = await Transaction.findOne({ where: { id, userId } });
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    const { description, amount, type, category, date, status, dueDate, creditCardId } = req.body;
    tx.description = description ?? tx.description;
    tx.amount = amount ?? tx.amount;
    tx.type = type ?? tx.type;
    tx.category = category ?? tx.category;
    tx.date = date ? new Date(date) : tx.date;
    tx.status = status ?? tx.status;
    tx.dueDate = dueDate ? new Date(dueDate) : tx.dueDate;
    tx.creditCardId = creditCardId !== undefined ? creditCardId : tx.creditCardId;
    await tx.save();
    res.json({ transaction: tx });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const removed = await Transaction.destroy({ where: { id, userId } });
    if (!removed) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

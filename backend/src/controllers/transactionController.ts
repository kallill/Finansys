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
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { description, amount, type, category, date } = req.body;
    const tx = await Transaction.create({
      description,
      amount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
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
    const { description, amount, type, category, date } = req.body;
    tx.description = description ?? tx.description;
    tx.amount = amount ?? tx.amount;
    tx.type = type ?? tx.type;
    tx.category = category ?? tx.category;
    tx.date = date ? new Date(date) : tx.date;
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

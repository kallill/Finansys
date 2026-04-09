import { Request, Response } from 'express';
import { CreditCard, Transaction } from '../models';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const listCreditCards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cards = await CreditCard.findAll({
      where: { userId },
      include: [{
        model: Transaction,
        as: 'transactions',
        where: { status: 'pending' },
        required: false
      }]
    });

    // Calcula o saldo utilizado (fatura atual) para cada cartão
    const cardsWithBalance = cards.map(card => {
      const usedLimit = (card as any).transactions?.reduce((acc: number, tx: any) => acc + Number(tx.amount), 0) || 0;
      return {
        ...card.toJSON(),
        usedLimit,
        availableLimit: Number(card.limit) - usedLimit
      };
    });

    res.json({ creditCards: cardsWithBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCreditCard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, limit, closingDay, dueDay } = req.body;
    const card = await CreditCard.create({
      name,
      limit,
      closingDay,
      dueDay,
      userId
    });

    res.status(201).json({ creditCard: card });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCreditCard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const card = await CreditCard.findOne({ where: { id, userId } });
    if (!card) return res.status(404).json({ message: 'Credit Card not found' });

    const { name, limit, closingDay, dueDay } = req.body;
    await card.update({ name, limit, closingDay, dueDay });

    res.json({ creditCard: card });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCreditCard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const removed = await CreditCard.destroy({ where: { id, userId } });
    if (!removed) return res.status(404).json({ message: 'Credit Card not found' });

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

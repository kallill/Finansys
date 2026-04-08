import { Request, Response } from 'express';
import { Transaction, User } from '../models';

/**
 * POST /webhook/transaction
 * Rota pública autenticada por API Key estática (BOT_API_KEY).
 * Usada pelo n8n para criar transações via bot do WhatsApp.
 *
 * Body: { userEmail, description, amount, type, category, date? }
 * Header: x-api-key: <BOT_API_KEY>
 */
export const webhookCreateTransaction = async (req: Request, res: Response) => {
  try {
    // Valida a API Key do bot
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.BOT_API_KEY;

    if (!validKey || apiKey !== validKey) {
      return res.status(401).json({ message: 'API Key inválida.' });
    }

    const { userEmail, phone, description, amount, type, category, date } = req.body;

    // Validações básicas
    if ((!userEmail && !phone) || !description || !amount || !type) {
      return res.status(400).json({
        message: 'Campos obrigatórios: (userEmail ou phone), description, amount, type.'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        message: 'Tipo inválido. Use "income" ou "expense".'
      });
    }

    // Busca o usuário pelo email ou telefone
    let user;
    if (phone) {
      user = await User.findOne({ where: { phone: phone } });
    }
    if (!user && userEmail) {
      user = await User.findOne({ where: { email: userEmail } });
    }

    if (!user) {
      return res.status(404).json({
        message: `Usuário não encontrado com o contato fornecido (${phone || userEmail}). Cadastre seu telefone no App.`
      });
    }

    // Cria a transação
    const tx = await Transaction.create({
      description,
      amount: parseFloat(amount),
      type,
      category: category || 'Outros',
      date: date ? new Date(date) : new Date(),
      userId: (user as any).id
    });

    // Resposta amigável para o n8n retornar ao WhatsApp
    const emoji = type === 'income' ? '💰' : '💸';
    const typeLabel = type === 'income' ? 'receita' : 'despesa';
    const amountFormatted = parseFloat(amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    return res.status(201).json({
      transaction: tx,
      message: `${emoji} *${typeLabel}* registrada com sucesso!\n📝 ${description}\n💵 ${amountFormatted}\n🏷️ ${category || 'Outros'}`
    });
  } catch (error) {
    console.error('[WebhookController] Erro ao criar transação:', error);
    return res.status(500).json({ message: 'Erro interno ao registrar transação.' });
  }
};

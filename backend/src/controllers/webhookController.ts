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

    // Sanitiza o telefone removendo caracteres não-numéricos
    const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;

    // Busca o usuário pelo email ou telefone
    let user;
    if (cleanPhone) {
      // 1. Tenta busca exata
      user = await User.findOne({ where: { phone: cleanPhone } });
      
      // 2. Se não achou e é um número brasileiro (+55)
      if (!user && cleanPhone.startsWith('55')) {
        if (cleanPhone.length === 12) {
          // Cliente mandou SEM o 9, vamos pesquisar adicionando o 9
          const phoneWith9 = `55${cleanPhone.substring(2, 4)}9${cleanPhone.substring(4)}`;
          user = await User.findOne({ where: { phone: phoneWith9 } });
        } else if (cleanPhone.length === 13) {
          // Cliente mandou COM o 9, vamos pesquisar tirando o 9
          const phoneWithout9 = `55${cleanPhone.substring(2, 4)}${cleanPhone.substring(5)}`;
          user = await User.findOne({ where: { phone: phoneWithout9 } });
        }
      }
    }
    
    // Fallback para e-mail
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

    // Resposta amigável para o n8n retornar ao WhatsApp (Legacy)
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

import { processAIRequest } from '../services/aiAgent';

/**
 * POST /webhook/agent
 * O "Cérebro" de IA - Processa o texto puro do N8N via Gemini Function Calling
 *
 * Body: { phone, message }
 * Header: x-api-key: <BOT_API_KEY>
 */
export const webhookAgent = async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.BOT_API_KEY;

    if (!validKey || apiKey !== validKey) {
      return res.status(401).json({ message: 'API Key inválida.' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ message: 'Campos obrigatórios: phone, message.' });
    }

    // Sanitiza e descobre o usuário pelo telefone igual ao legado
    const cleanPhone = phone.replace(/\D/g, '');
    let user;

    if (cleanPhone) {
      user = await User.findOne({ where: { phone: cleanPhone } });
      if (!user && cleanPhone.startsWith('55')) {
        if (cleanPhone.length === 12) {
          user = await User.findOne({ where: { phone: `55${cleanPhone.substring(2, 4)}9${cleanPhone.substring(4)}` } });
        } else if (cleanPhone.length === 13) {
          user = await User.findOne({ where: { phone: `55${cleanPhone.substring(2, 4)}${cleanPhone.substring(5)}` } });
        }
      }
    }

    if (!user) {
      return res.status(200).json({
        reply: `⚠️ O Google Gemini Assistant informa: Não encontrei seu número cadastrado no banco do Finansys. Entre no site e salve o telefone no seu Perfil!`
      });
    }

    // Passa a bola pro NodeJS Gemini SDK
    try {
      const responseText = await processAIRequest(message, (user as any).id);
      return res.status(200).json({ reply: responseText });
    } catch (aiError: any) {
      console.error("[Gemini API Error]", aiError);
      return res.status(200).json({ reply: `Desculpe, o servidor do Google Gemini retornou um erro agora: ${aiError.message}` });
    }

  } catch (error) {
    console.error('[WebhookController] Erro no Webhook Agent:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

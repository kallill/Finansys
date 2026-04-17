import { Request, Response } from 'express';
import { Transaction, User } from '../models';
import pluggyService from '../services/pluggyService';
import { categorizeDescription } from '../services/aiAgent';

/**
 * ... existent code ...
 */

export const pluggyWebhook = async (req: Request, res: Response) => {
  try {
    const { event, itemId } = req.body;
    console.log(`[Pluggy Webhook] Evento: ${event}, ItemId: ${itemId}`);

    // SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ nos interessa quando o item (banco) foi atualizado com novos dados
    if (event !== 'item/updated' && event !== 'item/created') {
       return res.status(200).json({ status: 'ignored' });
    }

    // Busca o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio dono dessa conexÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
    const user = await User.findOne({ where: { pluggyItemId: itemId } });
    if (!user) {
       console.warn(`[Pluggy Webhook] Recebi evento para itemId ${itemId} mas nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrei usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio vinculado.`);
       return res.status(200).json({ status: 'not_found' });
    }

    // 1. Puxa as transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes da Pluggy (ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltimos dias para garantir)
    // Nota: Em um app real, salvarÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­amos a data da ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltima sync. Aqui vamos simplificar.
    const pluggyTransactions = await pluggyService.getClient().fetchTransactions(itemId);
    
    let syncedCount = 0;

    for (const pTx of pluggyTransactions.results) {
       // Anti-duplicidade: Verifica se jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ importamos esse ID ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºnico da Pluggy
       const exists = await Transaction.findOne({ where: { pluggyTransactionId: pTx.id } });
       if (exists) continue;

       // 2. MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡gica do Gemini: CategorizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o sob demanda
       const classification = await categorizeDescription(pTx.description);

       // 3. Salva no banco de dados do Finansys
       await Transaction.create({
          description: pTx.description,
          amount: Math.abs(pTx.amount),
          type: classification.type,
          category: classification.category,
          date: pTx.date,
          status: 'paid', // TransaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes bancÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rias reais jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o pagas
          userId: user.id,
          pluggyTransactionId: pTx.id
       });
       syncedCount++;
    }

    console.log(`[Pluggy Webhook] SincronizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o concluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da para ${user.name}: ${syncedCount} novas transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes.`);
    return res.status(200).json({ status: 'success', synced: syncedCount });

  } catch (error: any) {
    console.error('[Pluggy Webhook Error]', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /webhook/transaction
 * Rota pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblica autenticada por API Key estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica (BOT_API_KEY).
 * Usada pelo n8n para criar transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes via bot do WhatsApp.
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
      return res.status(401).json({ message: 'API Key invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida.' });
    }

    const { userEmail, phone, description, amount, type, category, date } = req.body;

    // ValidaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡sicas
    if ((!userEmail && !phone) || !description || !amount || !type) {
      return res.status(400).json({
        message: 'Campos obrigatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rios: (userEmail ou phone), description, amount, type.'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        message: 'Tipo invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lido. Use "income" ou "expense".'
      });
    }

    // Sanitiza o telefone removendo caracteres nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o-numÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ricos
    const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;

    // Busca o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio pelo email ou telefone
    let user;
    if (cleanPhone) {
      // 1. Tenta busca exata
      user = await User.findOne({ where: { phone: cleanPhone } });
      
      // 2. Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o achou e ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© um nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero brasileiro (+55)
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
        message: `UsuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrado com o contato fornecido (${phone || userEmail}). Cadastre seu telefone no App.`
      });
    }

    // Cria a transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
    const tx = await Transaction.create({
      description,
      amount: parseFloat(amount),
      type,
      category: category || 'Outros',
      date: date ? new Date(date) : new Date(),
      userId: (user as any).id
    });

    // Resposta amigÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡vel para o n8n retornar ao WhatsApp (Legacy)
    const emoji = type === 'income' ? 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢Ãƒâ€šÃ‚Â°' : 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¸';
    const typeLabel = type === 'income' ? 'receita' : 'despesa';
    const amountFormatted = parseFloat(amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    return res.status(201).json({
      transaction: tx,
      message: `${emoji} *${typeLabel}* registrada com sucesso!\nÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€šÃ‚Â ${description}\nÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢Ãƒâ€šÃ‚Âµ ${amountFormatted}\nÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚ÂÃƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â ${category || 'Outros'}`
    });
  } catch (error) {
    console.error('[WebhookController] Erro ao criar transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o:', error);
    return res.status(500).json({ message: 'Erro interno ao registrar transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.' });
  }
};

import { processAIRequest } from '../services/aiAgent';

/**
 * POST /webhook/agent
 * O "CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rebro" de IA - Processa o texto puro do N8N via Gemini Function Calling
 *
 * Body: { phone, message }
 * Header: x-api-key: <BOT_API_KEY>
 */
export const webhookAgent = async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.BOT_API_KEY;

    if (!validKey || apiKey !== validKey) {
      return res.status(401).json({ message: 'API Key invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida.' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ message: 'Campos obrigatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rios: phone, message.' });
    }

    // Sanitiza e descobre o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio pelo telefone igual ao legado
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
        reply: `ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â O Google Gemini Assistant informa: NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrei seu nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero cadastrado no banco do Finansys. Entre no site e salve o telefone no seu Perfil!`
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
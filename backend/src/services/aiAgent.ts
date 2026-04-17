import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Transaction, LearnedPattern, CreditCard } from '../models';
import { Sequelize, Op } from 'sequelize';
import sequelize from '../config/database';

// Declarando as funÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes (Ferramentas) para o Gemini
const tool_consultar_fatura: FunctionDeclaration = {
  name: 'consultar_fatura',
  description: 'Lista o saldo e os gastos consolidados da fatura de um determinado cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      cardName: { type: SchemaType.STRING, description: 'O nome do cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito (ex: Nubank)' }
    },
    required: ['cardName']
  },
};

const tool_registrar_lancamento: FunctionDeclaration = {
  name: 'registrar_lancamento',
  description: 'Registra uma nova transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o financeira (receita ou despesa) no banco de dados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      description: {
        type: SchemaType.STRING,
        description: 'DescriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o curta da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o. Ex: "Mercado".',
      },
      amount: {
        type: SchemaType.NUMBER,
        description: 'Valor numÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rico positivo da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.',
      },
      type: {
        type: SchemaType.STRING,
        description: 'Tipo da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o. "income" (receita) ou "expense" (despesa).',
      },
      category: {
        type: SchemaType.STRING,
        description: 'A categoria do lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§amento.',
      },
      status: {
        type: SchemaType.STRING,
        description: 'Status do pagamento. Use "pending" para contas a pagar/receber no futuro, e "paid" para contas jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ resolvidas de forma imediata.',
      },
      dueDate: {
        type: SchemaType.STRING,
        description: 'Data de vencimento ou do gasto no formato YYYY-MM-DD. Apenas ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºtil se for uma data futura.',
      },
      creditCardName: {
        type: SchemaType.STRING,
        description: 'Nome do CartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de CrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito (ex: Nubank, Itau), apenas se o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio explicitar que pagou no cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito.',
      }
    },
    required: ['description', 'amount', 'type', 'category'],
  },
};

const tool_consultar_saldo: FunctionDeclaration = {
  name: 'consultar_saldo',
  description: 'Consulta o panorama financeiro do usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio: saldo atual, soma total de ganhos (receitas) e soma total gasta (despesas). Use para perguntas de totais gerais.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_consultar_resumo_categoria: FunctionDeclaration = {
  name: 'consultar_resumo_categoria',
  description: 'Consulta o total gasto na categoria no mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs atual.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      category: { type: SchemaType.STRING },
      type: { type: SchemaType.STRING }
    },
    required: ['category'],
  },
};

const tool_consultar_extrato: FunctionDeclaration = {
  name: 'consultar_extrato',
  description: 'Lista as transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes detalhadas (extrato) recentes do usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      limit: { type: SchemaType.NUMBER, description: 'NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero de transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes para listar. PadrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o 5.' },
      type: { type: SchemaType.STRING, description: 'Filtro opcional. "income" para ver sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ receitas, "expense" para sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ despesas.' }
    }
  },
};

const tool_consultar_panorama_gastos: FunctionDeclaration = {
  name: 'consultar_panorama_gastos',
  description: 'Gera um resumo de quanto foi gasto em cada categoria nos ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltimos 30 dias. Use para dar dicas de economia e anÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lise financeira.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_apagar_transacao: FunctionDeclaration = {
  name: 'apagar_transacao',
  description: 'Procura a transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o mais recente que bate com a descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o e/ou valor fornecidos e a deleta, servindo como funÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de DESFAZER ou corrigir erro.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      descriptionContains: { type: SchemaType.STRING, description: 'Parte da descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o que o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio quer apagar (ex: "Mercado")' },
      amountApprox: { type: SchemaType.NUMBER, description: 'Valor em formato de nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero inteiro ou float da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o a ser apagada (ex: 50.50)' }
    }
  },
};

const tool_editar_transacao: FunctionDeclaration = {
  name: 'editar_transacao',
  description: 'Procura a transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o mais recente pela descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o e/ou valor, e altera seus dados pelos novos valores informados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      searchDescription: { type: SchemaType.STRING, description: 'Palavra-chave da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o que deseja procurar para editar' },
      searchAmount: { type: SchemaType.NUMBER, description: 'Valor da transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o antiga que se deseja procurar' },
      newDescription: { type: SchemaType.STRING, description: 'A nova descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o a ser aplicada' },
      newAmount: { type: SchemaType.NUMBER, description: 'O novo valor a ser aplicado' },
      newCategory: { type: SchemaType.STRING, description: 'A nova categoria a ser aplicada' },
      newType: { type: SchemaType.STRING, description: '"income" ou "expense" (apenas se for trocar o tipo)' }
    }
  },
};

const tools = [{
  functionDeclarations: [
    tool_registrar_lancamento, tool_consultar_saldo, tool_consultar_resumo_categoria,
    tool_consultar_extrato, tool_apagar_transacao, tool_editar_transacao, tool_consultar_fatura,
    tool_consultar_panorama_gastos
  ],
}];

const executeTools = async (callName: string, callArgs: any, userId: number) => {
  try {
    if (callName === 'registrar_lancamento') {
      let creditCardId = null;
      let finalStatus = callArgs.status || 'paid';
      let finalDate = callArgs.dueDate ? new Date(callArgs.dueDate) : new Date();

      // LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de DetecÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de CartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
      const possibleCardContext = (callArgs.creditCardName || (callArgs.description || "").toLowerCase().includes('cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o'));

      if (possibleCardContext) {
         const searchName = callArgs.creditCardName;
         let card = null;

         if (searchName && searchName.trim().length > 0) {
            card = await CreditCard.findOne({ where: { userId, name: { [Op.iLike]: `%${searchName}%` } } });
         }

         if (!card) {
            // Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrou pelo nome ou o nome veio vazio (ex: "no cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o")
            const allCards = await CreditCard.findAll({ where: { userId } });
            if (allCards.length === 1) {
               card = allCards[0];
            } else if (allCards.length > 1) {
               const names = allCards.map(c => c.name).join(' ou ');
               return { 
                 status: "error", 
                 message: `O usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio possui mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltiplos cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes: ${names}. Por favor, pergunte em qual deles ele deseja realizar o lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§amento.` 
               };
            }
         }

         if (card) {
            creditCardId = card.id;
            finalStatus = 'pending'; // Gastos no crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito rodam pra conta futura (Fatura)
         }
      }

      const tx = await Transaction.create({ 
         ...callArgs, 
         userId, 
         date: finalDate, 
         dueDate: callArgs.dueDate ? new Date(callArgs.dueDate) : null,
         status: finalStatus,
         creditCardId
      });
      return { status: "success", message: creditCardId ? `TransaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o salva no cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.` : "TransaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o salva.", transactionId: tx.id, statusFinal: finalStatus, usadoCartaoCredito: !!creditCardId };
    }

    if (callName === 'consultar_saldo') {
      // Ignora pendentes e cartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes de crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito na conta principal! Dinheiro Real apenas.
      const transactions = await Transaction.findAll({ 
         where: { userId, status: 'paid', creditCardId: null } 
      });
      const totalReceitas = transactions.filter((tx: any) => tx.type === 'income').reduce((acc, tx: any) => acc + Number(tx.amount), 0);
      const totalDespesas = transactions.filter((tx: any) => tx.type === 'expense').reduce((acc, tx: any) => acc + Number(tx.amount), 0);
      const saldoAtual = totalReceitas - totalDespesas;
      return { status: "success", saldoAtualContaReal: saldoAtual, totalReceitas, totalDespesas };
    }

    if (callName === 'consultar_fatura') {
       const card = await CreditCard.findOne({ where: { userId, name: { [Op.iLike]: `%${callArgs.cardName}%` } } });
       if (!card) return { error: `CartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dito da operadora ${callArgs.cardName} nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o foi encontrado no sistema do usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio.` };

       const transactions = await Transaction.findAll({ where: { userId, creditCardId: card.id, status: 'pending' } });
       const totalFatura = transactions.reduce((acc, tx:any) => acc + Number(tx.amount), 0);
       return { status: "success", cardName: card.name, totalFatura, comprasPendentes: transactions.length };
    }
    if (callName === 'consultar_resumo_categoria') {
      const txType = callArgs.type === 'income' ? 'income' : 'expense';
      const dataAtual = new Date();
      const transactions = await Transaction.findAll({
        where: { userId, type: txType, category: callArgs.category, date: { [Op.gte]: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1) } }
      });
      const total = transactions.reduce((acc, tx: any) => acc + Number(tx.amount), 0);
      return { status: "success", categoria: callArgs.category, totalGasto: total };
    }
    if (callName === 'consultar_extrato') {
      const limit = callArgs.limit || 5;
      const whereClause: any = { userId };
      if (callArgs.type) whereClause.type = callArgs.type;
      
      const transactions = await Transaction.findAll({
        where: whereClause,
        order: [['date', 'DESC'], ['createdAt', 'DESC']],
        limit
      });
      return { status: "success", transacoes: transactions };
    }

    if (callName === 'apagar_transacao') {
      const whereClause: any = { userId };
      if (callArgs.amountApprox) whereClause.amount = callArgs.amountApprox;
      
      const transactions = await Transaction.findAll({ where: whereClause, order: [['createdAt', 'DESC']], limit: 10 });
      let txToDelele = transactions[0];

      if (callArgs.descriptionContains && transactions.length > 0) {
        const found = transactions.find((t:any) => t.description.toLowerCase().includes(callArgs.descriptionContains.toLowerCase()));
        if (found) txToDelele = found;
      }

      if (txToDelele) {
        await txToDelele.destroy();
        return { status: "success", message: `A transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o '${txToDelele.description}' de valor ${txToDelele.amount} foi excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da definitivamente.` };
      }
      return { status: "error", message: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrei nenhuma transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o recente parecida com essas caracterÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­sticas para apagar." };
    }

    if (callName === 'editar_transacao') {
      const whereClause: any = { userId };
      if (callArgs.searchAmount) whereClause.amount = callArgs.searchAmount;

      const transactions = await Transaction.findAll({ where: whereClause, order: [['createdAt', 'DESC']], limit: 10 });
      let txToEdit = transactions[0];

      if (callArgs.searchDescription && transactions.length > 0) {
        const found = transactions.find((t:any) => t.description.toLowerCase().includes(callArgs.searchDescription.toLowerCase()));
        if (found) txToEdit = found;
      }

      if (txToEdit) {
        if (callArgs.newDescription) txToEdit.description = callArgs.newDescription;
        if (callArgs.newAmount) txToEdit.amount = callArgs.newAmount;
        if (callArgs.newCategory) txToEdit.category = callArgs.newCategory;
        if (callArgs.newType) txToEdit.type = callArgs.newType;
        
        await txToEdit.save();
        return { status: "success", message: `TransaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o atualizada com sucesso para: ${txToEdit.description} - R$ ${txToEdit.amount} (${txToEdit.category})` };
      }
      return { status: "error", message: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrei nenhuma transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o recente parecida para editar." };
    }

    if (callName === 'consultar_panorama_gastos') {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30);

      const transactions = await Transaction.findAll({
        where: { 
           userId, 
           type: 'expense', 
           date: { [Op.gte]: dataInicio } 
        },
        attributes: [
           'category',
           [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
        ],
        group: ['category'],
        raw: true
      });

      return { status: "success", resumoMensalPorCategoria: transactions };
    }

    return { error: "Ferramenta nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o reconhecida." };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Helper para extrair dados financeiros (valor e descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o) de uma frase localmente.
 * ÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡til para economizar chamadas de IA em frases com padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes aprendidos.
 */
const extractFinancialData = (phrase: string) => {
  const amountRegex = /(\d+[,.]\d+|\d+)/;
  const match = phrase.match(amountRegex);
  const amount = match ? parseFloat(match[0].replace(',', '.')) : null;

  // DescriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: Retira o valor e palavras de ligaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o comuns
  let description = phrase
    .replace(amountRegex, '')
    .replace(/gastei|paguei|recebi|lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ar|fui|no|na|de|do|da|com|por|reais|valor/gi, '')
    .trim();

  // Capitaliza a primeira letra
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return { amount, description };
};

export const processAIRequest = async (userMessage: string, userId: number) => {
  const cleanMessage = userMessage.toLowerCase().trim();

  // Tier 1: Regex Burro Mas RÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡pido (Economiza Gemini em perguntas de saldo simples)
  if (['saldo', 'meu saldo', 'qual meu saldo', 'ver saldo'].includes(cleanMessage)) {
    const data = await executeTools('consultar_saldo', {}, userId);
    const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â¡ *CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lculo do Roteador Local:* Seu saldo geral (Conta Corrente) neste exato momento ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© de **${money}**!`;
  }

  // Tier 1.5: Busca Inteligente (Fuzzy) por PadrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes Aprendidos
  const learned = await LearnedPattern.findOne({ 
    where: { 
      phrase: { [Op.iLike]: `%${cleanMessage}%` } 
    } 
  });

  if (learned) {
    if (learned.intent === 'consultar_saldo') {
      const data = await executeTools('consultar_saldo', {}, userId);
      const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ *CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rebro Local (Aprendido):* Seu saldo geral ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© de **${money}**!`;
    }

    if (learned.intent === 'registrar_lancamento') {
      const { amount, description } = extractFinancialData(cleanMessage);
      if (amount && description) {
         const result = await executeTools('registrar_lancamento', { 
           description, 
           amount, 
           type: 'expense', 
           status: 'paid' 
         }, userId);
         return `ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â¡ *Script Local Orientado:* Lancei sua despesa de **R$ ${amount.toFixed(2)}** em **${description}**! (Processado localmente ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬)`;
      }
    }
  }

  // Tier 2: Acionando O CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rebro Gigante (Google Gemini) se for algo novo ou complexo
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o configurada no servidor (VPS).');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    tools: tools,
    systemInstruction: `VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© uma IA Financeira Financeira. Responda em PortuguÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs-BR para o WhatsApp. Formate valores como (R$ 1.500,00). 
    Sempre analise o JSON de resposta da ferramenta invocada para formatar humanamente o resultado.
    
    COMPORTAMENTO DE CONSULTOR FINANCEIRO:
    - Se o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio perguntar onde estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ gastando muito, use 'consultar_panorama_gastos'.
    - Seja proativo: sugira economias se vir gastos altos em categorias nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o essenciais (ex: AlimentaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Fora, Lazer).
    - Use emojis para tornar a conversa amigÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡vel mas profissional.`
  });

  const chat = model.startChat();
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  
  const functionCalls = response.functionCalls ? (typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls) : undefined;

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    
    // Auto-Aprendizado: O sistema salva a inteligÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia para a prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³xima vez
    if (!learned) {
       await LearnedPattern.create({ 
         phrase: cleanMessage, 
         intent: call.name,
         params: call.args // Guardamos os argumentos para entender o contexto do aprendizado
       });
       console.log(`[AI] Novo padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o aprendido localmente: "${cleanMessage}" -> ${call.name}`);
    }
    
    const toolResponseData = await executeTools(call.name, call.args, userId);
    
    const toolResult = await chat.sendMessage([{
      functionResponse: { name: call.name, response: toolResponseData }
    }]);

    return toolResult.response.text();
  }

  return response.text();
};

/**
 * MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡gica do Gemini para categorizar transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes bancÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rias do Open Finance
 */
export const categorizeDescription = async (description: string): Promise<{ category: string, type: 'income' | 'expense' }> => {
  try {
     const apiKey = process.env.GEMINI_API_KEY;
     if (!apiKey) return { category: 'Outros', type: 'expense' };

     const genAI = new GoogleGenerativeAI(apiKey);
     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

     const prompt = `Analise a seguinte descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o bancÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ria: "${description}". 
     Responda APENAS um JSON no formato: {"category": "NomeDaCategoria", "type": "income" ou "expense"}.
     Exemplo: "UBER TRIP" -> {"category": "Transporte", "type": "expense"}.
     "SALARIO" -> {"category": "SalÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio", "type": "income"}.`;

     const result = await model.generateContent(prompt);
     const text = result.response.text();
     const cleanJson = text.replace(/```json|```/g, '').trim();
     return JSON.parse(cleanJson);
  } catch (error) {
     console.error("Erro na categorizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o inteligente:", error);
     return { category: 'Outros', type: 'expense' };
  }
};
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Transaction, LearnedPattern, CreditCard } from '../models';
import { Op } from 'sequelize';

// Declarando as funções (Ferramentas) para o Gemini
const tool_consultar_fatura: FunctionDeclaration = {
  name: 'consultar_fatura',
  description: 'Lista o saldo e os gastos consolidados da fatura de um determinado cartão de crédito.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      cardName: { type: SchemaType.STRING, description: 'O nome do cartão de crédito (ex: Nubank)' }
    },
    required: ['cardName']
  },
};

const tool_registrar_lancamento: FunctionDeclaration = {
  name: 'registrar_lancamento',
  description: 'Registra uma nova transação financeira (receita ou despesa) no banco de dados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      description: {
        type: SchemaType.STRING,
        description: 'Descrição curta da transação. Ex: "Mercado".',
      },
      amount: {
        type: SchemaType.NUMBER,
        description: 'Valor numérico positivo da transação.',
      },
      type: {
        type: SchemaType.STRING,
        description: 'Tipo da transação. "income" (receita) ou "expense" (despesa).',
      },
      category: {
        type: SchemaType.STRING,
        description: 'A categoria do lançamento.',
      },
      status: {
        type: SchemaType.STRING,
        description: 'Status do pagamento. Use "pending" para contas a pagar/receber no futuro, e "paid" para contas já resolvidas de forma imediata.',
      },
      dueDate: {
        type: SchemaType.STRING,
        description: 'Data de vencimento ou do gasto no formato YYYY-MM-DD. Apenas útil se for uma data futura.',
      },
      creditCardName: {
        type: SchemaType.STRING,
        description: 'Nome do Cartão de Crédito (ex: Nubank, Itau), apenas se o usuário explicitar que pagou no cartão de crédito.',
      }
    },
    required: ['description', 'amount', 'type', 'category'],
  },
};

const tool_consultar_saldo: FunctionDeclaration = {
  name: 'consultar_saldo',
  description: 'Consulta o panorama financeiro do usuário: saldo atual, soma total de ganhos (receitas) e soma total gasta (despesas). Use para perguntas de totais gerais.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_consultar_resumo_categoria: FunctionDeclaration = {
  name: 'consultar_resumo_categoria',
  description: 'Consulta o total gasto na categoria no mês atual.',
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
  description: 'Lista as transações detalhadas (extrato) recentes do usuário.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      limit: { type: SchemaType.NUMBER, description: 'Número de transações para listar. Padrão 5.' },
      type: { type: SchemaType.STRING, description: 'Filtro opcional. "income" para ver só receitas, "expense" para só despesas.' }
    }
  },
};

const tool_apagar_transacao: FunctionDeclaration = {
  name: 'apagar_transacao',
  description: 'Procura a transação mais recente que bate com a descrição e/ou valor fornecidos e a deleta, servindo como função de DESFAZER ou corrigir erro.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      descriptionContains: { type: SchemaType.STRING, description: 'Parte da descrição da transação que o usuário quer apagar (ex: "Mercado")' },
      amountApprox: { type: SchemaType.NUMBER, description: 'Valor em formato de número inteiro ou float da transação a ser apagada (ex: 50.50)' }
    }
  },
};

const tool_editar_transacao: FunctionDeclaration = {
  name: 'editar_transacao',
  description: 'Procura a transação mais recente pela descrição e/ou valor, e altera seus dados pelos novos valores informados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      searchDescription: { type: SchemaType.STRING, description: 'Palavra-chave da transação que deseja procurar para editar' },
      searchAmount: { type: SchemaType.NUMBER, description: 'Valor da transação antiga que se deseja procurar' },
      newDescription: { type: SchemaType.STRING, description: 'A nova descrição a ser aplicada' },
      newAmount: { type: SchemaType.NUMBER, description: 'O novo valor a ser aplicado' },
      newCategory: { type: SchemaType.STRING, description: 'A nova categoria a ser aplicada' },
      newType: { type: SchemaType.STRING, description: '"income" ou "expense" (apenas se for trocar o tipo)' }
    }
  },
};

const tools = [{
  functionDeclarations: [
    tool_registrar_lancamento, tool_consultar_saldo, tool_consultar_resumo_categoria,
    tool_consultar_extrato, tool_apagar_transacao, tool_editar_transacao, tool_consultar_fatura
  ],
}];

const executeTools = async (callName: string, callArgs: any, userId: number) => {
  try {
    if (callName === 'registrar_lancamento') {
      let creditCardId = null;
      let finalStatus = callArgs.status || 'paid';
      let finalDate = callArgs.dueDate ? new Date(callArgs.dueDate) : new Date();

      if (callArgs.creditCardName) {
         // Tenta associar
         const card = await CreditCard.findOne({ where: { userId, name: { [Op.iLike]: `%${callArgs.creditCardName}%` } } });
         if (card) {
            creditCardId = card.id;
            finalStatus = 'pending'; // Gastos no crédito rodam pra conta futura (Fatura)
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
      return { status: "success", message: "Transação salva.", transactionId: tx.id, statusFinal: finalStatus, usadoCartaoCredito: !!creditCardId };
    }

    if (callName === 'consultar_saldo') {
      // Ignora pendentes e cartões de crédito na conta principal! Dinheiro Real apenas.
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
       if (!card) return { error: `Cartão de crédito da operadora ${callArgs.cardName} não foi encontrado no sistema do usuário.` };

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
        return { status: "success", message: `A transação '${txToDelele.description}' de valor ${txToDelele.amount} foi excluída definitivamente.` };
      }
      return { status: "error", message: "Não encontrei nenhuma transação recente parecida com essas características para apagar." };
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
        return { status: "success", message: `Transação atualizada com sucesso para: ${txToEdit.description} - R$ ${txToEdit.amount} (${txToEdit.category})` };
      }
      return { status: "error", message: "Não encontrei nenhuma transação recente parecida para editar." };
    }

    return { error: "Ferramenta não reconhecida." };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const processAIRequest = async (userMessage: string, userId: number) => {
  const cleanMessage = userMessage.toLowerCase().trim();

  // Tier 1: Regex Burro Mas Rápido (Economiza Gemini em perguntas de saldo simples)
  if (['saldo', 'meu saldo', 'qual meu saldo', 'ver saldo'].includes(cleanMessage)) {
    const data = await executeTools('consultar_saldo', {}, userId);
    const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `⚡ *Cálculo do Roteador Local:* Seu saldo geral (Conta Corrente) neste exato momento é de **${money}**!`;
  }

  // Tier 1.5: Busca Aprendida! O Node procura no banco se ele "aprendeu" essa frase exata com o Gemini antes
  const learned = await LearnedPattern.findOne({ where: { phrase: cleanMessage } });
  if (learned) {
    if (learned.intent === 'consultar_saldo') {
      const data = await executeTools('consultar_saldo', {}, userId);
      const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `🤖 *Cálculo Automático Aprendido:* Seu saldo geral (Conta Corrente) é de **${money}**!`;
    }
    // Para registrar_lancamento, precismos dos arguments, o que inviabiliza match exato local sem os regex, 
    // então enviamos os que não forem puramente informativos para o Gemini.
  }

  // Tier 2: Acionando O Cérebro Gigante (Google Gemini) se for algo novo ou complexo
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor (VPS).');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    tools: tools,
    systemInstruction: `Você é uma IA Financeira Financeira. Responda em Português-BR para o WhatsApp. Formate valores como (R$ 1.500,00). 
    Sempre analise o JSON de resposta da ferramenta invocada para formatar humanamente o resultado.`
  });

  const chat = model.startChat();
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  
  const functionCalls = response.functionCalls ? (typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls) : undefined;

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    
    // Auto-Aprendizado: Salvamos o que acabamos de descobrir no banco local se for uma chamada que não precisa de kwargs variáveis (Como saldo)
    if (call.name === 'consultar_saldo' && !learned) {
       await LearnedPattern.create({ phrase: cleanMessage, intent: call.name });
    }
    
    const toolResponseData = await executeTools(call.name, call.args, userId);
    
    const toolResult = await chat.sendMessage([{
      functionResponse: { name: call.name, response: toolResponseData }
    }]);

    return toolResult.response.text();
  }

  return response.text();
};

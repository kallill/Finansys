import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Transaction, LearnedPattern, CreditCard } from '../models';
import { Sequelize, Op } from 'sequelize';
import sequelize from '../config/database';

// Declarando as funÃ§Ãµes (Ferramentas) para o Gemini
const tool_consultar_fatura: FunctionDeclaration = {
  name: 'consultar_fatura',
  description: 'Lista o saldo e os gastos consolidados da fatura de um determinado cartÃ£o de crÃ©dito.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      cardName: { type: SchemaType.STRING, description: 'O nome do cartÃ£o de crÃ©dito (ex: Nubank)' }
    },
    required: ['cardName']
  },
};

const tool_registrar_lancamento: FunctionDeclaration = {
  name: 'registrar_lancamento',
  description: 'Registra uma nova transaÃ§Ã£o financeira (receita ou despesa) no banco de dados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      description: {
        type: SchemaType.STRING,
        description: 'DescriÃ§Ã£o curta da transaÃ§Ã£o. Ex: "Mercado".',
      },
      amount: {
        type: SchemaType.NUMBER,
        description: 'Valor numÃ©rico positivo da transaÃ§Ã£o.',
      },
      type: {
        type: SchemaType.STRING,
        description: 'Tipo da transaÃ§Ã£o. "income" (receita) ou "expense" (despesa).',
      },
      category: {
        type: SchemaType.STRING,
        description: 'A categoria do lanÃ§amento.',
      },
      status: {
        type: SchemaType.STRING,
        description: 'Status do pagamento. Use "pending" para contas a pagar/receber no futuro, e "paid" para contas jÃ¡ resolvidas de forma imediata.',
      },
      dueDate: {
        type: SchemaType.STRING,
        description: 'Data de vencimento ou do gasto no formato YYYY-MM-DD. Apenas Ãºtil se for uma data futura.',
      },
      creditCardName: {
        type: SchemaType.STRING,
        description: 'Nome do CartÃ£o de CrÃ©dito (ex: Nubank, Itau), apenas se o usuÃ¡rio explicitar que pagou no cartÃ£o de crÃ©dito.',
      }
    },
    required: ['description', 'amount', 'type', 'category'],
  },
};

const tool_consultar_saldo: FunctionDeclaration = {
  name: 'consultar_saldo',
  description: 'Consulta o panorama financeiro do usuÃ¡rio: saldo atual, soma total de ganhos (receitas) e soma total gasta (despesas). Use para perguntas de totais gerais.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_consultar_resumo_categoria: FunctionDeclaration = {
  name: 'consultar_resumo_categoria',
  description: 'Consulta o total gasto na categoria no mÃªs atual.',
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
  description: 'Lista as transaÃ§Ãµes detalhadas (extrato) recentes do usuÃ¡rio.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      limit: { type: SchemaType.NUMBER, description: 'NÃºmero de transaÃ§Ãµes para listar. PadrÃ£o 5.' },
      type: { type: SchemaType.STRING, description: 'Filtro opcional. "income" para ver sÃ³ receitas, "expense" para sÃ³ despesas.' }
    }
  },
};

const tool_consultar_panorama_gastos: FunctionDeclaration = {
  name: 'consultar_panorama_gastos',
  description: 'Gera um resumo de quanto foi gasto em cada categoria nos Ãºltimos 30 dias. Use para dar dicas de economia e anÃ¡lise financeira.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_apagar_transacao: FunctionDeclaration = {
  name: 'apagar_transacao',
  description: 'Procura a transaÃ§Ã£o mais recente que bate com a descriÃ§Ã£o e/ou valor fornecidos e a deleta, servindo como funÃ§Ã£o de DESFAZER ou corrigir erro.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      descriptionContains: { type: SchemaType.STRING, description: 'Parte da descriÃ§Ã£o da transaÃ§Ã£o que o usuÃ¡rio quer apagar (ex: "Mercado")' },
      amountApprox: { type: SchemaType.NUMBER, description: 'Valor em formato de nÃºmero inteiro ou float da transaÃ§Ã£o a ser apagada (ex: 50.50)' }
    }
  },
};

const tool_editar_transacao: FunctionDeclaration = {
  name: 'editar_transacao',
  description: 'Procura a transaÃ§Ã£o mais recente pela descriÃ§Ã£o e/ou valor, e altera seus dados pelos novos valores informados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      searchDescription: { type: SchemaType.STRING, description: 'Palavra-chave da transaÃ§Ã£o que deseja procurar para editar' },
      searchAmount: { type: SchemaType.NUMBER, description: 'Valor da transaÃ§Ã£o antiga que se deseja procurar' },
      newDescription: { type: SchemaType.STRING, description: 'A nova descriÃ§Ã£o a ser aplicada' },
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

      // LÃ³gica de DetecÃ§Ã£o de CartÃ£o
      const possibleCardContext = (callArgs.creditCardName || (callArgs.description || "").toLowerCase().includes('cartÃ£o'));

      if (possibleCardContext) {
         const searchName = callArgs.creditCardName;
         let card = null;

         if (searchName && searchName.trim().length > 0) {
            card = await CreditCard.findOne({ where: { userId, name: { [Op.iLike]: `%${searchName}%` } } });
         }

         if (!card) {
            // Se nÃ£o encontrou pelo nome ou o nome veio vazio (ex: "no cartÃ£o")
            const allCards = await CreditCard.findAll({ where: { userId } });
            if (allCards.length === 1) {
               card = allCards[0];
            } else if (allCards.length > 1) {
               const names = allCards.map(c => c.name).join(' ou ');
               return { 
                 status: "error", 
                 message: `O usuÃ¡rio possui mÃºltiplos cartÃµes: ${names}. Por favor, pergunte em qual deles ele deseja realizar o lanÃ§amento.` 
               };
            }
         }

         if (card) {
            creditCardId = card.id;
            finalStatus = 'pending'; // Gastos no crÃ©dito rodam pra conta futura (Fatura)
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
      return { status: "success", message: creditCardId ? `TransaÃ§Ã£o salva no cartÃ£o.` : "TransaÃ§Ã£o salva.", transactionId: tx.id, statusFinal: finalStatus, usadoCartaoCredito: !!creditCardId };
    }

    if (callName === 'consultar_saldo') {
      // Ignora pendentes e cartÃµes de crÃ©dito na conta principal! Dinheiro Real apenas.
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
       if (!card) return { error: `CartÃ£o de crÃ©dito da operadora ${callArgs.cardName} nÃ£o foi encontrado no sistema do usuÃ¡rio.` };

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
        return { status: "success", message: `A transaÃ§Ã£o '${txToDelele.description}' de valor ${txToDelele.amount} foi excluÃ­da definitivamente.` };
      }
      return { status: "error", message: "NÃ£o encontrei nenhuma transaÃ§Ã£o recente parecida com essas caracterÃ­sticas para apagar." };
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
        return { status: "success", message: `TransaÃ§Ã£o atualizada com sucesso para: ${txToEdit.description} - R$ ${txToEdit.amount} (${txToEdit.category})` };
      }
      return { status: "error", message: "NÃ£o encontrei nenhuma transaÃ§Ã£o recente parecida para editar." };
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

    return { error: "Ferramenta nÃ£o reconhecida." };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Helper para extrair dados financeiros (valor e descriÃ§Ã£o) de uma frase localmente.
 * Ãštil para economizar chamadas de IA em frases com padrÃµes aprendidos.
 */
const extractFinancialData = (phrase: string) => {
  const amountRegex = /(\d+[,.]\d+|\d+)/;
  const match = phrase.match(amountRegex);
  const amount = match ? parseFloat(match[0].replace(',', '.')) : null;

  // DescriÃ§Ã£o: Retira o valor e palavras de ligaÃ§Ã£o comuns
  let description = phrase
    .replace(amountRegex, '')
    .replace(/gastei|paguei|recebi|lanÃ§ar|fui|no|na|de|do|da|com|por|reais|valor/gi, '')
    .trim();

  // Capitaliza a primeira letra
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return { amount, description };
};

export const processAIRequest = async (userMessage: string, userId: number) => {
  const cleanMessage = userMessage.toLowerCase().trim();

  // Tier 1: Regex Burro Mas RÃ¡pido (Economiza Gemini em perguntas de saldo simples)
  if (['saldo', 'meu saldo', 'qual meu saldo', 'ver saldo'].includes(cleanMessage)) {
    const data = await executeTools('consultar_saldo', {}, userId);
    const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `âš¡ *CÃ¡lculo do Roteador Local:* Seu saldo geral (Conta Corrente) neste exato momento Ã© de **${money}**!`;
  }

  // Tier 1.5: Busca Inteligente (Fuzzy) por PadrÃµes Aprendidos
  const learned = await LearnedPattern.findOne({ 
    where: { 
      phrase: { [Op.iLike]: `%${cleanMessage}%` } 
    } 
  });

  if (learned) {
    if (learned.intent === 'consultar_saldo') {
      const data = await executeTools('consultar_saldo', {}, userId);
      const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `ðŸ¤– *CÃ©rebro Local (Aprendido):* Seu saldo geral Ã© de **${money}**!`;
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
         return `âš¡ *Script Local Orientado:* Lancei sua despesa de **R$ ${amount.toFixed(2)}** em **${description}**! (Processado localmente ðŸš€)`;
      }
    }
  }

  // Tier 2: Acionando O CÃ©rebro Gigante (Google Gemini) se for algo novo ou complexo
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY nÃ£o configurada no servidor (VPS).');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    tools: tools,
    systemInstruction: `VocÃª Ã© uma IA Financeira Financeira. Responda em PortuguÃªs-BR para o WhatsApp. Formate valores como (R$ 1.500,00). 
    Sempre analise o JSON de resposta da ferramenta invocada para formatar humanamente o resultado.
    
    COMPORTAMENTO DE CONSULTOR FINANCEIRO:
    - Se o usuÃ¡rio perguntar onde estÃ¡ gastando muito, use 'consultar_panorama_gastos'.
    - Seja proativo: sugira economias se vir gastos altos em categorias nÃ£o essenciais (ex: AlimentaÃ§Ã£o Fora, Lazer).
    - Use emojis para tornar a conversa amigÃ¡vel mas profissional.`
  });

  const chat = model.startChat();
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  
  const functionCalls = response.functionCalls ? (typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls) : undefined;

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    
    // Auto-Aprendizado: O sistema salva a inteligÃªncia para a prÃ³xima vez
    if (!learned) {
       await LearnedPattern.create({ 
         phrase: cleanMessage, 
         intent: call.name,
         params: call.args // Guardamos os argumentos para entender o contexto do aprendizado
       });
       console.log(`[AI] Novo padrÃ£o aprendido localmente: "${cleanMessage}" -> ${call.name}`);
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
 * MÃ¡gica do Gemini para categorizar transaÃ§Ãµes bancÃ¡rias do Open Finance
 */
export const categorizeDescription = async (description: string): Promise<{ category: string, type: 'income' | 'expense' }> => {
  try {
     const apiKey = process.env.GEMINI_API_KEY;
     if (!apiKey) return { category: 'Outros', type: 'expense' };

     const genAI = new GoogleGenerativeAI(apiKey);
     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

     const prompt = `Analise a seguinte descriÃ§Ã£o de transaÃ§Ã£o bancÃ¡ria: "${description}". 
     Responda APENAS um JSON no formato: {"category": "NomeDaCategoria", "type": "income" ou "expense"}.
     Exemplo: "UBER TRIP" -> {"category": "Transporte", "type": "expense"}.
     "SALARIO" -> {"category": "SalÃ¡rio", "type": "income"}.`;

     const result = await model.generateContent(prompt);
     const text = result.response.text();
     const cleanJson = text.replace(/```json|```/g, '').trim();
     return JSON.parse(cleanJson);
  } catch (error) {
     console.error("Erro na categorizaÃ§Ã£o inteligente:", error);
     return { category: 'Outros', type: 'expense' };
  }
};

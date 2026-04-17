import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Transaction, LearnedPattern, CreditCard } from '../models';
import { Sequelize, Op } from 'sequelize';
import sequelize from '../config/database';

// Declarando as funÃƒÂ§ÃƒÂµes (Ferramentas) para o Gemini
const tool_consultar_fatura: FunctionDeclaration = {
  name: 'consultar_fatura',
  description: 'Lista o saldo e os gastos consolidados da fatura de um determinado cartÃƒÂ£o de crÃƒÂ©dito.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      cardName: { type: SchemaType.STRING, description: 'O nome do cartÃƒÂ£o de crÃƒÂ©dito (ex: Nubank)' }
    },
    required: ['cardName']
  },
};

const tool_registrar_lancamento: FunctionDeclaration = {
  name: 'registrar_lancamento',
  description: 'Registra uma nova transaÃƒÂ§ÃƒÂ£o financeira (receita ou despesa) no banco de dados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      description: {
        type: SchemaType.STRING,
        description: 'DescriÃƒÂ§ÃƒÂ£o curta da transaÃƒÂ§ÃƒÂ£o. Ex: "Mercado".',
      },
      amount: {
        type: SchemaType.NUMBER,
        description: 'Valor numÃƒÂ©rico positivo da transaÃƒÂ§ÃƒÂ£o.',
      },
      type: {
        type: SchemaType.STRING,
        description: 'Tipo da transaÃƒÂ§ÃƒÂ£o. "income" (receita) ou "expense" (despesa).',
      },
      category: {
        type: SchemaType.STRING,
        description: 'A categoria do lanÃƒÂ§amento.',
      },
      status: {
        type: SchemaType.STRING,
        description: 'Status do pagamento. Use "pending" para contas a pagar/receber no futuro, e "paid" para contas jÃƒÂ¡ resolvidas de forma imediata.',
      },
      dueDate: {
        type: SchemaType.STRING,
        description: 'Data de vencimento ou do gasto no formato YYYY-MM-DD. Apenas ÃƒÂºtil se for uma data futura.',
      },
      creditCardName: {
        type: SchemaType.STRING,
        description: 'Nome do CartÃƒÂ£o de CrÃƒÂ©dito (ex: Nubank, Itau), apenas se o usuÃƒÂ¡rio explicitar que pagou no cartÃƒÂ£o de crÃƒÂ©dito.',
      }
    },
    required: ['description', 'amount', 'type', 'category'],
  },
};

const tool_consultar_saldo: FunctionDeclaration = {
  name: 'consultar_saldo',
  description: 'Consulta o panorama financeiro do usuÃƒÂ¡rio: saldo atual, soma total de ganhos (receitas) e soma total gasta (despesas). Use para perguntas de totais gerais.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_consultar_resumo_categoria: FunctionDeclaration = {
  name: 'consultar_resumo_categoria',
  description: 'Consulta o total gasto na categoria no mÃƒÂªs atual.',
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
  description: 'Lista as transaÃƒÂ§ÃƒÂµes detalhadas (extrato) recentes do usuÃƒÂ¡rio.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      limit: { type: SchemaType.NUMBER, description: 'NÃƒÂºmero de transaÃƒÂ§ÃƒÂµes para listar. PadrÃƒÂ£o 5.' },
      type: { type: SchemaType.STRING, description: 'Filtro opcional. "income" para ver sÃƒÂ³ receitas, "expense" para sÃƒÂ³ despesas.' }
    }
  },
};

const tool_consultar_panorama_gastos: FunctionDeclaration = {
  name: 'consultar_panorama_gastos',
  description: 'Gera um resumo de quanto foi gasto em cada categoria nos ÃƒÂºltimos 30 dias. Use para dar dicas de economia e anÃƒÂ¡lise financeira.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

const tool_apagar_transacao: FunctionDeclaration = {
  name: 'apagar_transacao',
  description: 'Procura a transaÃƒÂ§ÃƒÂ£o mais recente que bate com a descriÃƒÂ§ÃƒÂ£o e/ou valor fornecidos e a deleta, servindo como funÃƒÂ§ÃƒÂ£o de DESFAZER ou corrigir erro.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      descriptionContains: { type: SchemaType.STRING, description: 'Parte da descriÃƒÂ§ÃƒÂ£o da transaÃƒÂ§ÃƒÂ£o que o usuÃƒÂ¡rio quer apagar (ex: "Mercado")' },
      amountApprox: { type: SchemaType.NUMBER, description: 'Valor em formato de nÃƒÂºmero inteiro ou float da transaÃƒÂ§ÃƒÂ£o a ser apagada (ex: 50.50)' }
    }
  },
};

const tool_editar_transacao: FunctionDeclaration = {
  name: 'editar_transacao',
  description: 'Procura a transaÃƒÂ§ÃƒÂ£o mais recente pela descriÃƒÂ§ÃƒÂ£o e/ou valor, e altera seus dados pelos novos valores informados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      searchDescription: { type: SchemaType.STRING, description: 'Palavra-chave da transaÃƒÂ§ÃƒÂ£o que deseja procurar para editar' },
      searchAmount: { type: SchemaType.NUMBER, description: 'Valor da transaÃƒÂ§ÃƒÂ£o antiga que se deseja procurar' },
      newDescription: { type: SchemaType.STRING, description: 'A nova descriÃƒÂ§ÃƒÂ£o a ser aplicada' },
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

      // LÃƒÂ³gica de DetecÃƒÂ§ÃƒÂ£o de CartÃƒÂ£o
      const possibleCardContext = (callArgs.creditCardName || (callArgs.description || "").toLowerCase().includes('cartÃƒÂ£o'));

      if (possibleCardContext) {
         const searchName = callArgs.creditCardName;
         let card = null;

         if (searchName && searchName.trim().length > 0) {
            card = await CreditCard.findOne({ where: { userId, name: { [Op.iLike]: `%${searchName}%` } } });
         }

         if (!card) {
            // Se nÃƒÂ£o encontrou pelo nome ou o nome veio vazio (ex: "no cartÃƒÂ£o")
            const allCards = await CreditCard.findAll({ where: { userId } });
            if (allCards.length === 1) {
               card = allCards[0];
            } else if (allCards.length > 1) {
               const names = allCards.map(c => c.name).join(' ou ');
               return { 
                 status: "error", 
                 message: `O usuÃƒÂ¡rio possui mÃƒÂºltiplos cartÃƒÂµes: ${names}. Por favor, pergunte em qual deles ele deseja realizar o lanÃƒÂ§amento.` 
               };
            }
         }

         if (card) {
            creditCardId = card.id;
            finalStatus = 'pending'; // Gastos no crÃƒÂ©dito rodam pra conta futura (Fatura)
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
      return { status: "success", message: creditCardId ? `TransaÃƒÂ§ÃƒÂ£o salva no cartÃƒÂ£o.` : "TransaÃƒÂ§ÃƒÂ£o salva.", transactionId: tx.id, statusFinal: finalStatus, usadoCartaoCredito: !!creditCardId };
    }

    if (callName === 'consultar_saldo') {
      // Ignora pendentes e cartÃƒÂµes de crÃƒÂ©dito na conta principal! Dinheiro Real apenas.
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
       if (!card) return { error: `CartÃƒÂ£o de crÃƒÂ©dito da operadora ${callArgs.cardName} nÃƒÂ£o foi encontrado no sistema do usuÃƒÂ¡rio.` };

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
        return { status: "success", message: `A transaÃƒÂ§ÃƒÂ£o '${txToDelele.description}' de valor ${txToDelele.amount} foi excluÃƒÂ­da definitivamente.` };
      }
      return { status: "error", message: "NÃƒÂ£o encontrei nenhuma transaÃƒÂ§ÃƒÂ£o recente parecida com essas caracterÃƒÂ­sticas para apagar." };
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
        return { status: "success", message: `TransaÃƒÂ§ÃƒÂ£o atualizada com sucesso para: ${txToEdit.description} - R$ ${txToEdit.amount} (${txToEdit.category})` };
      }
      return { status: "error", message: "NÃƒÂ£o encontrei nenhuma transaÃƒÂ§ÃƒÂ£o recente parecida para editar." };
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

    return { error: "Ferramenta nÃƒÂ£o reconhecida." };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Helper para extrair dados financeiros (valor e descriÃƒÂ§ÃƒÂ£o) de uma frase localmente.
 * ÃƒÅ¡til para economizar chamadas de IA em frases com padrÃƒÂµes aprendidos.
 */
const extractFinancialData = (phrase: string) => {
  const amountRegex = /(\d+[,.]\d+|\d+)/;
  const match = phrase.match(amountRegex);
  const amount = match ? parseFloat(match[0].replace(',', '.')) : null;

  // DescriÃƒÂ§ÃƒÂ£o: Retira o valor e palavras de ligaÃƒÂ§ÃƒÂ£o comuns
  let description = phrase
    .replace(amountRegex, '')
    .replace(/gastei|paguei|recebi|lanÃƒÂ§ar|fui|no|na|de|do|da|com|por|reais|valor/gi, '')
    .trim();

  // Capitaliza a primeira letra
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return { amount, description };
};

export const processAIRequest = async (userMessage: string, userId: number) => {
  const cleanMessage = userMessage.toLowerCase().trim();

  // Tier 1: Regex Burro Mas RÃƒÂ¡pido (Economiza Gemini em perguntas de saldo simples)
  if (['saldo', 'meu saldo', 'qual meu saldo', 'ver saldo'].includes(cleanMessage)) {
    const data = await executeTools('consultar_saldo', {}, userId);
    const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `Ã¢Å¡Â¡ *CÃƒÂ¡lculo do Roteador Local:* Seu saldo geral (Conta Corrente) neste exato momento ÃƒÂ© de **${money}**!`;
  }

  // Tier 1.5: Busca Inteligente (Fuzzy) por PadrÃƒÂµes Aprendidos
  const learned = await LearnedPattern.findOne({ 
    where: { 
      phrase: { [Op.iLike]: `%${cleanMessage}%` } 
    } 
  });

  if (learned) {
    if (learned.intent === 'consultar_saldo') {
      const data = await executeTools('consultar_saldo', {}, userId);
      const money = Number(data.saldoAtualContaReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `Ã°Å¸Â¤â€“ *CÃƒÂ©rebro Local (Aprendido):* Seu saldo geral ÃƒÂ© de **${money}**!`;
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
         return `Ã¢Å¡Â¡ *Script Local Orientado:* Lancei sua despesa de **R$ ${amount.toFixed(2)}** em **${description}**! (Processado localmente Ã°Å¸Å¡â‚¬)`;
      }
    }
  }

  // Tier 2: Acionando O CÃƒÂ©rebro Gigante (Google Gemini) se for algo novo ou complexo
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY nÃƒÂ£o configurada no servidor (VPS).');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    tools: tools,
    systemInstruction: `VocÃƒÂª ÃƒÂ© uma IA Financeira Financeira. Responda em PortuguÃƒÂªs-BR para o WhatsApp. Formate valores como (R$ 1.500,00). 
    Sempre analise o JSON de resposta da ferramenta invocada para formatar humanamente o resultado.
    
    COMPORTAMENTO DE CONSULTOR FINANCEIRO:
    - Se o usuÃƒÂ¡rio perguntar onde estÃƒÂ¡ gastando muito, use 'consultar_panorama_gastos'.
    - Seja proativo: sugira economias se vir gastos altos em categorias nÃƒÂ£o essenciais (ex: AlimentaÃƒÂ§ÃƒÂ£o Fora, Lazer).
    - Use emojis para tornar a conversa amigÃƒÂ¡vel mas profissional.`
  });

  const chat = model.startChat();
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  
  const functionCalls = response.functionCalls ? (typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls) : undefined;

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    
    // Auto-Aprendizado: O sistema salva a inteligÃƒÂªncia para a prÃƒÂ³xima vez
    if (!learned) {
       await LearnedPattern.create({ 
         phrase: cleanMessage, 
         intent: call.name,
         params: call.args // Guardamos os argumentos para entender o contexto do aprendizado
       });
       console.log(`[AI] Novo padrÃƒÂ£o aprendido localmente: "${cleanMessage}" -> ${call.name}`);
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
 * MÃƒÂ¡gica do Gemini para categorizar transaÃƒÂ§ÃƒÂµes bancÃƒÂ¡rias do Open Finance
 */
export const categorizeDescription = async (description: string): Promise<{ category: string, type: 'income' | 'expense' }> => {
  try {
     const apiKey = process.env.GEMINI_API_KEY;
     if (!apiKey) return { category: 'Outros', type: 'expense' };

     const genAI = new GoogleGenerativeAI(apiKey);
     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

     const prompt = `Analise a seguinte descriÃƒÂ§ÃƒÂ£o de transaÃƒÂ§ÃƒÂ£o bancÃƒÂ¡ria: "${description}". 
     Responda APENAS um JSON no formato: {"category": "NomeDaCategoria", "type": "income" ou "expense"}.
     Exemplo: "UBER TRIP" -> {"category": "Transporte", "type": "expense"}.
     "SALARIO" -> {"category": "SalÃƒÂ¡rio", "type": "income"}.`;

     const result = await model.generateContent(prompt);
     const text = result.response.text();
     const cleanJson = text.replace(/```json|```/g, '').trim();
     return JSON.parse(cleanJson);
  } catch (error) {
     console.error("Erro na categorizaÃƒÂ§ÃƒÂ£o inteligente:", error);
     return { category: 'Outros', type: 'expense' };
  }
};

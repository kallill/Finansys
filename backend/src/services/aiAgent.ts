import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Transaction, LearnedPattern } from '../models';
import { Op } from 'sequelize';

// Declarando as funções (Ferramentas) para o Gemini
const tool_registrar_lancamento: FunctionDeclaration = {
  name: 'registrar_lancamento',
  description: 'Registra uma nova transação financeira (receita ou despesa) no banco de dados.',
<!-- slide -->  parameters: {
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
    },
    required: ['description', 'amount', 'type', 'category'],
  },
};

const tool_consultar_saldo: FunctionDeclaration = {
  name: 'consultar_saldo',
  description: 'Consulta o saldo total atual do usuário.',
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

const tools = [{
  functionDeclarations: [
    tool_registrar_lancamento, tool_consultar_saldo, tool_consultar_resumo_categoria
  ],
}];

const executeTools = async (callName: string, callArgs: any, userId: number) => {
  try {
    if (callName === 'registrar_lancamento') {
      const tx = await Transaction.create({ ...callArgs, userId, date: new Date() });
      return { status: "success", message: "Transação salva.", transactionId: tx.id };
    }
    if (callName === 'consultar_saldo') {
      const transactions = await Transaction.findAll({ where: { userId } });
      const total = transactions.reduce((acc, tx: any) => tx.type === 'income' ? acc + Number(tx.amount) : acc - Number(tx.amount), 0);
      return { status: "success", saldoAtual: total };
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
    const money = Number(data.saldoAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `⚡ *Cálculo do Roteador Local:* Seu saldo geral neste exato momento é de **${money}**!`;
  }

  // Tier 1.5: Busca Aprendida! O Node procura no banco se ele "aprendeu" essa frase exata com o Gemini antes
  const learned = await LearnedPattern.findOne({ where: { phrase: cleanMessage } });
  if (learned) {
    if (learned.intent === 'consultar_saldo') {
      const data = await executeTools('consultar_saldo', {}, userId);
      const money = Number(data.saldoAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `🤖 *Cálculo Automático Aprendido:* Seu saldo geral é de **${money}**!`;
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

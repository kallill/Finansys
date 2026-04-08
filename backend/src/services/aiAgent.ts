import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Transaction } from '../models';
import { Op } from 'sequelize';

// Declarando as funções (Ferramentas) para o Gemini
const tool_registrar_lancamento: FunctionDeclaration = {
  name: 'registrar_lancamento',
  description: 'Registra uma nova transação financeira (receita ou despesa) no banco de dados.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      description: {
        type: SchemaType.STRING,
        description: 'Descrição curta da transação. Ex: "Mercado", "Salário", "Uber".',
      },
      amount: {
        type: SchemaType.NUMBER,
        description: 'Valor numérico positivo da transação. Ex: 50.50',
      },
      type: {
        type: SchemaType.STRING,
        description: 'Tipo da transação. Exatamente "income" ou "expense".',
      },
      category: {
        type: SchemaType.STRING,
        description: 'A categoria do lançamento. Ex: "Alimentação", "Transporte", "Moradia".',
      },
    },
    required: ['description', 'amount', 'type', 'category'],
  },
};

const tool_consultar_saldo: FunctionDeclaration = {
  name: 'consultar_saldo',
  description: 'Consulta o saldo total financeiro atual do usuário, somando receitas e subtraindo despesas de todo o histórico.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {}
  },
};

const tool_consultar_resumo_categoria: FunctionDeclaration = {
  name: 'consultar_resumo_categoria',
  description: 'Consulta o total gasto (ou recebido) pelo usuário em uma categoria específica no mês atual.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      category: {
        type: SchemaType.STRING,
        description: 'A categoria em que o usuário deseja saber o resumo. Ex: "Alimentação".',
      },
      type: {
        type: SchemaType.STRING,
        description: 'Se deseja o resumo de gastos ("expense") ou ganhos ("income"). Padrão é expense.',
      }
    },
    required: ['category'],
  },
};

const tools = [{
  functionDeclarations: [
    tool_registrar_lancamento,
    tool_consultar_saldo,
    tool_consultar_resumo_categoria
  ],
}];

// Executores Nativos (Quem bate no Postgres)
const executeTools = async (callName: string, callArgs: any, userId: number) => {
  try {
    if (callName === 'registrar_lancamento') {
      const tx = await Transaction.create({
        description: callArgs.description,
        amount: callArgs.amount,
        type: callArgs.type,
        category: callArgs.category,
        userId: userId,
        date: new Date()
      });
      return { status: "success", message: "Transação salva no banco de dados.", transactionId: tx.id };
    }

    if (callName === 'consultar_saldo') {
      const transactions = await Transaction.findAll({ where: { userId } });
      let total = 0;
      transactions.forEach((tx: any) => {
        if (tx.type === 'income') total += Number(tx.amount);
        else total -= Number(tx.amount);
      });
      return { status: "success", saldoAtual: total };
    }

    if (callName === 'consultar_resumo_categoria') {
      const txType = callArgs.type === 'income' ? 'income' : 'expense';
      
      // Filtra pelo mês atual
      const dataAtual = new Date();
      const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
      
      const transactions = await Transaction.findAll({
        where: {
          userId,
          type: txType,
          category: callArgs.category, // O ideal é usar o iLike, mas o SQLite tem limitações, vamos pelo exato
          date: {
             [Op.gte]: primeiroDia // Usamos o operador do Sequelize (já temos o Postgres)
          }
        }
      });

      let total = 0;
      transactions.forEach((tx: any) => {
        total += Number(tx.amount);
      });

      return { 
        status: "success", 
        categoria: callArgs.category, 
        mesAtual: dataAtual.getMonth() + 1,
        totalGasto: total, 
        transacoesEncontradas: transactions.length 
      };
    }

    return { error: "Ferramenta não reconhecida." };
  } catch (error: any) {
    console.error("[Tool Execution Error]", error);
    return { error: error.message };
  }
};

export const processAIRequest = async (userMessage: string, userId: number) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor (VPS).');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    tools: tools,
    systemInstruction: `Você é uma Inteligência Artificial Financeira embutida no WhatsApp do usuário do aplicativo Finansys.
Sua missão final é SEMPRE dar uma resposta amigável em Português-BR para ser lida no WhatsApp, utilizando emojis e formatação agradável de moedas (R$ 1.500,00).

Se o usuário quiser salvar ou pedir dados, use a ferramenta mais apropriada. 
Sempre analise o retorno da ferramenta que está retornando direto do Banco de Dados PostgreSQL do usuário e converta esses dados crus (JSON de sucesso) em uma mensagem de confirmação bonita.`
  });

  // Start chat para manter contexto simples da chamada
  const chat = model.startChat();
  const result = await chat.sendMessage(userMessage);

  // Gemini pode responder texto OU com uma requisição de Tool Call
  const response = result.response;
  
  const functionCalls = response.functionCalls ? (typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls) : undefined;

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    
    // Executa no Postgres!
    const toolResponseData = await executeTools(call.name, call.args, userId);
    
    // Devolve o JSON do Postgres para o Gemini interpretar e converter pra Humano
    const toolResult = await chat.sendMessage([{
      functionResponse: {
        name: call.name,
        response: toolResponseData
      }
    }]);

    return toolResult.response.text();
  }

  // Se o Gemini achou que não era função (ex: apenas um "Bom dia"), retorna direto
  return response.text();
};

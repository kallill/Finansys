import { Request, Response } from 'express';
import { parseBankFile, processImportWithAI } from '../services/importService';
import { Transaction } from '../models';

export const importStatement = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { bank } = req.body;
        const userId = (req as any).user.id;

        if (!file) {
            return res.status(400).json({ message: 'Arquivo nÃ£o enviado.' });
        }

        const rawTransactions = await parseBankFile(file.buffer, file.originalname, bank || 'generic');
        const enrichedTransactions = await processImportWithAI(rawTransactions);

        res.json({ 
            message: 'Arquivo processado com sucesso. Revise as categorias sugeridas pela IA.',
            transactions: enrichedTransactions 
        });
    } catch (error: any) {
        console.error('Erro na importaÃ§Ã£o:', error);
        res.status(500).json({ message: 'Falha ao processar o extrato bancÃ¡rio.', error: error.message });
    }
};

export const confirmImport = async (req: Request, res: Response) => {
    try {
        const { transactions } = req.body;
        const userId = (req as any).user.id;

        if (!Array.isArray(transactions)) {
            return res.status(400).json({ message: 'Formato de dados invÃ¡lido.' });
        }

        const createdTransactions = await Promise.all(transactions.map(t => {
            return Transaction.create({
                ...t,
                userId,
                status: 'paid'
            });
        }));

        res.json({ 
            message: `${createdTransactions.length} transaÃ§Ãµes importadas com sucesso!`,
            count: createdTransactions.length 
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao salvar transaÃ§Ãµes importadas.', error: error.message });
    }
};

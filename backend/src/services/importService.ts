import { categorizeDescription } from './aiAgent';
import * as ofx from 'ofx-js';
import * as csv from 'csv-string';

interface ParsedTransaction {
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
}

export const parseBankFile = async (buffer: Buffer, filename: string, bank: string): Promise<ParsedTransaction[]> => {
    const content = buffer.toString('utf-8');
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'ofx') {
        return parseOFX(content);
    } else if (ext === 'csv') {
        return parseCSV(content, bank);
    }
    
    throw new Error('Formato de arquivo nÃƒÂ£o suportado (.csv ou .ofx apenas)');
};

const parseOFX = async (content: string): Promise<ParsedTransaction[]> => {
    const data = await ofx.parse(content);
    const transactions = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
    
    return transactions.map((t: any) => {
        const amount = parseFloat(t.TRNAMT);
        return {
            date: parseOFXDate(t.DTPOSTED),
            description: t.MEMO || t.NAME,
            amount: Math.abs(amount),
            type: amount > 0 ? 'income' : 'expense'
        };
    });
};

const parseCSV = (content: string, bank: string): ParsedTransaction[] => {
    const rows = csv.parse(content);
    
    // PadrÃƒÂ£o Nubank: data, valor, identificador, descriÃƒÂ§ÃƒÂ£o
    if (bank.toLowerCase() === 'nubank') {
        return rows.slice(1).map(row => {
            const amount = parseFloat(row[1]);
            return {
                date: new Date(row[0].split('/').reverse().join('-')),
                description: row[3],
                amount: Math.abs(amount),
                type: amount > 0 ? 'income' : 'expense'
            };
        });
    }

    // PadrÃƒÂ£o GenÃƒÂ©rico para outros bancos se nÃƒÂ£o reconhecido
    return rows.slice(1).map(row => {
        const amount = parseFloat(row[2] || row[1]);
        return {
            date: new Date(row[0]),
            description: row[1],
            amount: Math.abs(amount),
            type: amount > 0 ? 'income' : 'expense'
        };
    });
};

const parseOFXDate = (dateStr: string): Date => {
    // Formato OFX: YYYYMMDDHHMMSS
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
};

export const processImportWithAI = async (transactions: ParsedTransaction[]) => {
    return Promise.all(transactions.map(async (t) => {
        const aiData = await categorizeDescription(t.description);
        return { ...t, category: aiData.category };
    }));
};

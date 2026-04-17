import React, { useState } from 'react';
import { 
    Upload, ChevronRight, CheckCircle2, AlertCircle, 
    HelpCircle, Building2, Smartphone
} from 'lucide-react';
import { importBankStatement, confirmBankImport } from '../../services/api';

const BankImportComponent = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [selectedBank, setSelectedBank] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const banks = [
        { id: 'nubank', name: 'Nubank', logo: 'ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â£', format: 'CSV', tutorial: 'App > Perfil > Configurar > Exportar extrato CSV' },
        { id: 'itau', name: 'ItaÃƒÆ’Ã‚Âº', logo: 'ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â ', format: 'OFX/CSV', tutorial: 'Internet Banking > Extrato > Salvar em OFX (Money)' },
        { id: 'inter', name: 'Inter', logo: 'ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â ', format: 'OFX', tutorial: 'Internet Banking > Conta Corrente > Extrato > Exportar OFX' },
        { id: 'santander', name: 'Santander', logo: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´', format: 'OFX/CSV', tutorial: 'Internet Banking > Conta Corrente > Extrato > Exportar' },
    ];

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFile(file);
        
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bank', selectedBank.id);
            
            const response = await importBankStatement(formData);
            setPreview(response.transactions);
            setStep(3);
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao processar arquivo. Verifique o formato.' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await confirmBankImport(preview);
            setMessage({ type: 'success', text: 'ImportaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o concluÃƒÆ’Ã‚Â­da com sucesso!' });
            if (onComplete) setTimeout(onComplete, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao salvar transaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full transition-all duration-300">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-8 px-4 max-w-md mx-auto">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            step >= s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Bank */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banks.map((bank) => (
                        <button
                            key={bank.id}
                            onClick={() => { setSelectedBank(bank); setStep(2); }}
                            className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group text-left shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl bg-slate-100 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl">{bank.logo}</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{bank.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">Aceita: {bank.format}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Tutorial & Upload */}
            {step === 2 && selectedBank && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-emerald-500" />
                                Como exportar no {selectedBank.name}?
                            </h3>
                            <div className="space-y-4 text-slate-600 dark:text-slate-400">
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                    <p className="text-sm">{selectedBank.tutorial}</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                    <p className="text-sm">Envie o arquivo para o seu computador.</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                    <p className="text-sm">Arraste-o para a zona de upload ao lado.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <p className="mb-2 text-sm text-slate-900 dark:text-white font-bold">Clique ou arraste o arquivo</p>
                                    <p className="text-xs text-slate-500">{selectedBank.format} apenas</p>
                                </div>
                                <input type="file" className="hidden" accept=".csv,.ofx" onChange={handleFileUpload} />
                            </label>
                            <button onClick={() => setStep(1)} className="mt-4 text-xs text-slate-500 hover:text-emerald-500 underline text-center w-full">Voltar para seleÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de banco</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Review & AI Categorization */}
            {step === 3 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            RevisÃƒÆ’Ã‚Â£o da IA Finansys
                        </h3>
                        <button onClick={() => setStep(2)} className="text-slate-500 text-sm hover:underline">Trocar arquivo</button>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Data</th>
                                    <th className="px-6 py-4 font-bold">DescriÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o</th>
                                    <th className="px-6 py-4 font-bold">Categoria (IA)</th>
                                    <th className="px-6 py-4 font-bold text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {preview.map((tx, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{tx.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                            {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                        <button 
                            onClick={handleConfirm}
                            disabled={loading}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                        >
                            {loading ? 'Processando...' : 'Confirmar ImportaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-bold">{message.text}</p>
                </div>
            )}
        </div>
    );
};

export default BankImportComponent;
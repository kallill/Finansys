import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Edit2, Trash2, ArrowLeft, Filter, Calendar, CheckCircle, Clock, Wallet as WalletIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getCreditCards } from '../services/api';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    description: '', 
    amount: '', 
    type: 'expense', 
    category: 'Geral', 
    date: new Date().toISOString().slice(0,10),
    status: 'paid',
    creditCardId: ''
  });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      // Carrega cada um individualmente para que um erro em um não trave o outro
      const [txResult, cardsResult] = await Promise.allSettled([
        getTransactions(),
        getCreditCards()
      ]);

      if (txResult.status === 'fulfilled') {
        const txData = txResult.value;
        const arr = Array.isArray(txData) ? txData : Array.isArray(txData?.transactions) ? txData.transactions : [];
        setTransactions(arr);
      } else {
        console.error('Falha ao carregar transações:', txResult.reason);
        setError('Não foi possível carregar o extrato. O banco de dados pode estar em manutenção.');
      }

      if (cardsResult.status === 'fulfilled') {
        setCards(cardsResult.value || []);
      } else {
        console.error('Falha ao carregar cartões:', cardsResult.reason);
        // Não bloqueia a tela, apenas avisa se estiver no modal
      }

    } catch (e) {
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ 
      description: '', 
      amount: '', 
      type: 'expense', 
      category: 'Geral', 
      date: new Date().toISOString().slice(0,10),
      status: 'paid',
      creditCardId: ''
    });
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    setForm({ 
      description: tx.description, 
      amount: String(tx.amount), 
      type: tx.type, 
      category: tx.category, 
      date: tx.date?.slice?.(0,10) ?? '',
      status: tx.status || 'paid',
      creditCardId: tx.creditCardId || ''
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        amount: Number(form.amount),
        creditCardId: form.creditCardId || null 
      };
      if (editing) {
        await updateTransaction(editing.id, payload);
      } else {
        await createTransaction(payload);
      }
      setModalOpen(false);
      await load();
    } catch {
      setError('Erro ao salvar transação');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Excluir transação?')) return;
    try {
      await deleteTransaction(id);
      await load();
    } catch {
      setError('Erro ao excluir transação');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><Filter size={20}/></div>
              Transações
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={openCreate} className="shadow-lg shadow-emerald-500/20"><Plus size={18} /> Nova Transação</Button>
          </div>
        </div>

        {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 mb-6">{error}</div>}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Data</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Descrição</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Categoria</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Origem</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[10px] text-right">Valor</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td className="p-8 text-center text-slate-400" colSpan={7}>Universo de dados carregando...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td className="p-12 text-center text-slate-400" colSpan={7}>Nenhum registro encontrado.</td></tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-500 font-medium">
                         <div className="flex flex-col">
                            <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                            <span className="text-[10px] opacity-60">{new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{tx.description}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {tx.creditCardId ? (
                          <div className="flex items-center gap-1.5 text-indigo-500 text-[10px] font-bold">
                             <CreditCard size={12} /> Cartão
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
                             <WalletIcon size={12} /> Dinheiro/Pix
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {tx.status === 'paid' ? (
                          <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
                            <CheckCircle size={12} /> Efivado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold">
                            <Clock size={12} /> Pendente
                          </span>
                        )}
                      </td>
                      <td className={`p-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                        {tx.type === 'income' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(tx)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => onDelete(tx.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-500 text-white rounded-lg">{editing ? <Edit2 size={18}/> : <Plus size={18}/>}</div>
                {editing ? 'Ajustar Detalhes' : 'Novo Registro'}
              </h2>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">O que você está registrando?</label>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Ex: Mercado Atacadão" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Valor</label>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" type="number" step="0.01" placeholder="R$ 0,00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Categoria</label>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Ex: Alimentação" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Tipo de Fluxo</label>
                    <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="expense">📉 Despesa (Saída)</option>
                      <option value="income">📈 Receita (Entrada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Data</label>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>

                  <div className="col-span-full border-t border-slate-100 dark:border-slate-800 pt-4">
                     <label className="text-xs font-semibold text-slate-500 ml-2 mb-3 block">Forma de Pagamento / Destino</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] text-slate-400 uppercase font-bold ml-1 mb-1 block">Status de Efetivação</label>
                           <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                              <option value="paid">✅ Já Pago/Recebido</option>
                              <option value="pending">⏳ Pendente/Agendado</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-400 uppercase font-bold ml-1 mb-1 block">Cartão de Crédito</label>
                           <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.creditCardId} onChange={e => setForm({ ...form, creditCardId: e.target.value })}>
                              <option value="">Não usar Cartão</option>
                              {cards.map(card => (
                                <option key={card.id} value={card.id}>{card.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold hover:bg-slate-200 transition-all" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="px-8 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Finalizar Registro
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;

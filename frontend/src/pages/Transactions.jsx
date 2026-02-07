import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/api';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: 'Geral', date: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      const arr = Array.isArray(data) ? data : Array.isArray(data?.transactions) ? data.transactions : [];
      setTransactions(arr);
    } catch (e) {
      setError('Falha ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ description: '', amount: '', type: 'expense', category: 'Geral', date: '' });
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    setForm({ description: tx.description, amount: String(tx.amount), type: tx.type, category: tx.category, date: tx.date?.slice?.(0,10) ?? '' });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
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
    try {
      await deleteTransaction(id);
      await load();
    } catch {
      setError('Erro ao excluir transação');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard /> Transações</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
            <Button variant="primary" onClick={openCreate}><Plus /> Nova</Button>
          </div>
        </div>

        {error && <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-6 border border-rose-500/20">{error}</div>}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Data</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={6}>Carregando...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td className="p-4" colSpan={6}>Nenhuma transação</td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-4">{tx.description}</td>
                    <td className="p-4">{tx.category}</td>
                    <td className="p-4">{tx.type === 'income' ? 'Receita' : 'Despesa'}</td>
                    <td className="p-4">R$ {Number(tx.amount).toFixed(2)}</td>
                    <td className="p-4">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(tx)} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(tx.id)} className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">{editing ? 'Editar' : 'Nova'} Transação</h2>
              <form className="space-y-4" onSubmit={onSubmit}>
                <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
                <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
                  <Button variant="primary" type="submit">Salvar</Button>
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

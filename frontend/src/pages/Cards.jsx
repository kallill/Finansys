import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Edit2, Trash2, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import { getCreditCards, createCreditCard, updateCreditCard, deleteCreditCard } from '../services/api';

const Cards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', limit: '', closingDay: 25, dueDay: 5 });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCreditCards();
      setCards(data);
    } catch (e) {
      setError('Falha ao carregar cartÃƒÆ’Ã‚Âµes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', limit: '', closingDay: 25, dueDay: 5 });
    setModalOpen(true);
  };

  const openEdit = (card) => {
    setEditing(card);
    setForm({ 
      name: card.name, 
      limit: String(card.limit), 
      closingDay: card.closingDay, 
      dueDay: card.dueDay 
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        limit: Number(form.limit),
        closingDay: Number(form.closingDay),
        dueDay: Number(form.dueDay)
      };
      if (editing) {
        await updateCreditCard(editing.id, payload);
      } else {
        await createCreditCard(payload);
      }
      setModalOpen(false);
      await load();
    } catch {
      setError('Erro ao salvar cartÃƒÆ’Ã‚Â£o');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cartÃƒÆ’Ã‚Â£o?')) return;
    try {
      await deleteCreditCard(id);
      await load();
    } catch {
      setError('Erro ao excluir cartÃƒÆ’Ã‚Â£o');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <CreditCard size={24} /> Meus CartÃƒÆ’Ã‚Âµes
            </h1>
          </div>
          <Button variant="primary" onClick={openCreate} className="shadow-lg shadow-emerald-500/20">
            <Plus size={18} /> Novo CartÃƒÆ’Ã‚Â£o
          </Button>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl border border-rose-500/20 mb-8 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-500">Buscando seus cartÃƒÆ’Ã‚Âµes...</div>
          ) : cards.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-slate-400" size={32} />
               </div>
               <p className="text-slate-500 dark:text-slate-400">Nenhum cartÃƒÆ’Ã‚Â£o cadastrado ainda.</p>
               <button onClick={openCreate} className="text-emerald-500 font-medium mt-2 hover:underline">Adicionar meu primeiro cartÃƒÆ’Ã‚Â£o</button>
            </div>
          ) : (
            cards.map(card => {
              const progress = (card.usedLimit / card.limit) * 100;
              return (
                <div key={card.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">{card.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">CrÃƒÆ’Ã‚Â©dito</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(card)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><Edit2 size={14} /></button>
                      <button onClick={() => onDelete(card.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="flex justify-between mb-2">
                         <span className="text-xs text-slate-500">Fatura Atual</span>
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-200">R$ {Number(card.usedLimit).toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(progress, 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                            <DollarSign size={10} /> limite total
                         </div>
                         <div className="text-sm font-bold">R$ {Number(card.limit).toFixed(2)}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-indigo-500/10">
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                            <Calendar size={10} /> vencimento
                         </div>
                         <div className="text-sm font-bold">Dia {String(card.dueDay).padStart(2,'0')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-emerald-500 text-white rounded-lg"><Plus size={18} /></div>
                {editing ? 'Editar CartÃƒÆ’Ã‚Â£o' : 'Novo CartÃƒÆ’Ã‚Â£o'}
              </h2>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Nome do CartÃƒÆ’Ã‚Â£o/Banco</label>
                  <input className="w-full bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none rounded-2xl p-4 transition-all" placeholder="Ex: Nubank, Inter" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Dia Fechamento</label>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none rounded-2xl p-4 transition-all" type="number" min="1" max="31" value={form.closingDay} onChange={e => setForm({ ...form, closingDay: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Dia Vencimento</label>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none rounded-2xl p-4 transition-all" type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-2 mb-1 block">Limite Total (R$)</label>
                  <input className="w-full bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none rounded-2xl p-4 transition-all" type="number" step="0.01" placeholder="0,00" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} required />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {editing ? 'Salvar AlteraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes' : 'Criar CartÃƒÆ’Ã‚Â£o'}
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

export default Cards;
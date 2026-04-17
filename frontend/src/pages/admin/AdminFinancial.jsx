import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { DollarSign, Plus, Trash2, Calendar, User, Package, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';
import api from '../../services/api';

const AdminFinancial = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    plano_id: '',
    data_vencimento: new Date().toISOString().split('T')[0],
    status_pagamento: 'Ativo'
  });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, clientRes, planRes] = await Promise.all([
        api.get('/api/crm/financial'),
        api.get('/api/crm/clients'),
        api.get('/api/crm/plans')
      ]);
      setSubscriptions(subRes.data);
      setClients(clientRes.data);
      setPlans(planRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.plano_id) {
      setError('Selecione um cliente e um plano.');
      return;
    }

    try {
      await api.post('/api/crm/financial', formData);
      setShowModal(false);
      setFormData({ 
        cliente_id: '', 
        plano_id: '', 
        data_vencimento: new Date().toISOString().split('T')[0], 
        status_pagamento: 'Ativo' 
      });
      fetchData();
    } catch (err) {
      setError('Erro ao criar contrato. Tente novamente.');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/crm/financial/${id}`, { status_pagamento: newStatus });
      fetchData();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este contrato permanentemente?')) return;
    try {
      await api.delete(`/api/crm/financial/${id}`);
      fetchData();
    } catch (err) {
      alert('Erro ao excluir contrato.');
    }
  };

  return (
    <AdminLayout title="Gestao Financeira">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Contratos e Faturamento</h3>
          <p className="text-gray-400 text-sm">Controle as assinaturas recorrentes do CRM</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20 font-bold"
        >
          <Plus size={20} />
          Novo Contrato
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-950/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Plano</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vencimento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">Carregando dados financeiros...</td>
                </tr>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-red-500 font-bold text-xs">
                          {sub.cliente?.nome?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{sub.cliente?.nome}</p>
                          <p className="text-[10px] text-gray-500">{sub.cliente?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded tracking-wide border border-gray-700">
                        {sub.plano?.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">
                        R$ {parseFloat(sub.plano?.valor || 0).toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} className="text-gray-600" />
                        {new Date(sub.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleUpdateStatus(sub.id, sub.status_pagamento === 'Ativo' ? 'Atrasado' : 'Ativo')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                          sub.status_pagamento === 'Ativo' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                      >
                        {sub.status_pagamento === 'Ativo' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {sub.status_pagamento}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleDelete(sub.id)}
                         className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                    Nenhum contrato ativo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Contrato */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h4 className="text-xl font-bold text-white">Lancar Novo Contrato</h4>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
              
              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Cliente
                </label>
                <select 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Package size={14} /> Plano de Servico
                </label>
                <select 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
                  value={formData.plano_id}
                  onChange={(e) => setFormData({...formData, plano_id: e.target.value})}
                >
                  <option value="">Selecione um plano...</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.nome} (R$ {p.valor})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} /> Vencimento
                  </label>
                  <input 
                    type="date" required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle size={14} /> Status Inicial
                  </label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
                    value={formData.status_pagamento}
                    onChange={(e) => setFormData({...formData, status_pagamento: e.target.value})}
                  >
                    <option value="Ativo">Aberto / Ativo</option>
                    <option value="Atrasado">Inadimplente</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]"
                >
                  Confirmar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFinancial;

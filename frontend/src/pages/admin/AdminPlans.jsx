import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Package, Plus, Trash2, Edit, Check, X, Tag, DollarSign, ListChecks } from 'lucide-react';
import api from '../../services/api';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    recursos_inclusos: ''
  });
  const [error, setError] = useState('');

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/crm/plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Transform string resources to array
    const resources = formData.recursos_inclusos
      .split('\n')
      .filter(r => r.trim() !== '');

    try {
      const payload = { 
        nome: formData.nome, 
        valor: parseFloat(formData.valor), 
        recursos_inclusos: resources 
      };

      if (editingId) {
        await api.put(`/api/crm/plans/${editingId}`, payload);
      } else {
        await api.post('/api/crm/plans', payload);
      }

      setFormData({ nome: '', valor: '', recursos_inclusos: '' });
      setShowModal(false);
      setEditingId(null);
      fetchPlans();
    } catch (err) {
      setError('Erro ao salvar plano. Verifique os dados.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este plano? Assinaturas existentes podem ser afetadas.')) return;
    try {
      await api.delete(`/api/crm/plans/${id}`);
      fetchPlans();
    } catch (err) {
      alert('Erro ao excluir plano.');
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      nome: plan.nome,
      valor: plan.valor.toString(),
      recursos_inclusos: plan.recursos_inclusos.join('\n')
    });
    setEditingId(plan.id);
    setShowModal(true);
  };

  return (
    <AdminLayout title="Planos e ServiÃƒÂ§os">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">CatÃƒÂ¡logo de ServiÃƒÂ§os</h3>
          <p className="text-gray-400 text-sm">Estruture seus planos recorrentes da Cerasus</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ nome: '', valor: '', recursos_inclusos: '' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20 font-bold"
        >
          <Plus size={20} />
          Criar Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all group flex flex-col">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800/50">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                  <Package size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(plan)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(plan)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{plan.nome}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-red-500">R$ {parseFloat(plan.valor).toLocaleString('pt-BR')}</span>
                <span className="text-xs text-gray-500">/mÃƒÂªs</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 bg-gray-950/30">
              <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <ListChecks size={14} /> Recursos Inclusos
              </p>
              <ul className="space-y-3">
                {plan.recursos_inclusos.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {loading && (
           <div className="col-span-full py-12 text-center text-gray-500 italic">
             Buscando catÃƒÂ¡logo de planos...
           </div>
        )}
        
        {!loading && plans.length === 0 && (
          <div className="col-span-full py-20 bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-3xl text-center">
            <Tag size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-400">Nenhum plano cadastrado ainda.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 text-red-500 hover:underline font-semibold"
            >
              Comece criando seu primeiro plano de serviÃƒÂ§o
            </button>
          </div>
        )}
      </div>

      {/* Modal Cadastro/EdiÃƒÂ§ÃƒÂ£o */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h4 className="text-xl font-bold text-white">
                {editingId ? 'Editar Plano' : 'Novo Plano de ServiÃƒÂ§o'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
              
              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Nome do Plano</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Consultoria Gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Valor Mensal (BRL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                  <input 
                    type="number" step="0.01" required
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Recursos (um por linha)</label>
                <textarea 
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all min-h-[120px] text-sm"
                  value={formData.recursos_inclusos}
                  onChange={(e) => setFormData({...formData, recursos_inclusos: e.target.value})}
                  placeholder="Monitoramento 24h&#10;Backup em Nuvem&#10;Suporte VIP"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]"
                >
                  {editingId ? 'Salvar AlteraÃƒÂ§ÃƒÂµes' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPlans;

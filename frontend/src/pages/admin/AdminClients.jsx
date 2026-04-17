import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Users, Plus, Trash2, Edit, Search, User, Mail, Phone, FileText, X } from 'lucide-react';
import api from '../../services/api';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    documento: '',
    tipo_pessoa: 'Fisica'
  });
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingId) {
        await api.put(`/api/crm/clients/${editingId}`, formData);
      } else {
        await api.post('/api/crm/clients', formData);
      }

      setFormData({ nome: '', email: '', telefone: '', documento: '', tipo_pessoa: 'Fisica' });
      setShowModal(false);
      setEditingId(null);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar cliente. Verifique se o CPF/CNPJ ja existe.');
    }
  };

  const handleEdit = (client) => {
    setFormData({
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
      documento: client.documento,
      tipo_pessoa: client.tipo_pessoa
    });
    setEditingId(client.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este cliente?')) return;
    try {
      await api.delete(`/api/crm/clients/${id}`);
      fetchClients();
    } catch (err) {
      alert('Erro ao excluir cliente.');
    }
  };

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.documento.includes(searchTerm)
  );

  return (
    <AdminLayout title="Clientes & Prospects">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Base de Clientes</h3>
          <p className="text-gray-400 text-sm">Gerencie seus contatos e leads da Cerasus</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou CPF..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              setFormData({ nome: '', email: '', telefone: '', documento: '', tipo_pessoa: 'Fisica' });
              setEditingId(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-red-600/20 font-bold text-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500 italic">Buscando clientes...</div>
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-red-500/30 transition-all group relative">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gray-800 rounded-2xl text-red-500 ring-1 ring-gray-700">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">{client.nome}</h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 mt-1">
                      Pessoa {client.tipo_pessoa}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(client)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail size={16} className="text-gray-600" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone size={16} className="text-gray-600" />
                  <span>{client.telefone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <FileText size={16} className="text-gray-600" />
                  <span>{client.documento}</span>
                </div>
              </div>

              {client.assinaturas && client.assinaturas.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contrato Ativo</span>
                   </div>
                   <span className="text-sm font-semibold text-white">{client.assinaturas[0].plano?.nome}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-3xl text-center">
            <Users size={48} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-400">{searchTerm ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado.'}</p>
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edicao */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
              <h4 className="text-xl font-bold text-white">
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">Nome Completo / Razao Social</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">Tipo</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
                    value={formData.tipo_pessoa}
                    onChange={(e) => setFormData({...formData, tipo_pessoa: e.target.value})}
                  >
                    <option value="Fisica">Pessoa Fisica</option>
                    <option value="Juridica">Pessoa Juridica</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">CPF / CNPJ</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    value={formData.documento}
                    onChange={(e) => setFormData({...formData, documento: e.target.value})}
                  />
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">E-mail</label>
                  <input 
                    type="email" required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs text-gray-500 ml-1 font-bold uppercase tracking-wider">Telefone</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]"
                >
                  {editingId ? 'Salvar Alteracoes' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminClients;

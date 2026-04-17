import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Users, Plus, Trash2, Shield, Mail, UserPlus, X } from 'lucide-react';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    nivel_acesso: 'Standard'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentAdmin = JSON.parse(localStorage.getItem('crm_admin') || '{}');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/crm/auth/admins');
      setUsers(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await api.post('/api/crm/auth/admins', formData);
      setSuccess('Usuário criado com sucesso!');
      setFormData({ nome: '', email: '', password: '', nivel_acesso: 'Standard' });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar usuário.');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentAdmin.id) {
      alert('Você não pode deletar sua própria conta operacional.');
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja remover este administrador?')) return;

    try {
      await api.delete(`/api/crm/auth/admins/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Erro ao remover usuário.');
    }
  };

  return (
    <AdminLayout title="Gestão de Usuários">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Administradores do CRM</h3>
          <p className="text-gray-400 text-sm">Gerencie quem tem acesso ao painel da Cerasus</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-600/20"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Nome</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">E-mail</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Nível</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                        {user.nome.charAt(0)}
                      </div>
                      <span className="font-medium">{user.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-500" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      user.nivel_acesso === 'Admin' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {user.nivel_acesso}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">Carregando usuários...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Usuário */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h4 className="text-xl font-bold flex items-center gap-2 text-white">
                <UserPlus size={22} className="text-red-500" />
                Criar Novo Admin
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Sair"
                title="Sair"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm italic">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">E-mail Operacional</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@cerasus.com.br"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Senha Temporária</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Nível de Acesso</label>
                <select 
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
                  value={formData.nivel_acesso}
                  onChange={(e) => setFormData({...formData, nivel_acesso: e.target.value})}
                >
                  <option value="Standard">Standard (Visualização/OS)</option>
                  <option value="Admin">Admin (Controle Total)</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;

import React, { useState } from 'react';
import { AdminLayout } from './AdminDashboard';
import { User, Lock, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const AdminProfile = () => {
  const currentAdmin = JSON.parse(localStorage.getItem('crm_admin') || '{}');
  
  const [formData, setFormData] = useState({
    nome: currentAdmin.nome || '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const payload = { nome: formData.nome };
      if (formData.password) payload.password = formData.password;

      const response = await api.put('/api/crm/auth/profile', payload);
      
      // Update local storage with new name
      const updatedAdmin = { ...currentAdmin, nome: response.data.admin.nome };
      localStorage.setItem('crm_admin', JSON.stringify(updatedAdmin));
      
      setSuccess('Perfil atualizado com sucesso!');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Meu Perfil">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-red-600/10 to-transparent p-8 border-b border-gray-800">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{currentAdmin.nome}</h3>
                <p className="text-gray-400 font-medium flex items-center gap-2 mt-1">
                  <ShieldCheck size={16} className="text-red-500" />
                  Nível {currentAdmin.nivel_acesso} Cerasus
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">{currentAdmin.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2">
                <Lock size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400 ml-1">Nome de Exibição</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text"
                    required
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all placeholder:text-gray-700"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400 ml-1">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password"
                      className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all placeholder:text-gray-700"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Deixe em branco para manter"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400 ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password"
                      className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all placeholder:text-gray-700"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirmar nova senha"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Atualizar Perfil'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4 italic">
                Sua sessão permanecerá ativa após a atualização do nome. Se alterar a senha, recomenda-se realizar um novo login.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;

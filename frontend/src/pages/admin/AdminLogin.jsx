import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usando API do backend CRM
      const response = await api.post('/api/crm/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('crm_token', response.data.token);
        localStorage.setItem('crm_admin', JSON.stringify(response.data.admin));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blurs for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gray-600/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-red-500 mb-4">
          <ShieldCheck size={56} strokeWidth={1.5} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white">
          Cerasus CRM
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Acesso Restrito ÃƒÆ’Ã‚Â  Equipe Administrativa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl border border-gray-800 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-xl flex items-center text-red-200">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 text-white block w-full pl-10 pr-3 py-3 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm placeholder-gray-500 transition-all focus:bg-gray-800"
                  placeholder="admin@cerasus.com.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 text-white block w-full pl-10 pr-3 py-3 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm placeholder-gray-500 transition-all focus:bg-gray-800"
                  placeholder="ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
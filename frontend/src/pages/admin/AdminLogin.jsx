import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import api from '../../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaData, setCaptchaData] = useState({ id: '', svg: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const response = await api.get('/api/crm/auth/captcha');
      setCaptchaData({
        id: response.data.captchaId,
        svg: response.data.svg
      });
      setCaptchaValue('');
    } catch (err) {
      console.error('Erro ao buscar captcha:', err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/crm/auth/login', { 
        email, 
        password, 
        captchaId: captchaData.id, 
        captchaValue 
      });
      
      if (response.data.success) {
        localStorage.setItem('crm_token', response.data.token);
        localStorage.setItem('crm_admin', JSON.stringify(response.data.admin));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao conectar com o servidor.';
      setError(msg);
      
      // Se for erro de captcha ou bloqueio, renovar captcha
      if (err.response?.status === 400 || err.response?.status === 403) {
        fetchCaptcha();
        if (err.response?.data?.isBlocked) {
          setIsBlocked(true);
        }
      }
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
          Infraestrutura Segura & Controle Administrativo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl border border-gray-800 rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {error && (
              <div className={`border p-4 rounded-xl flex items-center ${isBlocked ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-red-900/50 border-red-500/50 text-red-200'}`}>
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border border-gray-800 text-white block w-full pl-10 pr-3 py-3 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm placeholder-gray-600 transition-all focus:bg-gray-800 outline-none"
                  placeholder="admin@cerasus.com.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                Senha Operacional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border border-gray-800 text-white block w-full pl-10 pr-3 py-3 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm placeholder-gray-600 transition-all focus:bg-gray-800 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Captcha Section */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                Desafio de Segurança (Anti-Bot)
              </label>
              <div className="flex gap-3">
                <div 
                  className="bg-black/40 border border-gray-800 rounded-xl overflow-hidden flex-1 h-12 flex items-center justify-center relative group"
                  dangerouslySetInnerHTML={{ __html: captchaData.svg }}
                />
                <button 
                  type="button"
                  onClick={fetchCaptcha}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
                  title="Recarregar Captcha"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <div className="mt-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text" required
                  value={captchaValue}
                  onChange={(e) => setCaptchaValue(e.target.value)}
                  placeholder="Digite os caracteres acima"
                  className="bg-gray-800/50 border border-gray-800 text-white block w-full pl-10 pr-3 py-3 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm placeholder-gray-600 transition-all focus:bg-gray-800 outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? 'Verificando...' : 'Acessar CRM'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
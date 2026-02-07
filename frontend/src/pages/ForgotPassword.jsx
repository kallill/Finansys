import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await forgotPassword(email);
      setMessage(res.message || 'Se o e-mail existir, enviaremos um link de redefinição.');
    } catch (err) {
      setError('Não foi possível enviar. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Esqueceu sua senha</h2>
          <p className="text-slate-400">Informe seu e-mail para receber o link de redefinição.</p>
        </div>

        {message && (
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm mb-6 border border-emerald-500/20 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-6 border border-rose-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <Button variant="primary" className="w-full py-3.5" disabled={loading}>
            {loading ? (
              <span className="animate-pulse">Enviando...</span>
            ) : (
              <>Enviar link <ArrowRight size={18} /></>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/login')} className="text-emerald-400 hover:underline">
            Voltar ao login
          </button>
        </div>

        <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;

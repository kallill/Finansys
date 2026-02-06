import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { verifyEmailToken } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmailToken(token);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
        
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verificando...</h2>
            <p className="text-slate-400">Aguarde enquanto validamos seu email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Email Verificado!</h2>
            <p className="text-slate-400 mb-8">
              Sua conta foi ativada com sucesso. Você já pode fazer login.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Falha na Verificação</h2>
            <p className="text-slate-400 mb-8">
              O link é inválido ou expirou. Tente se cadastrar novamente ou entre em contato com o suporte.
            </p>
            <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
              Voltar
            </Button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;

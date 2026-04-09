import React, { useState, useEffect } from 'react';
import { MessageSquare, Link, Unlink, CheckCircle, Smartphone } from 'lucide-react';
import Button from '../ui/Button';
import { getWhatsAppStatus, logoutWhatsApp } from '../../services/api';
import WhatsAppModal from '../modals/WhatsAppModal';

const WhatsAppCard = () => {
  const [status, setStatus] = useState(null); // { connected: boolean, status: string }
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await getWhatsAppStatus();
      setStatus(res);
    } catch (e) {
      console.error('Erro ao buscar status do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    if (window.confirm('Deseja realmente desconectar seu WhatsApp do robô?')) {
      await logoutWhatsApp();
      fetchStatus();
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  const isConnected = status?.connected;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
      {/* Decoração sutil */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${isConnected ? 'bg-emerald-500/5' : 'bg-blue-500/5'} rounded-full -mr-10 -mt-10 transition-colors`}></div>
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className={`w-12 h-12 ${isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'} rounded-2xl flex items-center justify-center transition-colors shadow-inner`}>
          <MessageSquare size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">Cérebro WhatsApp</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isConnected ? 'Conexão Ativa' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-4 relative z-10">
           <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-xs text-slate-600 dark:text-emerald-400 font-medium">Seu dispositivo está pareado</span>
           </div>
           <button 
             onClick={handleDisconnect}
             className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
           >
             <Unlink size={14} /> Desvincular Conta
           </button>
        </div>
      ) : (
        <div className="relative z-10">
           <p className="text-xs text-slate-500 mb-5 leading-relaxed">
             Conecte seu WhatsApp para registrar transações usando sua voz ou texto natural com IA.
           </p>
           <Button 
             variant="primary" 
             onClick={() => setIsModalOpen(true)} 
             className="w-full flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
           >
             <Smartphone size={18} /> Conectar Agora
           </Button>
        </div>
      )}

      <WhatsAppModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnected={fetchStatus}
      />
    </div>
  );
};

export default WhatsAppCard;

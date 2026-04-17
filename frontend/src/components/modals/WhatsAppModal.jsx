import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { getWhatsAppQRCode, getWhatsAppStatus } from '../../services/api';

const WhatsAppModal = ({ isOpen, onClose, onConnected }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // pending, scanning, connected, error
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadQRCode();
    } else {
      // Limpa ao fechar
      setQrCode(null);
      setStatus('pending');
    }
  }, [isOpen]);

  // Polling para verificar se o usuÃƒÂ¡rio escaneou
  useEffect(() => {
    let interval;
    if (isOpen && status !== 'connected') {
      interval = setInterval(async () => {
        try {
          const res = await getWhatsAppStatus();
          if (res.connected) {
            setStatus('connected');
            if (onConnected) onConnected();
            clearInterval(interval);
          }
        } catch (e) {
          // Ignora erros de polling
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, status]);

  const loadQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWhatsAppQRCode();
      if (data.base64) {
        setQrCode(data.base64);
        setStatus('scanning');
      } else {
         setError('A API nÃƒÂ£o retornou um cÃƒÂ³digo QR vÃƒÂ¡lido.');
      }
    } catch (err) {
      setError('Falha ao conectar com o servidor do WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                <Smartphone size={24} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Conectar WhatsApp</h3>
                <p className="text-xs text-slate-500">Escaneie o cÃƒÂ³digo para ativar seu bot</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'connected' ? (
            <div className="text-center py-10">
               <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={40} />
               </div>
               <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Conectado com Sucesso!</h4>
               <p className="text-slate-500 mb-8">Seu robÃƒÂ´ financeiro jÃƒÂ¡ estÃƒÂ¡ ativo e pronto para receber suas transaÃƒÂ§ÃƒÂµes.</p>
               <Button variant="primary" onClick={onClose} className="px-10">Concluir</Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-center">
              
              {/* QR Code Area */}
              <div className="relative group">
                <div className="w-[240px] h-[240px] bg-slate-50 dark:bg-slate-950 rounded-2xl border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                   {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={40} className="text-emerald-500 animate-spin" />
                        <span className="text-xs text-slate-500">Gerando QR...</span>
                      </div>
                   ) : error ? (
                      <div className="px-6 text-center">
                        <AlertCircle size={40} className="text-rose-500 mx-auto mb-2" />
                        <p className="text-xs text-rose-500">{error}</p>
                        <button onClick={loadQRCode} className="mt-3 text-xs text-emerald-500 font-bold hover:underline">Tentar novamente</button>
                      </div>
                   ) : (
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain p-2" />
                   )}
                </div>
              </div>

              {/* Instructions */}
              <div className="flex-1 space-y-6">
                 <div>
                    <h5 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Passo a Passo:</h5>
                    <ol className="space-y-4">
                       <li className="flex gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                          <span className="text-slate-600 dark:text-slate-400">Abra o **WhatsApp** no seu celular</span>
                       </li>
                       <li className="flex gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                          <span className="text-slate-600 dark:text-slate-400">VÃƒÂ¡ em **ConfiguraÃƒÂ§ÃƒÂµes** {'>'} **Aparelhos Conectados**</span>
                       </li>
                       <li className="flex gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                          <span className="text-slate-600 dark:text-slate-400">Clique em **Conectar um Aparelho** e aponte a cÃƒÂ¢mera</span>
                       </li>
                    </ol>
                 </div>
                 <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium capitalize">
                       Ã°Å¸Å¡Â¨ Importante: A primeira conexÃƒÂ£o vincula seu nÃƒÂºmero permanentemente para falar com o RobÃƒÂ´.
                    </p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;

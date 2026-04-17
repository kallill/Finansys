import React, { useState, useEffect } from 'react';
import { Briefcase, UploadCloud, CheckCircle, Image as ImageIcon, X, Plus, AlertCircle, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const AdminOS = () => {
  const [ordens, setOrdens] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOS, setSelectedOS] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ cliente_id: '', descricao: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [osRes, clientRes] = await Promise.all([
        api.get('/api/crm/os'),
        api.get('/api/crm/clients')
      ]);
      setOrdens(osRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error('Erro ao buscar OS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOS = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.descricao) {
      setError('Preencha todos os campos.');
      return;
    }

    try {
      await api.post('/api/crm/os', formData);
      setShowModal(false);
      setFormData({ cliente_id: '', descricao: '' });
      fetchData();
    } catch (err) {
      setError('Erro ao criar Ordem de Servico.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/crm/os/${id}/status`, { status });
      if (selectedOS) setSelectedOS({ ...selectedOS, status });
      fetchData();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedOS) return;

    const data = new FormData();
    data.append('anexo', file);

    setUploading(true);
    try {
      await api.post(`/api/crm/os/${selectedOS.id}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      // Recarregar a OS selecionada para ver o novo anexo
      const response = await api.get('/api/crm/os');
      const updatedOS = response.data.find(o => o.id === selectedOS.id);
      setSelectedOS(updatedOS);
    } catch (err) {
      alert('Erro no upload do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Gestao de Ordens de Servico (OS)">
      
      <div className="flex justify-between items-center mb-8">
        <div>
           <h3 className="text-xl text-white font-bold">Servicos Tecnicos</h3>
           <p className="text-gray-400 text-sm">Controle de campo e execucoes Cerasus</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
        >
          <Plus size={20} className="inline mr-2" /> Nova OS
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-950/50 text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">ID / Cliente</th>
              <th className="px-6 py-4">Descricao</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data Abertura</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">Buscando ordens de servico...</td></tr>
            ) : ordens.length > 0 ? (
              ordens.map((os) => (
                <tr key={os.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-red-500 font-black text-xs block mb-1">#{os.id.toString().padStart(4, '0')}</span>
                    <span className="text-sm font-semibold text-white">{os.cliente?.nome}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm truncate max-w-xs">{os.descricao}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border
                      ${os.status === 'Concluida' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}
                    `}>
                      {os.status === 'Em Andamento' ? 'Execucao' : os.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                    {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedOS(os)} className="text-red-500 hover:text-red-400 font-bold text-xs ring-1 ring-red-500/20 px-3 py-1.5 rounded-lg hover:bg-black/40 transition-all">
                      VER DETALHES
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-500 italic">Nenhuma OS aberta no momento.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over de Detalhes */}
      {selectedOS && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedOS(null)}></div>
          <div className="relative w-full max-w-md bg-gray-950 h-full shadow-2xl border-l border-gray-800 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-500">
            
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
              <div>
                <span className="text-red-500 font-black text-xs">DETALHES DA ORDEM</span>
                <h3 className="text-xl font-bold text-white">OS #{selectedOS.id.toString().padStart(4, '0')}</h3>
              </div>
              <button onClick={() => setSelectedOS(null)} className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex-1 space-y-8">
              <section>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Cliente / Solicitante</label>
                <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                   <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 font-bold">
                      {selectedOS.cliente?.nome?.charAt(0)}
                   </div>
                   <p className="text-white font-bold">{selectedOS.cliente?.nome}</p>
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Descricao Tecnica</label>
                <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 min-h-[120px]">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedOS.descricao}</p>
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                  <ImageIcon size={14} className="text-red-500" /> 
                  Evidencias e Docs ({selectedOS.anexos?.length || 0})
                </label>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selectedOS.anexos?.map((anexo, i) => (
                    <a key={i} href={anexo.url_arquivo} target="_blank" rel="noreferrer" className="aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group relative ring-1 ring-inset ring-white/5">
                      <img src={anexo.url_arquivo} alt="Evidencia" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Search size={20} className="text-white" />
                      </div>
                    </a>
                  ))}
                  
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-900/50 hover:border-red-500/50 transition-all text-gray-500 hover:text-red-500">
                    <UploadCloud size={24} className="mb-2" />
                    <span className="text-[10px] font-bold">ANEXAR</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
                {uploading && <p className="text-xs text-center text-red-500 animate-pulse font-bold mt-2">Enviando evidencias...</p>}
              </section>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0">
              {selectedOS.status !== 'Concluida' ? (
                <button 
                  onClick={() => handleUpdateStatus(selectedOS.id, 'Concluida')}
                  className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-green-600/20 active:scale-95"
                >
                  <CheckCircle size={18} />
                  Concluir Ordem de Servico
                </button>
              ) : (
                <div className="flex items-center justify-center gap-3 py-4 px-4 bg-gray-800/50 text-green-500 rounded-2xl border border-green-500/20 font-black text-xs uppercase tracking-widest">
                  <CheckCircle size={18} />
                  OS Finalizada com Sucesso
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova OS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={24} className="text-red-500" />
                Nova Ordem de Servico
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOS} className="p-6 space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/40 text-red-500 p-3 rounded-xl text-xs">{error}</div>}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cliente Solicitante</label>
                <select 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">O que precisa ser feito?</label>
                <textarea 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all min-h-[150px] text-sm"
                  placeholder="Descreva detalhadamente o servico tecnico..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl text-xs tracking-widest uppercase transition-all shadow-xl shadow-red-600/20 active:scale-95">
                  ABRIR CHAMADO TÉCNICO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOS;
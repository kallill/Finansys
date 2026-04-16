import React, { useState } from 'react';
import { Briefcase, UploadCloud, CheckCircle, Image as ImageIcon, FileText } from 'lucide-react';
import { AdminLayout } from './AdminDashboard';
import api from '../../services/api';

// Fake Data for visual representation currently. 
// In production, this would be fetched via `useEffect` from `/api/crm/os`.
const mockOSData = [
  { id: 1, cliente: 'Agrobusiness Corp', desc: 'Instalação de Servidores', status: 'Em Andamento', data: '16/04/2026', anexos: [] },
  { id: 2, cliente: 'Tech Startups SA', desc: 'Consultoria Cloud', status: 'Concluída', data: '12/04/2026', anexos: ['https://cerasus.com.br/uploads/os/fake1.jpg'] },
];

const AdminOS = () => {
  const [ordens, setOrdens] = useState(mockOSData);
  const [selectedOS, setSelectedOS] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleOSClick = (os) => {
    setSelectedOS(os);
  };

  const closeMenu = () => {
    setSelectedOS(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedOS) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Usando API do backend Multer (CRM)
      // const response = await api.post(`/api/crm/os/${selectedOS.id}/anexo`, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('crm_token')}` }
      // });
      
      // Simulação para UX
      setTimeout(() => {
        const dummyUrl = URL.createObjectURL(file);
        const updatedOrdens = ordens.map(o => {
          if(o.id === selectedOS.id) {
            return { ...o, anexos: [...o.anexos, dummyUrl] };
          }
          return o;
        });
        setOrdens(updatedOrdens);
        setSelectedOS(updatedOrdens.find(o => o.id === selectedOS.id));
        setUploading(false);
      }, 1000);

    } catch (err) {
      console.error(err);
      alert('Erro ao enviar imagem.');
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Gestão de Ordens de Serviço (OS)">
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl text-white font-medium">Ordens Abertas</h3>
        <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Nova OS
        </button>
      </div>

      {/* Tabelas de OS */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800/50 text-gray-300 font-medium">
            <tr>
              <th className="px-6 py-4">ID / Cliente</th>
              <th className="px-6 py-4">Descrição do Serviço</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {ordens.map((os) => (
              <tr key={os.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  #{os.id} <span className="block text-xs text-gray-500 font-normal mt-1">{os.cliente}</span>
                </td>
                <td className="px-6 py-4">{os.desc}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                    ${os.status === 'Concluída' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}
                    ${os.status === 'Em Andamento' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                  `}>
                    {os.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{os.data}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOSClick(os)} className="text-red-500 hover:text-red-400 font-medium text-sm">
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OS Details Modal/Drawer */}
      {selectedOS && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMenu}></div>
          <div className="relative w-full max-w-md bg-gray-900 h-full shadow-2xl border-l border-gray-800 overflow-y-auto flex flex-col">
            
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900/90 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold text-white">OS #{selectedOS.id}</h3>
              <button onClick={closeMenu} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 flex-1">
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Cliente</p>
                <p className="text-white text-base font-medium">{selectedOS.cliente}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Descrição</p>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{selectedOS.desc}</p>
              </div>

              {/* Upload Section */}
              <div className="mt-8 border-t border-gray-800 pt-6">
                <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <ImageIcon size={16} />
                  Anexos e Comprovações
                </h4>
                
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800/50 hover:border-red-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-red-500" />
                      <p className="mb-2 text-sm text-gray-400 text-center px-4">
                        {uploading ? 'Enviando imagem...' : <><span className="font-semibold text-red-500">Clique para enviar</span> ou arraste a foto do serviço aqui</>}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>

                {/* Gallery */}
                {selectedOS.anexos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {selectedOS.anexos.map((url, i) => (
                      <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group relative">
                        <img src={url} alt="Anexo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-gray-500 mt-4 italic">Nenhuma foto anexada ainda.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0">
              <button className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors">
                <CheckCircle size={18} />
                Marcar como Concluída
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOS;

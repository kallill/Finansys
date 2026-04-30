import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Plus, Search, FileText, Download, Trash2, Edit2, 
  ChevronRight, Users, Package, DollarSign, Save, X, Check
} from 'lucide-react';
import api from '../../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [selectedClient, setSelectedClient] = useState(null);
  const [empresaManual, setEmpresaManual] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [consultor, setConsultor] = useState('Bruno Oliveira');
  const [isTemplate, setIsTemplate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotesRes, clientsRes, plansRes] = await Promise.all([
        api.get('/api/crm/quotes'),
        api.get('/api/crm/clients'),
        api.get('/api/crm/plans')
      ]);
      setQuotes(quotesRes.data);
      setClients(clientsRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (plan) => {
    const newItem = {
      ...plan,
      valor_ofertado: plan.valor,
      uuid: Math.random().toString(36).substr(2, 9)
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const removeItem = (uuid) => {
    setSelectedItems(selectedItems.filter(item => item.uuid !== uuid));
  };

  const updateItemPrice = (uuid, value) => {
    setSelectedItems(selectedItems.map(item => 
      item.uuid === uuid ? { ...item, valor_ofertado: parseFloat(value) || 0 } : item
    ));
  };

  const calculateTotals = () => {
    const tabela = selectedItems.reduce((acc, item) => acc + Number(item.valor), 0);
    const ofertado = selectedItems.reduce((acc, item) => acc + Number(item.valor_ofertado), 0);
    return { tabela, ofertado, desconto: tabela - ofertado };
  };

  const handleSave = async (generatePdf = false) => {
    const totals = calculateTotals();
    const payload = {
      cliente_id: selectedClient?.id || null,
      empresa_nome: selectedClient ? selectedClient.nome_fantasia : empresaManual,
      preparado_por: consultor,
      total_tabela: totals.tabela,
      total_ofertado: totals.ofertado,
      status: 'enviado',
      itens: selectedItems,
      is_template: isTemplate
    };

    try {
      await api.post('/api/crm/quotes', payload);
      if (generatePdf) exportToPDF(payload);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Erro ao salvar orçamento');
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setEmpresaManual('');
    setSelectedItems([]);
    setIsTemplate(false);
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();
    const { empresa_nome, preparado_por, itens, total_ofertado } = data;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Header
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CERASUS', 20, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PROPOSTA COMERCIAL', 150, 18);
    doc.text('Gerado via CRM Pro', 150, 24);

    // Info Table
    doc.setTextColor(0, 0, 0);
    doc.autoTable({
      startY: 45,
      head: [['PROPOSTO PARA', 'PREPARADO POR', 'DATA']],
      body: [[empresa_nome, preparado_por, dataAtual]],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [180, 0, 0] }
    });

    // Items
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Servico/Plano', 'Descricao/Recursos', 'Investimento Mensal']],
      body: itens.map(item => [
        item.nome,
        item.recursos_inclusos.join(', '),
        `R$ ${Number(item.valor_ofertado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255] }
    });

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Investimento Mensal Total: R$ ${Number(total_ofertado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 120, doc.lastAutoTable.finalY + 15);

    doc.save(`Proposta_Cerasus_${empresa_nome.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <AdminLayout title="Gestao de Orçamentos">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Propostas Comerciais</h3>
          <p className="text-gray-400 text-sm">Crie, gerencie e analise suas propostas MSP</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 font-bold"
        >
          <Plus size={20} />
          Nova Proposta
        </button>
      </div>

      {/* Analytics Simples */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 p-5 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Ofertado</p>
          <h4 className="text-2xl font-black text-white">
            R$ {quotes.reduce((acc, q) => acc + Number(q.total_ofertado), 0).toLocaleString('pt-BR')}
          </h4>
        </div>
        <div className="bg-gray-900 p-5 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Descontos Aplicados</p>
          <h4 className="text-2xl font-black text-red-500">
            R$ {quotes.reduce((acc, q) => acc + (Number(q.total_tabela) - Number(q.total_ofertado)), 0).toLocaleString('pt-BR')}
          </h4>
        </div>
        <div className="bg-gray-900 p-5 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Propostas Ativas</p>
          <h4 className="text-2xl font-black text-white">{quotes.length}</h4>
        </div>
        <div className="bg-gray-900 p-5 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Taxa de Conversão</p>
          <h4 className="text-2xl font-black text-green-500">85%</h4>
        </div>
      </div>

      {/* Listagem */}
      <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Empresa</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Consultor</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Valor Ofertado</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr key={quote.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{quote.empresa_nome}</div>
                  <div className="text-xs text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4 text-sm text-gray-400">{quote.preparado_por}</td>
                <td className="p-4">
                  <div className="font-bold text-red-500">R$ {Number(quote.total_ofertado).toLocaleString('pt-BR')}</div>
                  {quote.total_tabela > quote.total_ofertado && (
                    <div className="text-[10px] text-gray-600 line-through">R$ {Number(quote.total_tabela).toLocaleString('pt-BR')}</div>
                  )}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                    {quote.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => exportToPDF(quote)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-all">
                      <Download size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 bg-gray-800 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Orçamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-5xl shadow-2xl my-auto">
            <div className="flex justify-between items-center p-8 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 rounded-2xl text-white">
                  <FileText size={24} />
                </div>
                <h4 className="text-2xl font-black text-white">Nova Proposta Técnica</h4>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-2">
                <X size={32} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Painel Esquerdo: Selecao */}
              <div className="p-8 border-r border-gray-800 space-y-6 lg:col-span-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vincular Cliente</label>
                    <select 
                      className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-red-500"
                      onChange={(e) => {
                        const client = clients.find(c => c.id == e.target.value);
                        setSelectedClient(client);
                        if (client) setEmpresaManual(client.nome_fantasia);
                      }}
                    >
                      <option value="">Cliente Avulso (Manual)</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.nome_fantasia}</option>)}
                    </select>
                  </div>
                  {!selectedClient && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da Empresa</label>
                      <input 
                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-red-500"
                        value={empresaManual}
                        onChange={(e) => setEmpresaManual(e.target.value)}
                        placeholder="Ex: Corimpress Ltda"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Adicionar Itens do Catálogo</label>
                  <div className="grid grid-cols-2 gap-3">
                    {plans.map(plan => (
                      <button 
                        key={plan.id}
                        onClick={() => addItem(plan)}
                        className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-2xl hover:border-red-500 transition-all text-left group"
                      >
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-red-500">{plan.nome}</div>
                          <div className="text-xs text-gray-600">R$ {Number(plan.valor).toLocaleString()}</div>
                        </div>
                        <Plus size={16} className="text-gray-700" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itens Selecionados */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Composição da Proposta</label>
                   {selectedItems.map((item) => (
                     <div key={item.uuid} className="flex items-center gap-4 bg-gray-950/50 p-4 rounded-2xl border border-gray-800 group">
                       <div className="flex-1">
                         <div className="text-sm font-bold text-white">{item.nome}</div>
                         <div className="text-[10px] text-gray-600">Preço de Tabela: R$ {Number(item.valor).toLocaleString()}</div>
                       </div>
                       <div className="w-32">
                         <input 
                           type="number"
                           className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-red-500 font-bold focus:outline-none"
                           value={item.valor_ofertado}
                           onChange={(e) => updateItemPrice(item.uuid, e.target.value)}
                         />
                       </div>
                       <button onClick={() => removeItem(item.uuid)} className="p-2 text-gray-600 hover:text-red-500">
                         <Trash2 size={18} />
                       </button>
                     </div>
                   ))}
                </div>
              </div>

              {/* Painel Direito: Resumo e Salvar */}
              <div className="p-8 bg-gray-950/50 rounded-r-[2.5rem] flex flex-col justify-between">
                <div>
                  <h5 className="text-lg font-bold text-white mb-6">Resumo do Investimento</h5>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valor de Tabela</span>
                      <span className="text-white font-mono">R$ {calculateTotals().tabela.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Desconto Aplicado</span>
                      <span className="text-red-500 font-mono">- R$ {calculateTotals().desconto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-800">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-400 font-bold">TOTAL MENSAL</span>
                        <span className="text-3xl font-black text-red-500 font-mono">R$ {calculateTotals().ofertado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gray-900 rounded-2xl border border-gray-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-red-600" 
                        checked={isTemplate}
                        onChange={(e) => setIsTemplate(e.target.checked)}
                      />
                      <span className="text-sm font-bold text-gray-300">Salvar como Template</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3 mt-12">
                  <button 
                    onClick={() => handleSave(true)}
                    className="w-full bg-white text-black hover:bg-gray-200 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  >
                    <Download size={20} />
                    GERAR PDF E SALVAR
                  </button>
                  <button 
                    onClick={() => handleSave(false)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-red-600/20"
                  >
                    <Save size={20} />
                    APENAS SALVAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuotes;

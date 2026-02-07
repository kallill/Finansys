import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart as PieIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import { getReportTransactions } from '../services/api';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ start: '', end: '', type: '', category: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReportTransactions(filters);
      const arr = Array.isArray(data?.transactions) ? data.transactions : [];
      setRows(arr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const header = ['Descrição', 'Categoria', 'Tipo', 'Valor', 'Data'];
    const lines = rows.map(r => [r.description, r.category, r.type, Number(r.amount).toFixed(2), new Date(r.date).toLocaleDateString('pt-BR')]);
    const csv = [header, ...lines].map(l => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transacoes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><PieIcon /> Relatórios</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
            <Button variant="primary" onClick={exportCsv}>Exportar CSV</Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3" type="date" value={filters.start} onChange={e => setFilters({ ...filters, start: e.target.value })} placeholder="Início" />
            <input className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3" type="date" value={filters.end} onChange={e => setFilters({ ...filters, end: e.target.value })} placeholder="Fim" />
            <select className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <input className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Categoria" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} />
            <Button variant="primary" onClick={load}>Aplicar</Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={5}>Carregando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-4" colSpan={5}>Sem resultados</td></tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-4">{r.description}</td>
                    <td className="p-4">{r.category}</td>
                    <td className="p-4">{r.type === 'income' ? 'Receita' : 'Despesa'}</td>
                    <td className="p-4">R$ {Number(r.amount).toFixed(2)}</td>
                    <td className="p-4">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import { getWalletSummary, getDashboardSeries, getDashboardStats } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

const colors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#14b8a6'];

const WalletPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totals: { income: 0, expense: 0, balance: 0 }, categories: [] });
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const s = await getWalletSummary();
      const se = await getDashboardSeries();
      const st = await getDashboardStats();
      setSummary(s);
      setSeries(Array.isArray(se?.series) ? se.series : []);
      setStats(st);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet /> Minha Carteira</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
            <Button variant="primary" onClick={() => navigate('/transactions')}><DollarSign /> Nova Transação</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-sm text-slate-500">Saldo Total</p>
            <p className="text-2xl font-bold">R$ {Number(summary.totals.balance).toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-sm text-slate-500">Receitas (Mês)</p>
            <p className="text-2xl font-bold text-emerald-600">R$ {Number(summary.totals.income).toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-sm text-slate-500">Despesas (Mês)</p>
            <p className="text-2xl font-bold text-rose-600">R$ {Number(summary.totals.expense).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-1">
            <h2 className="font-semibold mb-4">Distribuição por Categoria</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="expense" data={summary.categories} nameKey="category" cx="50%" cy="50%" outerRadius={90}>
                    {summary.categories.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-semibold mb-4">Fluxo nos Últimos Meses</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="Receitas" fill="#10b981" />
                  <Bar dataKey="expense" name="Despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;

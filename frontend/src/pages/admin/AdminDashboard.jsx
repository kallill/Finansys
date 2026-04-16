import React, { useState } from 'react';
import { 
  Users, TrendingUp, DollarSign, AlertCircle, 
  Settings, LogOut, Package, Briefcase, FileImage
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const dummyRevenueData = [
  { name: 'Dez', mrr: 12000 },
  { name: 'Jan', mrr: 15400 },
  { name: 'Fev', mrr: 18000 },
  { name: 'Mar', mrr: 22000 },
  { name: 'Abr', mrr: 26500 },
];

const dummyConversionData = [
  { name: 'Prospects', value: 45 },
  { name: 'Ativos', value: 18 },
  { name: 'Perdidos', value: 5 },
];

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('crm_admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_admin');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Finansys CRM
            </h1>
            <p className="text-xs text-gray-500 mt-1">Portal Administrativo</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/20">
              <TrendingUp size={20} />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <Users size={20} />
              Clientes & Prospects
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <Package size={20} />
              Planos e Contratos
            </a>
            <a href="/admin/os" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <Briefcase size={20} />
              Ordens de Serviço
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <DollarSign size={20} />
              Financeiro
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-sm">
              {admin?.nome?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium">{admin?.nome || 'Administrador'}</p>
              <p className="text-xs text-gray-500">{admin?.nivel_acesso}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between sticky top-0 z-10 hidden md:flex">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Inject content here */}
          {children}
        </div>
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <AdminLayout title="Visão Geral">
      {/* 🚀 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Receita Mensal (MRR)</p>
              <h3 className="text-3xl font-bold text-white">R$ 26.500</h3>
            </div>
            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-sm text-green-400 mt-4 flex items-center gap-1">
            <TrendingUp size={16} /> +15.3% desde o último mês
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Clientes Ativos</p>
              <h3 className="text-3xl font-bold text-white">104</h3>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm text-blue-400 mt-4 flex items-center gap-1">
            +6 novos clientes
          </p>
        </div>

        <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-red-200 mb-1">Inadimplência</p>
              <h3 className="text-3xl font-bold text-white">R$ 1.850</h3>
            </div>
            <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-sm text-red-400 mt-4">
            3 faturas em atraso
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">OS Abertas</p>
              <h3 className="text-3xl font-bold text-white">12</h3>
            </div>
            <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-lg">
              <Briefcase size={24} />
            </div>
          </div>
          <p className="text-sm text-yellow-500 mt-4">
            Pendente execução
          </p>
        </div>
      </div>

      {/* 📊 Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-6">Crescimento de Receita Corrente</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(val) => [`R$ ${val.toLocaleString()}`, 'MRR']}
                />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#818cf8" 
                  strokeWidth={4} 
                  dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel/Conversion */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Funil Comercial (Mês)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dummyConversionData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: '#1f2937'}}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                />
                <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export { AdminLayout, AdminDashboard };

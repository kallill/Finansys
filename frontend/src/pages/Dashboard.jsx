import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, PieChart, CreditCard, LogOut, Menu, 
  Search, Bell, TrendingUp, TrendingDown, DollarSign, User, Sun, Moon 
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import StatCard from '../components/dashboard/StatCard';
import TransactionRow from '../components/dashboard/TransactionRow';
import { getTransactions, getDashboardStats } from '../services/api';
import useTheme from '../hooks/useTheme';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'Usuário', email: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Erro ao ler usuário do localStorage");
        }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await getTransactions();
            const sample = [
              { id: 1, description: "Design Freelance", date: "Hoje, 14:00", amount: "2.400,00", type: "income", category: "Serviços" },
              { id: 2, description: "Netflix Premium", date: "Ontem, 09:30", amount: "55,90", type: "expense", category: "Assinatura" },
              { id: 3, description: "Supermercado", date: "12 Mar, 18:15", amount: "432,10", type: "expense", category: "Alimentação" },
              { id: 4, description: "Venda Produto X", date: "10 Mar, 11:20", amount: "150,00", type: "income", category: "Vendas" }
            ];
            const arr = Array.isArray(data) ? data 
              : Array.isArray(data?.transactions) ? data.transactions 
              : [];
            setTransactions(arr.length > 0 ? arr : sample);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'wallet', label: 'Minha Carteira', icon: Wallet },
    { id: 'analytics', label: 'Relatórios', icon: PieChart },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Sidebar Overlay Mobile */}
      {!sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm" onClick={() => setSidebarOpen(true)} style={{display: 'none'}} />
      )}

      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} 
        fixed md:relative z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shadow-xl md:shadow-none`}
      >
        <div className="h-20 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
          {sidebarOpen ? <Logo /> : <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">F</div>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'} />
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              {activeTab === item.id && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden">
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden md:flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500/50 transition-colors w-64">
              <Search size={18} className="text-slate-400 dark:text-slate-500 mr-2" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
            
            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Plano Grátis</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-slate-400 dark:text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Saldo Total" 
              value="R$ 42.500,00" 
              change="+12.5%" 
              isPositive={true} 
              icon={DollarSign} 
            />
            <StatCard 
              title="Receitas (Mês)" 
              value="R$ 8.250,00" 
              change="+5.2%" 
              isPositive={true} 
              icon={TrendingUp} 
            />
            <StatCard 
              title="Despesas (Mês)" 
              value="R$ 3.100,00" 
              change="-2.4%" 
              isPositive={false} 
              icon={TrendingDown} 
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Area (Simulated) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fluxo de Caixa</h3>
                <select className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 outline-none">
                  <option>Últimos 6 meses</option>
                  <option>Este ano</option>
                </select>
              </div>
              
              {/* CSS Only Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-4 mt-8">
                {[65, 40, 75, 55, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm relative h-full flex items-end overflow-hidden">
                      <div 
                        style={{ height: `${h}%` }} 
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-80 group-hover:opacity-100 transition-all duration-300 relative"
                      >
                         {/* Tooltip on hover */}
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            R$ {h * 100}
                         </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500 text-center font-medium">
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recentes</h3>
                <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">Ver todas</button>
              </div>
              <div className="space-y-1">
                {Array.isArray(transactions) && transactions.map((tx) => (
                    <TransactionRow 
                        key={tx.id}
                        name={tx.description} 
                        date={tx.date} 
                        amount={tx.amount} 
                        type={tx.type} 
                        category={tx.category}
                    />
                ))}
              </div>

               <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-4 text-center shadow-lg shadow-emerald-500/20">
                    <p className="text-white font-medium mb-2">Upgrade para Pro</p>
                    <p className="text-emerald-100 text-sm mb-3">Desbloqueie IA e relatórios ilimitados.</p>
                    <button className="bg-white text-emerald-600 text-sm font-bold px-4 py-2 rounded-lg w-full hover:bg-slate-50 transition-colors shadow-sm">
                      Ver Planos
                    </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

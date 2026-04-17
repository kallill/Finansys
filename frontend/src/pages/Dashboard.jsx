import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet as WalletIcon, PieChart, CreditCard, LogOut, Menu, X, 
  Search, Bell, TrendingUp, TrendingDown, DollarSign, User, Sun, Moon 
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import StatCard from '../components/dashboard/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TransactionRow from '../components/dashboard/TransactionRow';
import { getTransactions, getDashboardStats, createTransaction, getDashboardSeries, getCreditCards } from '../services/api';
import useTheme from '../hooks/useTheme';
import WhatsAppCard from '../components/dashboard/WhatsAppCard';
import BankImportComponent from '../components/dashboard/BankImportComponent';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'UsuÃƒÂ¡rio', email: '' });
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'expense', description: '', amount: '', category: '', date: new Date().toISOString().slice(0,10) });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Erro ao ler usuÃƒÂ¡rio do localStorage");
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
            const [data, s, st, cData] = await Promise.all([
              getTransactions(),
              getDashboardSeries(),
              getDashboardStats(),
              getCreditCards().catch(() => []) // Fallback se falhar
            ]);
            
            const arr = Array.isArray(data) ? data 
              : Array.isArray(data?.transactions) ? data.transactions 
              : [];
            setTransactions(arr);
            setSeries(s?.series || []);
            setStats(st);
            setCards(cData || []);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'VisÃƒÂ£o Geral', icon: LayoutDashboard },
    { id: 'wallet', label: 'Minha Carteira', icon: WalletIcon },
    { id: 'cards', label: 'Meus CartÃƒÂµes', icon: CreditCard },
    { id: 'import', label: 'Importar Extrato', icon: TrendingUp },
    { id: 'analytics', label: 'RelatÃƒÂ³rios', icon: PieChart },
    { id: 'transactions', label: 'TransaÃƒÂ§ÃƒÂµes', icon: Menu },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Overlay para fechar sidebar no celular */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <aside 
        className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} 
        fixed md:relative z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shadow-2xl md:shadow-none`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1 flex justify-center">
            {sidebarOpen ? <Logo /> : <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">F</div>}
          </div>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'transactions') navigate('/transactions');
                else if (item.id === 'wallet') navigate('/wallet');
                else if (item.id === 'cards') navigate('/cards');
                else if (item.id === 'analytics') navigate('/reports');
                else setActiveTab(item.id);
              }}
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
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden">
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
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
            
            <button 
              onClick={() => alert('VocÃƒÂª nÃƒÂ£o tem notificaÃƒÂ§ÃƒÂµes pendentes no momento.')}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Plano GrÃƒÂ¡tis</p>
              </div>
              <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-slate-400 dark:text-slate-300" />
                </div>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {activeTab === 'dashboard' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Saldo Total" 
                  value={stats ? `R$ ${Number(stats.totals.balance).toFixed(2)}` : "R$ 0,00"} 
                  change=""
                  isPositive={(stats?.totals.balance ?? 0) >= 0} 
                  icon={DollarSign} 
                />
                <StatCard 
                  title="Receitas (MÃƒÂªs)" 
                  value={stats?.totals?.income ? `R$ ${Number(stats.totals.income).toFixed(2)}` : "R$ 0,00"} 
                  change=""
                  isPositive={true} 
                  icon={TrendingUp} 
                />
                <StatCard 
                  title="Despesas (MÃƒÂªs)" 
                  value={stats?.totals?.expense ? `R$ ${Number(stats.totals.expense).toFixed(2)}` : "R$ 0,00"} 
                  change=""
                  isPositive={false} 
                  icon={TrendingDown} 
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setNewTx({ ...newTx, type: 'income' }); setShowModal(true); }} className="px-4 py-2 rounded-xl bg-emerald-500 text-white flex items-center gap-2">
                  <TrendingUp size={18} /> LanÃƒÂ§ar Receita
                </button>
                <button onClick={() => { setNewTx({ ...newTx, type: 'expense' }); setShowModal(true); }} className="px-4 py-2 rounded-xl bg-rose-500 text-white flex items-center gap-2">
                  <TrendingDown size={18} /> LanÃƒÂ§ar Despesa
                </button>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fluxo de Caixa</h3>
                    <select className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 outline-none">
                      <option>ÃƒÅ¡ltimos 6 meses</option>
                      <option>Este ano</option>
                    </select>
                  </div>
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

                {/* Recent Transactions & Actions */}
                <div className="space-y-8">
                  <WhatsAppCard />
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recentes</h3>
                    <button onClick={() => navigate('/transactions')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">Ver todas</button>
                  </div>
                  <div className="space-y-1">
                    {Array.isArray(transactions) && transactions.slice(0, 5).map((tx) => (
                        <TransactionRow 
                            key={tx.id}
                            name={tx.description} 
                            date={tx.date} 
                            amount={Number(tx.amount).toFixed(2)} 
                            type={tx.type} 
                            category={tx.category}
                            isCredit={!!tx.creditCardId}
                            cardName={cards.find(c => c.id === tx.creditCardId)?.name}
                        />
                    ))}
                  </div>

                   <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-center shadow-lg shadow-emerald-500/20">
                        <p className="text-white font-medium mb-1">Novo: ImportaÃƒÂ§ÃƒÂ£o Manual</p>
                        <p className="text-emerald-100 text-xs mb-3">Importe o extrato do seu banco (Nubank, ItaÃƒÂº, Inter) e deixe a IA categorizar.</p>
                        <button onClick={() => setActiveTab('import')} className="bg-white text-emerald-600 text-sm font-bold px-4 py-2 rounded-lg w-full hover:bg-slate-50 transition-colors shadow-sm">
                          Importar Extrato
                        </button>
                      </div>
                   </div>
                </div>
              </div>

              </div>
            </>
          ) : activeTab === 'import' ? (
            <BankImportComponent onComplete={() => setActiveTab('dashboard')} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
               <p>Selecione uma funcionalidade vÃƒÂ¡lida no menu lateral.</p>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-4">{newTx.type === 'income' ? 'Nova Receita' : 'Nova Despesa'}</h3>
                <div className="space-y-3">
                  <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="DescriÃƒÂ§ÃƒÂ£o" value={newTx.description} onChange={e => setNewTx({ ...newTx, description: e.target.value })} />
                  <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Categoria" value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} />
                  <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" type="number" step="0.01" placeholder="Valor" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />
                  <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white" onClick={async () => {
                    const payload = { ...newTx, amount: parseFloat(newTx.amount) };
                    await createTransaction(payload);
                    const data = await getTransactions();
                    const arr = Array.isArray(data) ? data : Array.isArray(data?.transactions) ? data.transactions : [];
                    setTransactions(arr);
                    const st = await getDashboardStats();
                    setStats(st);
                    setShowModal(false);
                  }}>Salvar</button>
                </div>
              </div>
            </div>
          )}


        </div>
      </main>
    </div>
  );
};

export default Dashboard;

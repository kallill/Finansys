import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  User,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

// --- Componentes Compartilhados ---

const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    outline: "bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-lg">F</span>
    </div>
    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
      Finansys
    </span>
  </div>
);

// --- Componentes da Dashboard ---

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className="p-3 bg-slate-700/50 rounded-xl group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors text-slate-400">
        <Icon size={20} />
      </div>
    </div>
    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      <span className="font-medium">{change}</span>
      <span className="text-slate-500 ml-1">vs. mês anterior</span>
    </div>
  </div>
);

const TransactionRow = ({ name, date, amount, type, category }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-xl transition-colors border-b border-slate-800 last:border-0">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
      </div>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-slate-400">{date} • {category}</p>
      </div>
    </div>
    <span className={`font-bold ${type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
      {type === 'income' ? '+' : '-'} R$ {amount}
    </span>
  </div>
);

// --- Views Principais ---

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Recursos</a>
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Preços</a>
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Sobre</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('login')} className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">
              Entrar
            </button>
            <Button onClick={() => onNavigate('login')} variant="primary" className="py-2 px-4 text-sm">
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Novo: Integração com PIX 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Domine suas finanças com <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">Inteligência Artificial</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            O Finansys transforma a maneira como você lida com dinheiro. Dashboards intuitivos, previsões inteligentes e controle total em uma única plataforma.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
            <Button onClick={() => onNavigate('login')}>
              Criar Conta Grátis <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={() => {}}>
              Ver Demonstração
            </Button>
          </div>

          {/* Feature Preview Image */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-2 shadow-2xl shadow-emerald-500/10">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-800 relative group">
              {/* Mockup visual */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                 <div className="text-center p-10">
                    <PieChart size={64} className="mx-auto text-emerald-500 mb-4 opacity-50" />
                    <p className="text-slate-500 font-mono">Dashboard Preview</p>
                 </div>
              </div>
              
              {/* Overlay elements to look like UI */}
              <div className="absolute top-4 left-4 right-4 flex gap-4">
                  <div className="w-1/4 h-32 bg-slate-700/30 rounded-lg animate-pulse"></div>
                  <div className="w-1/4 h-32 bg-slate-700/30 rounded-lg animate-pulse delay-75"></div>
                  <div className="w-1/4 h-32 bg-slate-700/30 rounded-lg animate-pulse delay-150"></div>
                  <div className="w-1/4 h-32 bg-slate-700/30 rounded-lg animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Segurança Bancária", desc: "Seus dados protegidos com criptografia de ponta a ponta." },
              { icon: PieChart, title: "Relatórios Detalhados", desc: "Entenda para onde vai cada centavo com gráficos precisos." },
              { icon: Smartphone, title: "Acesso Mobile", desc: "Gerencie suas finanças de qualquer lugar, a qualquer hora." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simula delay de rede
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
          <p className="text-slate-400">Insira suas credenciais para acessar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-white">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50" />
              Lembrar de mim
            </label>
            <a href="#" className="text-emerald-400 hover:text-emerald-300">Esqueceu a senha?</a>
          </div>

          <Button variant="primary" className="w-full py-3.5" disabled={loading}>
            {loading ? (
              <span className="animate-pulse">Autenticando...</span>
            ) : (
              <>Entrar na Conta <ArrowRight size={18} /></>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Não tem uma conta? <button onClick={onBack} className="text-emerald-400 hover:underline">Cadastre-se</button>
          </p>
        </div>
        
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Ajustar sidebar no mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'wallet', label: 'Minha Carteira', icon: Wallet },
    { id: 'analytics', label: 'Relatórios', icon: PieChart },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar Overlay Mobile */}
      {!sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm" onClick={() => setSidebarOpen(true)} style={{display: 'none'}} />
      )}

      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} 
        fixed md:relative z-30 h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}
      >
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
          {sidebarOpen ? <Logo /> : <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center font-bold">F</div>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'} />
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              {activeTab === item.id && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden">
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 focus-within:border-emerald-500/50 transition-colors w-64">
              <Search size={18} className="text-slate-500 mr-2" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-500" />
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Ana Silva</p>
                <p className="text-xs text-slate-400">Plano Pro</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-slate-300" />
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
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Fluxo de Caixa</h3>
                <select className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded-lg px-3 py-1 outline-none">
                  <option>Últimos 6 meses</option>
                  <option>Este ano</option>
                </select>
              </div>
              
              {/* CSS Only Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-4 mt-8">
                {[65, 40, 75, 55, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer">
                    <div className="w-full bg-slate-800 rounded-t-sm relative h-full flex items-end overflow-hidden">
                      <div 
                        style={{ height: `${h}%` }} 
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-80 group-hover:opacity-100 transition-all duration-300 relative"
                      >
                         {/* Tooltip on hover */}
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            R$ {h * 100}
                         </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 text-center font-medium">
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Recentes</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">Ver todas</button>
              </div>
              <div className="space-y-1">
                <TransactionRow 
                  name="Design Freelance" 
                  date="Hoje, 14:00" 
                  amount="2.400,00" 
                  type="income" 
                  category="Serviços"
                />
                <TransactionRow 
                  name="Netflix Premium" 
                  date="Ontem, 09:30" 
                  amount="55,90" 
                  type="expense" 
                  category="Assinatura"
                />
                <TransactionRow 
                  name="Supermercado" 
                  date="12 Mar, 18:15" 
                  amount="432,10" 
                  type="expense" 
                  category="Alimentação"
                />
                <TransactionRow 
                  name="Venda Produto X" 
                  date="10 Mar, 11:20" 
                  amount="150,00" 
                  type="income" 
                  category="Vendas"
                />
              </div>

               <div className="mt-6 pt-6 border-t border-slate-800">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-4 text-center">
                    <p className="text-white font-medium mb-2">Upgrade para Pro</p>
                    <p className="text-emerald-100 text-sm mb-3">Desbloqueie IA e relatórios ilimitados.</p>
                    <button className="bg-white text-emerald-600 text-sm font-bold px-4 py-2 rounded-lg w-full hover:bg-slate-100 transition-colors">
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

// --- App Principal ---

const App = () => {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'dashboard'

  const navigate = (view) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  return (
    <>
      {currentView === 'landing' && <LandingPage onNavigate={navigate} />}
      {currentView === 'login' && <LoginPage onLogin={() => navigate('dashboard')} onBack={() => navigate('landing')} />}
      {currentView === 'dashboard' && <Dashboard onLogout={() => navigate('landing')} />}
    </>
  );
};

export default App;
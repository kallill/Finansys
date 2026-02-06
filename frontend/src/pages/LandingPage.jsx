import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, ArrowRight, ShieldCheck, Smartphone, DollarSign, TrendingUp, TrendingDown, Sun, Moon } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import StatCard from '../components/dashboard/StatCard';
import TransactionRow from '../components/dashboard/TransactionRow';
import useTheme from '../hooks/useTheme';

const DashboardPreview = () => (
  <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 p-6 flex flex-col gap-6 overflow-hidden transition-colors duration-300">
     {/* Fake Header */}
     <div className="flex items-center justify-between mb-2">
        <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Visão Geral</h3>
            <p className="text-slate-500 text-xs">Bem-vindo de volta, Ana</p>
        </div>
        <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
                <span className="font-bold text-xs">AS</span>
            </div>
        </div>
     </div>

     {/* Stats Row */}
     <div className="grid grid-cols-3 gap-4">
        <StatCard title="Saldo Total" value="R$ 14.250" change="+12%" isPositive={true} icon={DollarSign} />
        <StatCard title="Receitas" value="R$ 8.400" change="+5%" isPositive={true} icon={TrendingUp} />
        <StatCard title="Despesas" value="R$ 3.100" change="-2%" isPositive={false} icon={TrendingDown} />
     </div>

     {/* Main Content Row */}
     <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Fake Chart */}
        <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm">Fluxo de Caixa</h4>
                <div className="w-20 h-6 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 px-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm relative h-full flex items-end">
                        <div style={{height: `${h}%`}} className="w-full bg-emerald-500/80 rounded-t-sm"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Fake Transactions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm dark:shadow-none">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-2">Recentes</h4>
            <div className="space-y-1">
                <TransactionRow name="Freelance" date="Hoje" amount="1.200" type="income" category="Serviços" />
                <TransactionRow name="Spotify" date="Ontem" amount="29,90" type="expense" category="Assinatura" />
                <TransactionRow name="Mercado" date="12/03" amount="450" type="expense" category="Alimentação" />
            </div>
        </div>
     </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-emerald-500/30 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Recursos</a>
            <a href="#" className="text-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Preços</a>
            <a href="#" className="text-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Sobre</a>
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

            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Entrar
            </button>
            <Button onClick={() => navigate('/register')} variant="primary" className="py-2 px-4 text-sm">
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 animate-fade-in-up shadow-sm dark:shadow-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Novo: Integração com PIX 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">
            Domine suas finanças com <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500">Inteligência Artificial</span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            O Finansys transforma a maneira como você lida com dinheiro. Dashboards intuitivos, previsões inteligentes e controle total em uma única plataforma.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
            <Button onClick={() => navigate('/register')}>
              Criar Conta Grátis <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={() => {}}>
              Ver Demonstração
            </Button>
          </div>

          {/* Feature Preview Image */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 shadow-2xl shadow-emerald-500/5 dark:shadow-emerald-500/10">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative group border border-slate-200 dark:border-slate-800">
               {/* Dashboard Preview Component */}
               <div className="absolute inset-0 transform scale-[0.98] origin-center hover:scale-100 transition-transform duration-700">
                  <DashboardPreview />
               </div>
               
               {/* Reflection/Shine effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Segurança Bancária", desc: "Seus dados protegidos com criptografia de ponta a ponta." },
              { icon: PieChart, title: "Relatórios Detalhados", desc: "Entenda para onde vai cada centavo com gráficos precisos." },
              { icon: Smartphone, title: "Acesso Mobile", desc: "Gerencie suas finanças de qualquer lugar, a qualquer hora." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

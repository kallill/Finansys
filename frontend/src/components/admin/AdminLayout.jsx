import React from 'react';
import { 
  TrendingUp, Users, Package, Briefcase, DollarSign, UserCog, LogOut, Settings, LayoutDashboard
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('crm_admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_admin');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive(to) 
        ? 'bg-red-600/20 text-red-500 font-medium border border-red-500/20 shadow-sm' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
      }`}
    >
      <Icon size={20} />
      {children}
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6 border-b border-gray-800">
            <Link to="/admin/dashboard" className="block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
              Cerasus CRM
            </Link>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Cerasus Solutions</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <NavLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/admin/clients" icon={Users}>Clientes & Prospects</NavLink>
            <NavLink to="/admin/plans" icon={Package}>Planos e Contratos</NavLink>
            <NavLink to="/admin/os" icon={Briefcase}>Ordens de Servico</NavLink>
            <NavLink to="/admin/financial" icon={DollarSign}>Financeiro</NavLink>
            
            {/* Somente visivel para Admin */}
            {admin?.nivel_acesso === 'Admin' && (
              <div className="pt-4 mt-4 border-t border-gray-800/50">
                <p className="px-4 text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Sistema</p>
                <NavLink to="/admin/users" icon={UserCog}>Gestao de Usuarios</NavLink>
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <Link 
            to="/admin/profile" 
            className="flex items-center gap-3 px-4 py-2 mb-4 hover:bg-gray-800 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 to-red-700 flex items-center justify-center font-bold text-sm shadow-lg shadow-red-600/10">
              {admin?.nome?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-red-500 transition-colors">{admin?.nome || 'Administrador'}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{admin?.nivel_acesso}</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Sair do CRM
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-950/50 backdrop-blur-3xl">
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-6 flex items-center justify-between sticky top-0 z-10 hidden md:flex">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">{title}</h2>
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/profile" 
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-800 transition-all"
              title="Configuracoes de Perfil"
            >
              <Settings size={20} />
            </Link>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
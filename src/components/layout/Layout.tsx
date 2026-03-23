import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Settings, 
  BarChart3, 
  Users, 
  Building2, 
  LogOut, 
  Menu, 
  Clock, 
  Bell, 
  HelpCircle 
} from 'lucide-react';
import { User } from '../../types';
import SidebarItem from '../common/SidebarItem';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void | Promise<void>;
}

const Layout = ({ user, children, onLogout }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    SELLER: [
      { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
      { icon: LayoutDashboard, label: 'Resumen', path: '/resumen' },
      { icon: Package, label: 'Inventario', path: '/inventario' },
      { icon: Settings, label: 'Configuración', path: '/configuracion' },
    ],
    OWNER: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: ShoppingCart, label: 'Terminal', path: '/ventas' },
      { icon: BarChart3, label: 'Reportes', path: '/reportes' },
      { icon: Package, label: 'Inventario', path: '/inventario' },
      { icon: Settings, label: 'Configuración', path: '/configuracion' },
    ],
    SUPER_ADMIN: [
      { icon: LayoutDashboard, label: 'Panel General', path: '/panel' },
      { icon: Users, label: 'Dueños', path: '/dueños' },
      { icon: Users, label: 'Vendedores', path: '/vendedores' },
      { icon: Building2, label: 'Empresas', path: '/empresas' },
      { icon: Settings, label: 'Sistema', path: '/sistema' },
    ]
  };

  const currentMenu = (menuItems as any)[user.role] || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-slate-100 flex flex-col overflow-hidden whitespace-nowrap"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <ShoppingCart className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800">ClaudiaPOS</span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {currentMenu.map((item: any) => (
            <SidebarItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              badge={item.label === 'Inventario' ? '3' : undefined}
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {currentMenu.find((m: any) => m.path === location.pathname)?.label || 'Inicio'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-sm font-medium">
              <Clock size={16} />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500">
              <HelpCircle size={20} />
            </button>
            <div className="w-px h-8 bg-slate-100 mx-2"></div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:border-indigo-200 transition-all">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;

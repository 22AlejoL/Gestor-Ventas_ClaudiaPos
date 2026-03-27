import React, { useEffect, useRef, useState } from 'react';
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
  HelpCircle,
  UserCircle2
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { User, UserRole } from '../../types';
import SidebarItem from '../common/SidebarItem';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void | Promise<void>;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  read: boolean;
}

type HeaderPanel = 'notifications' | 'help' | 'profile' | null;

const Layout = ({ user, children, onLogout }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<HeaderPanel>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    {
      id: 'stock-alert',
      title: 'Inventario requiere atencion',
      detail: user.role === 'SUPER_ADMIN' ? 'Hay empresas con productos por debajo del minimo.' : 'Tienes productos con stock critico.',
      read: false,
    },
    {
      id: 'sales-summary',
      title: 'Resumen diario disponible',
      detail: 'El resumen del turno actual ya puede consultarse en reportes.',
      read: false,
    },
    {
      id: 'security',
      title: 'Sesion protegida',
      detail: 'Tu cuenta mantiene autenticacion activa y segura.',
      read: true,
    },
  ]);
  const headerActionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!headerActionsRef.current) return;
      if (!headerActionsRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const togglePanel = (panel: Exclude<HeaderPanel, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const openProfile = () => {
    navigate('/configuracion');
    setActivePanel(null);
  };

  const openHelpCenter = () => {
    navigate('/configuracion');
    setActivePanel(null);
  };

  const contactSupport = () => {
    window.location.href = 'mailto:soporte@claudiapos.com?subject=Ayuda%20con%20ClaudiaPOS';
    setActivePanel(null);
  };

  const menuItems: Record<UserRole, MenuItem[]> = {
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

  const currentMenu = menuItems[user.role] || [];

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-white/95 backdrop-blur-sm border-r border-slate-200/80 flex flex-col overflow-hidden whitespace-nowrap"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <ShoppingCart className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800">ClaudiaPOS</span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {currentMenu.map((item) => (
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
          <div className="surface-card p-4 flex items-center gap-3 mb-4">
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
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-rose-100"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white rounded-xl transition-all text-slate-500 border border-transparent hover:border-slate-200"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {currentMenu.find((m) => m.path === location.pathname)?.label || 'Inicio'}
            </h1>
          </div>

          <div ref={headerActionsRef} className="relative flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-sm font-medium">
              <Clock size={16} />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button
              type="button"
              onClick={() => togglePanel('notifications')}
              className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-500 relative border border-transparent hover:border-slate-200"
              aria-label="Notificaciones"
              aria-expanded={activePanel === 'notifications'}
              aria-haspopup="dialog"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[11px] rounded-full border-2 border-white font-bold inline-flex items-center justify-center leading-none shadow-sm">
                  {Math.min(unreadCount, 9)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => togglePanel('help')}
              className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-500 border border-transparent hover:border-slate-200"
              aria-label="Ayuda"
              aria-expanded={activePanel === 'help'}
              aria-haspopup="dialog"
            >
              <HelpCircle size={20} />
            </button>
            <div className="w-px h-8 bg-slate-100 mx-2"></div>
            <button
              type="button"
              onClick={() => togglePanel('profile')}
              className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:border-indigo-200 transition-all"
              aria-label="Perfil"
              aria-expanded={activePanel === 'profile'}
              aria-haspopup="dialog"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
            </button>

            <AnimatePresence>
              {activePanel === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-28 top-14 w-[360px] max-w-[calc(100vw-2rem)] surface-panel p-3 z-30"
                  role="dialog"
                  aria-label="Panel de notificaciones"
                >
                  <div className="flex items-center justify-between px-2 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">Notificaciones</p>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Marcar todo leido
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1 space-y-1">
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markNotificationRead(item.id)}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 w-2.5 h-2.5 rounded-full ${item.read ? 'bg-slate-300' : 'bg-rose-500'}`} />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activePanel === 'help' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-16 top-14 w-[320px] max-w-[calc(100vw-2rem)] surface-panel p-4 z-30"
                  role="dialog"
                  aria-label="Panel de ayuda"
                >
                  <p className="text-sm font-bold text-slate-800 mb-1">Ayuda rapida</p>
                  <p className="text-xs text-slate-500 mb-3">Accesos para resolver dudas frecuentes.</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={openHelpCenter}
                      className="btn-secondary w-full justify-start"
                    >
                      <HelpCircle size={16} />
                      Centro de ayuda
                    </button>
                    <button
                      type="button"
                      onClick={contactSupport}
                      className="btn-secondary w-full justify-start"
                    >
                      <Bell size={16} />
                      Contactar soporte
                    </button>
                  </div>
                </motion.div>
              )}

              {activePanel === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-14 w-[300px] max-w-[calc(100vw-2rem)] surface-panel p-4 z-30"
                  role="dialog"
                  aria-label="Panel de perfil"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="pt-3 space-y-2">
                    <button
                      type="button"
                      onClick={openProfile}
                      className="btn-secondary w-full justify-start"
                    >
                      <UserCircle2 size={16} />
                      Ver perfil
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 transition-colors"
                    >
                      <LogOut size={16} />
                      Cerrar sesion
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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


import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, LayoutTemplate, Settings, Users, LogOut, X, PieChart, Share2, Package, CreditCard } from 'lucide-react';
import { Logo } from './Logo';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose, onLogout }) => {
  const location = useLocation();

  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/projects', icon: Calendar, label: 'Minha Agenda' },
    { path: '/social-tracker', icon: Share2, label: 'Social Tracker' },
    { path: '/templates', icon: LayoutTemplate, label: 'Modelos' },
    { path: '/reports', icon: PieChart, label: 'Relatórios' },
    { path: '/plans', icon: CreditCard, label: 'Assinatura' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
  ];

  if (user?.role === 'admin') {
      // Insert 'Equipes' before Settings
      const settingsIndex = links.findIndex(l => l.path === '/settings');
      links.splice(settingsIndex, 0, { path: '/clients', icon: Users, label: 'Equipes' });
      // Insert 'Produtos' before Clients (Equipes)
      const clientsIndex = links.findIndex(l => l.path === '/clients');
      links.splice(clientsIndex, 0, { path: '/products', icon: Package, label: 'Produtos' });
  }

  return (
    <>
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-gray-800 
          transform transition-transform duration-300 ease-in-out flex flex-col 
          h-[100dvh] md:h-screen
          md:translate-x-0 md:sticky md:top-0
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-gray-800 flex-shrink-0 flex justify-between items-center h-20">
          <Logo size="md" />
          <button 
            onClick={onClose} 
            className="md:hidden text-gray-400 hover:text-white transition-colors p-1 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/templates' && location.pathname.startsWith('/templates'));
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose()} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gray-800 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}
                `}
              >
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]"></div>
                )}
                <link.icon size={20} className={`transition-colors ${isActive ? 'text-indigo-500' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 flex-shrink-0">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Sair</span>
           </button>
        </div>
      </aside>
    </>
  );
};

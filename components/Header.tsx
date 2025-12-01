
import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, Clock } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  toggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, toggleMobileSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 bg-brand-surface/70 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-400 p-2 hover:bg-gray-800 rounded-lg transition-colors" onClick={toggleMobileSidebar}>
            <Menu />
        </button>
        <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Buscar relatórios..." 
                className="bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
            />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 bg-gray-900/80 border border-gray-700/50 rounded-full px-4 py-1.5 shadow-sm">
           <Clock size={14} className="text-[#3B82F6]" />
           <span className="text-sm font-mono font-medium text-gray-300 min-w-[70px] text-center">
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </span>
        </div>

        <button className="relative text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-700 hidden md:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white group-hover:text-[#3B82F6] transition-colors">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Gestor' : 'Colaborador'}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-700 border-2 border-[#3B82F6] overflow-hidden group-hover:shadow-[0_0_10px_#3B82F6] transition-all">
                <img src={user?.avatar_url || 'https://via.placeholder.com/40'} alt="User" className="h-full w-full object-cover" />
            </div>
        </div>
      </div>
    </header>
  );
};
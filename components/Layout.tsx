import React, { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Mobile Backdrop - Only visible when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-full">
        <Header 
          user={user} 
          toggleMobileSidebar={() => setIsSidebarOpen(true)} 
        />
        
        {/* Main Content Area with Sticky Footer behavior */}
        <main className="flex-1 overflow-y-auto flex flex-col scroll-smooth">
          <div className="flex-1 p-4 md:p-8">
              <div 
                key={location.pathname} 
                className="max-w-7xl mx-auto w-full animate-fadeIn"
              >
                 {children}
              </div>
          </div>

          <footer className="mt-auto border-t border-gray-800/50 bg-[#0f172a]/50 py-6 px-8">
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                 <p className="text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} CalenDash Solutions. Todos os direitos reservados.
                 </p>
                 <div className="flex items-center gap-6 text-xs text-gray-500">
                    <a href="#" className="hover:text-[#3B82F6] transition-colors">Termos</a>
                    <a href="#" className="hover:text-[#3B82F6] transition-colors">Privacidade</a>
                    <a href="#" className="hover:text-[#3B82F6] transition-colors">Suporte</a>
                 </div>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#000000] z-[100] flex flex-col items-center justify-center animate-fadeIn">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-pulse-slow"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <Logo size="lg" />
        
        <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-[#3B82F6] w-1/3 animate-[slideRight_1s_ease-in-out_infinite]"></div>
        </div>
        
        <p className="text-gray-500 text-sm font-medium animate-pulse">Carregando ambiente...</p>
      </div>

      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
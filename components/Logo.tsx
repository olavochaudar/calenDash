import React from 'react';
import { CalendarDays } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'md' ? 28 : 40;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl';
  const gap = size === 'sm' ? 'gap-2' : 'gap-3';

  return (
    <div className={`flex items-center ${gap} font-bold select-none`}>
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 rounded-full"></div>
        <CalendarDays size={iconSize} className="text-indigo-500 relative z-10" />
      </div>
      <span className={`${textSize} tracking-tight text-white`}>
        Calen<span className="text-indigo-500">Dash</span>
      </span>
    </div>
  );
};
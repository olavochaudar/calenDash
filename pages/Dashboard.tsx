import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import {
  Calendar,
  Bell,
  Clock,
  Zap,
  LayoutDashboard,
  Settings,
  Rocket,
  Quote,
} from 'lucide-react';

// --- FRASES MOTIVACIONAIS ---
const BUSINESS_QUOTES = [
  {
    text: 'A melhor maneira de prever o futuro é criá-lo.',
    author: 'Peter Drucker',
  },
  {
    text: 'O sucesso é a soma de pequenos esforços repetidos.',
    author: 'Robert Collier',
  },
  {
    text: 'Não gerencie o tempo, gerencie sua energia.',
    author: 'Tony Schwartz',
  },
  {
    text: 'Se você não pode medir, você não pode gerenciar.',
    author: 'Peter Drucker',
  },
  {
    text: 'A liderança é a capacidade de traduzir a visão em realidade.',
    author: 'Warren Bennis',
  },
];

// --- ESTILOS ---
const GlobalStyles = () => (
  <style>{`
        .bento-grid { 
            display: grid; 
            grid-template-columns: repeat(1, 1fr); 
            gap: 1.5rem; 
        }
        @media (min-width: 768px) { 
            .bento-grid { 
                grid-template-columns: repeat(3, 1fr); 
                grid-template-rows: auto; 
            } 
        }
        .card-hover:hover { 
            transform: translateY(-4px); 
            box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.15); 
            border-color: rgba(99, 102, 241, 0.3); 
        }
    `}</style>
);

// --- COMPONENTES UI ---
const GlassCard = ({ children, className = '', onClick, delay = 0 }: any) => (
  <div
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className={`bg-[#13131a]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 transition-all duration-500 hover:bg-[#18181b]/80 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards ${className} ${
      onClick ? 'cursor-pointer card-hover' : ''
    }`}
  >
    <div className='absolute top-0 right-0 p-20 bg-indigo-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>
    <div className='relative z-10 h-full'>{children}</div>
  </div>
);

const ShortcutBtn = ({ icon: Icon, label, desc, onClick, color }: any) => (
  <button
    onClick={onClick}
    className='flex items-center gap-4 w-full p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group text-left'
  >
    <div
      className={`p-2.5 rounded-xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
    >
      {Icon && <Icon size={18} />}
    </div>
    <div className='flex-1'>
      <h4 className='font-bold text-gray-200 text-sm'>{label}</h4>
      <p className='text-[11px] text-gray-500'>{desc}</p>
    </div>
  </button>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [userName, setUserName] = useState<string>('Gestor');
  const [greeting, setGreeting] = useState<string>('');
  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState(BUSINESS_QUOTES[0]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite');
    setQuote(
      BUSINESS_QUOTES[Math.floor(Math.random() * BUSINESS_QUOTES.length)]
    );
    fetchUserData();
    return () => clearInterval(timer);
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabaseService.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.name || user.email?.split('@')[0] || 'Gestor';
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(date);
    } catch (e) {
      return '';
    }
  };

  return (
    <div className='min-h-screen bg-[#050507] text-gray-100 font-sans p-4 md:p-8 relative overflow-hidden'>
      <GlobalStyles />

      {/* Background */}
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px]'></div>
        <div className='absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]'></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* --- HEADER MELHORADO --- */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <div>
            <h1 className='text-4xl md:text-5xl font-bold mb-2 tracking-tight'>
              {greeting},{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'>
                {userName}
              </span>
            </h1>
            <p className='text-gray-400 flex items-center gap-2 text-sm md:text-base'>
              <Clock size={16} className='text-indigo-500' />
              {formatDate(time)} • Operação Ativa
            </p>
          </div>

          <div className='mt-4 md:mt-0 flex items-center gap-5'>
            {/* Botão de Notificação Premium */}
            <button className='relative p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 group'>
              <Bell
                size={22}
                className='group-hover:rotate-12 transition-transform duration-300'
              />
              <span className='absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#050507] animate-pulse'></span>
              <div className='absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
            </button>

            <div className='h-8 w-px bg-white/10 hidden md:block'></div>

            {/* Avatar de Usuário Premium */}
            <div
              className='group relative cursor-pointer'
              onClick={() => navigate('/settings')}
            >
              <div className='absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 blur-[3px] transition duration-500'></div>
              <div className='relative h-12 w-12 rounded-full bg-[#0B0B0F] flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all z-10 overflow-hidden'>
                <span className='font-bold text-xl text-white bg-clip-text bg-gradient-to-br from-white to-gray-400 group-hover:scale-110 transition-transform duration-300'>
                  {userName.charAt(0)}
                </span>
              </div>
              <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#050507] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] z-20'></div>
            </div>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className='bento-grid'>
          {/* 1. CARD BOAS VINDAS / INSIGHT */}
          <GlassCard
            className='md:col-span-2 md:row-span-1 flex flex-col justify-center items-center text-center relative overflow-hidden h-full min-h-[300px]'
            delay={100}
          >
            <div className='absolute top-0 right-0 p-32 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2'></div>
            <div className='relative z-10 flex flex-col items-center'>
              <div className='flex items-center justify-center gap-2 mb-6'>
                <div className='p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20'>
                  <Zap size={16} />
                </div>
                <span className='text-xs font-bold text-indigo-200 uppercase tracking-widest'>
                  Insight do Dia
                </span>
              </div>
              <div className='max-w-xl px-4'>
                <h2 className='text-xl md:text-3xl font-medium text-white italic leading-relaxed mb-6'>
                  "{quote.text}"
                </h2>
                <div className='flex items-center justify-center gap-3'>
                  <div className='h-px w-8 bg-indigo-500/50'></div>
                  <p className='text-indigo-400 font-bold text-xs uppercase tracking-wider'>
                    {quote.author}
                  </p>
                  <div className='h-px w-8 bg-indigo-500/50'></div>
                </div>
              </div>
            </div>
            <Quote className='absolute bottom-6 right-8 text-white/5 w-24 h-24 rotate-12' />
          </GlassCard>

          {/* 2. ACESSO RÁPIDO */}
          <GlassCard
            className='md:col-span-1 md:row-span-1 flex flex-col justify-between h-full min-h-[300px]'
            delay={200}
          >
            <div>
              <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2'>
                <Zap size={14} className='text-yellow-500' /> Acesso Rápido
              </h3>
              <div className='space-y-2'>
                <ShortcutBtn
                  icon={LayoutDashboard}
                  color='bg-indigo-600'
                  label='Social Tracker'
                  desc='Gerenciar campanhas'
                  onClick={() => navigate('/social-tracker')}
                />
                <ShortcutBtn
                  icon={Calendar}
                  color='bg-pink-600'
                  label='Agenda'
                  desc='Ver compromissos'
                  onClick={() => navigate('/projects')}
                />
                <ShortcutBtn
                  icon={Settings}
                  color='bg-gray-600'
                  label='Configurações'
                  desc='Perfil e conta'
                  onClick={() => navigate('/settings')}
                />
              </div>
            </div>

            {/* Banner IA - RESTAURADO (Grande e Roxo) */}
            <div className='mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden group cursor-pointer'>
              <div className='relative z-10'>
                <h4 className='font-bold text-white mb-1'>IA Autônoma</h4>
                <p className='text-xs text-indigo-100 mb-3'>
                  Em breve automatização com IA.
                </p>
                <button className='text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-bold shadow-lg transition-transform group-hover:scale-105'>
                  Ver Planos
                </button>
              </div>
              <Rocket className='absolute -bottom-2 -right-2 text-white/20 w-24 h-24 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-500' />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

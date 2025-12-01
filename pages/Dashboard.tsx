
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import { KpiData, ChartData } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarClock, LayoutTemplate, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Organizador');

  useEffect(() => {
    const fetchData = async () => {
      const userSession = supabaseService.auth.getSession();
      if (userSession && userSession.name) setUserName(userSession.name.split(' ')[0]);

      const kpiRes = await supabaseService.from('kpis').select();
      const chartRes = await supabaseService.from('analytics').select();
      if (kpiRes.data) setKpis(kpiRes.data as KpiData[]);
      if (chartRes.data) setChartData(chartRes.data as ChartData[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Organizando agenda...</div>;

  return (
    <div className="space-y-10 pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-surface to-indigo-950/40 border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl font-bold text-white mb-3">
                Olá, <span className="text-indigo-500">{userName}</span>.
            </h1>
            <p className="text-xl text-gray-200 font-medium mb-4">
                Seu tempo, organizado com maestria.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                Você tem 3 eventos agendados para hoje. Aproveite para revisar seus modelos de planejamento.
            </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
                onClick={() => navigate('/projects')}
                className="group cursor-pointer bg-brand-surface border border-gray-800 p-6 rounded-2xl hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 relative overflow-hidden"
            >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Acessar Agenda</h3>
                <p className="text-sm text-gray-400 mb-6">
                    Visualize seus compromissos, agende novas reuniões e gerencie deadlines.
                </p>
                <div className="flex items-center text-sm font-bold text-indigo-500 group-hover:translate-x-2 transition-transform">
                    Ver Calendário <ArrowRight size={16} className="ml-2"/>
                </div>
            </div>

            <div 
                onClick={() => navigate('/templates')}
                className="group cursor-pointer bg-brand-surface border border-gray-800 p-6 rounded-2xl hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 relative overflow-hidden"
            >
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <LayoutTemplate size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Explorar Modelos</h3>
                <p className="text-sm text-gray-400 mb-6">
                    Descubra estruturas prontas para Conteúdo, Fitness, Estudos e Negócios.
                </p>
                <div className="flex items-center text-sm font-bold text-purple-400 group-hover:translate-x-2 transition-transform">
                    Ver Galeria <ArrowRight size={16} className="ml-2"/>
                </div>
            </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
            {kpis.slice(0, 3).map((kpi, idx) => (
                <div key={idx} className="bg-brand-surface border border-gray-800 p-5 rounded-xl flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">
                            {kpi.label}
                        </p>
                        <h4 className="text-2xl font-bold text-white">{kpi.value}</h4>
                    </div>
                    <div className={`flex flex-col items-end ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="text-xs font-bold">{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                    </div>
                </div>
            ))}
        </div>

        <div className="lg:col-span-2 bg-brand-surface border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-6">Volume de Eventos (Semanal)</h3>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#6366f1" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

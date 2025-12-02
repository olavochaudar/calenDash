import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
// Mantendo os imports visuais
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Calendar,
  LayoutTemplate,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Organizador');

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // DADOS INICIAIS
  const [kpis, setKpis] = useState([
    { label: 'EVENTOS AGENDADOS', value: 0 },
    { label: 'HORAS OCUPADAS', value: '0h' },
    { label: 'CANCELAMENTOS', value: 0 },
  ]);

  const [chartData, setChartData] = useState([
    { name: 'Seg', value: 4 },
    { name: 'Ter', value: 7 },
    { name: 'Qua', value: 5 },
    { name: 'Qui', value: 12 },
    { name: 'Sex', value: 9 },
    { name: 'Sáb', value: 3 },
    { name: 'Dom', value: 2 },
  ]);

  // --- AQUI ESTÁ A LÓGICA DE DIAGNÓSTICO QUE VOCÊ PEDIU ---
  const fetchData = async () => {
    try {
      console.log('--- INICIANDO BUSCA DE DADOS ---');

      // 1. Pega usuário
      const {
        data: { session },
      } = await supabaseService.auth.getSession();
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name.split(' ')[0]);
      }

      // 2. BUSCA TUDO (Sem filtro de status para testar se existe algo)
      const { count, error, data } = await supabaseService
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // LOG PARA DEBUGS (Aperte F12 no navegador e veja a aba Console)
      console.log('RESPOSTA DO SUPABASE:', { count, data, error });

      if (error) {
        console.error('ERRO NO SUPABASE:', error.message);
      }

      const totalReal = count || 0;

      // Atualiza os KPIs
      setKpis([
        { label: 'EVENTOS AGENDADOS', value: totalReal },
        { label: 'HORAS OCUPADAS', value: `${totalReal * 1}h` },
        { label: 'CANCELAMENTOS', value: 0 },
      ]);
    } catch (error) {
      console.error('Erro geral no Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNÇÃO DE CRIAR EVENTO ---
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    setIsSaving(true);
    try {
      const { error } = await supabaseService.from('projects').insert([
        {
          name: newEventName,
          type: 'Reunião',
          created_at: newEventDate || new Date().toISOString(),
          status: 'scheduled',
        },
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      setNewEventName('');
      setNewEventDate('');

      // Atualiza os números na hora
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className='text-center py-20 text-white'>Carregando Painel...</div>
    );

  return (
    <div className='space-y-10 pb-10'>
      {/* --- MODAL (POP-UP) --- */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
          <div className='bg-[#09090b] border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative'>
            <button
              onClick={() => setIsModalOpen(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-white'
            >
              <X size={20} />
            </button>

            <h2 className='text-xl font-bold text-white mb-6'>
              Novo Evento Rápido
            </h2>

            <form onSubmit={handleCreateEvent} className='space-y-4'>
              <div>
                <label className='text-xs font-bold text-gray-500 uppercase'>
                  Nome
                </label>
                <input
                  type='text'
                  placeholder='Nome do Evento'
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className='w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white mt-1'
                  autoFocus
                />
              </div>
              <div>
                <label className='text-xs font-bold text-gray-500 uppercase'>
                  Data
                </label>
                <input
                  type='date'
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className='w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white mt-1'
                />
              </div>

              <button
                type='submit'
                disabled={isSaving}
                className='w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 mt-4'
              >
                {isSaving ? 'Salvando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- BANNER DE BOAS VINDAS COM O BOTÃO --- */}
      <div className='bg-gradient-to-r from-brand-surface to-indigo-950/40 border border-gray-800 rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
        {/* Fundo decorativo */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none'></div>

        <div className='relative z-10 max-w-2xl'>
          <h1 className='text-4xl font-bold text-white mb-3'>
            Painel de Controle
          </h1>
          <p className='text-xl text-indigo-400 font-medium mb-2'>
            Olá, {userName}.
          </p>
          <p className='text-gray-400 text-sm'>
            Você tem <strong>{kpis[0].value} eventos</strong> ativos agora.
          </p>
        </div>

        {/* BOTÃO DE ADICIONAR */}
        <button
          onClick={() => setIsModalOpen(true)}
          className='relative z-50 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95'
        >
          <div className='bg-white/20 p-1 rounded-full'>
            <Plus size={20} />
          </div>
          <span>Novo Evento</span>
        </button>
      </div>

      {/* --- CARTÕES DE NAVEGAÇÃO --- */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div
          onClick={() => navigate('/projects')}
          className='cursor-pointer bg-brand-surface border border-gray-800 p-6 rounded-2xl hover:border-indigo-500 transition-all'
        >
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500'>
              <Calendar size={20} />
            </div>
            <h3 className='text-lg font-bold text-white'>
              Ver Agenda Completa
            </h3>
          </div>
          <div className='text-indigo-400 text-sm font-bold flex items-center'>
            Acessar <ArrowRight size={16} className='ml-2' />
          </div>
        </div>

        <div
          onClick={() => navigate('/templates')}
          className='cursor-pointer bg-brand-surface border border-gray-800 p-6 rounded-2xl hover:border-purple-500 transition-all'
        >
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500'>
              <LayoutTemplate size={20} />
            </div>
            <h3 className='text-lg font-bold text-white'>
              Modelos de Planejamento
            </h3>
          </div>
          <div className='text-purple-400 text-sm font-bold flex items-center'>
            Explorar <ArrowRight size={16} className='ml-2' />
          </div>
        </div>
      </div>

      {/* --- ESTATÍSTICAS --- */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='space-y-4'>
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className='bg-brand-surface border border-gray-800 p-5 rounded-xl flex justify-between items-center'
            >
              <div>
                <p className='text-gray-500 text-xs font-bold uppercase mb-1'>
                  {kpi.label}
                </p>
                <h4 className='text-2xl font-bold text-white'>{kpi.value}</h4>
              </div>
              <CheckCircle2 size={20} className='text-gray-700' />
            </div>
          ))}
        </div>

        <div className='lg:col-span-2 bg-brand-surface border border-gray-800 rounded-xl p-6'>
          <h3 className='text-sm font-semibold text-gray-300 mb-6'>
            Atividade Semanal
          </h3>
          <div className='h-[200px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData}>
                <XAxis
                  dataKey='name'
                  stroke='#4B5563'
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type='monotone'
                  dataKey='value'
                  stroke='#6366f1'
                  strokeWidth={3}
                  fillOpacity={1}
                  fill='url(#colorValue)'
                />
                <defs>
                  <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

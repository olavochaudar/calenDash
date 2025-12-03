import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  LayoutTemplate,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Removemos a dependência do Auth para não quebrar a tela
  const [userName, setUserName] = useState('Organizador');

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDuration, setNewEventDuration] = useState(1);
  const [newEventStatus, setNewEventStatus] = useState('scheduled');
  const [isSaving, setIsSaving] = useState(false);

  // --- DADOS DO PAINEL ---
  const [kpis, setKpis] = useState([
    { label: 'EVENTOS AGENDADOS', value: 0 },
    { label: 'HORAS OCUPADAS', value: '0h' },
    { label: 'CANCELAMENTOS', value: 0 },
  ]);

  const [chartData, setChartData] = useState<any[]>([]);

  // --- PROCESSAMENTO DE DADOS ---
  const processDashboardData = (data: any[]) => {
    // 1. Filtragem e Tratamento de Nulos
    const activeEvents = data.filter(
      (item) => (item.status || 'scheduled') !== 'cancelled'
    );
    const cancelledEvents = data.filter((item) => item.status === 'cancelled');

    // 2. Soma de Horas
    const totalHours = activeEvents.reduce((acc, curr) => {
      const dur = curr.duration ? Number(curr.duration) : 1;
      return acc + (isNaN(dur) ? 1 : dur);
    }, 0);

    setKpis([
      { label: 'EVENTOS AGENDADOS', value: activeEvents.length },
      { label: 'HORAS OCUPADAS', value: `${totalHours}h` },
      { label: 'CANCELAMENTOS', value: cancelledEvents.length },
    ]);

    // 3. Gráfico (Dias da Semana)
    const daysTemplate = [
      { name: 'Dom', value: 0, id: 0 },
      { name: 'Seg', value: 0, id: 1 },
      { name: 'Ter', value: 0, id: 2 },
      { name: 'Qua', value: 0, id: 3 },
      { name: 'Qui', value: 0, id: 4 },
      { name: 'Sex', value: 0, id: 5 },
      { name: 'Sáb', value: 0, id: 6 },
    ];

    activeEvents.forEach((event) => {
      if (event.created_at) {
        const dateObj = new Date(event.created_at);
        const dayIndex = dateObj.getDay(); // 0 a 6
        const dur = event.duration ? Number(event.duration) : 1;

        if (daysTemplate[dayIndex]) {
          daysTemplate[dayIndex].value += dur;
        }
      }
    });

    setChartData(daysTemplate.map(({ name, value }) => ({ name, value })));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // --- IMPORTANTE: Removi a chamada de Auth que estava dando erro ---
      // O foco agora é testar apenas a conexão com o BANCO DE DADOS

      console.log("Iniciando busca na tabela 'projects'...");

      // Verifica se o serviço do supabase existe
      if (!supabaseService || !supabaseService.from) {
        throw new Error(
          "Configuração do Supabase inválida. Verifique '../services/supabaseService'"
        );
      }

      const { data, error } = await supabaseService
        .from('projects')
        .select('*');

      if (error) {
        console.error('Erro SQL:', error);
        throw error;
      }

      console.log('Dados recebidos:', data); // Verifique o console (F12)

      if (data && data.length > 0) {
        processDashboardData(data);
      } else {
        processDashboardData([]);
      }
    } catch (err: any) {
      console.error('ERRO NO DASHBOARD:', err);
      setErrorMsg(err.message || 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    setIsSaving(true);
    try {
      const dateToSave = newEventDate ? new Date(newEventDate) : new Date();

      const payload = {
        name: newEventName,
        type: 'Reunião',
        created_at: dateToSave.toISOString(),
        status: newEventStatus,
        duration: newEventDuration,
      };

      const { error } = await supabaseService
        .from('projects')
        .insert([payload]);

      if (error) throw error;

      setIsModalOpen(false);
      setNewEventName('');
      setNewEventDate('');
      setNewEventDuration(1);

      await fetchData();
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#09090b] text-white'>
        <div className='animate-pulse text-indigo-400 font-bold'>
          Carregando Dados...
        </div>
      </div>
    );

  if (errorMsg)
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white p-10'>
        <div className='bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-lg text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-bold mb-2'>Erro Técnico</h2>
          <p className='text-gray-300 mb-4'>{errorMsg}</p>
          <button
            onClick={fetchData}
            className='bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold'
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );

  return (
    <div className='space-y-8 pb-10 fade-in'>
      {/* MODAL */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
          <div className='bg-[#09090b] border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative'>
            <button
              onClick={() => setIsModalOpen(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-white'
            >
              <X size={20} />
            </button>
            <h2 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
              <Plus size={20} className='text-indigo-500' /> Novo Agendamento
            </h2>
            <form onSubmit={handleCreateEvent} className='space-y-5'>
              <div>
                <label className='text-xs font-bold text-gray-500 uppercase mb-1.5 block'>
                  Nome
                </label>
                <input
                  type='text'
                  required
                  placeholder='Ex: Reunião'
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className='w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl p-3.5 text-white outline-none'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase mb-1.5 block'>
                    Data
                  </label>
                  <input
                    type='date'
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className='w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl p-3.5 text-white outline-none'
                  />
                </div>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase mb-1.5 block'>
                    Duração (h)
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={newEventDuration}
                    onChange={(e) =>
                      setNewEventDuration(Number(e.target.value))
                    }
                    className='w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl p-3.5 text-white outline-none'
                  />
                </div>
              </div>
              <div>
                <label className='text-xs font-bold text-gray-500 uppercase mb-1.5 block'>
                  Status
                </label>
                <select
                  value={newEventStatus}
                  onChange={(e) => setNewEventStatus(e.target.value)}
                  className='w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl p-3.5 text-white outline-none'
                >
                  <option value='scheduled'>Agendado</option>
                  <option value='cancelled'>Cancelado</option>
                </select>
              </div>
              <button
                type='submit'
                disabled={isSaving}
                className='w-full py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 mt-2 disabled:opacity-50'
              >
                {isSaving ? 'Salvando...' : 'Confirmar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className='bg-gradient-to-r from-brand-surface to-indigo-950/30 border border-gray-800 rounded-2xl p-8 flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold text-white mb-2'>
            Painel de Controle
          </h1>
          <p className='text-indigo-400'>Bem-vindo, {userName}.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg'
        >
          <Plus size={18} /> <span>Novo Evento</span>
        </button>
      </div>

      {/* KPIS */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className='bg-brand-surface border border-gray-800/60 p-6 rounded-2xl flex justify-between items-center'
          >
            <div>
              <p className='text-gray-500 text-xs font-bold uppercase mb-2'>
                {kpi.label}
              </p>
              <h4 className='text-3xl font-bold text-white'>{kpi.value}</h4>
            </div>
            {kpi.label.includes('CANCEL') ? (
              <AlertCircle className='text-red-500' />
            ) : (
              <CheckCircle2 className='text-emerald-500' />
            )}
          </div>
        ))}
      </div>

      {/* GRÁFICO */}
      <div className='bg-brand-surface border border-gray-800/60 rounded-2xl p-8 flex flex-col h-[400px]'>
        <h3 className='text-lg font-bold text-white mb-6'>Atividade Semanal</h3>
        <div className='flex-1 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366f1' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#1f2937'
                vertical={false}
              />
              <XAxis
                dataKey='name'
                stroke='#6B7280'
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#374151',
                  color: '#fff',
                }}
              />
              <Area
                type='monotone'
                dataKey='value'
                stroke='#6366f1'
                strokeWidth={4}
                fill='url(#colorValue)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  LogOut,
  Loader2,
  Layers,
  Target,
  Rocket,
  Trash2,
  Plus,
  LayoutDashboard,
  CheckCircle2,
  ClipboardList,
  Swords,
  DollarSign,
  Zap,
  ArrowUpRight,
  X,
  Edit3,
  User,
  Download,
  Instagram,
  Facebook,
  Search,
  Video,
  Linkedin,
  Globe,
  Youtube,
  Wallet,
} from 'lucide-react';

// --- ESTILOS GLOBAIS ---
const GlobalStyles = () => (
  <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        body, html { height: 100%; width: 100%; margin: 0; padding: 0; overflow-x: hidden; background-color: #050507; }
        .thin-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    `}</style>
);

// --- TIPOS ---
type PlatformType =
  | 'Meta Ads'
  | 'Instagram Ads'
  | 'Google Ads'
  | 'TikTok Ads'
  | 'YouTube Ads'
  | 'LinkedIn'
  | 'Outros';

interface Campaign {
  id: string;
  name: string;
  platform: PlatformType;
  spend: number;
  revenue: number;
  clicks: number;
  status: 'Ativa' | 'Pausada';
}
interface Expense {
  id: string;
  description: string;
  category: 'Mídia' | 'Ferramentas' | 'Equipe' | 'Outros';
  amount: number;
  date: string;
}
interface ContentPost {
  id: string;
  caption: string;
  funnelStage: 'Topo' | 'Meio' | 'Fundo';
  date: string;
  status: 'Ideia' | 'Agendado' | 'Publicado';
}
interface Competitor {
  id: string;
  name: string;
  strength: string;
  weakness: string;
}
interface Task {
  id: string;
  text: string;
  done: boolean;
}
interface StrategyData {
  personaName: string;
  personaJob: string;
  personaPain: string;
  personaDesire: string;
  swotStrengths: string;
  swotWeaknesses: string;
  swotOpportunities: string;
  swotThreats: string;
}
interface Targets {
  followers: number;
  roas: number;
  engagement: number;
}
interface HistoryPoint {
  date: string;
  followers: number;
  engagement: number;
}

interface MarketingProfile {
  brandName: string;
  history: HistoryPoint[];
  strategy: StrategyData;
  campaigns: Campaign[];
  expenses: Expense[];
  content: ContentPost[];
  competitors: Competitor[];
  tasks: Task[];
  targets: Targets;
  lastLikes: number;
  lastComments: number;
}

// --- FUNÇÕES AUXILIARES ---
const parseValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  let clean = value.toString().replace(/[^\d,.-]/g, '');
  if (clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

const formatNumber = (num: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(num);
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val
  );

// --- COMPONENTES UI ---
const GlassCard = ({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-[#13131a]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl transition-all duration-300 relative z-10 ${
      onClick
        ? 'cursor-pointer hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:-translate-y-1'
        : ''
    } ${className}`}
  >
    {children}
  </div>
);

const ProgressBar = ({
  current,
  max,
  color,
}: {
  current: number;
  max: number;
  color: string;
}) => {
  const percentage = Math.min(100, Math.max(0, (current / (max || 1)) * 100));
  return (
    <div className='w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden relative z-0'>
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const NavButton = ({ id, activeTab, setActiveTab, icon: Icon, label }: any) => (
  <button
    type='button'
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer select-none relative z-20 ${
      activeTab === id
        ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={16} /> <span className='hidden md:inline'>{label}</span>
  </button>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'Meta Ads':
      return (
        <div className='text-blue-500'>
          <Facebook size={16} />
        </div>
      );
    case 'Instagram Ads':
      return (
        <div className='text-pink-500'>
          <Instagram size={16} />
        </div>
      );
    case 'Google Ads':
      return (
        <div className='text-yellow-500'>
          <Search size={16} />
        </div>
      );
    case 'TikTok Ads':
      return (
        <div className='text-pink-400'>
          <Video size={16} />
        </div>
      );
    case 'YouTube Ads':
      return (
        <div className='text-red-500'>
          <Youtube size={16} />
        </div>
      );
    case 'LinkedIn':
      return (
        <div className='text-blue-400'>
          <Linkedin size={16} />
        </div>
      );
    default:
      return (
        <div className='text-gray-400'>
          <Globe size={16} />
        </div>
      );
  }
};

export const MarketingDashboard: React.FC = () => {
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'strategy' | 'finance' | 'content'
  >('overview');
  const [loading, setLoading] = useState(false);
  const [contentFilter, setContentFilter] = useState<
    'Todos' | 'Topo' | 'Meio' | 'Fundo'
  >('Todos');

  // --- ESTADOS DE EDIÇÃO ---
  const [editingKpi, setEditingKpi] = useState<
    'audience' | 'financial' | 'engagement' | null
  >(null);
  const [tempAudience, setTempAudience] = useState({ current: '', target: '' });
  const [tempFinance, setTempFinance] = useState({
    spend: '',
    revenue: '',
    targetRoas: '',
  });
  const [tempEngagement, setTempEngagement] = useState({
    likes: '',
    comments: '',
    target: '',
  });

  // Inputs
  const [brandInput, setBrandInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [contentInput, setContentInput] = useState({
    caption: '',
    date: '',
    stage: 'Topo',
  });
  const [compInput, setCompInput] = useState({
    name: '',
    strength: '',
    weakness: '',
  });
  const [campaignInput, setCampaignInput] = useState<{
    name: string;
    platform: PlatformType;
    spend: string;
    revenue: string;
  }>({ name: '', platform: 'Meta Ads', spend: '', revenue: '' });
  const [expenseInput, setExpenseInput] = useState({
    description: '',
    amount: '',
    category: 'Ferramentas',
  });

  const STORAGE_KEY = 'marketing_os_v13_full';

  // --- AUTO-SAVE & LOAD ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.history) setProfile(parsed);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  // --- HANDLERS ---
  const handleInit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setProfile({
        brandName: brandInput || 'Minha Marca',
        history: [
          {
            date: new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            }),
            followers: 0,
            engagement: 0,
          },
        ],
        strategy: {
          personaName: '',
          personaJob: '',
          personaPain: '',
          personaDesire: '',
          swotStrengths: '',
          swotWeaknesses: '',
          swotOpportunities: '',
          swotThreats: '',
        },
        campaigns: [],
        expenses: [],
        content: [],
        competitors: [],
        tasks: [],
        targets: { followers: 1000, roas: 3, engagement: 5 },
        lastLikes: 0,
        lastComments: 0,
      });
      setLoading(false);
    }, 1000);
  };

  // KPI SAVERS
  const saveAudience = () => {
    if (!profile) return;
    const cf =
      profile.history.length > 0
        ? profile.history[profile.history.length - 1].followers
        : 0;
    const val = parseValue(tempAudience.current);
    const target = parseValue(tempAudience.target);
    const nh = [...profile.history];
    if (nh.length > 0)
      nh[nh.length - 1] = {
        ...nh[nh.length - 1],
        followers: val > 0 ? val : cf,
      };
    else
      nh.push({
        date: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        }),
        followers: val,
        engagement: 0,
      });
    setProfile({
      ...profile,
      history: nh,
      targets: {
        ...profile.targets,
        followers: target || profile.targets.followers,
      },
    });
    setEditingKpi(null);
  };

  const saveEngagement = () => {
    if (!profile) return;
    const l = parseValue(tempEngagement.likes);
    const c = parseValue(tempEngagement.comments);
    const targetMeta = parseValue(tempEngagement.target);
    let f =
      profile.history.length > 0
        ? profile.history[profile.history.length - 1].followers
        : 0;
    if (f === 0) f = 1;
    const r = ((l + c) / f) * 100;
    const nh = [...profile.history];
    if (nh.length > 0)
      nh[nh.length - 1] = { ...nh[nh.length - 1], engagement: r };
    setProfile({
      ...profile,
      history: nh,
      lastLikes: l,
      lastComments: c,
      targets: {
        ...profile.targets,
        engagement: targetMeta || profile.targets.engagement,
      },
    });
    setEditingKpi(null);
  };

  const saveFinancialData = () => {
    if (!profile) return;
    const target = parseValue(tempFinance.targetRoas);
    const spend = parseValue(tempFinance.spend);
    const revenue = parseValue(tempFinance.revenue);
    let newCampaigns = [...profile.campaigns];
    if (spend > 0 || revenue > 0) {
      newCampaigns = newCampaigns.filter((c) => c.id !== 'manual-entry');
      newCampaigns.push({
        id: 'manual-entry',
        name: 'Resumo Manual / Outros',
        platform: 'Outros',
        spend: spend,
        revenue: revenue,
        clicks: 0,
        status: 'Ativa',
      });
    }
    setProfile({
      ...profile,
      campaigns: newCampaigns,
      targets: { ...profile.targets, roas: target || profile.targets.roas },
    });
    setEditingKpi(null);
  };

  // CRUD GERAL
  const addTask = () => {
    if (profile && taskInput) {
      setProfile({
        ...profile,
        tasks: [
          ...profile.tasks,
          { id: Date.now().toString(), text: taskInput, done: false },
        ],
      });
      setTaskInput('');
    }
  };
  const toggleTask = (id: string) => {
    if (profile)
      setProfile({
        ...profile,
        tasks: profile.tasks.map((t) =>
          t.id === id ? { ...t, done: !t.done } : t
        ),
      });
  };
  const deleteTask = (id: string) => {
    if (profile)
      setProfile({
        ...profile,
        tasks: profile.tasks.filter((t) => t.id !== id),
      });
  };
  const addContent = () => {
    if (profile && contentInput.caption) {
      setProfile({
        ...profile,
        content: [
          ...profile.content,
          {
            id: Date.now().toString(),
            caption: contentInput.caption,
            date: contentInput.date,
            funnelStage: contentInput.stage as any,
            status: 'Ideia',
          },
        ],
      });
      setContentInput({ caption: '', date: '', stage: 'Topo' });
    }
  };
  const deleteContent = (id: string) => {
    if (profile)
      setProfile({
        ...profile,
        content: profile.content.filter((c) => c.id !== id),
      });
  };
  const addCompetitor = () => {
    if (profile && compInput.name) {
      setProfile({
        ...profile,
        competitors: [
          ...profile.competitors,
          { id: Date.now().toString(), ...compInput },
        ],
      });
      setCompInput({ name: '', strength: '', weakness: '' });
    }
  };
  const deleteCompetitor = (id: string) => {
    if (profile)
      setProfile({
        ...profile,
        competitors: profile.competitors.filter((c) => c.id !== id),
      });
  };
  const updateStrategy = (key: string, val: string) =>
    profile &&
    setProfile({
      ...profile,
      strategy: { ...profile.strategy, [key]: val } as any,
    });
  const addCampaign = () => {
    if (!profile || !campaignInput.name) return;
    const newCamp: Campaign = {
      id: Date.now().toString(),
      name: campaignInput.name,
      platform: campaignInput.platform,
      spend: parseValue(campaignInput.spend),
      revenue: parseValue(campaignInput.revenue),
      clicks: 0,
      status: 'Ativa',
    };
    setProfile({ ...profile, campaigns: [...profile.campaigns, newCamp] });
    setCampaignInput({ ...campaignInput, name: '', spend: '', revenue: '' });
  };
  const deleteCampaign = (id: string) => {
    if (profile)
      setProfile({
        ...profile,
        campaigns: profile.campaigns.filter((c) => c.id !== id),
      });
  };
  const addExpense = () => {
    if (!profile || !expenseInput.description) return;
    const newExp: Expense = {
      id: Date.now().toString(),
      description: expenseInput.description,
      amount: parseValue(expenseInput.amount),
      category: expenseInput.category as any,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setProfile({ ...profile, expenses: [...profile.expenses, newExp] });
    setExpenseInput({ description: '', amount: '', category: 'Ferramentas' });
  };
  const deleteExpense = (id: string) => {
    if (profile)
      setProfile({
        ...profile,
        expenses: profile.expenses.filter((e) => e.id !== id),
      });
  };
  const handleExport = () =>
    alert('Simulação: Relatório PDF gerado com sucesso.');
  const handleReset = () => {
    if (confirm('Tem certeza? Isso apagará todos os dados.')) {
      localStorage.removeItem(STORAGE_KEY);
      setProfile(null);
    }
  };

  // --- RENDER ---
  if (!profile) {
    return (
      <div className='min-h-screen bg-[#050507] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden'>
        <GlobalStyles />
        <div className='fixed inset-0 z-0 pointer-events-none bg-[#050507]'>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        <GlassCard className='p-10 w-full max-w-md text-center relative z-10 border-white/10'>
          <div className='w-20 h-20 bg-white text-black rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(255,255,255,0.3)] rotate-3'>
            <Rocket size={40} />
          </div>
          <h1 className='text-4xl font-bold mb-2'>Marketing OS</h1>
          <p className='text-gray-400 mb-8 text-sm'>
            O sistema operacional definitivo para CMOs.
          </p>
          <form onSubmit={handleInit} className='space-y-4'>
            <input
              className='w-full bg-[#09090b]/50 border border-gray-700/50 text-white p-4 rounded-xl outline-none focus:border-white transition-all pl-4 text-center z-20 relative'
              placeholder='Nome da Marca'
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              required
            />
            <button className='w-full bg-white text-black font-bold p-4 rounded-xl flex justify-center items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-white/10 z-20 relative cursor-pointer'>
              {loading ? (
                <Loader2 className='animate-spin' />
              ) : (
                'Inicializar Sistema'
              )}{' '}
              <ArrowUpRight size={18} />
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  // CÁLCULOS
  const currentStats =
    profile.history.length > 0
      ? profile.history[profile.history.length - 1]
      : { followers: 0, engagement: 0 };
  const totalAdSpend = profile.campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = profile.campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalExpenses = profile.expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - (totalAdSpend + totalExpenses);
  const globalROAS = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
  const platformSpend = profile.campaigns.reduce((acc, c) => {
    acc[c.platform] = (acc[c.platform] || 0) + c.spend;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.keys(platformSpend).map((key) => ({
    name: key,
    value: platformSpend[key],
    color: key.includes('Meta')
      ? '#3b82f6'
      : key.includes('Google')
      ? '#eab308'
      : '#6b7280',
  }));

  return (
    <div className='min-h-screen bg-[#050507] text-gray-100 font-sans pb-20 overflow-x-hidden selection:bg-indigo-500/30 relative'>
      <GlobalStyles />
      <div className='fixed inset-0 z-0 pointer-events-none bg-[#050507]'>
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className='fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-6xl px-4'>
        <div className='bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row justify-between items-center shadow-2xl ring-1 ring-white/5 gap-4 md:gap-0'>
          <div className='flex items-center gap-3 px-4'>
            <div className='w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black shadow-lg'>
              {profile.brandName.charAt(0)}
            </div>
            <span className='font-bold text-sm'>{profile.brandName}</span>
          </div>
          <div className='flex gap-2 overflow-x-auto w-full md:w-auto justify-start md:justify-center thin-scrollbar px-2'>
            <NavButton
              id='overview'
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={LayoutDashboard}
              label='Visão Geral'
            />
            <NavButton
              id='strategy'
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Target}
              label='Estratégia'
            />
            <NavButton
              id='finance'
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={DollarSign}
              label='Financeiro'
            />
            <NavButton
              id='content'
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Layers}
              label='Conteúdo'
            />
          </div>
          <div className='flex items-center gap-2 px-2'>
            <button
              onClick={handleExport}
              className='p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg z-20 cursor-pointer'
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleReset}
              className='p-2.5 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-lg z-20 cursor-pointer'
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 pt-36 pb-12 relative z-10'>
        {/* === VISÃO GERAL === */}
        {activeTab === 'overview' && (
          <div className='space-y-8 animate-fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              {/* CARD AUDIÊNCIA */}
              <GlassCard
                onClick={() => {
                  setTempAudience({
                    current: currentStats.followers.toString(),
                    target: profile.targets.followers.toString(),
                  });
                  setEditingKpi('audience');
                }}
                className='p-6 relative group'
              >
                <div className='flex justify-between items-start mb-2'>
                  <span className='text-xs font-bold text-gray-500 flex items-center gap-2'>
                    <Activity size={14} /> AUDIÊNCIA
                  </span>
                  <Edit3
                    size={14}
                    className='text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
                <h3 className='text-3xl font-bold text-white'>
                  {formatNumber(currentStats.followers)}
                </h3>
                <ProgressBar
                  current={currentStats.followers}
                  max={profile.targets.followers}
                  color='bg-indigo-500'
                />
              </GlassCard>

              {/* CARD ROAS */}
              <GlassCard
                onClick={() => {
                  setTempFinance({
                    targetRoas: profile.targets.roas.toString(),
                    spend: totalAdSpend.toString(),
                    revenue: totalRevenue.toString(),
                  });
                  setEditingKpi('financial');
                }}
                className='p-6 relative group'
              >
                <div className='flex justify-between items-start mb-2'>
                  <span className='text-xs font-bold text-gray-500 flex items-center gap-2'>
                    <DollarSign size={14} /> ROAS GLOBAL
                  </span>
                  <Edit3
                    size={14}
                    className='text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
                <h3
                  className={`text-3xl font-bold ${
                    globalROAS >= profile.targets.roas
                      ? 'text-emerald-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {globalROAS.toFixed(2)}x
                </h3>
                <ProgressBar
                  current={globalROAS}
                  max={profile.targets.roas}
                  color='bg-emerald-500'
                />
              </GlassCard>

              {/* CARD ENGAJAMENTO */}
              <GlassCard
                onClick={() => {
                  setTempEngagement({
                    likes: profile.lastLikes.toString(),
                    comments: profile.lastComments.toString(),
                    target: profile.targets.engagement.toString(),
                  });
                  setEditingKpi('engagement');
                }}
                className='p-6 relative group'
              >
                <div className='flex justify-between items-start mb-2'>
                  <span className='text-xs font-bold text-gray-500 flex items-center gap-2'>
                    <Target size={14} /> ENGAJAMENTO
                  </span>
                  <Edit3
                    size={14}
                    className='text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
                <h3 className='text-3xl font-bold text-white'>
                  {currentStats.engagement.toFixed(2)}%
                </h3>
                <ProgressBar
                  current={currentStats.engagement}
                  max={profile.targets.engagement}
                  color='bg-pink-500'
                />
              </GlassCard>

              {/* CARD BACKLOG */}
              <GlassCard className='p-6 relative group'>
                <div className='flex justify-between items-start mb-2'>
                  <span className='text-xs font-bold text-gray-500 flex items-center gap-2'>
                    <ClipboardList size={14} /> BACKLOG
                  </span>
                </div>
                <h3 className='text-3xl font-bold text-white'>
                  {profile.tasks.filter((t) => !t.done).length}
                </h3>
                <div className='mt-4 flex gap-2'>
                  <input
                    className='w-full bg-black/40 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white outline-none z-20 relative'
                    placeholder='+ Tarefa...'
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addTask();
                    }}
                    className='bg-white/10 hover:bg-white/20 rounded-lg p-1.5 transition-colors z-20 relative cursor-pointer'
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* AREA DO GRÁFICO E TAREFAS */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <GlassCard className='p-6 min-h-[400px]'>
                <div className='flex justify-between items-center mb-8'>
                  <h3 className='font-bold text-lg flex items-center gap-2 text-white'>
                    <TrendingUp size={20} className='text-indigo-500' />{' '}
                    Performance
                  </h3>
                </div>
                <div className='h-[300px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={profile.history}>
                      <defs>
                        <linearGradient
                          id='colorFollowers'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#6366f1'
                            stopOpacity={0.4}
                          />
                          <stop
                            offset='95%'
                            stopColor='#6366f1'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='#ffffff10'
                        vertical={false}
                      />
                      <XAxis
                        dataKey='date'
                        stroke='#52525b'
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke='#52525b'
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatNumber}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area
                        type='monotone'
                        dataKey='followers'
                        stroke='#6366f1'
                        strokeWidth={3}
                        fillOpacity={1}
                        fill='url(#colorFollowers)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
              <GlassCard className='p-6'>
                <h3 className='font-bold text-lg mb-4 text-white'>
                  Tarefas Recentes
                </h3>
                <div className='space-y-3 max-h-[300px] overflow-y-auto thin-scrollbar'>
                  {profile.tasks.map((task) => (
                    <div
                      key={task.id}
                      className='flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group'
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center relative z-20 cursor-pointer ${
                          task.done
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {task.done && (
                          <CheckCircle2 size={14} className='text-white' />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          task.done
                            ? 'line-through text-gray-500'
                            : 'text-gray-200'
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className='text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20 relative cursor-pointer'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {profile.tasks.length === 0 && (
                    <p className='text-gray-500 text-sm text-center py-4'>
                      Nenhuma tarefa.
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* BANNER IA */}
            <div className='relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#1a1a2e] to-[#0f0f16] p-8 shadow-2xl'>
              <div className='relative z-10 flex items-center justify-between'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10'>
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-white'>
                      IA Autônoma em Breve
                    </h3>
                    <p className='mt-1 max-w-lg text-sm text-gray-400'>
                      O módulo de conexão via API está em desenvolvimento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === ABA: ESTRATÉGIA === */}
        {activeTab === 'strategy' && (
          <div className='space-y-6 animate-fade-in'>
            <GlassCard className='p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-indigo-500/10 rounded-lg text-indigo-500'>
                  <User size={20} />
                </div>
                <h2 className='text-xl font-bold text-white'>
                  Persona & Identidade
                </h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label className='text-[10px] text-gray-500 font-bold block mb-2 uppercase'>
                    Perfil
                  </label>
                  <input
                    className='w-full bg-black/40 border border-gray-700/50 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none z-20 relative'
                    placeholder='Ex: João, 30 anos...'
                    value={profile.strategy.personaName}
                    onChange={(e) =>
                      updateStrategy('personaName', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 font-bold block mb-2 uppercase'>
                    Dores
                  </label>
                  <textarea
                    className='w-full bg-black/40 border border-gray-700/50 rounded-xl p-3 text-white text-sm h-24 resize-none focus:border-red-500 outline-none z-20 relative'
                    placeholder='O que tira o sono dele?'
                    value={profile.strategy.personaPain}
                    onChange={(e) =>
                      updateStrategy('personaPain', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 font-bold block mb-2 uppercase'>
                    Desejos
                  </label>
                  <textarea
                    className='w-full bg-black/40 border border-gray-700/50 rounded-xl p-3 text-white text-sm h-24 resize-none focus:border-green-500 outline-none z-20 relative'
                    placeholder='Qual o sonho dele?'
                    value={profile.strategy.personaDesire}
                    onChange={(e) =>
                      updateStrategy('personaDesire', e.target.value)
                    }
                  />
                </div>
              </div>
            </GlassCard>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <GlassCard className='p-6 border-l-4 border-l-emerald-500'>
                <h3 className='font-bold text-white mb-4 flex items-center gap-2'>
                  <ArrowUpRight size={18} className='text-emerald-500' /> Forças
                  & Oportunidades
                </h3>
                <textarea
                  className='w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-sm text-gray-300 h-32 resize-none outline-none focus:bg-black/40 z-20 relative'
                  placeholder='Liste seus pontos fortes...'
                  value={profile.strategy.swotStrengths}
                  onChange={(e) =>
                    updateStrategy('swotStrengths', e.target.value)
                  }
                />
              </GlassCard>
              <GlassCard className='p-6 border-l-4 border-l-red-500'>
                <h3 className='font-bold text-white mb-4 flex items-center gap-2'>
                  <X size={18} className='text-red-500' /> Fraquezas & Ameaças
                </h3>
                <textarea
                  className='w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-sm text-gray-300 h-32 resize-none outline-none focus:bg-black/40 z-20 relative'
                  placeholder='Onde o concorrente ganha?'
                  value={profile.strategy.swotWeaknesses}
                  onChange={(e) =>
                    updateStrategy('swotWeaknesses', e.target.value)
                  }
                />
              </GlassCard>
            </div>
            <GlassCard className='p-6'>
              <h3 className='font-bold mb-6 flex items-center gap-2 text-white'>
                <Swords size={18} className='text-orange-500' /> Concorrentes
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-4 gap-2 mb-6'>
                <input
                  className='bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                  placeholder='Nome'
                  value={compInput.name}
                  onChange={(e) =>
                    setCompInput({ ...compInput, name: e.target.value })
                  }
                />
                <input
                  className='bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                  placeholder='Ponto Forte'
                  value={compInput.strength}
                  onChange={(e) =>
                    setCompInput({ ...compInput, strength: e.target.value })
                  }
                />
                <input
                  className='bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                  placeholder='Ponto Fraco'
                  value={compInput.weakness}
                  onChange={(e) =>
                    setCompInput({ ...compInput, weakness: e.target.value })
                  }
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    addCompetitor();
                  }}
                  className='bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center z-20 relative cursor-pointer'
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {profile.competitors.map((comp) => (
                  <div
                    key={comp.id}
                    className='bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 relative hover:border-gray-500 transition-colors'
                  >
                    <h4 className='font-bold text-white mb-2'>{comp.name}</h4>
                    <p className='text-xs text-green-400 mb-1'>
                      + {comp.strength}
                    </p>
                    <p className='text-xs text-red-400'>- {comp.weakness}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCompetitor(comp.id);
                      }}
                      className='absolute top-3 right-3 text-gray-600 hover:text-red-500 z-20 relative cursor-pointer'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* === ABA: FINANCEIRO === */}
        {activeTab === 'finance' && (
          <div className='space-y-6 animate-fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <GlassCard className='p-6'>
                <p className='text-xs font-bold text-gray-500 mb-1 uppercase'>
                  Total Mídia
                </p>
                <h2 className='text-3xl font-bold text-white'>
                  {formatCurrency(totalAdSpend)}
                </h2>
              </GlassCard>
              <GlassCard className='p-6'>
                <p className='text-xs font-bold text-gray-500 mb-1 uppercase'>
                  Receita Total
                </p>
                <h2 className='text-3xl font-bold text-emerald-400'>
                  {formatCurrency(totalRevenue)}
                </h2>
              </GlassCard>
              <GlassCard
                className={`p-6 border-l-4 ${
                  netProfit >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'
                }`}
              >
                <p className='text-xs font-bold text-gray-500 mb-1 uppercase'>
                  Lucro Líquido
                </p>
                <h2
                  className={`text-3xl font-bold ${
                    netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(netProfit)}
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Inclui custos de ferramentas: {formatCurrency(totalExpenses)}
                </p>
              </GlassCard>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2 space-y-6'>
                <GlassCard className='p-6'>
                  <h3 className='font-bold mb-4 text-white flex items-center gap-2'>
                    <Target size={18} className='text-indigo-500' /> Performance
                    de Mídia
                  </h3>
                  <div className='space-y-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/5'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                      <input
                        className='md:col-span-2 bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                        placeholder='Nome da Campanha'
                        value={campaignInput.name}
                        onChange={(e) =>
                          setCampaignInput({
                            ...campaignInput,
                            name: e.target.value,
                          })
                        }
                      />
                      <input
                        type='text'
                        className='bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                        placeholder='Gasto (R$)'
                        value={campaignInput.spend}
                        onChange={(e) =>
                          setCampaignInput({
                            ...campaignInput,
                            spend: e.target.value,
                          })
                        }
                      />
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          className='w-full bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                          placeholder='Receita (R$)'
                          value={campaignInput.revenue}
                          onChange={(e) =>
                            setCampaignInput({
                              ...campaignInput,
                              revenue: e.target.value,
                            })
                          }
                        />
                        <button
                          type='button'
                          onClick={addCampaign}
                          className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 flex items-center justify-center z-20 relative cursor-pointer'
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className='max-h-[300px] overflow-y-auto thin-scrollbar'>
                    <table className='w-full text-left text-sm'>
                      <thead className='text-gray-500 text-xs uppercase sticky top-0 bg-[#13131a] z-10'>
                        <tr>
                          <th className='pb-3'>Campanha</th>
                          <th className='pb-3'>Gasto</th>
                          <th className='pb-3'>ROAS</th>
                          <th className='pb-3 text-right'>#</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-800'>
                        {profile.campaigns.map((camp) => {
                          const roas =
                            camp.spend > 0 ? camp.revenue / camp.spend : 0;
                          return (
                            <tr key={camp.id} className='hover:bg-white/5'>
                              <td className='py-3 text-white'>{camp.name}</td>
                              <td className='py-3 text-gray-400'>
                                {formatCurrency(camp.spend)}
                              </td>
                              <td className='py-3'>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${
                                    roas >= 4
                                      ? 'bg-emerald-500/10 text-emerald-500'
                                      : 'bg-yellow-500/10 text-yellow-500'
                                  }`}
                                >
                                  {roas.toFixed(2)}x
                                </span>
                              </td>
                              <td className='py-3 text-right'>
                                <button
                                  onClick={() => deleteCampaign(camp.id)}
                                  className='text-gray-600 hover:text-red-500 cursor-pointer z-20 relative'
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
              <div className='space-y-6'>
                <GlassCard className='p-6 h-[300px] flex flex-col'>
                  <h3 className='font-bold mb-2 text-white text-sm'>
                    Media Mix
                  </h3>
                  <div className='flex-1 relative'>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey='value'
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke='none'
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              borderRadius: '8px',
                              border: 'none',
                            }}
                            itemStyle={{ color: 'white' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='h-full flex items-center justify-center text-gray-600 text-xs'>
                        Sem dados.
                      </div>
                    )}
                  </div>
                </GlassCard>
                <GlassCard className='p-6'>
                  <h3 className='font-bold mb-4 text-white flex items-center gap-2'>
                    <Wallet size={18} className='text-pink-500' /> Despesas
                    Extras
                  </h3>
                  <div className='flex gap-2 mb-4'>
                    <input
                      className='flex-1 bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                      placeholder='Ex: Software'
                      value={expenseInput.description}
                      onChange={(e) =>
                        setExpenseInput({
                          ...expenseInput,
                          description: e.target.value,
                        })
                      }
                    />
                    <input
                      type='text'
                      className='w-24 bg-black/40 border border-gray-700/50 rounded-lg p-2 text-white text-sm outline-none z-20 relative'
                      placeholder='R$'
                      value={expenseInput.amount}
                      onChange={(e) =>
                        setExpenseInput({
                          ...expenseInput,
                          amount: e.target.value,
                        })
                      }
                    />
                    <button
                      type='button'
                      onClick={addExpense}
                      className='bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg z-20 relative cursor-pointer'
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className='max-h-[150px] overflow-y-auto thin-scrollbar space-y-2'>
                    {profile.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className='flex justify-between items-center text-sm p-2 bg-white/5 rounded'
                      >
                        <span className='text-gray-300'>{exp.description}</span>
                        <div className='flex items-center gap-3'>
                          <span className='text-white font-mono'>
                            {formatCurrency(exp.amount)}
                          </span>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className='text-gray-600 hover:text-red-500 cursor-pointer z-20 relative'
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* === ABA: CONTEÚDO === */}
        {activeTab === 'content' && (
          <div className='space-y-6 animate-fade-in'>
            <GlassCard className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='font-bold flex items-center gap-2 text-white'>
                  <Layers size={20} className='text-pink-500' /> Pipeline de
                  Conteúdo
                </h3>
                <div className='flex gap-2 relative z-20'>
                  {['Todos', 'Topo', 'Meio', 'Fundo'].map((f) => (
                    <button
                      type='button'
                      key={f}
                      onClick={(e) => {
                        e.stopPropagation();
                        setContentFilter(f as any);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg cursor-pointer ${
                        contentFilter === f
                          ? 'bg-pink-600 text-white'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className='flex gap-4 mb-4'>
                <input
                  className='flex-1 bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white text-sm outline-none focus:border-pink-500 z-20 relative'
                  placeholder='Nova ideia...'
                  value={contentInput.caption}
                  onChange={(e) =>
                    setContentInput({
                      ...contentInput,
                      caption: e.target.value,
                    })
                  }
                />
                <select
                  className='bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white text-sm outline-none z-20 relative'
                  value={contentInput.stage}
                  onChange={(e) =>
                    setContentInput({ ...contentInput, stage: e.target.value })
                  }
                >
                  <option>Topo</option>
                  <option>Meio</option>
                  <option>Fundo</option>
                </select>
                <input
                  type='date'
                  className='bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white text-sm outline-none z-20 relative'
                  value={contentInput.date}
                  onChange={(e) =>
                    setContentInput({ ...contentInput, date: e.target.value })
                  }
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    addContent();
                  }}
                  className='bg-pink-600 hover:bg-pink-700 text-white px-6 rounded-lg font-bold z-20 relative cursor-pointer'
                >
                  <Plus size={20} />
                </button>
              </div>
            </GlassCard>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {['Topo', 'Meio', 'Fundo'].map((stage) => {
                if (contentFilter !== 'Todos' && contentFilter !== stage)
                  return null;
                return (
                  <div
                    key={stage}
                    className={`bg-[#13131a]/40 border-t-4 ${
                      stage === 'Topo'
                        ? 'border-indigo-500'
                        : stage === 'Meio'
                        ? 'border-pink-500'
                        : 'border-emerald-500'
                    } border-x border-b border-gray-800 rounded-2xl p-4 min-h-[400px]`}
                  >
                    <h4 className='font-bold text-sm text-white mb-4 flex justify-between'>
                      {stage}{' '}
                      <span className='text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400'>
                        {
                          profile.content.filter((c) => c.funnelStage === stage)
                            .length
                        }
                      </span>
                    </h4>
                    <div className='space-y-3'>
                      {profile.content
                        .filter((c) => c.funnelStage === stage)
                        .map((post) => (
                          <div
                            key={post.id}
                            className='bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 group relative hover:bg-gray-800 transition-all shadow-md'
                          >
                            <p className='text-sm text-gray-200 line-clamp-3 font-medium mb-3'>
                              {post.caption}
                            </p>
                            <div className='flex justify-between items-center pt-3 border-t border-gray-700/50'>
                              <span className='text-[10px] text-gray-400'>
                                {new Date(post.date).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteContent(post.id);
                                }}
                                className='text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20 relative cursor-pointer'
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAIS DE EDIÇÃO --- */}
      {editingKpi && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in'>
          <GlassCard className='w-full max-w-sm p-6 bg-[#18181b] z-[101]'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-white'>Editar Dados</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingKpi(null);
                }}
                className='relative z-20 cursor-pointer'
              >
                <X size={20} className='text-gray-500 hover:text-white' />
              </button>
            </div>

            {editingKpi === 'audience' && (
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] uppercase font-bold text-gray-500 mb-1 block'>
                    Seguidores
                  </label>
                  <input
                    type='text'
                    className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                    value={tempAudience.current}
                    onChange={(e) =>
                      setTempAudience({
                        ...tempAudience,
                        current: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-emerald-500 mb-1 block'>
                    Meta
                  </label>
                  <input
                    type='text'
                    className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                    value={tempAudience.target}
                    onChange={(e) =>
                      setTempAudience({
                        ...tempAudience,
                        target: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    saveAudience();
                  }}
                  className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg mt-2 z-20 relative cursor-pointer'
                >
                  Salvar
                </button>
              </div>
            )}

            {editingKpi === 'financial' && (
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] uppercase font-bold text-gray-500 mb-1 block'>
                    Gasto Total (Mês)
                  </label>
                  <input
                    type='text'
                    className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                    value={tempFinance.spend}
                    onChange={(e) =>
                      setTempFinance({ ...tempFinance, spend: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-gray-500 mb-1 block'>
                    Receita Total (Mês)
                  </label>
                  <input
                    type='text'
                    className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                    value={tempFinance.revenue}
                    onChange={(e) =>
                      setTempFinance({
                        ...tempFinance,
                        revenue: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='border-t border-gray-800 pt-2'>
                  <label className='text-[10px] uppercase font-bold text-emerald-500 mb-1 block'>
                    Meta ROAS
                  </label>
                  <input
                    type='text'
                    className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                    value={tempFinance.targetRoas}
                    onChange={(e) =>
                      setTempFinance({
                        ...tempFinance,
                        targetRoas: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    saveFinancialData();
                  }}
                  className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-lg mt-2 z-20 relative cursor-pointer'
                >
                  Salvar & Atualizar
                </button>
              </div>
            )}

            {editingKpi === 'engagement' && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-[10px] uppercase font-bold text-gray-500 mb-1 block'>
                      Likes
                    </label>
                    <input
                      type='text'
                      className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                      value={tempEngagement.likes}
                      onChange={(e) =>
                        setTempEngagement({
                          ...tempEngagement,
                          likes: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className='text-[10px] uppercase font-bold text-gray-500 mb-1 block'>
                      Comentários
                    </label>
                    <input
                      type='text'
                      className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                      value={tempEngagement.comments}
                      onChange={(e) =>
                        setTempEngagement({
                          ...tempEngagement,
                          comments: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-pink-500 mb-1 block'>
                    Meta (%)
                  </label>
                  <input
                    type='text'
                    className='w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white outline-none z-20 relative'
                    value={tempEngagement.target}
                    onChange={(e) =>
                      setTempEngagement({
                        ...tempEngagement,
                        target: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEngagement();
                  }}
                  className='w-full bg-pink-600 hover:bg-pink-700 text-white font-bold p-3 rounded-lg mt-2 z-20 relative cursor-pointer'
                >
                  Salvar
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

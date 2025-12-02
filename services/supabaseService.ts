import {
  User,
  Project,
  Client,
  KpiData,
  ChartData,
  Template,
  Product,
} from '../types';

const MOCK_USER: User = {
  id: 'user-123',
  email: 'usuario@calendash.com',
  name: 'Alex Planejador',
  role: 'admin',
  avatar_url: 'https://picsum.photos/100/100',
  department: 'Planejamento',
};

const MOCK_EVENTS: Project[] = [
  {
    id: '1',
    name: 'Reunião de Kick-off',
    type: 'Reunião',
    status: 'scheduled',
    created_at: '2023-10-25',
    brief: 'Alinhamento inicial do projeto Alpha.',
    content: 'Pauta: Cronograma, Responsáveis, Orçamento.',
    priority: 'high',
    tasks: [
      {
        id: 't1',
        text: 'Preparar apresentação de slides',
        completed: true,
        created_at: '2023-10-20T10:00:00Z',
      },
      {
        id: 't2',
        text: 'Confirmar presença dos stakeholders',
        completed: false,
        created_at: '2023-10-21T14:30:00Z',
      },
      {
        id: 't3',
        text: 'Reservar sala de reunião',
        completed: true,
        created_at: '2023-10-22T09:15:00Z',
      },
    ],
    attachments: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=400&auto=format&fit=crop',
    ],
  },
  {
    id: '2',
    name: 'Entrega de Conteúdo Social',
    type: 'Deadline',
    status: 'scheduled',
    created_at: '2023-10-26',
    brief: 'Posts Instagram Semana 42',
    content: '',
    priority: 'medium',
    tasks: [
      {
        id: 't1',
        text: 'Revisar copy dos posts',
        completed: false,
        created_at: '2023-10-24T11:00:00Z',
      },
      {
        id: 't2',
        text: 'Aprovar design das artes',
        completed: false,
        created_at: '2023-10-24T11:05:00Z',
      },
    ],
    attachments: [],
  },
  {
    id: '3',
    name: 'Call Mensal de Resultados',
    type: 'Recorrente',
    status: 'completed',
    created_at: '2023-10-20',
    brief: 'Apresentação de KPIs.',
    content: 'Slide deck em anexo.',
    priority: 'high',
  },
  {
    id: '4',
    name: 'Dentista',
    type: 'Pessoal',
    status: 'scheduled',
    created_at: '2023-10-28',
    brief: 'Dr. Silva - 15h',
    content: '',
    priority: 'low',
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Licença ERP Pro',
    description: 'Assinatura mensal do software',
    cost_price: 50.0,
    sale_price: 150.0,
    current_stock: 999,
    min_stock: 10,
    created_at: '2023-10-01',
  },
  {
    id: 'p2',
    name: 'Consultoria de Implantação',
    description: 'Pacote de 10 horas técnicas',
    cost_price: 800.0,
    sale_price: 2500.0,
    current_stock: 5,
    min_stock: 2,
    created_at: '2023-10-05',
  },
  {
    id: 'p3',
    name: 'Teclado Mecânico RGB',
    description: 'Periférico para desenvolvedores',
    cost_price: 120.0,
    sale_price: 350.0,
    current_stock: 45,
    min_stock: 15,
    created_at: '2023-10-10',
  },
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 1,
    title: 'Calendário Editorial Social Media',
    category: 'Marketing',
    image_url:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    shortDesc: 'Organize posts, stories e reels para todas as redes.',
    fullDesc:
      'Este modelo é perfeito para gestores de mídias sociais. Ele inclui visualizações semanais e mensais, campos para status de aprovação, links de assets e legendas. Otimize seu fluxo de publicação e nunca mais perca uma data comemorativa.',
    features: [
      'Planejador de Feed',
      'Status de Aprovação',
      'Banco de Hashtags',
      'Métricas de Performance',
    ],
    popularity: 98,
  },
  {
    id: 2,
    title: 'Cronograma de Projeto Ágil',
    category: 'Negócios',
    image_url:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop',
    shortDesc: 'Sprints, dailies e entregas para times de tech.',
    fullDesc:
      'Baseado na metodologia Scrum, este calendário foca em ciclos de 2 semanas (Sprints). Organize suas dailies, reviews e retrospectives. Ideal para manter o time alinhado e visualizar o progresso das tarefas.',
    features: [
      'Ciclos de Sprint',
      'Datas de Release',
      'Meeting Planner',
      'Blockers Log',
    ],
    popularity: 85,
  },
  {
    id: 3,
    title: 'Agenda de Treinos Fitness',
    category: 'Saúde',
    image_url:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
    shortDesc: 'Planeje seus exercícios e descanso.',
    fullDesc:
      'Acompanhe sua evolução física com este calendário de treinos. Defina grupos musculares por dia, dias de descanso ativo e registre suas cargas. A consistência é a chave para o resultado.',
    features: [
      'Divisão de Treino ABC',
      'Registro de Cardio',
      'Controle de Peso',
      'Metas Mensais',
    ],
    popularity: 72,
  },
  {
    id: 4,
    title: 'Planejamento de Estudos',
    category: 'Educação',
    image_url:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop',
    shortDesc: 'Grade horária para estudantes e concursos.',
    fullDesc:
      'Maximize seu aprendizado distribuindo as matérias ao longo da semana. Utilize a técnica de pomodoro integrada e reserve tempo para revisões espaçadas.',
    features: [
      'Grade Horária',
      'Revisão Espaçada',
      'Datas de Provas',
      'Progresso de Matéria',
    ],
    popularity: 90,
  },
];

const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'TechSolutions Ltda',
    email: 'contact@techsolutions.com',
    company: 'TI & Dev',
    role: 'Tech Lead',
    salary: 12500,
    phone: '(11) 99999-1234',
    status: 'active',
    plan: 'Enterprise',
    projects_count: 12,
    created_at: '2023-01-15',
  },
  {
    id: 'c2',
    name: 'Maria Clara',
    email: 'maria@marketing.com',
    company: 'Marketing',
    role: 'Social Media',
    salary: 4500,
    phone: '(21) 98888-5678',
    status: 'active',
    plan: 'Pro',
    projects_count: 8,
    created_at: '2023-03-22',
  },
  {
    id: 'c3',
    name: 'Roberto Alves',
    email: 'roberto@design.com',
    company: 'Design',
    role: 'Designer Senior',
    salary: 7800,
    phone: '(31) 97777-4321',
    status: 'inactive',
    plan: 'Basic',
    projects_count: 3,
    created_at: '2023-05-10',
  },
  {
    id: 'c4',
    name: 'Global Corp',
    email: 'admin@globalcorp.com',
    company: 'Financeiro',
    role: 'CFO',
    salary: 22000,
    phone: '(11) 91234-5678',
    status: 'pending',
    plan: 'Enterprise',
    projects_count: 0,
    created_at: '2023-11-01',
  },
];

export const supabaseService = {
  auth: {
    signInWithPassword: async (email: string, password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (email) {
        localStorage.setItem('calendash_session', JSON.stringify(MOCK_USER));
        return { data: { user: MOCK_USER }, error: null };
      }
      return { data: null, error: { message: 'Erro no login' } };
    },
    signUp: async (email: string, password: string, name?: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newUser = {
        ...MOCK_USER,
        email,
        name: name || email.split('@')[0],
      };
      localStorage.setItem('calendash_session', JSON.stringify(newUser));
      return { data: { user: newUser }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('calendash_session');
    },
    getSession: () => {
      const session = localStorage.getItem('calendash_session');
      return session ? JSON.parse(session) : null;
    },
    updateUser: async (updates: Partial<User>) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const current = JSON.parse(
        localStorage.getItem('calendash_session') || '{}'
      );
      const updated = { ...current, ...updates };
      localStorage.setItem('calendash_session', JSON.stringify(updated));
      return { data: updated, error: null };
    },
  },

  from: (table: string) => {
    return {
      select: async (p0: string, p1: { count: string; head: boolean }) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (table === 'projects')
          return { data: [...MOCK_EVENTS], error: null };
        if (table === 'templates')
          return { data: [...MOCK_TEMPLATES], error: null };
        if (table === 'clients') {
          return { data: [...MOCK_CLIENTS], error: null };
        }
        if (table === 'products') {
          return { data: [...MOCK_PRODUCTS], error: null };
        }
        if (table === 'analytics') {
          const chartData: ChartData[] = [
            { name: 'Seg', value: 4, secondary: 1 },
            { name: 'Ter', value: 6, secondary: 2 },
            { name: 'Qua', value: 8, secondary: 0 },
            { name: 'Qui', value: 5, secondary: 1 },
            { name: 'Sex', value: 7, secondary: 3 },
            { name: 'Sáb', value: 2, secondary: 0 },
            { name: 'Dom', value: 1, secondary: 0 },
          ];
          return { data: chartData, error: null };
        }
        if (table === 'kpis') {
          const kpis: KpiData[] = [
            {
              label: 'Eventos Agendados',
              value: '42',
              change: 15,
              trend: 'up',
            },
            { label: 'Horas Ocupadas', value: '126h', change: 8, trend: 'up' },
            { label: 'Cancelamentos', value: '3', change: -5, trend: 'down' },
            { label: 'Modelos em Uso', value: '5', change: 2, trend: 'up' },
          ];
          return { data: kpis, error: null };
        }
        return { data: [], error: null };
      },
      insert: async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (table === 'projects') {
          const newEvent = {
            ...data[0],
            // Respect existing ID if provided (for Undo), otherwise generate
            id: data[0].id || Math.random().toString(36).substr(2, 9),
            created_at: data[0].created_at || new Date().toISOString(),
            tasks: data[0].tasks || [],
            attachments: data[0].attachments || [],
          };
          MOCK_EVENTS.push(newEvent);
          return { data: [newEvent], error: null };
        }
        if (table === 'clients') {
          const newClient = {
            ...data[0],
            id: data[0].id || Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
          };
          MOCK_CLIENTS.push(newClient);
          return { data: [newClient], error: null };
        }
        if (table === 'products') {
          const newProduct = {
            ...data[0],
            id: data[0].id || Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
          };
          MOCK_PRODUCTS.push(newProduct);
          return { data: [newProduct], error: null };
        }
        return { data: null, error: null };
      },
      update: (updates: any) => {
        return {
          eq: async (col: string, val: any) => {
            await new Promise((resolve) => setTimeout(resolve, 400));
            if (table === 'projects' && col === 'id') {
              const idx = MOCK_EVENTS.findIndex((p) => p.id === val);
              if (idx > -1) {
                MOCK_EVENTS[idx] = { ...MOCK_EVENTS[idx], ...updates };
                return { data: [MOCK_EVENTS[idx]], error: null };
              }
            }
            if (table === 'clients' && col === 'id') {
              const idx = MOCK_CLIENTS.findIndex((c) => c.id === val);
              if (idx > -1) {
                MOCK_CLIENTS[idx] = { ...MOCK_CLIENTS[idx], ...updates };
                return { data: [MOCK_CLIENTS[idx]], error: null };
              }
            }
            if (table === 'products' && col === 'id') {
              const idx = MOCK_PRODUCTS.findIndex((p) => p.id === val);
              if (idx > -1) {
                MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...updates };
                return { data: [MOCK_PRODUCTS[idx]], error: null };
              }
            }
            return { data: null, error: 'Not found' };
          },
        };
      },
      delete: async () => {
        return { error: null };
      },
      eq: (col: string, val: any) => {
        return {
          select: async () => {
            if (table === 'projects' && col === 'id') {
              const evt = MOCK_EVENTS.find((p) => p.id === val);
              return { data: evt ? [evt] : [], error: null };
            }
            if (table === 'templates' && col === 'id') {
              const tpl = MOCK_TEMPLATES.find((t) => t.id === Number(val));
              return { data: tpl ? [tpl] : [], error: null };
            }
            return { data: [], error: null };
          },
          delete: async () => {
            if (table === 'projects' && col === 'id') {
              const idx = MOCK_EVENTS.findIndex((p) => p.id === val);
              if (idx > -1) MOCK_EVENTS.splice(idx, 1);
            }
            if (table === 'clients' && col === 'id') {
              const idx = MOCK_CLIENTS.findIndex((c) => c.id === val);
              if (idx > -1) MOCK_CLIENTS.splice(idx, 1);
            }
            if (table === 'products' && col === 'id') {
              const idx = MOCK_PRODUCTS.findIndex((p) => p.id === val);
              if (idx > -1) MOCK_PRODUCTS.splice(idx, 1);
            }
            return { error: null };
          },
        };
      },
    };
  },
};

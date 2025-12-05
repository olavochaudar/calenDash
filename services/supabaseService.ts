import {
  User,
  Project,
  Client,
  KpiData,
  ChartData,
  Template,
  Product,
} from '../types';

// --- CHAVES DE ARMAZENAMENTO ---
const KEYS = {
  USER: 'calendash_user_v1',
  PROJECTS: 'calendash_projects_v1',
  PRODUCTS: 'calendash_products_v1',
  CLIENTS: 'calendash_clients_v1',
};

// --- DADOS PADRÃO (Para quando não houver nada salvo) ---
const DEFAULT_USER: User = {
  id: 'user-123',
  email: 'admin@calendash.com',
  name: 'Gestor',
  role: 'admin',
  avatar_url: '',
  department: 'Geral',
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 1,
    title: 'Calendário Editorial',
    category: 'Marketing',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
    shortDesc: 'Organize posts e stories.',
    fullDesc: 'Ideal para gestores.',
    features: ['Planejador', 'Status'],
    popularity: 98,
  },
  {
    id: 2,
    title: 'Gestão Financeira',
    category: 'Negócios',
    image_url: 'https://images.unsplash.com/photo-1554224155-9844c6ef315a',
    shortDesc: 'Controle de fluxo de caixa.',
    fullDesc: 'Planilha completa.',
    features: ['Entradas', 'Saídas'],
    popularity: 85,
  },
];

// --- FUNÇÕES DE PERSISTÊNCIA (O Segredo) ---
const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Erro ao carregar ${key}`, e);
    return defaultValue;
  }
};

const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erro ao salvar ${key}`, e);
  }
};

// --- CARREGAMENTO INICIAL DOS DADOS ---
// Agora as variáveis nascem lendo a memória do navegador
let CURRENT_USER = loadData<User>(KEYS.USER, DEFAULT_USER);
let MOCK_EVENTS = loadData<Project[]>(KEYS.PROJECTS, []);
let MOCK_PRODUCTS = loadData<Product[]>(KEYS.PRODUCTS, []);
let MOCK_CLIENTS = loadData<Client[]>(KEYS.CLIENTS, []);

export const supabaseService = {
  // --- AUTENTICAÇÃO ---
  auth: {
    signInWithPassword: async (email: string, password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Simula login: qualquer email funciona para teste
      if (email) {
        return { data: { user: CURRENT_USER }, error: null };
      }
      return { data: null, error: { message: 'Erro no login' } };
    },
    signUp: async (email: string, password: string, name?: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newUser = {
        ...DEFAULT_USER,
        email,
        name: name || email.split('@')[0],
      };
      CURRENT_USER = newUser;
      saveData(KEYS.USER, CURRENT_USER);
      return { data: { user: newUser }, error: null };
    },
    signOut: async () => {
      // Opcional: Limpar sessão ou dados
      // localStorage.clear();
    },
    getSession: () => {
      return CURRENT_USER;
    },
    getUser: async () => {
      return { data: { user: CURRENT_USER } };
    },
    updateUser: async (updates: Partial<User>) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      CURRENT_USER = { ...CURRENT_USER, ...updates };
      saveData(KEYS.USER, CURRENT_USER);
      return { data: CURRENT_USER, error: null };
    },
  },

  // --- CLIENTE DO BANCO DE DADOS (Simulado com Persistência) ---
  // Acessador direto para compatibilidade
  get client() {
    return this;
  },

  from: (table: string) => {
    return {
      // --- SELECT ---
      select: async (columns?: string) => {
        await new Promise((resolve) => setTimeout(resolve, 200)); // Pequeno delay para parecer real

        if (table === 'projects' || table === 'events')
          return { data: [...MOCK_EVENTS], error: null };
        if (table === 'products')
          return { data: [...MOCK_PRODUCTS], error: null };
        if (table === 'clients')
          return { data: [...MOCK_CLIENTS], error: null };
        if (table === 'templates')
          return { data: [...DEFAULT_TEMPLATES], error: null };

        // Tabelas de Relatórios (Mockados estáticos por enquanto)
        if (table === 'transactions') {
          // Gera transações baseadas nos projetos para o financeiro ter dados
          const transactions = MOCK_EVENTS.map((p) => ({
            id: p.id,
            amount: 1500, // Valor fictício por projeto
            type: 'income',
            category: 'Venda de Projeto',
            date: p.created_at,
          }));
          return { data: transactions, error: null };
        }

        return { data: [], error: null };
      },

      // --- INSERT ---
      insert: async (data: any[]) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const item = data[0];
        const newId = item.id || crypto.randomUUID(); // Gera ID real
        const newItem = {
          ...item,
          id: newId,
          created_at: new Date().toISOString(),
        };

        if (table === 'projects' || table === 'events') {
          MOCK_EVENTS = [newItem, ...MOCK_EVENTS]; // Adiciona no topo
          saveData(KEYS.PROJECTS, MOCK_EVENTS); // SALVA NO NAVEGADOR
          return { data: [newItem], error: null };
        }
        if (table === 'products') {
          MOCK_PRODUCTS = [newItem, ...MOCK_PRODUCTS];
          saveData(KEYS.PRODUCTS, MOCK_PRODUCTS); // SALVA NO NAVEGADOR
          return { data: [newItem], error: null };
        }
        if (table === 'clients') {
          MOCK_CLIENTS = [newItem, ...MOCK_CLIENTS];
          saveData(KEYS.CLIENTS, MOCK_CLIENTS); // SALVA NO NAVEGADOR
          return { data: [newItem], error: null };
        }
        return { data: null, error: null };
      },

      // --- UPDATE (Prepara o update) ---
      update: (updates: any) => {
        return {
          eq: async (col: string, val: any) => {
            await new Promise((resolve) => setTimeout(resolve, 300));

            if (col !== 'id')
              return { data: null, error: 'Apenas ID suportado' };

            if (table === 'projects' || table === 'events') {
              MOCK_EVENTS = MOCK_EVENTS.map((item) =>
                item.id === val ? { ...item, ...updates } : item
              );
              saveData(KEYS.PROJECTS, MOCK_EVENTS); // SALVA
              return { data: [updates], error: null };
            }
            if (table === 'products') {
              MOCK_PRODUCTS = MOCK_PRODUCTS.map((item) =>
                item.id === val ? { ...item, ...updates } : item
              );
              saveData(KEYS.PRODUCTS, MOCK_PRODUCTS); // SALVA
              return { data: [updates], error: null };
            }
            if (table === 'clients') {
              MOCK_CLIENTS = MOCK_CLIENTS.map((item) =>
                item.id === val ? { ...item, ...updates } : item
              );
              saveData(KEYS.CLIENTS, MOCK_CLIENTS); // SALVA
              return { data: [updates], error: null };
            }
            return { data: null, error: null };
          },
        };
      },

      // --- DELETE ---
      delete: () => {
        return {
          eq: async (col: string, val: any) => {
            await new Promise((resolve) => setTimeout(resolve, 300));

            if (table === 'projects' || table === 'events') {
              MOCK_EVENTS = MOCK_EVENTS.filter((p) => p.id !== val);
              saveData(KEYS.PROJECTS, MOCK_EVENTS); // SALVA A REMOÇÃO
            }
            if (table === 'products') {
              MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== val);
              saveData(KEYS.PRODUCTS, MOCK_PRODUCTS); // SALVA A REMOÇÃO
            }
            if (table === 'clients') {
              MOCK_CLIENTS = MOCK_CLIENTS.filter((c) => c.id !== val);
              saveData(KEYS.CLIENTS, MOCK_CLIENTS); // SALVA A REMOÇÃO
            }
            return { error: null };
          },
        };
      },

      // --- FILTROS (EQ, NEQ, ORDER, LIMIT, GTE) ---
      // Simulação básica para não quebrar a UI
      eq: (col: string, val: any) => {
        return {
          select: async () => {
            // Lógica simples de filtro para ID
            if (table === 'projects' || table === 'events') {
              const found = MOCK_EVENTS.find((i) => i.id === val);
              return { data: found ? found : null, error: null };
            }
            return { data: null, error: null };
          },
          single: async () => {
            if (table === 'projects' || table === 'events') {
              const found = MOCK_EVENTS.find((i) => i.id === val);
              return { data: found || null, error: null };
            }
            return { data: null, error: null };
          },
          delete: async () => {
            // Atalho para delete direto
            if (table === 'projects' || table === 'events') {
              MOCK_EVENTS = MOCK_EVENTS.filter((p) => p.id !== val);
              saveData(KEYS.PROJECTS, MOCK_EVENTS);
            }
            if (table === 'products') {
              MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== val);
              saveData(KEYS.PRODUCTS, MOCK_PRODUCTS);
            }
            return { error: null };
          },
        };
      },

      // Funções auxiliares para não quebrar o encadeamento (chaining)
      neq: () => ({
        order: () => ({
          limit: async () => {
            // Retorna o primeiro projeto se houver
            if (
              (table === 'projects' || table === 'events') &&
              MOCK_EVENTS.length > 0
            ) {
              return { data: [MOCK_EVENTS[0]], error: null };
            }
            return { data: [], error: null };
          },
        }),
      }),
      gte: () => ({
        order: () => ({
          limit: async () => {
            // Simula busca de próximos eventos
            if (
              (table === 'projects' || table === 'events') &&
              MOCK_EVENTS.length > 0
            ) {
              return { data: [MOCK_EVENTS[0]], error: null };
            }
            return { data: [], error: null };
          },
        }),
      }),
      order: () => ({ limit: async () => ({ data: [], error: null }) }),
    };
  },
};

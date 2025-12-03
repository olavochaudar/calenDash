import React, { useState, useMemo, useEffect } from 'react';
// --- IMPORTAÇÕES DE GRÁFICOS ---
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// --- IMPORTAÇÕES DE ÍCONES ---
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Plus,
  X,
  Save,
  Calendar,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Filter,
  Users,
  Package,
  Trash2,
  Search,
  Edit2,
} from 'lucide-react';

// --- TIPOS DE DADOS ---
type TabType = 'finance' | 'products' | 'employees';
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  salary: number;
  status: 'Ativo' | 'Férias';
}

// --- CORES DO TEMA ---
const COLORS = {
  income: '#10B981',
  expense: '#EF4444',
  grid: '#27272a',
  text: '#9CA3AF',
};

const CATEGORY_COLORS: Record<string, string> = {
  Operacional: '#EF4444',
  Marketing: '#F97316',
  Tecnologia: '#8B5CF6',
  Pessoal: '#3B82F6',
  Produtos: '#06b6d4',
  Fornecedores: '#ec4899',
  Logística: '#eab308',
  Impostos: '#6B7280',
  Vendas: '#10B981',
  Serviços: '#6366f1',
  Investimentos: '#34D399',
  Outros: '#9CA3AF',
};

// --- COMPONENTE PRINCIPAL ---
export const Reports: React.FC = () => {
  // --- ESTADOS GLOBAIS ---
  const [activeTab, setActiveTab] = useState<TabType>('finance');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  // =========================================================================
  // LOGICA DO LOCALSTORAGE (Aqui acontece a mágica de salvar)
  // =========================================================================

  // 1. Carregar Saldo Inicial
  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem('erp_balance');
    return saved ? Number(saved) : 0;
  });

  // 2. Carregar Transações
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('erp_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Carregar Produtos
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Carregar Funcionários
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('erp_employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [tempInitialBalance, setTempInitialBalance] = useState('');

  // --- SALVAMENTO AUTOMÁTICO (Efeitos) ---
  // Sempre que uma dessas variáveis mudar, salvamos no navegador
  useEffect(() => {
    localStorage.setItem('erp_balance', initialBalance.toString());
  }, [initialBalance]);
  useEffect(() => {
    localStorage.setItem('erp_transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('erp_employees', JSON.stringify(employees));
  }, [employees]);

  // =========================================================================

  // --- ESTADOS DOS FORMULÁRIOS ---
  const [newTrans, setNewTrans] = useState({
    description: '',
    amount: '',
    type: 'income' as TransactionType,
    category: 'Vendas',
    date: new Date().toISOString().split('T')[0],
  });
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Serviço',
  });
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    salary: '',
    status: 'Ativo' as 'Ativo' | 'Férias',
  });

  // --- CÁLCULOS FINANCEIROS (KPIs) ---
  const financials = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const balance = initialBalance + income - expense;
    const margin =
      income > 0 ? (((income - expense) / income) * 100).toFixed(1) : '0';
    return { income, expense, balance, margin };
  }, [transactions, initialBalance]);

  // --- GRÁFICOS ---
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];
    return transactions.map((t, i) => ({
      name: `Mov ${i + 1}`,
      entrada: t.type === 'income' ? t.amount : 0,
      saida: t.type === 'expense' ? t.amount : 0,
      date: t.date,
    }));
  }, [transactions]);

  const expenseDistribution = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0)
      return [{ name: 'Sem Dados', value: 1, color: '#333' }];
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(grouped).map((key) => ({
      name: key,
      value: grouped[key],
      color: CATEGORY_COLORS[key] || '#9CA3AF',
    }));
  }, [transactions]);

  // --- AÇÕES ---
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);

  const handleDelete = (id: number, listType: TabType) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      if (listType === 'finance')
        setTransactions((prev) => prev.filter((i) => i.id !== id));
      if (listType === 'products')
        setProducts((prev) => prev.filter((i) => i.id !== id));
      if (listType === 'employees')
        setEmployees((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSaveInitialBalance = () => {
    setInitialBalance(Number(tempInitialBalance));
    setIsBalanceModalOpen(false);
  };

  const handleSave = () => {
    if (activeTab === 'finance') {
      if (!newTrans.description || !newTrans.amount) return;
      setTransactions([
        ...transactions,
        {
          id: Date.now(),
          description: newTrans.description,
          amount: Number(newTrans.amount),
          type: newTrans.type,
          category: newTrans.category,
          date: newTrans.date,
        },
      ]);
      setNewTrans({
        description: '',
        amount: '',
        type: 'income',
        category: 'Vendas',
        date: new Date().toISOString().split('T')[0],
      });
    } else if (activeTab === 'products') {
      if (!newProd.name || !newProd.price) return;
      setProducts([
        ...products,
        {
          id: Date.now(),
          name: newProd.name,
          price: Number(newProd.price),
          stock: Number(newProd.stock),
          category: newProd.category,
        },
      ]);
      setNewProd({ name: '', price: '', stock: '', category: 'Serviço' });
    } else if (activeTab === 'employees') {
      if (!newEmp.name || !newEmp.salary) return;
      setEmployees([
        ...employees,
        {
          id: Date.now(),
          name: newEmp.name,
          role: newEmp.role,
          salary: Number(newEmp.salary),
          status: newEmp.status,
        },
      ]);
      setNewEmp({ name: '', role: '', salary: '', status: 'Ativo' });
    }
    setIsModalOpen(false);
  };

  return (
    <div className='min-h-screen bg-[#09090b] text-white p-6 md:p-8 font-sans pb-20'>
      {/* --- MODAL DE SALDO INICIAL --- */}
      {isBalanceModalOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4'>
          <div className='bg-[#18181b] border border-gray-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold text-white'>
                Definir Saldo Inicial
              </h3>
              <button onClick={() => setIsBalanceModalOpen(false)}>
                <X className='text-gray-400 hover:text-white' />
              </button>
            </div>
            <p className='text-gray-400 text-sm mb-4'>
              Informe quanto você já tem em caixa antes das movimentações
              abaixo.
            </p>
            <input
              type='number'
              value={tempInitialBalance}
              onChange={(e) => setTempInitialBalance(e.target.value)}
              placeholder='Ex: 0,00'
              className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none mb-4 focus:border-indigo-500'
              autoFocus
            />
            <button
              onClick={handleSaveInitialBalance}
              className='w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl'
            >
              Atualizar Saldo
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL GERAL --- */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-[#18181b] border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                <Plus size={20} className='text-indigo-500' />
                {activeTab === 'finance'
                  ? 'Nova Movimentação'
                  : activeTab === 'products'
                  ? 'Novo Produto'
                  : 'Novo Funcionário'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className='text-gray-400 hover:text-white' />
              </button>
            </div>

            <div className='space-y-4'>
              {/* FORMULÁRIO FINANCEIRO */}
              {activeTab === 'finance' && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <button
                      onClick={() =>
                        setNewTrans({
                          ...newTrans,
                          type: 'income',
                          category: 'Vendas',
                        })
                      }
                      className={`p-3 rounded-xl border flex justify-center gap-2 ${
                        newTrans.type === 'income'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      <ArrowUp size={18} /> Entrada
                    </button>
                    <button
                      onClick={() =>
                        setNewTrans({
                          ...newTrans,
                          type: 'expense',
                          category: 'Operacional',
                        })
                      }
                      className={`p-3 rounded-xl border flex justify-center gap-2 ${
                        newTrans.type === 'expense'
                          ? 'bg-red-500/20 border-red-500 text-red-500'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      <ArrowDown size={18} /> Saída
                    </button>
                  </div>
                  <input
                    type='text'
                    placeholder='Descrição'
                    value={newTrans.description}
                    onChange={(e) =>
                      setNewTrans({ ...newTrans, description: e.target.value })
                    }
                    className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                  />
                  <div className='grid grid-cols-2 gap-4'>
                    <input
                      type='number'
                      placeholder='Valor (R$)'
                      value={newTrans.amount}
                      onChange={(e) =>
                        setNewTrans({ ...newTrans, amount: e.target.value })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    />
                    <input
                      type='date'
                      value={newTrans.date}
                      onChange={(e) =>
                        setNewTrans({ ...newTrans, date: e.target.value })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label className='text-xs text-gray-500 uppercase font-bold ml-1'>
                      Categoria
                    </label>
                    <select
                      value={newTrans.category}
                      onChange={(e) =>
                        setNewTrans({ ...newTrans, category: e.target.value })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    >
                      {newTrans.type === 'income' ? (
                        <>
                          <option value='Vendas'>Vendas</option>
                          <option value='Serviços'>Serviços</option>
                          <option value='Investimentos'>Investimentos</option>
                          <option value='Outros'>Outros</option>
                        </>
                      ) : (
                        <>
                          <option value='Operacional'>Operacional</option>
                          <option value='Produtos'>Produtos (Estoque)</option>
                          <option value='Fornecedores'>Fornecedores</option>
                          <option value='Logística'>Logística / Frete</option>
                          <option value='Marketing'>Marketing</option>
                          <option value='Pessoal'>Pessoal / Salários</option>
                          <option value='Tecnologia'>Tecnologia</option>
                          <option value='Impostos'>Impostos</option>
                          <option value='Outros'>Outros</option>
                        </>
                      )}
                    </select>
                  </div>
                </>
              )}

              {/* FORMULÁRIO PRODUTOS */}
              {activeTab === 'products' && (
                <>
                  <input
                    type='text'
                    placeholder='Nome do Produto'
                    value={newProd.name}
                    onChange={(e) =>
                      setNewProd({ ...newProd, name: e.target.value })
                    }
                    className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                  />
                  <div className='grid grid-cols-2 gap-4'>
                    <input
                      type='number'
                      placeholder='Preço (R$)'
                      value={newProd.price}
                      onChange={(e) =>
                        setNewProd({ ...newProd, price: e.target.value })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    />
                    <input
                      type='number'
                      placeholder='Estoque (qtd)'
                      value={newProd.stock}
                      onChange={(e) =>
                        setNewProd({ ...newProd, stock: e.target.value })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    />
                  </div>
                  <input
                    type='text'
                    placeholder='Categoria (Ex: Serviço)'
                    value={newProd.category}
                    onChange={(e) =>
                      setNewProd({ ...newProd, category: e.target.value })
                    }
                    className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                  />
                </>
              )}

              {/* FORMULÁRIO FUNCIONÁRIOS */}
              {activeTab === 'employees' && (
                <>
                  <input
                    type='text'
                    placeholder='Nome do Colaborador'
                    value={newEmp.name}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, name: e.target.value })
                    }
                    className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                  />
                  <input
                    type='text'
                    placeholder='Cargo'
                    value={newEmp.role}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, role: e.target.value })
                    }
                    className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                  />
                  <div className='grid grid-cols-2 gap-4'>
                    <input
                      type='number'
                      placeholder='Salário (R$)'
                      value={newEmp.salary}
                      onChange={(e) =>
                        setNewEmp({ ...newEmp, salary: e.target.value })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    />
                    <select
                      value={newEmp.status}
                      onChange={(e) =>
                        setNewEmp({ ...newEmp, status: e.target.value as any })
                      }
                      className='w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none'
                    >
                      <option>Ativo</option>
                      <option>Férias</option>
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={handleSave}
                className='w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/20'
              >
                <Save size={18} /> Salvar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-white mb-2 tracking-tight'>
            Gestão Empresarial
          </h1>
          <div className='flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800'>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'finance'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Financeiro
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'employees'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Funcionários
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105'
        >
          <Plus size={18} />{' '}
          {activeTab === 'finance'
            ? 'Nova Transação'
            : activeTab === 'products'
            ? 'Novo Produto'
            : 'Novo Funcionário'}
        </button>
      </div>

      {/* --- FINANCEIRO --- */}
      {activeTab === 'finance' && (
        <div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6'>
              <div className='flex justify-between items-start mb-4'>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Receita
                </p>
                <TrendingUp className='text-emerald-500' size={20} />
              </div>
              <h3 className='text-3xl font-bold text-white'>
                {formatCurrency(financials.income)}
              </h3>
            </div>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6'>
              <div className='flex justify-between items-start mb-4'>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Despesas
                </p>
                <TrendingDown className='text-red-500' size={20} />
              </div>
              <h3 className='text-3xl font-bold text-white'>
                {formatCurrency(financials.expense)}
              </h3>
            </div>
            {/* CARD DE SALDO EDITÁVEL */}
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6 group'>
              <div className='flex justify-between items-start mb-4'>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Saldo
                </p>
                <Wallet className='text-blue-500' size={20} />
              </div>
              <div className='flex items-center gap-2'>
                <h3
                  className={`text-3xl font-bold ${
                    financials.balance >= 0 ? 'text-white' : 'text-red-500'
                  }`}
                >
                  {formatCurrency(financials.balance)}
                </h3>
                <button
                  onClick={() => {
                    setTempInitialBalance(initialBalance.toString());
                    setIsBalanceModalOpen(true);
                  }}
                  className='p-1 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100'
                >
                  <Edit2 size={16} className='text-gray-400 hover:text-white' />
                </button>
              </div>
            </div>
            <div className='bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6'>
              <p className='text-indigo-400 text-xs font-bold uppercase mb-2'>
                Margem
              </p>
              <h3 className='text-3xl font-bold text-white mb-2'>
                {financials.margin}%
              </h3>
              <div className='w-full bg-gray-700 h-1.5 rounded-full'>
                <div
                  className={`h-full ${
                    Number(financials.margin) > 20
                      ? 'bg-emerald-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{
                    width: `${Math.min(Number(financials.margin), 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            <div className='lg:col-span-2 bg-[#18181b] border border-gray-800 rounded-2xl p-6'>
              <h3 className='text-lg font-bold text-white mb-6 flex items-center gap-2'>
                <Activity size={18} className='text-indigo-500' /> Fluxo de
                Caixa
              </h3>
              <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id='colorIncome'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor={COLORS.income}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor={COLORS.income}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id='colorExpense'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor={COLORS.expense}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor={COLORS.expense}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={COLORS.grid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey='name'
                      stroke='#9CA3AF'
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke='#9CA3AF'
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <Area
                      type='monotone'
                      dataKey='entrada'
                      stroke={COLORS.income}
                      fill='url(#colorIncome)'
                      strokeWidth={3}
                    />
                    <Area
                      type='monotone'
                      dataKey='saida'
                      stroke={COLORS.expense}
                      fill='url(#colorExpense)'
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6'>
              <h3 className='text-lg font-bold text-white mb-6'>Categorias</h3>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={expenseDistribution}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {expenseDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke='none'
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <Legend verticalAlign='bottom' />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className='bg-[#18181b] border border-gray-800 rounded-2xl overflow-hidden'>
            <div className='p-6 border-b border-gray-800'>
              <h3 className='font-bold text-white flex gap-2'>
                <Calendar size={18} className='text-gray-400' /> Histórico
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm text-gray-400'>
                <thead className='bg-gray-900/50 text-xs uppercase font-bold'>
                  <tr>
                    <th className='px-6 py-4'>Desc</th>
                    <th className='px-6 py-4'>Cat</th>
                    <th className='px-6 py-4'>Data</th>
                    <th className='px-6 py-4 text-right'>Valor</th>
                    <th className='px-6 py-4 text-center'>Ação</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-800/50'>
                  {[...transactions].reverse().map((t) => (
                    <tr key={t.id} className='hover:bg-gray-800/30'>
                      <td className='px-6 py-4 text-white font-medium'>
                        {t.description}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`px-2 py-1 rounded text-xs border ${
                            t.type === 'income'
                              ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10'
                              : 'border-red-500/20 text-red-500 bg-red-500/10'
                          }`}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          t.type === 'income'
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}{' '}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <button
                          onClick={() => handleDelete(t.id, 'finance')}
                          className='text-gray-600 hover:text-red-500'
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className='p-6 text-center'>
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- PRODUTOS --- */}
      {activeTab === 'products' && (
        <div className='animate-in fade-in slide-in-from-right-4 duration-500'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6 flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Itens em Estoque
                </p>
                <h3 className='text-3xl font-bold text-white mt-1'>
                  {products.reduce((acc, p) => acc + p.stock, 0)}
                </h3>
              </div>
              <div className='p-3 bg-purple-500/10 rounded-xl text-purple-500'>
                <Package size={24} />
              </div>
            </div>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6 flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Valor em Produtos
                </p>
                <h3 className='text-3xl font-bold text-white mt-1'>
                  {formatCurrency(
                    products.reduce((acc, p) => acc + p.price * p.stock, 0)
                  )}
                </h3>
              </div>
              <div className='p-3 bg-emerald-500/10 rounded-xl text-emerald-500'>
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div className='bg-[#18181b] border border-gray-800 rounded-2xl overflow-hidden'>
            <div className='p-6 border-b border-gray-800 flex justify-between'>
              <h3 className='font-bold text-white flex gap-2'>
                <Package size={18} className='text-indigo-500' /> Lista de
                Produtos
              </h3>
              <Search size={18} className='text-gray-500' />
            </div>
            <table className='w-full text-left text-sm text-gray-400'>
              <thead className='bg-gray-900/50 text-xs uppercase font-bold'>
                <tr>
                  <th className='px-6 py-4'>Produto</th>
                  <th className='px-6 py-4'>Categoria</th>
                  <th className='px-6 py-4 text-center'>Estoque</th>
                  <th className='px-6 py-4 text-right'>Preço Unit.</th>
                  <th className='px-6 py-4 text-center'>Ação</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-800/50'>
                {products.map((p) => (
                  <tr key={p.id} className='hover:bg-gray-800/30'>
                    <td className='px-6 py-4 text-white font-medium'>
                      {p.name}
                    </td>
                    <td className='px-6 py-4'>{p.category}</td>
                    <td className='px-6 py-4 text-center'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          p.stock < 10
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {p.stock} unid
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right font-bold text-emerald-400'>
                      {formatCurrency(p.price)}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <button
                        onClick={() => handleDelete(p.id, 'products')}
                        className='text-gray-600 hover:text-red-500'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className='p-6 text-center'>
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FUNCIONÁRIOS --- */}
      {activeTab === 'employees' && (
        <div className='animate-in fade-in slide-in-from-right-4 duration-500'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6 flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Equipe Ativa
                </p>
                <h3 className='text-3xl font-bold text-white mt-1'>
                  {employees.length}
                </h3>
              </div>
              <div className='p-3 bg-blue-500/10 rounded-xl text-blue-500'>
                <Users size={24} />
              </div>
            </div>
            <div className='bg-[#18181b] border border-gray-800 rounded-2xl p-6 flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-xs font-bold uppercase'>
                  Folha Salarial
                </p>
                <h3 className='text-3xl font-bold text-white mt-1'>
                  {formatCurrency(
                    employees.reduce((acc, e) => acc + e.salary, 0)
                  )}
                </h3>
              </div>
              <div className='p-3 bg-red-500/10 rounded-xl text-red-500'>
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div className='bg-[#18181b] border border-gray-800 rounded-2xl overflow-hidden'>
            <div className='p-6 border-b border-gray-800'>
              <h3 className='font-bold text-white flex gap-2'>
                <Users size={18} className='text-indigo-500' /> Quadro de
                Funcionários
              </h3>
            </div>
            <table className='w-full text-left text-sm text-gray-400'>
              <thead className='bg-gray-900/50 text-xs uppercase font-bold'>
                <tr>
                  <th className='px-6 py-4'>Nome</th>
                  <th className='px-6 py-4'>Cargo</th>
                  <th className='px-6 py-4'>Status</th>
                  <th className='px-6 py-4 text-right'>Salário</th>
                  <th className='px-6 py-4 text-center'>Ação</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-800/50'>
                {employees.map((e) => (
                  <tr key={e.id} className='hover:bg-gray-800/30'>
                    <td className='px-6 py-4 text-white font-medium flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold'>
                        {e.name.charAt(0)}
                      </div>
                      {e.name}
                    </td>
                    <td className='px-6 py-4'>{e.role}</td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs border ${
                          e.status === 'Ativo'
                            ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10'
                            : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/10'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right text-gray-300'>
                      {formatCurrency(e.salary)}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <button
                        onClick={() => handleDelete(e.id, 'employees')}
                        className='text-gray-600 hover:text-red-500'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className='p-6 text-center'>
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

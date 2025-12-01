import React from 'react';
import { Users, DollarSign, Activity, TrendingUp, CreditCard, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const performanceData = [
  { name: 'Jan', mrr: 45000, sales: 52000, users: 120, churn: 5 },
  { name: 'Fev', mrr: 48000, sales: 55000, users: 135, churn: 8 },
  { name: 'Mar', mrr: 52000, sales: 61000, users: 150, churn: 4 },
  { name: 'Abr', mrr: 58000, sales: 67000, users: 180, churn: 6 },
  { name: 'Mai', mrr: 64000, sales: 75000, users: 210, churn: 3 },
  { name: 'Jun', mrr: 72000, sales: 84000, users: 250, churn: 5 },
];

export const AdminDashboard: React.FC = () => {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Painel Administrativo</h1>
                <p className="text-gray-400">Visão geral da saúde financeira e crescimento da plataforma.</p>
            </div>
            
            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Sales KPI */}
                <div className="bg-brand-surface border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-[#FF8C00]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Total de Vendas (YTD)</p>
                            <h3 className="text-3xl font-bold text-white mt-1">R$ 394.000</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                    </div>
                    <span className="text-green-500 text-sm flex items-center gap-1 font-medium">
                        <TrendingUp size={14} /> +18% vs ano anterior
                    </span>
                </div>

                {/* MAU KPI */}
                <div className="bg-brand-surface border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Usuários Ativos Mensais</p>
                            <h3 className="text-3xl font-bold text-white mt-1">1.250</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Activity size={24} />
                        </div>
                    </div>
                    <span className="text-blue-500 text-sm flex items-center gap-1 font-medium">
                        <TrendingUp size={14} /> +12% vs mês anterior
                    </span>
                </div>

                {/* MRR KPI */}
                <div className="bg-brand-surface border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Receita Recorrente (MRR)</p>
                            <h3 className="text-3xl font-bold text-white mt-1">R$ 72.000</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <span className="text-purple-500 text-sm flex items-center gap-1 font-medium">
                        <TrendingUp size={14} /> +8.5% crescimento MoM
                    </span>
                </div>
            </div>

            {/* Performance Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* MRR Growth Chart */}
                <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#FF8C00]" /> Crescimento de MRR
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'MRR']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="mrr" 
                                    stroke="#FF8C00" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorMrr)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Users size={18} className="text-blue-500" /> Novos Usuários vs Cancelamentos
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    cursor={{fill: '#374151', opacity: 0.2}}
                                />
                                <Legend />
                                <Bar dataKey="users" name="Novos Usuários" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="churn" name="Cancelamentos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-brand-surface border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">Transações Recentes</h3>
                    <button className="text-xs text-[#FF8C00] hover:text-white transition-colors">Ver todas</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            <tr className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">TechSolutions Ltda</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-[#FF8C00]/10 text-[#FF8C00] text-xs font-bold">PRO ANUAL</span></td>
                                <td className="px-6 py-4">Hoje, 14:30</td>
                                <td className="px-6 py-4 font-bold text-white">R$ 997,00</td>
                                <td className="px-6 py-4 text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Pago</td>
                            </tr>
                            <tr className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">Maria Clara Mkt</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold">STARTER</span></td>
                                <td className="px-6 py-4">Ontem, 09:15</td>
                                <td className="px-6 py-4 font-bold text-white">R$ 97,00</td>
                                <td className="px-6 py-4 text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Pago</td>
                            </tr>
                            <tr className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">Roberto Design</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-bold">AGENCY</span></td>
                                <td className="px-6 py-4">24 Out, 11:00</td>
                                <td className="px-6 py-4 font-bold text-white">R$ 297,00</td>
                                <td className="px-6 py-4 text-red-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Falhou</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
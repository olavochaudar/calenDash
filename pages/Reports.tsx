
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Button } from '../components/Button';
import { Download, Share2, Calendar, Filter, TrendingUp, Zap, FileText, MousePointer2, Settings, Eye, EyeOff, Layout } from 'lucide-react';

// Mock Data for Charts
const engagementData = [
  { name: 'Seg', generated: 12, impact: 2400 },
  { name: 'Ter', generated: 19, impact: 3500 },
  { name: 'Qua', generated: 8, impact: 1200 },
  { name: 'Qui', generated: 25, impact: 4800 },
  { name: 'Sex', generated: 22, impact: 4100 },
  { name: 'Sáb', generated: 15, impact: 2900 },
  { name: 'Dom', generated: 10, impact: 1800 },
];

const distributionData = [
  { name: 'E-mail Marketing', value: 45, color: '#FF8C00' },
  { name: 'Social Media', value: 30, color: '#8B5CF6' },
  { name: 'Blog Posts', value: 15, color: '#3B82F6' },
  { name: 'Ads', value: 10, color: '#EF4444' },
];

const performanceTable = [
  { type: 'E-mail Marketing', projects: 45, avgOpenRate: '42%', conversion: '3.8%' },
  { type: 'Instagram Posts', projects: 82, avgOpenRate: 'N/A', conversion: '1.2%' },
  { type: 'Landing Pages', projects: 12, avgOpenRate: 'N/A', conversion: '8.5%' },
  { type: 'Blog Articles', projects: 8, avgOpenRate: 'N/A', conversion: '0.9%' },
];

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // State for Widget Visibility
  const [visibleWidgets, setVisibleWidgets] = useState({
      kpis: true,
      volumeChart: true,
      distributionChart: true,
      detailsTable: true
  });

  const handleDownload = () => {
      const headers = ['Tipo,Projetos,Conversão'];
      const rows = performanceTable.map(item => `${item.type},${item.projects},${item.conversion}`);
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "calendash_analytics.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const toggleWidget = (key: keyof typeof visibleWidgets) => {
      setVisibleWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 pb-10" onClick={() => isConfigOpen && setIsConfigOpen(false)}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
              <h1 className="text-3xl font-bold text-white mb-2">Relatórios de Performance</h1>
              <p className="text-gray-400">Personalize sua visão e acompanhe o impacto.</p>
          </div>
          
          <div className="flex gap-3 relative" onClick={e => e.stopPropagation()}>
             <div className="bg-gray-900 border border-gray-700 rounded-lg p-1 flex items-center">
                {['7d', '30d', '90d'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                            dateRange === range 
                            ? 'bg-[#FF8C00] text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {range}
                    </button>
                ))}
             </div>

             <div className="relative">
                 <Button 
                    variant="secondary" 
                    className={`h-10 text-xs ${isConfigOpen ? 'bg-gray-800 text-white ring-2 ring-indigo-500/50' : ''}`}
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                 >
                    <Settings size={16} className="mr-2" /> Personalizar
                 </Button>

                 {isConfigOpen && (
                     <div className="absolute top-12 right-0 w-64 bg-[#09090b] border border-gray-700 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn">
                         <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                             <Layout size={14} className="text-indigo-500" /> Exibir Widgets
                         </h4>
                         <div className="space-y-2">
                             {[
                                 { key: 'kpis', label: 'Cartões de KPI' },
                                 { key: 'volumeChart', label: 'Gráfico de Volume' },
                                 { key: 'distributionChart', label: 'Gráfico de Distribuição' },
                                 { key: 'detailsTable', label: 'Tabela Detalhada' }
                             ].map((item) => (
                                 <div 
                                    key={item.key} 
                                    onClick={() => toggleWidget(item.key as keyof typeof visibleWidgets)}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 cursor-pointer group transition-colors"
                                 >
                                     <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{item.label}</span>
                                     {visibleWidgets[item.key as keyof typeof visibleWidgets] 
                                        ? <Eye size={16} className="text-indigo-500" /> 
                                        : <EyeOff size={16} className="text-gray-600" />
                                     }
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
             </div>

             <Button variant="secondary" onClick={handleDownload} className="h-10 text-xs">
                <Download size={16} className="mr-2" /> Exportar
             </Button>
          </div>
      </div>

      {/* KPI Overview Cards */}
      {visibleWidgets.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
              <div className="bg-brand-surface border border-gray-800 rounded-xl p-5 hover:border-[#FF8C00]/30 transition-all">
                 <div className="flex justify-between items-start mb-2">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Conteúdos Gerados</p>
                     <FileText size={18} className="text-[#FF8C00]" />
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-1">1,248</h3>
                 <span className="text-green-500 text-xs flex items-center gap-1 font-medium bg-green-500/10 w-fit px-2 py-0.5 rounded">
                    <TrendingUp size={12} /> +12% vs semana passada
                 </span>
              </div>

              <div className="bg-brand-surface border border-gray-800 rounded-xl p-5 hover:border-blue-500/30 transition-all">
                 <div className="flex justify-between items-start mb-2">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tempo Economizado</p>
                     <Zap size={18} className="text-blue-500" />
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-1">182h</h3>
                 <span className="text-blue-500 text-xs flex items-center gap-1 font-medium bg-blue-500/10 w-fit px-2 py-0.5 rounded">
                    ~ R$ 9.000 em horas
                 </span>
              </div>

              <div className="bg-brand-surface border border-gray-800 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                 <div className="flex justify-between items-start mb-2">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Engajamento Est.</p>
                     <MousePointer2 size={18} className="text-purple-500" />
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-1">45.2k</h3>
                 <span className="text-green-500 text-xs flex items-center gap-1 font-medium bg-green-500/10 w-fit px-2 py-0.5 rounded">
                    <TrendingUp size={12} /> +8% vs média
                 </span>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={60} />
                 </div>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Score de Produtividade</p>
                 <h3 className="text-4xl font-bold text-[#FF8C00] mb-1 relative z-10">94<span className="text-lg text-gray-500">/100</span></h3>
                 <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 relative z-10">
                    <div className="bg-[#FF8C00] h-1.5 rounded-full w-[94%] shadow-[0_0_10px_#FF8C00]"></div>
                 </div>
              </div>
          </div>
      )}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Main Activity Chart */}
         {visibleWidgets.volumeChart && (
             <div className={`bg-brand-surface border border-gray-800 rounded-xl p-6 animate-fadeIn ${
                 !visibleWidgets.distributionChart ? 'lg:col-span-3' : 'lg:col-span-2'
             }`}>
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                   Volume de Produção vs Impacto
                </h3>
                <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={engagementData}>
                           <defs>
                               <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                           <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} hide />
                           <Tooltip 
                               contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                               itemStyle={{ color: '#fff' }}
                           />
                           <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                           <Area yAxisId="left" type="monotone" dataKey="generated" name="Conteúdos Criados" stroke="#FF8C00" fillOpacity={1} fill="url(#colorGenerated)" strokeWidth={3} />
                           <Area yAxisId="right" type="monotone" dataKey="impact" name="Impacto (Alcance)" stroke="#3B82F6" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={3} />
                       </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
         )}

         {/* Distribution Pie Chart */}
         {visibleWidgets.distributionChart && (
             <div className={`bg-brand-surface border border-gray-800 rounded-xl p-6 animate-fadeIn ${
                 !visibleWidgets.volumeChart ? 'lg:col-span-3' : ''
             }`}>
                <h3 className="text-lg font-semibold text-white mb-6">Distribuição por Tipo</h3>
                <div className="h-[300px] relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                               data={distributionData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                           >
                               {distributionData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                               ))}
                           </Pie>
                           <Tooltip 
                               contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                               itemStyle={{ color: '#fff' }}
                           />
                           <Legend verticalAlign="bottom" height={36}/>
                       </PieChart>
                   </ResponsiveContainer>
                   {/* Center Text */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-5">
                       <p className="text-2xl font-bold text-white">100%</p>
                       <p className="text-xs text-gray-500">Mix Total</p>
                   </div>
                </div>
             </div>
         )}
      </div>

      {/* Detailed Table */}
      {visibleWidgets.detailsTable && (
          <div className="bg-brand-surface border border-gray-800 rounded-xl overflow-hidden animate-fadeIn">
             <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-white">Desempenho por Categoria</h3>
                 <Button variant="ghost" className="text-xs">Ver Relatório Completo</Button>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-400">
                     <thead className="bg-gray-900 text-xs uppercase text-gray-500">
                         <tr>
                             <th className="px-6 py-4">Categoria</th>
                             <th className="px-6 py-4 text-center">Projetos Ativos</th>
                             <th className="px-6 py-4 text-center">Taxa de Abertura (Méd)</th>
                             <th className="px-6 py-4 text-center">Conversão Est.</th>
                             <th className="px-6 py-4 text-right">Trend</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-800">
                         {performanceTable.map((row, idx) => (
                             <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                 <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${
                                         row.type.includes('E-mail') ? 'bg-[#FF8C00]' : 
                                         row.type.includes('Instagram') ? 'bg-purple-500' : 'bg-blue-500'
                                     }`}></div>
                                     {row.type}
                                 </td>
                                 <td className="px-6 py-4 text-center">{row.projects}</td>
                                 <td className="px-6 py-4 text-center">{row.avgOpenRate}</td>
                                 <td className="px-6 py-4 text-center font-bold text-white">{row.conversion}</td>
                                 <td className="px-6 py-4 text-right">
                                     <span className="text-green-500 flex items-center justify-end gap-1 text-xs font-bold">
                                         <TrendingUp size={14} /> Alta
                                     </span>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
      )}
    </div>
  );
};

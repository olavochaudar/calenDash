
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ArrowRight } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Template } from '../types';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabaseService.from('templates').select().then(res => {
        if (res.data) setTemplates(res.data as Template[]);
    });
  }, []);

  const filteredTemplates = templates.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Modelos de Calendário</h1>
           <p className="text-gray-400 max-w-2xl">
             Encontre a estrutura perfeita para organizar sua vida, trabalho ou estudos.
           </p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
           <input 
              type="text" 
              placeholder="Buscar modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 outline-none"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map((template) => (
           <div 
              key={template.id} 
              onClick={() => navigate(`/templates/${template.id}`)}
              className="bg-brand-surface border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col h-full"
           >
              <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10 opacity-80" />
                  <img 
                    src={template.image_url} 
                    alt={template.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                      {template.category}
                  </span>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {template.title}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded">
                          <Star size={12} fill="currentColor" /> {template.popularity}%
                      </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                      {template.shortDesc}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                     <span className="text-xs text-gray-500">{template.features.length} Funcionalidades</span>
                     <div className="flex items-center text-indigo-500 text-sm font-bold group-hover:gap-2 transition-all">
                        Ver Detalhes <ArrowRight size={16} className="ml-1" />
                     </div>
                  </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import { Template, Project, Task } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, CheckCircle2, CalendarPlus, Share2 } from 'lucide-react';

export const TemplateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
        if (!id) return;
        const { data } = await supabaseService.from('templates').eq('id', id).select();
        if (data && data.length > 0) {
            setTemplate(data[0] as Template);
        }
        setLoading(false);
    };
    fetchTemplate();
  }, [id]);

  const handleUseTemplate = async () => {
      if (!template) return;
      setCreating(true);

      // Convert features to tasks
      const newTasks: Task[] = template.features.map(f => ({
          id: Math.random().toString(36).substr(2, 9),
          text: f,
          completed: false,
          created_at: new Date().toISOString()
      }));

      const newProject: Partial<Project> = {
          name: template.title,
          type: template.category,
          status: 'scheduled',
          brief: template.shortDesc,
          content: template.fullDesc,
          priority: 'medium',
          tasks: newTasks,
          attachments: [template.image_url],
          created_at: new Date().toISOString()
      };

      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const { data } = await supabaseService.from('projects').insert([newProject]);
      
      if (data && data[0]) {
          navigate(`/projects/${data[0].id}`);
      }
      setCreating(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Carregando modelo...</div>;
  if (!template) return <div className="text-center py-20 text-gray-500">Modelo não encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-fadeIn">
      <button 
        onClick={() => navigate('/templates')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Voltar para Galeria
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Image & Visuals */}
          <div className="space-y-6">
              <div className="aspect-video rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                  <img 
                    src={template.image_url} 
                    alt={template.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                          {template.category}
                      </span>
                  </div>
              </div>

              <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4">O que está incluído?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {template.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-gray-400 text-sm">
                              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                              {feature}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{template.title}</h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  {template.shortDesc}
              </p>

              <div className="prose prose-invert text-gray-400 mb-8">
                  <p>{template.fullDesc}</p>
              </div>

              <div className="mt-auto space-y-4">
                  <Button 
                    onClick={handleUseTemplate} 
                    isLoading={creating}
                    className="w-full py-4 text-lg shadow-xl shadow-indigo-500/20"
                  >
                      <CalendarPlus size={20} className="mr-2" /> 
                      {creating ? 'Criando Calendário...' : 'Usar este Modelo'}
                  </Button>
                  <Button variant="secondary" className="w-full py-4 bg-gray-800 border border-gray-700 hover:bg-gray-700">
                      <Share2 size={20} className="mr-2" /> Compartilhar Modelo
                  </Button>
              </div>
          </div>

      </div>
    </div>
  );
};

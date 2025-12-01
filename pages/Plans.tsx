
import React from 'react';
import { Check, Crown, Shield, Sparkles } from 'lucide-react';

export const Plans: React.FC = () => {
  const plan = {
      name: 'Plano Pro Society',
      price: 'R$ 97',
      period: '/mês',
      description: 'Acesso total e irrestrito a todas as ferramentas da plataforma.',
      target: 'Profissionais e Empresas',
      features: [
        { text: 'Social Tracker Ilimitado (Society)', included: true },
        { text: 'Gestão de Calendários e Projetos', included: true },
        { text: 'Relatórios Avançados e PDF', included: true },
        { text: 'Gestão de Equipes e Produtos', included: true },
        { text: 'Todos os Modelos Liberados', included: true },
        { text: 'Suporte Prioritário VIP', included: true },
      ],
      icon: Crown,
      buttonText: 'Assinar Agora'
    };

  return (
    <div className="space-y-10 pb-20">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Plano Único. Potência Máxima.</h1>
        <p className="text-gray-400 text-lg">
          Simplificamos tudo. Um valor, acesso total.
        </p>
      </div>

      <div className="flex justify-center px-4">
            <div 
              className="relative w-full max-w-lg rounded-2xl p-8 flex flex-col border transition-all duration-300 bg-gradient-to-b from-[#1a1025] to-brand-surface border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] hover:border-purple-400 scale-105"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide flex items-center gap-1 whitespace-nowrap border border-purple-400">
                  <Sparkles size={12} fill="currentColor" /> Oferta Especial
              </div>

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-purple-500/10 text-purple-400 mx-auto">
                <plan.icon size={32} />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm mt-4 px-4">
                    {plan.description}
                </p>
              </div>

              <div className="border-t border-purple-900/50 my-6"></div>

              <div className="space-y-4 flex-1 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400 text-center mb-4">Tudo o que você recebe:</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 px-4">
                    <div className="mt-0.5 rounded-full p-0.5 shrink-0 bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-gray-200 font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <button 
                  className="w-full flex items-center justify-center py-4 text-lg font-bold rounded-xl transition-all bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_35px_rgba(147,51,234,0.6)]"
                >
                  {plan.buttonText}
                </button>
                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-2">
                    <Shield size={14} /> Pagamento Seguro
                </p>
              </div>
            </div>
      </div>
      
    </div>
  );
};

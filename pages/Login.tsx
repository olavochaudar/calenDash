
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { supabaseService } from '../services/supabaseService';
import { Lock, Mail, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('colaborador@calendash.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 500));

    const { data, error } = await supabaseService.auth.signInWithPassword(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data) {
      onLogin();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      
      <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden flex-col justify-between p-12 border-r border-gray-900">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        </div>

        <div className="relative z-10">
            <Logo size="lg" />
        </div>

        <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Gestão de <span className="text-[#3B82F6]">agendas e equipes</span> unificada.
            </h2>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check size={14} strokeWidth={3} /></div>
                    <span>Planejamento centralizado</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check size={14} strokeWidth={3} /></div>
                    <span>Otimização de rotinas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check size={14} strokeWidth={3} /></div>
                    <span>Segurança de dados</span>
                </div>
            </div>
        </div>

        <div className="relative z-10 bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-300 italic mb-4">"O CalenDash trouxe visibilidade para o que cada membro da equipe está fazendo, eliminando reuniões de status desnecessárias."</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B82F6] to-purple-600 p-[2px]">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" className="rounded-full w-full h-full object-cover border-2 border-black" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">Roberto Alves</p>
                    <p className="text-gray-500 text-xs">Diretor de Operações</p>
                </div>
            </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-[#09090b]">
        <div className="w-full max-w-md space-y-8">
            
            <div className="text-center lg:text-left">
                <div className="lg:hidden flex justify-center mb-6">
                    <Logo size="md" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Login Corporativo</h2>
                <p className="mt-2 text-gray-400">
                    Acesse sua conta para gerenciar calendários e relatórios.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-fadeIn">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#3B82F6] transition-colors">
                                <Mail size={20} />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all outline-none"
                                placeholder="nome@calendash.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#3B82F6] transition-colors">
                                <Lock size={20} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full py-3.5 text-base font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all" 
                    isLoading={loading}
                >
                    Acessar Plataforma <ArrowRight size={18} className="ml-2" />
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
                Não tem acesso?{' '}
                <Link to="/register" className="font-bold text-[#3B82F6] hover:text-blue-400 hover:underline transition-colors">
                    Solicite ao administrador
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};
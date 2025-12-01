
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { supabaseService } from '../services/supabaseService';
import { Lock, Mail, User, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabaseService.auth.signUp(email, password, name);
    if (data) {
        onLogin();
        navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden flex-col justify-between p-12 border-r border-gray-900">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10">
            <Logo size="lg" />
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                    Solicitação de <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-blue-400">Acesso Corporativo</span>
                </h2>
                <p className="text-gray-400 text-lg">
                    Crie sua conta para iniciar o registro de atividades e gestão de tempo.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <div className="p-2 bg-[#3B82F6]/10 rounded-lg text-[#3B82F6]">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Registro de Atividades</h4>
                        <p className="text-sm text-gray-500">Mantenha seu histórico de trabalho atualizado.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500 flex gap-6">
            <span>&copy; 2024 CalenDash</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-[#09090b]">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white tracking-tight">Criar Conta</h2>
                <p className="mt-2 text-gray-400">
                    Preencha seus dados profissionais.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome Completo</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#3B82F6] transition-colors">
                            <User size={20} />
                        </div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail Corporativo</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#3B82F6] transition-colors">
                            <Mail size={20} />
                        </div>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all outline-none"
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
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all outline-none"
                            minLength={8}
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        className="w-full py-3.5 text-base font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all" 
                        isLoading={loading}
                    >
                        Cadastrar <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>
            </form>

            <p className="text-center text-sm text-gray-500">
                Já tem conta?{' '}
                <Link to="/login" className="font-bold text-[#3B82F6] hover:text-blue-400 hover:underline transition-colors">
                    Fazer Login
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};
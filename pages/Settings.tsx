
import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { supabaseService } from '../services/supabaseService';
import { User } from '../types';
import { Camera, Bell, Shield, CreditCard, User as UserIcon, Check } from 'lucide-react';
import { Plans } from './Plans';

interface SettingsProps {
    user: User | null;
    onUserUpdate: (updatedUser: Partial<User>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      
      const updates = { name, company, phone };
      
      await supabaseService.auth.updateUser(updates);
      onUserUpdate(updates);
      
      setMessage('Perfil atualizado com sucesso!');
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            supabaseService.auth.updateUser({ avatar_url: base64String });
            onUserUpdate({ avatar_url: base64String });
        };
        reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
      return name
          .split(' ')
          .map(part => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-gray-400">Gerencie seus dados e preferências.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
        {[
            { id: 'perfil', label: 'Perfil', icon: UserIcon },
            { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
            { id: 'seguranca', label: 'Segurança', icon: Shield },
            { id: 'notificacoes', label: 'Notificações', icon: Bell },
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
                <tab.icon size={16} />
                {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-brand-surface border border-gray-800 rounded-xl p-6 md:p-8 animate-fadeIn">
          {activeTab === 'perfil' && (
            <>
                <div className="mb-8 border-b border-gray-800 pb-6">
                    <h2 className="text-lg font-bold text-white mb-1">Informações Pessoais</h2>
                </div>
                
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="h-24 w-24 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden flex items-center justify-center group-hover:border-[#3B82F6] transition-colors">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-[#3B82F6]">{getInitials(name)}</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#3B82F6] p-2 rounded-full text-white border-2 border-[#09090b] shadow-lg group-hover:scale-110 transition-transform">
                                <Camera size={16} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{name || 'Usuário'}</h3>
                            <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-800"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Nome Completo</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Departamento/Empresa</label>
                            <input 
                                type="text" 
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        {message && (
                            <span className="text-green-500 text-sm font-medium animate-fadeIn bg-green-500/10 px-3 py-2 rounded-lg">
                                {message}
                            </span>
                        )}
                        <Button type="submit" isLoading={saving} className="px-8">
                            Salvar
                        </Button>
                    </div>
                </form>
            </>
          )}

          {activeTab === 'assinatura' && (
              <div className="animate-fadeIn">
                  <Plans />
              </div>
          )}

          {activeTab !== 'perfil' && activeTab !== 'assinatura' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 bg-gray-900 rounded-full mb-4">
                      <Shield size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-gray-300 font-medium mb-1">Área Restrita</h3>
                  <p className="text-gray-500 text-sm">Contate o administrador para alterar estas configurações.</p>
              </div>
          )}
      </div>
    </div>
  );
};

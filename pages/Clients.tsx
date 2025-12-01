
import React, { useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Client } from '../types';
import { Search, Users, UserCheck, MoreVertical, X, Plus, DollarSign, Briefcase, Phone, Check, Edit2, FolderGit2, Trash2, AlertCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Feedback State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info', action?: () => void, actionLabel?: string} | null>(null);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempSalary, setTempSalary] = useState<string>('');

  // Undo State
  const [lastDeletedClient, setLastDeletedClient] = useState<Client | null>(null);

  // Delete Modal State
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      company: '', // Using as Department
      role: '',
      salary: '',
      phone: '',
      status: 'active'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
      if (notification) {
          const timer = setTimeout(() => setNotification(null), 5000); // 5s for undo chance
          return () => clearTimeout(timer);
      }
  }, [notification]);

  const fetchClients = () => {
      supabaseService.from('clients').select().then(({ data }) => {
          if (data) setClients(data as unknown as Client[]);
      });
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success', action?: () => void, actionLabel?: string) => {
      setNotification({ message, type, action, actionLabel });
  };

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      const newMember = {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          salary: parseFloat(formData.salary) || 0,
          phone: formData.phone,
          status: 'active',
          plan: 'Pro', // Default
          projects_count: 0
      };

      const { data } = await supabaseService.from('clients').insert([newMember]);
      
      if (data) {
          setClients([...clients, ...(data as unknown as Client[])]);
          setIsModalOpen(false);
          setFormData({ name: '', email: '', company: '', role: '', salary: '', phone: '', status: 'active' });
          showNotification('Membro adicionado com sucesso!');
      }
      
      setIsSaving(false);
  };

  // 1. Click Trigger - Opens Modal
  const handleRequestDelete = (client: Client, e: React.MouseEvent) => {
      e.stopPropagation();
      setClientToDelete(client);
  };

  // 2. Confirmation Action
  const confirmDelete = async () => {
      if (!clientToDelete) return;

      const id = clientToDelete.id;
      const clientName = clientToDelete.name;
      const clientSalary = clientToDelete.salary;

      // Close modal immediately
      setClientToDelete(null);
      
      // Salvar para desfazer
      setLastDeletedClient(clientToDelete);

      // Optimistic update - Remove visualmente agora
      const previousClients = [...clients];
      setClients(clients.filter(c => c.id !== id));
      
      const { error } = await supabaseService.from('clients').eq('id', id).delete();

      if (error) {
          setClients(previousClients); // Rollback se falhar
          showNotification('Erro ao excluir membro.', 'error');
      } else {
          const salarySaved = formatCurrency(clientSalary || 0);
          showNotification(
              `Membro removido. Economia mensal de ${salarySaved}.`, 
              'info', 
              () => handleUndoDelete(previousClients), 
              'Desfazer'
          );
      }
  };

  const handleUndoDelete = async (previousClients: Client[]) => {
      setClients(previousClients);
      if (lastDeletedClient) {
          // Re-insert into mock DB to allow persistence
          await supabaseService.from('clients').insert([lastDeletedClient]);
      }
      showNotification('Exclusão desfeita com sucesso.', 'success');
      setLastDeletedClient(null);
  };

  // Inline Salary Editing Functions
  const startEditing = (client: Client, e?: React.MouseEvent) => {
      if(e) e.stopPropagation();
      setEditingId(client.id);
      setTempSalary(client.salary?.toString() || '');
  };

  const cancelEditing = () => {
      setEditingId(null);
      setTempSalary('');
  };

  const saveSalary = async (id: string) => {
      const newSalary = parseFloat(tempSalary);
      if (isNaN(newSalary)) return;

      // Optimistic Update
      const updatedClients = clients.map(c => 
          c.id === id ? { ...c, salary: newSalary } : c
      );
      setClients(updatedClients);
      
      // Reset State
      setEditingId(null);

      // Call API (Mock)
      await supabaseService.from('clients').update({ salary: newSalary }).eq('id', id);
      showNotification('Salário atualizado.');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') saveSalary(id);
      if (e.key === 'Escape') cancelEditing();
  };

  const formatCurrency = (value?: number) => {
      if (value === undefined) return 'R$ -';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* Toast Notification */}
      {notification && (
          <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slideUp border border-white/10 ${
              notification.type === 'error' ? 'bg-red-500/90 text-white' : 
              notification.type === 'info' ? 'bg-gray-800 text-white border-indigo-500/50' :
              'bg-green-500/90 text-white'
          }`}>
              {notification.type === 'success' ? <CheckCircle2 size={20} /> : 
               notification.type === 'info' ? <Trash2 size={20} className="text-red-400" /> :
               <AlertCircle size={20} />}
              
              <div className="flex flex-col">
                  <span className="font-medium text-sm">{notification.message}</span>
              </div>

              {notification.action && (
                  <button 
                    onClick={notification.action}
                    className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                      <RotateCcw size={12} /> {notification.actionLabel}
                  </button>
              )}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-brand-surface border border-gray-800 p-6 rounded-xl flex items-center gap-4 animate-fadeIn">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <Users size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Membros</p>
                <h3 className="text-2xl font-bold text-white transition-all">{clients.length}</h3>
            </div>
        </div>
        <div className="bg-brand-surface border border-gray-800 p-6 rounded-xl flex items-center gap-4 animate-fadeIn">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
                <UserCheck size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Ativos Hoje</p>
                <h3 className="text-2xl font-bold text-white transition-all">{clients.filter(c => c.status === 'active').length}</h3>
            </div>
        </div>
         <div className="bg-brand-surface border border-gray-800 p-6 rounded-xl flex items-center gap-4 animate-fadeIn">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Folha Mensal</p>
                <h3 className="text-xl font-bold text-white transition-all">
                    {formatCurrency(clients.reduce((acc, curr) => acc + (curr.salary || 0), 0))}
                </h3>
            </div>
        </div>
      </div>

      <div className="bg-brand-surface border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar membro..."
                        className="bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:ring-[#3B82F6] focus:outline-none text-white"
                    />
                </div>
            </div>
            
            <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto text-sm font-bold shadow-none border-0">
                <Plus size={16} className="mr-2"/> Adicionar Membro
            </Button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-950 text-xs font-semibold text-gray-500 border-b border-gray-800">
                    <tr>
                        <th className="px-6 py-4">Nome / Cargo</th>
                        <th className="px-6 py-4">Departamento</th>
                        <th className="px-6 py-4">Contato</th>
                        <th className="px-6 py-4">Salário (Mensal)</th>
                        <th className="px-6 py-4 text-center">Projetos</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {clients.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-500">
                                Nenhum membro encontrado.
                            </td>
                        </tr>
                    )}
                    {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-800/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-gray-300 flex items-center justify-center font-bold text-xs uppercase">
                                        {client.name.substring(0,2)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{client.name}</div>
                                        <div className="text-xs text-indigo-400 font-medium">{client.role || 'Colaborador'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{client.company}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col text-xs">
                                    <span className="text-gray-300">{client.email}</span>
                                    <span className="text-gray-500">{client.phone || '-'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-300">
                                {editingId === client.id ? (
                                    <div className="flex items-center gap-2 animate-fadeIn">
                                        <span className="text-gray-500 text-xs">R$</span>
                                        <input 
                                            type="number" 
                                            value={tempSalary}
                                            onChange={(e) => setTempSalary(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, client.id)}
                                            className="bg-gray-900 border border-indigo-500 rounded px-2 py-1 w-24 text-white text-sm focus:outline-none"
                                            autoFocus
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <button 
                                            onClick={() => saveSalary(client.id)}
                                            className="p-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button 
                                            onClick={cancelEditing}
                                            className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={(e) => startEditing(client, e)}
                                        className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors border border-transparent hover:border-gray-700 rounded px-2 py-1 -ml-2 w-fit"
                                        title="Clique para editar salário"
                                    >
                                        {formatCurrency(client.salary)}
                                        <Edit2 size={12} className="opacity-0 group-hover:opacity-30" />
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 font-mono text-sm">
                                    <FolderGit2 size={14} className="text-indigo-500"/>
                                    {client.projects_count}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {client.status === 'active' && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Ativo
                                    </div>
                                )}
                                {client.status === 'inactive' && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Inativo
                                    </div>
                                )}
                                {client.status === 'pending' && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Pendente
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={(e) => startEditing(client, e)}
                                        className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleRequestDelete(client, e)}
                                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                          <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Excluir Membro?</h3>
                      <p className="text-gray-400 mb-6">
                          Tem certeza que deseja remover <strong>{clientToDelete.name}</strong> da equipe? 
                          Se houver pendências, o usuário será apenas desativado.
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <Button 
                            variant="secondary" 
                            className="w-full bg-gray-800 hover:bg-gray-700 border-gray-700" 
                            onClick={() => setClientToDelete(null)}
                          >
                              Cancelar
                          </Button>
                          <Button 
                            variant="danger" 
                            className="w-full"
                            onClick={confirmDelete}
                          >
                              Confirmar Exclusão
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Novo Membro da Equipe
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informações Pessoais</label>
                            <input 
                                type="text" 
                                placeholder="Nome Completo"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                                required
                            />
                            <input 
                                type="email" 
                                placeholder="E-mail Corporativo"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                                required
                            />
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Telefone / Celular"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dados Profissionais</label>
                            
                            <div className="relative mb-3">
                                <Briefcase size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Cargo / Função"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <input 
                                type="text" 
                                placeholder="Departamento / Setor"
                                value={formData.company}
                                onChange={e => setFormData({...formData, company: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                            />
                            
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-500 text-sm font-bold">R$</span>
                                <input 
                                    type="number" 
                                    placeholder="Salário Mensal"
                                    value={formData.salary}
                                    onChange={e => setFormData({...formData, salary: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" isLoading={isSaving}>Cadastrar Membro</Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
// Helper icon for Toast
const CheckCircle2 = ({size}: {size:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;

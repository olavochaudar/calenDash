
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import { Project } from '../types';
import { Button } from '../components/Button';
import { Plus, MoreHorizontal, Calendar as CalendarIcon, Clock, List, ChevronLeft, ChevronRight, GripVertical, Trash2, X, CheckCircle2, RotateCcw, AlertCircle, AlertTriangle } from 'lucide-react';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Reunião');
  const [eventDate, setEventDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Undo / Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info', action?: () => void, actionLabel?: string} | null>(null);
  const [lastDeletedEvent, setLastDeletedEvent] = useState<Project | null>(null);
  
  // Delete Confirmation State
  const [eventToDelete, setEventToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchEvents();
    const handleClickOutside = (event: MouseEvent) => {
        if (activeMenuId && !(event.target as Element).closest('.project-menu-container')) {
            setActiveMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  useEffect(() => {
      if (notification) {
          const timer = setTimeout(() => setNotification(null), 5000); // 5s to undo
          return () => clearTimeout(timer);
      }
  }, [notification]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabaseService.from('projects').select();
    if (data) setEvents(data as Project[]);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      const { data } = await supabaseService.from('projects').insert([{
          name: eventName,
          type: eventType,
          created_at: eventDate || new Date().toISOString(),
          status: 'scheduled'
      }]);
      if (data) setEvents([...events, ...data as Project[]]);
      setIsModalOpen(false);
      setIsSaving(false);
      setEventName('');
      setNotification({ message: 'Evento criado com sucesso!', type: 'success' });
  };

  const handleRequestDelete = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const event = events.find(ev => ev.id === id);
      if (event) {
          setEventToDelete(event);
          setActiveMenuId(null);
      }
  };

  const confirmDelete = async () => {
      if (!eventToDelete) return;
      
      const id = eventToDelete.id;
      setLastDeletedEvent(eventToDelete);
      setEventToDelete(null);

      // Optimistic Update
      const previousEvents = [...events];
      const updatedEvents = events.filter(evt => evt.id !== id);
      setEvents(updatedEvents);

      // Call API
      await supabaseService.from('projects').eq('id', id).delete();

      // Show Toast with Undo
      setNotification({
          message: 'Evento cancelado e movido para lixeira.',
          type: 'info',
          action: () => handleUndoDelete(previousEvents),
          actionLabel: 'Desfazer'
      });
  };

  const handleUndoDelete = async (previousEvents: Project[]) => {
      setEvents(previousEvents);
      if (lastDeletedEvent) {
          // Restore to API
          await supabaseService.from('projects').insert([lastDeletedEvent]);
      }
      setNotification({ message: 'Evento restaurado com sucesso.', type: 'success' });
      setLastDeletedEvent(null);
  };

  // --- Calendar Logic ---

  const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
      return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
      e.dataTransfer.setData("eventId", eventId);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, day: number) => {
      e.preventDefault();
      const eventId = e.dataTransfer.getData("eventId");
      
      // Calculate new date string (YYYY-MM-DD)
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Handle timezone offset simply by creating date at noon
      const newDateObj = new Date(year, month, day, 12, 0, 0);
      const newDateIso = newDateObj.toISOString();

      // Optimistic UI Update
      const updatedEvents = events.map(evt => {
          if (evt.id === eventId) {
              return { ...evt, created_at: newDateIso };
          }
          return evt;
      });
      setEvents(updatedEvents);

      // Backend Update
      await supabaseService.from('projects').update({ created_at: newDateIso }).eq('id', eventId);
  };

  const renderCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      
      const blanks = Array(firstDay).fill(null);
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      
      const allCells = [...blanks, ...days];
      
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

      return (
          <div className="bg-brand-surface border border-gray-800 rounded-xl overflow-hidden animate-fadeIn">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CalendarIcon size={20} className="text-indigo-500" />
                      {monthNames[month]} <span className="text-gray-500">{year}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                      <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                          <ChevronLeft size={20} />
                      </button>
                      <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                          Hoje
                      </button>
                      <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                          <ChevronRight size={20} />
                      </button>
                  </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-950">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                      <div key={d} className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {d}
                      </div>
                  ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 auto-rows-fr bg-gray-900">
                  {allCells.map((day, index) => {
                      if (!day) return <div key={`blank-${index}`} className="min-h-[120px] bg-gray-950/30 border-r border-b border-gray-800/50"></div>;

                      const dateKey = new Date(year, month, day).toDateString();
                      const isToday = new Date().toDateString() === dateKey;
                      
                      const dayEvents = events.filter(e => {
                          const eDate = new Date(e.created_at);
                          return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
                      });

                      return (
                          <div 
                            key={`day-${day}`} 
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day)}
                            className={`min-h-[120px] border-r border-b border-gray-800 p-2 relative group transition-colors hover:bg-gray-800/20 ${isToday ? 'bg-indigo-500/5' : ''}`}
                          >
                              <span className={`text-sm font-bold block mb-2 ${isToday ? 'text-indigo-400' : 'text-gray-400'}`}>
                                  {day}
                              </span>
                              
                              <div className="space-y-1.5">
                                  {dayEvents.map(evt => (
                                      <div 
                                        key={evt.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, evt.id)}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/projects/${evt.id}`); }}
                                        className={`
                                            text-[10px] px-2 py-1.5 rounded cursor-grab active:cursor-grabbing truncate shadow-sm hover:opacity-80 transition-opacity border-l-2 relative group/event
                                            ${evt.type === 'Reunião' ? 'bg-blue-500/20 text-blue-300 border-blue-500' : 
                                              evt.type === 'Deadline' ? 'bg-red-500/20 text-red-300 border-red-500' :
                                              evt.type === 'Pessoal' ? 'bg-green-500/20 text-green-300 border-green-500' :
                                              'bg-gray-700 text-gray-300 border-gray-500'}
                                        `}
                                        title={evt.name}
                                      >
                                          <div className="flex items-center gap-1 pr-4">
                                              {evt.status === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>}
                                              <span className="truncate">{evt.name}</span>
                                          </div>
                                          
                                          {/* Quick Delete in Calendar */}
                                          <button 
                                            onClick={(e) => handleRequestDelete(evt.id, e)}
                                            className="absolute right-0.5 top-0.5 p-0.5 text-current opacity-0 group-hover/event:opacity-100 hover:bg-black/20 rounded"
                                          >
                                              <X size={10} strokeWidth={3} />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                              
                              {/* Add Button on Hover */}
                              <button 
                                onClick={() => {
                                    setEventDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                                    setIsModalOpen(true);
                                }}
                                className="absolute top-2 right-2 p-1 text-gray-600 hover:text-white hover:bg-indigo-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                              >
                                  <Plus size={14} />
                              </button>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderStatusBadge = (status: string) => {
      const styles = {
          scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          completed: "bg-green-500/10 text-green-400 border-green-500/20",
          cancelled: "bg-red-500/10 text-red-400 border-red-500/20"
      };
      const labels = {
          scheduled: "Agendado",
          completed: "Concluído",
          cancelled: "Cancelado"
      };
      return (
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles]}`}>
              {labels[status as keyof typeof labels] || status}
          </span>
      );
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
          <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slideUp border border-white/10 ${
              notification.type === 'info' ? 'bg-gray-800 text-white border-red-500/50' :
              'bg-green-500/90 text-white'
          }`}>
              {notification.type === 'success' ? <CheckCircle2 size={20} /> : <Trash2 size={20} className="text-red-400" />}
              
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

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Minha Agenda</h1>
            <p className="text-gray-400">Gerencie seus próximos eventos e compromissos.</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-gray-900 p-1 rounded-lg border border-gray-800 flex items-center">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Lista"
                >
                    <List size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Calendário"
                >
                    <CalendarIcon size={18} />
                </button>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={18} className="mr-2" /> Novo Evento
            </Button>
        </div>
      </div>

      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-800 rounded-xl"></div>)}
          </div>
      ) : (
        <>
            {viewMode === 'calendar' ? (
                renderCalendar()
            ) : (
                <div className="grid grid-cols-1 gap-4 pb-20">
                    {events.length === 0 && (
                        <div className="text-center py-20 text-gray-500">Nenhum evento agendado.</div>
                    )}
                    {events.map((evt) => (
                        <div 
                        key={evt.id} 
                        onClick={() => navigate(`/projects/${evt.id}`)}
                        className="bg-brand-surface border border-gray-800 rounded-xl p-4 hover:border-indigo-500/40 hover:bg-gray-800/30 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group relative z-10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-900 rounded-lg border border-gray-700 text-gray-300">
                                    <span className="text-xs font-bold uppercase">{new Date(evt.created_at).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-bold">{new Date(evt.created_at).getDate()}</span>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{evt.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={14} /> 09:00 - 10:00</span>
                                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                        <span>{evt.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                {renderStatusBadge(evt.status)}
                                <div className="relative project-menu-container">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === evt.id ? null : evt.id); }}
                                        className={`p-2 rounded-lg transition-colors ${activeMenuId === evt.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                    
                                    {activeMenuId === evt.id && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeIn">
                                            <button 
                                                onClick={(e) => handleRequestDelete(evt.id, e)} 
                                                className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors text-sm font-medium"
                                            >
                                                <Trash2 size={16} /> Cancelar Evento
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                          <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Excluir Evento?</h3>
                      <p className="text-gray-400 mb-6">
                          Tem certeza que deseja remover <strong>{eventToDelete.name}</strong>?
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <Button 
                            variant="secondary" 
                            className="w-full bg-gray-800 hover:bg-gray-700 border-gray-700" 
                            onClick={() => setEventToDelete(null)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Adicionar Evento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Título do Evento"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                />
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="date" 
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select 
                        value={eventType}
                        onChange={e => setEventType(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option>Reunião</option>
                        <option>Deadline</option>
                        <option>Pessoal</option>
                        <option>Outros</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" isLoading={isSaving}>Agendar</Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

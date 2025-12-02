import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import { Project, Task } from '../types';
import { Button } from '../components/Button';
import {
  ArrowLeft,
  Save,
  Tag,
  MapPin,
  AlignLeft,
  CheckSquare,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  MoreVertical,
  ArrowDownUp,
  Filter,
} from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fields
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Project['status']>('scheduled');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  // Sorting & Filtering State
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>(
    'all'
  );
  const [taskSort, setTaskSort] = useState<'newest' | 'oldest' | 'az'>(
    'newest'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const { data } = await supabaseService
        .from('projects')
        .eq('id', id)
        .select();
      if (data && data[0]) {
        const p = data[0] as Project;
        setEvent(p);
        setDescription(p.brief || '');
        setNotes(p.content || '');
        setStatus(p.status);
        setTasks(p.tasks || []);
        setAttachments(p.attachments || []);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    await supabaseService
      .from('projects')
      .update({
        brief: description,
        content: notes,
        status,
        tasks,
        attachments,
      })
      .eq('id', event.id);

    // Update local state to ensure consistency
    setEvent((prev) =>
      prev
        ? {
            ...prev,
            brief: description,
            content: notes,
            status,
            tasks,
            attachments,
          }
        : null
    );
    setSaving(false);
  };

  // Task Logic
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText,
      completed: false,
      created_at: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const getVisibleTasks = () => {
    let result = [...tasks];

    // Filter
    if (taskFilter === 'pending') result = result.filter((t) => !t.completed);
    if (taskFilter === 'completed') result = result.filter((t) => t.completed);

    // Sort
    result.sort((a, b) => {
      if (taskSort === 'az') return a.text.localeCompare(b.text);
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return taskSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  };

  const visibleTasks = getVisibleTasks();

  // Image Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAttachments([...attachments, base64String]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const progress =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((t) => t.completed).length / tasks.length) * 100
        )
      : 0;

  if (loading)
    return (
      <div className='flex items-center justify-center h-[50vh] text-gray-500 animate-pulse'>
        Carregando workspace...
      </div>
    );
  if (!event)
    return (
      <div className='text-center text-gray-500 mt-20'>
        Evento não encontrado.
      </div>
    );

  return (
    <div className='space-y-6 pb-20'>
      {/* Header & Controls */}
      <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
        <button
          onClick={() => navigate('/projects')}
          className='flex items-center gap-2 text-gray-400 hover:text-white transition-colors'
        >
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className='flex items-center gap-3 w-full md:w-auto'>
          <div className='hidden md:block h-6 w-px bg-gray-800'></div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            className={`bg-gray-900 border border-gray-700 text-sm rounded-lg p-2.5 outline-none font-medium w-full md:w-auto
                    ${
                      status === 'scheduled'
                        ? 'text-blue-400'
                        : status === 'completed'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                `}
          >
            <option value='scheduled'>📅 Em Andamento</option>
            <option value='completed'>✅ Concluído</option>
            <option value='cancelled'>🚫 Cancelado</option>
          </select>
          <Button
            onClick={handleSave}
            isLoading={saving}
            className='whitespace-nowrap'
          >
            <Save size={16} className='mr-2' /> Salvar Alterações
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Event Title Card */}
          <div className='bg-brand-surface border border-gray-800 rounded-2xl p-6 relative overflow-hidden'>
            <div className='flex justify-between items-start mb-6'>
              <div>
                <div className='flex items-center gap-2 text-indigo-500 text-sm font-bold uppercase tracking-wider mb-2'>
                  <Tag size={14} /> {event.type}
                </div>
                <h1 className='text-3xl font-bold text-white'>{event.name}</h1>
              </div>
              <div className='flex flex-col items-end'>
                <div className='w-14 h-14 bg-gray-900 rounded-xl flex flex-col items-center justify-center border border-gray-700 text-gray-300 shadow-lg'>
                  <span className='text-[10px] font-bold uppercase'>
                    {new Date(event.created_at).toLocaleString('default', {
                      month: 'short',
                    })}
                  </span>
                  <span className='text-xl font-bold text-white'>
                    {new Date(event.created_at).getDate()}
                  </span>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <div className='flex justify-between text-xs text-gray-400 mb-1'>
                  <span>Progresso das Tarefas</span>
                  <span>{progress}%</span>
                </div>
                <div className='w-full bg-gray-800 rounded-full h-2'>
                  <div
                    className='bg-indigo-500 h-2 rounded-full transition-all duration-500'
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Checklist Section */}
          <div className='bg-brand-surface border border-gray-800 rounded-2xl p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
              <h3 className='text-xl font-bold text-white flex items-center gap-2'>
                <CheckSquare size={20} className='text-indigo-500' /> O Que Será
                Feito
              </h3>

              {/* Filter & Sort Controls */}
              <div className='flex items-center gap-2'>
                <div className='bg-gray-900 border border-gray-700 rounded-lg p-1 flex'>
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      taskFilter === 'all'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setTaskFilter('pending')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      taskFilter === 'pending'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      taskFilter === 'completed'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Feitas
                  </button>
                </div>

                <div className='relative'>
                  <div className='absolute inset-y-0 left-2 flex items-center pointer-events-none'>
                    <ArrowDownUp size={12} className='text-gray-500' />
                  </div>
                  <select
                    value={taskSort}
                    onChange={(e) => setTaskSort(e.target.value as any)}
                    className='bg-gray-900 border border-gray-700 text-xs rounded-lg py-1.5 pl-7 pr-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                  >
                    <option value='newest'>Recentes</option>
                    <option value='oldest'>Antigos</option>
                    <option value='az'>A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='space-y-3 mb-6'>
              {visibleTasks.length === 0 && (
                <div className='text-center py-8 border-2 border-dashed border-gray-800 rounded-xl'>
                  <p className='text-gray-500 text-sm'>
                    {tasks.length === 0
                      ? 'Nenhuma tarefa criada ainda.'
                      : 'Nenhuma tarefa encontrada neste filtro.'}
                  </p>
                </div>
              )}
              {visibleTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all group animate-slideUp ${
                    task.completed
                      ? 'bg-green-500/5 border-green-500/10'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-600 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && <CheckSquare size={14} />}
                  </button>
                  <div className='flex-1 min-w-0'>
                    <span
                      className={`block text-sm truncate ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-200'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className='text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} className='relative mt-2'>
              <input
                type='text'
                placeholder='Adicionar nova tarefa...'
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className='w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors group'
              />
              <button
                type='submit'
                disabled={!newTaskText.trim()}
                className='absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20'
              >
                <Plus size={18} />
              </button>
            </form>
          </div>

          {/* Details & Notes */}
          <div className='bg-brand-surface border border-gray-800 rounded-2xl p-6 space-y-6'>
            <div>
              <label className='text-sm font-bold text-gray-300 mb-2 flex items-center gap-2'>
                <AlignLeft size={16} /> Descrição Detalhada
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]'
                placeholder='Descreva os objetivos deste evento...'
              />
            </div>
            <div>
              <label className='text-sm font-bold text-gray-300 mb-2 flex items-center gap-2'>
                <MapPin size={16} /> Notas Adicionais / Local
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className='w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]'
                placeholder='Link da reunião, endereço físico ou observações...'
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className='space-y-6'>
          {/* Media Gallery */}
          <div className='bg-brand-surface border border-gray-800 rounded-2xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                <ImageIcon size={18} className='text-indigo-500' /> Galeria
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className='text-xs flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors'
              >
                <Upload size={12} /> Upload
              </button>
              <input
                type='file'
                ref={fileInputRef}
                className='hidden'
                accept='image/*'
                onChange={handleImageUpload}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {attachments.map((img, idx) => (
                <div
                  key={idx}
                  className='aspect-square rounded-xl relative group overflow-hidden border border-gray-800'
                >
                  <img
                    src={img}
                    alt={`attachment-${idx}`}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                    <button
                      onClick={() => window.open(img, '_blank')}
                      className='p-1.5 bg-gray-700 text-white rounded-full hover:bg-indigo-500'
                    >
                      <MoreVertical size={14} />
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      className='p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600'
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div
                onClick={() => fileInputRef.current?.click()}
                className='aspect-square rounded-xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-600 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer'
              >
                <Plus size={24} />
                <span className='text-xs font-medium mt-1'>Adicionar</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className='bg-brand-surface border border-gray-800 rounded-2xl p-6'>
            <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-4'>
              Detalhes
            </h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Prioridade</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase
                              ${
                                event.priority === 'high'
                                  ? 'bg-red-500/10 text-red-400'
                                  : event.priority === 'medium'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : 'bg-blue-500/10 text-blue-400'
                              }
                          `}
                >
                  {event.priority === 'high'
                    ? 'Alta'
                    : event.priority === 'medium'
                    ? 'Média'
                    : 'Baixa'}
                </span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Criado em</span>
                <span className='text-gray-300'>
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

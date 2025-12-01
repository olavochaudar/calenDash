
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  company?: string;
  phone?: string;
  department?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string; // Event Title
  type: string; // e.g., 'Reunião', 'Deadline', 'Evento'
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string; // Event Date
  brief?: string;   // Description
  content?: string; // Notes/Agenda
  priority?: 'low' | 'medium' | 'high';
  tasks?: Task[];
  attachments?: string[]; // Array of image URLs
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock: number;
  created_at?: string;
}

export interface Template {
  id: number;
  title: string;
  category: string;
  image_url: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  popularity: number; // 0-100
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string; // Acts as Department
  role?: string;   // Job Title
  phone?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'pending';
  plan: 'Basic' | 'Pro' | 'Enterprise'; // Can be used as Level (Junior, Senior, etc)
  projects_count: number;
  created_at: string;
  last_activity?: string;
}

export interface KpiData {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down';
}

export interface ChartData {
  name: string;
  value: number;
  secondary: number;
}

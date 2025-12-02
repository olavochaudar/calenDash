import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'ERRO: Variáveis de ambiente SUPABASE_URL ou SUPABASE_KEY não encontradas.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Exporta usando o padrão moderno
export default supabase;

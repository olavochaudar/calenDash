import express from 'express';
import cors from 'cors';
import supabase from './config/supabaseClient.js'; // <-- Obrigatório ter o .js no final

const app = express();

app.use(cors());
app.use(express.json());

// Rota 1: Teste simples
app.get('/', (req, res) => {
  res.send('🚀 Servidor Moderno (ESM) rodando!');
});

// Rota 2: Teste do Banco de Dados
app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase
    .from('products') // Certifique-se que essa tabela existe no Supabase
    .select('*')
    .limit(5);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json({ mensagem: 'Conexão Supabase OK!', dados: data });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesse: http://localhost:${PORT}`);
});

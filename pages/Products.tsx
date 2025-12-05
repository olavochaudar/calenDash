import React, { useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Product } from '../types';
import { Button } from '../components/Button';
import {
  Search,
  Plus,
  Package,
  DollarSign,
  AlertTriangle,
  X,
  Pencil,
  Trash2,
  Download,
} from 'lucide-react';

// Chave única para garantir que não pegue lixo antigo do navegador
const STORAGE_KEY = 'calendash_products_prod_v1';

export const Products: React.FC = () => {
  // 1. INICIALIZAÇÃO ROBUSTA
  // Carrega imediatamente do localStorage ao montar o componente.
  // Se não tiver nada, inicia com array vazio []. NADA de dados fictícios.
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao ler cache local:', error);
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_price: '',
    sale_price: '',
    current_stock: '',
    min_stock: '5',
  });

  // 2. PERSISTÊNCIA AUTOMÁTICA (Obrigatorio)
  // Qualquer mudança em 'products' é salva instantaneamente no navegador
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // 3. SINCRONIZAÇÃO EM SEGUNDO PLANO (Opcional)
  // Tenta buscar do banco, mas mescla com inteligência
  useEffect(() => {
    const syncSupabase = async () => {
      try {
        const { data, error } = await supabaseService.from('products').select();
        if (data && !error && data.length > 0) {
          // Aqui você pode decidir: ou o banco manda em tudo, ou o local manda.
          // Por segurança, vamos atualizar o local apenas se o banco tiver dados reais.
          setProducts(data as Product[]);
        }
      } catch (e) {
        // Silencioso: se der erro, o usuário continua usando o LocalStorage sem saber.
        console.log('Modo offline ou erro de conexão. Usando dados locais.');
      }
    };
    syncSupabase();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validação de segurança
    const stock = parseInt(formData.current_stock) || 0;
    const cost = parseFloat(formData.cost_price) || 0;
    const sale = parseFloat(formData.sale_price) || 0;
    const minStock = parseInt(formData.min_stock) || 0;

    if (stock < 0) {
      alert('O estoque não pode ser negativo.');
      setIsSaving(false);
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      cost_price: cost,
      sale_price: sale,
      current_stock: stock,
      min_stock: minStock,
    };

    try {
      if (editingId) {
        // --- EDITAR ---
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...productData } : p))
        );
        // Sync assíncrono (não bloqueia a UI)
        supabaseService
          .from('products')
          .update(productData)
          .eq('id', editingId)
          .then();
      } else {
        // --- CRIAR ---
        const newId = crypto.randomUUID();
        const newProduct = {
          id: newId,
          ...productData,
          created_at: new Date().toISOString(),
        } as Product;

        setProducts((prev) => [...prev, newProduct]);
        // Sync assíncrono
        supabaseService.from('products').insert([productData]).then();
      }
      closeModal();
    } catch (error) {
      console.error('Erro crítico ao salvar:', error);
    }

    setIsSaving(false);
  };

  const handleEdit = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      cost_price: product.cost_price.toString(),
      sale_price: product.sale_price.toString(),
      current_stock: product.current_stock.toString(),
      min_stock: product.min_stock.toString(),
    });
    setIsModalOpen(true);
  };

  const handleRequestDelete = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.id;

    // Remove instantaneamente da UI e do LocalStorage
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setProductToDelete(null);

    // Sync assíncrono com banco
    supabaseService.from('products').eq('id', id).delete().then();
  };

  const handleExport = () => {
    const headers = [
      'ID,Nome,Descrição,Custo,Venda,Estoque,Estoque Mínimo,Status',
    ];
    const csvRows = products.map((p) => {
      const status = p.current_stock <= p.min_stock ? 'BAIXO' : 'OK';
      return `${p.id},"${p.name}","${p.description || ''}",${p.cost_price},${
        p.sale_price
      },${p.current_stock},${p.min_stock},${status}`;
    });
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'produtos_calendash.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      cost_price: '',
      sale_price: '',
      current_stock: '',
      min_stock: '5',
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='space-y-8 pb-10 animate-in fade-in duration-500'>
      {/* Cabeçalho */}
      <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-white mb-2'>
            Gestão de Produtos
          </h1>
          <p className='text-gray-400'>Controle de estoque e precificação.</p>
        </div>
        <div className='flex gap-3'>
          <Button variant='secondary' onClick={handleExport}>
            <Download size={18} className='mr-2' /> Exportar CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className='mr-2' /> Novo Produto
          </Button>
        </div>
      </div>

      {/* Métricas (Calculadas em tempo real baseadas no estado 'products') */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-brand-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4'>
          <div className='p-3 bg-indigo-500/10 text-indigo-500 rounded-lg'>
            <Package size={24} />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-bold'>
              Total Itens
            </p>
            <h3 className='text-2xl font-bold text-white'>{products.length}</h3>
          </div>
        </div>
        <div className='bg-brand-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4'>
          <div className='p-3 bg-green-500/10 text-green-500 rounded-lg'>
            <DollarSign size={24} />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-bold'>
              Valor em Estoque
            </p>
            <h3 className='text-2xl font-bold text-white'>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(
                products.reduce(
                  (acc, p) =>
                    acc + (p.cost_price || 0) * (p.current_stock || 0),
                  0
                )
              )}
            </h3>
          </div>
        </div>
        <div className='bg-brand-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4'>
          <div className='p-3 bg-red-500/10 text-red-500 rounded-lg'>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-bold'>
              Estoque Baixo
            </p>
            <h3 className='text-2xl font-bold text-white'>
              {products.filter((p) => p.current_stock <= p.min_stock).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Busca e Tabela */}
      <div className='bg-brand-surface border border-gray-800 rounded-xl overflow-hidden'>
        <div className='p-4 border-b border-gray-800'>
          <div className='relative w-full md:w-64'>
            <Search
              className='absolute left-3 top-2.5 text-gray-500'
              size={18}
            />
            <input
              type='text'
              placeholder='Buscar produto...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500'
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-gray-400'>
            <thead className='bg-gray-900 text-xs uppercase text-gray-500'>
              <tr>
                <th className='px-6 py-4'>Nome</th>
                <th className='px-6 py-4'>Custo</th>
                <th className='px-6 py-4'>Venda</th>
                <th className='px-6 py-4 text-center'>Estoque</th>
                <th className='px-6 py-4 text-center'>Status</th>
                <th className='px-6 py-4 text-right'>Ações</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-800'>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    {search
                      ? 'Nenhum produto encontrado na busca.'
                      : 'Nenhum produto cadastrado. Adicione um novo!'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className='hover:bg-gray-800/30 transition-colors group'
                  >
                    <td className='px-6 py-4'>
                      <div className='text-white font-medium'>
                        {product.name}
                      </div>
                      <div className='text-xs text-gray-500 truncate max-w-[200px]'>
                        {product.description}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      R$ {(product.cost_price || 0).toFixed(2)}
                    </td>
                    <td className='px-6 py-4 font-bold text-white'>
                      R$ {(product.sale_price || 0).toFixed(2)}
                    </td>
                    <td className='px-6 py-4 text-center font-mono'>
                      {product.current_stock}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      {product.current_stock <= product.min_stock ? (
                        <span className='bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/20'>
                          BAIXO
                        </span>
                      ) : (
                        <span className='bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20'>
                          OK
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={(e) => handleEdit(product, e)}
                          className='p-1.5 hover:bg-indigo-500/20 text-gray-500 hover:text-indigo-400 rounded-lg transition-colors'
                          title='Editar'
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => handleRequestDelete(product, e)}
                          className='p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors'
                          title='Excluir'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300'>
          <div className='bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative'>
            <div className='flex flex-col items-center text-center'>
              <div className='w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500'>
                <AlertTriangle size={32} />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                Excluir Produto?
              </h3>
              <p className='text-gray-400 mb-6'>
                Tem certeza que deseja remover{' '}
                <strong>{productToDelete.name}</strong>? Esta ação não pode ser
                desfeita.
              </p>

              <div className='flex gap-3 w-full'>
                <Button
                  variant='secondary'
                  className='w-full bg-gray-800 hover:bg-gray-700 border-gray-700'
                  onClick={() => setProductToDelete(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant='danger'
                  className='w-full'
                  onClick={confirmDelete}
                >
                  Confirmar Exclusão
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300'>
          <div className='bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative'>
            <button
              onClick={closeModal}
              className='absolute top-4 right-4 text-gray-500 hover:text-white transition-colors'
            >
              <X size={24} />
            </button>
            <h2 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
              <Package size={20} className='text-indigo-500' />
              {editingId ? 'Editar Produto' : 'Cadastrar Produto'}
            </h2>

            <form onSubmit={handleSave} className='space-y-4'>
              <div>
                <label className='block text-xs font-bold text-gray-400 mb-1'>
                  Nome do Produto
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none'
                  required
                  placeholder='Ex: Teclado Mecânico'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-gray-400 mb-1'>
                  Descrição
                </label>
                <input
                  type='text'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none'
                  placeholder='Detalhes opcionais'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-bold text-gray-400 mb-1'>
                    Preço de Custo (R$)
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_price: e.target.value })
                    }
                    className='w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none'
                    required
                    placeholder='0.00'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-gray-400 mb-1'>
                    Preço de Venda (R$)
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.sale_price}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_price: e.target.value })
                    }
                    className='w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none'
                    required
                    placeholder='0.00'
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-bold text-gray-400 mb-1'>
                    Estoque Atual
                  </label>
                  <input
                    type='number'
                    value={formData.current_stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_stock: e.target.value,
                      })
                    }
                    className='w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none'
                    required
                    placeholder='0'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-gray-400 mb-1'>
                    Estoque Mínimo
                  </label>
                  <input
                    type='number'
                    value={formData.min_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, min_stock: e.target.value })
                    }
                    className='w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none'
                    placeholder='5'
                  />
                </div>
              </div>

              <div className='pt-4 flex justify-end gap-3'>
                <Button type='button' variant='ghost' onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type='submit' isLoading={isSaving}>
                  {editingId ? 'Salvar Alterações' : 'Salvar Produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

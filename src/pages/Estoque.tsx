import React, { useState, useEffect } from 'react';
import { Package, TrendingDown, TrendingUp, AlertTriangle, Search, Plus, Minus, Edit, History, Filter } from 'lucide-react';
import { estoqueService, EstoqueComProduto, MovimentacaoEstoque } from '../services/estoqueService';

export default function Estoque() {
  const [estoque, setEstoque] = useState<EstoqueComProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovimentacoesModal, setShowMovimentacoesModal] = useState(false);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EstoqueComProduto | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [ajusteForm, setAjusteForm] = useState({
    quantidade: 0,
    motivo: '',
    tipo: 'ajuste' as 'ajuste' | 'entrada' | 'saida'
  });
  const [relatorio, setRelatorio] = useState<any>(null);

  useEffect(() => {
    loadEstoque();
    loadRelatorio();
  }, []);

  const loadEstoque = async () => {
    try {
      setLoading(true);
      const data = await estoqueService.listar();
      setEstoque(data);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatorio = async () => {
    try {
      const data = await estoqueService.buscarRelatorioEstoque();
      setRelatorio(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    }
  };

  const handleViewMovimentacoes = async (produtoId: string) => {
    try {
      const data = await estoqueService.listarMovimentacoes(produtoId);
      setMovimentacoes(data);
      setShowMovimentacoesModal(true);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const handleAjuste = async (produto: EstoqueComProduto) => {
    setSelectedProduct(produto);
    setAjusteForm({
      quantidade: 0,
      motivo: '',
      tipo: 'ajuste'
    });
    setShowAjusteModal(true);
  };

  const handleEntrada = async (produto: EstoqueComProduto) => {
    setSelectedProduct(produto);
    setAjusteForm({
      quantidade: 0,
      motivo: '',
      tipo: 'entrada'
    });
    setShowAjusteModal(true);
  };

  const handleSaida = async (produto: EstoqueComProduto) => {
    setSelectedProduct(produto);
    setAjusteForm({
      quantidade: 0,
      motivo: '',
      tipo: 'saida'
    });
    setShowAjusteModal(true);
  };

  const submitAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await estoqueService.atualizarEstoque(
        selectedProduct.produto_id,
        ajusteForm.quantidade,
        ajusteForm.tipo,
        ajusteForm.motivo
      );

      setShowAjusteModal(false);
      setSelectedProduct(null);
      setAjusteForm({ quantidade: 0, motivo: '', tipo: 'ajuste' });
      loadEstoque();
      loadRelatorio();
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
    }
  };

  const getEstoqueStatus = (produto: EstoqueComProduto) => {
    if (!produto.produto.controla_estoque) {
      return { color: 'bg-gray-100 text-gray-800', icon: Package, text: 'Não controla' };
    }

    if (produto.quantidade_disponivel <= 0) {
      return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Sem estoque' };
    }

    if (produto.quantidade_disponivel <= produto.produto.estoque_minimo) {
      return { color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown, text: 'Estoque baixo' };
    }

    return { color: 'bg-green-100 text-green-800', icon: TrendingUp, text: 'OK' };
  };

  const filteredEstoque = estoque.filter(item =>
    item.produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Controle de Estoque</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMovimentacoesModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <History className="h-5 w-5" />
            Histórico
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {relatorio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Produtos</p>
                <p className="text-2xl font-bold">{relatorio.total_produtos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Valor em Estoque</p>
                <p className="text-2xl font-bold">R$ {relatorio.valor_total_estoque.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{relatorio.produtos_sem_estoque}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{relatorio.produtos_estoque_baixo}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponível
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reservado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEstoque.map((item) => {
              const status = getEstoqueStatus(item);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.produto.imagem_url && (
                        <img
                          src={item.produto.imagem_url}
                          alt={item.produto.nome}
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.produto.nome}</div>
                        <div className="text-sm text-gray-500">{item.produto.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantidade_disponivel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantidade_reservada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.quantidade_total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                      <div className="flex items-center">
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.text}
                      </div>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewMovimentacoes(item.produto_id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Histórico"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEntrada(item)}
                        className="text-green-600 hover:text-green-900"
                        title="Dar entrada"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSaida(item)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Dar saída"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAjuste(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Ajustar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Movimentações Modal */}
      {showMovimentacoesModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Histórico de Movimentações</h2>
              <button
                onClick={() => setShowMovimentacoesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td className="px-4 py-2 text-sm">
                        {new Date(mov.data_movimentacao).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mov.tipo_movimentacao === 'entrada' ? 'bg-green-100 text-green-800' :
                          mov.tipo_movimentacao === 'saida' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {mov.tipo_movimentacao}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{mov.produto?.nome}</td>
                      <td className="px-4 py-2 text-sm">{mov.quantidade}</td>
                      <td className="px-4 py-2 text-sm">{mov.usuarios?.nome}</td>
                      <td className="px-4 py-2 text-sm">{mov.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowMovimentacoesModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ajuste Modal */}
      {showAjusteModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {ajusteForm.tipo === 'ajuste' ? 'Ajustar Estoque' : 
                 ajusteForm.tipo === 'entrada' ? 'Dar Entrada' : 'Dar Saída'}
              </h2>
              <button
                onClick={() => setShowAjusteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitAjuste} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Produto: {selectedProduct.produto.nome}
                </label>
                <p className="text-sm text-gray-500">SKU: {selectedProduct.produto.sku}</p>
                <p className="text-sm text-gray-500">
                  Estoque atual: {selectedProduct.quantidade_disponivel}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ajusteForm.quantidade}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, quantidade: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Motivo *
                </label>
                <textarea
                  required
                  value={ajusteForm.motivo}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, motivo: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder={ajusteForm.tipo === 'ajuste' ? 'Motivo do ajuste' :
                          ajusteForm.tipo === 'entrada' ? 'Motivo da entrada' : 'Motivo da saída'}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAjusteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

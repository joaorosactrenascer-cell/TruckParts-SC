import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingCart, Package, DollarSign, Calendar, CheckCircle, Clock, Truck, Eye } from 'lucide-react';
import { pedidosService, Pedido, PedidoCompleto } from '../services/pedidosService';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PedidoCompleto | null>(null);
  const [showItemsModal, setShowItemsModal] = useState(false);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      let data;
      if (statusFilter === 'todos') {
        data = await pedidosService.listar();
      } else {
        data = await pedidosService.listarPorStatus(statusFilter);
      }
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await pedidosService.buscarPorId(orderId);
      setSelectedOrder(order);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Pedido['status']) => {
    try {
      await pedidosService.atualizarStatus(orderId, newStatus);
      loadPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'confirmado': return 'bg-blue-100 text-blue-800';
      case 'em_separacao': return 'bg-yellow-100 text-yellow-800';
      case 'faturado': return 'bg-purple-100 text-purple-800';
      case 'enviado': return 'bg-indigo-100 text-indigo-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return <Clock className="h-4 w-4" />;
      case 'confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'em_separacao': return <Package className="h-4 w-4" />;
      case 'faturado': return <DollarSign className="h-4 w-4" />;
      case 'enviado': return <Truck className="h-4 w-4" />;
      case 'entregue': return <CheckCircle className="h-4 w-4" />;
      case 'cancelado': return <Trash2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = pedidos.filter(pedido =>
    pedido.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <button
          onClick={() => window.location.href = '/novo-pedido'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <ShoppingCart className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_separacao">Em Separação</option>
            <option value="faturado">Faturado</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
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
            {filteredOrders.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {pedido.numero_pedido || `#${pedido.id.slice(-8)}`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pedido.cliente?.nome || 'Cliente não encontrado'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {pedido.valor_total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pedido.status)}`}>
                      <div className="flex items-center">
                        {getStatusIcon(pedido.status)}
                        <span className="ml-1">
                          {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                        </span>
                      </div>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewOrder(pedido.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver Detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.location.href = `/editar-pedido/${pedido.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalhes do Pedido</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Order Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informações do Pedido</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Número:</span>
                      <p className="font-medium">{selectedOrder.numero_pedido || `#${selectedOrder.id.slice(-8)}`}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Data:</span>
                      <p className="font-medium">{new Date(selectedOrder.data_pedido).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <div className="inline-flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          <div className="flex items-center">
                            {getStatusIcon(selectedOrder.status)}
                            <span className="ml-1">
                              {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                            </span>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Nome:</span>
                        <p className="font-medium">{selectedOrder.cliente?.nome}</p>
                      </div>
                      {selectedOrder.cliente?.email && (
                        <div>
                          <span className="text-sm text-gray-500">Email:</span>
                          <p className="font-medium">{selectedOrder.cliente.email}</p>
                        </div>
                      )}
                      {selectedOrder.cliente?.telefone && (
                        <div>
                          <span className="text-sm text-gray-500">Telefone:</span>
                          <p className="font-medium">{selectedOrder.cliente.telefone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <p className="text-xl font-bold">R$ {selectedOrder.subtotal.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Desconto</span>
                  <p className="text-xl font-bold text-red-600">-R$ {selectedOrder.desconto.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Frete</span>
                  <p className="text-xl font-bold">R$ {selectedOrder.valor_frete.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-700">Total</span>
                  <p className="text-xl font-bold text-green-600">R$ {selectedOrder.valor_total.toFixed(2)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Itens do Pedido</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.itens?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              {item.produto?.imagem_url && (
                                <img
                                  src={item.produto.imagem_url}
                                  alt={item.produto.nome}
                                  className="h-8 w-8 rounded mr-2 object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm">{item.produto?.nome}</p>
                                <p className="text-xs text-gray-500">{item.produto?.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">{item.quantidade}</td>
                          <td className="px-4 py-2 text-sm">R$ {item.preco_unitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium">R$ {item.valor_total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments */}
              {selectedOrder.pagamentos && selectedOrder.pagamentos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Pagamentos</h3>
                  <div className="space-y-2">
                    {selectedOrder.pagamentos.map((pagamento) => (
                      <div key={pagamento.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-500">{pagamento.forma_pagamento}</span>
                          <p className="font-medium">R$ {pagamento.valor_pago.toFixed(2)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          pagamento.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pagamento.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                onClick={() => window.location.href = `/editar-pedido/${selectedOrder.id}`}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Editar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

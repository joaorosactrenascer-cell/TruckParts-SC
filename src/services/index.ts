// Export all services for easy importing
export { produtosService } from './produtosService';
export { clientesService } from './clientesService';
export { pedidosService } from './pedidosService';
export { estoqueService } from './estoqueService';

// Export types
export type { Produto, ProdutoComEstoque } from './produtosService';
export type { Cliente, ClienteComEnderecos } from './clientesService';
export type { Pedido, ItemPedido, PedidoCompleto } from './pedidosService';
export type { Estoque, MovimentacaoEstoque, EstoqueComProduto } from './estoqueService';

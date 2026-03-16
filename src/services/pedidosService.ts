import { supabase } from '../lib/supabase';

export interface Pedido {
  id: string;
  empresa_id: string;
  cliente_id: string;
  numero_pedido?: string;
  status: 'rascunho' | 'confirmado' | 'em_separacao' | 'faturado' | 'enviado' | 'entregue' | 'cancelado';
  data_pedido: string;
  data_entrega_prevista?: string;
  data_entrega_real?: string;
  subtotal: number;
  desconto: number;
  valor_frete: number;
  valor_impostos: number;
  valor_total: number;
  forma_pagamento?: string;
  condicao_pagamento?: string;
  observacoes?: string;
  vendedor_id?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ItemPedido {
  id: string;
  empresa_id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  desconto: number;
  valor_total: number;
  data_criacao: string;
}

export interface PedidoCompleto extends Pedido {
  cliente: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  itens: Array<{
    id: string;
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    desconto: number;
    valor_total: number;
    produto: {
      id: string;
      nome: string;
      sku: string;
      imagem_url?: string;
    };
  }>;
  pagamentos: Array<{
    id: string;
    forma_pagamento: string;
    valor_pago: number;
    data_pagamento: string;
    status: string;
  }>;
}

class PedidosService {
  async listar(): Promise<Pedido[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes(nome, email, telefone)
        `)
        .order('data_pedido', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<PedidoCompleto | null> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes(*),
          itens_pedido(
            *,
            produtos(nome, sku, imagem_url)
          ),
          pagamentos(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

  async criar(pedido: Omit<Pedido, 'id' | 'numero_pedido' | 'data_criacao' | 'data_atualizacao'>): Promise<Pedido> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  async editar(id: string, pedido: Partial<Pedido>): Promise<Pedido> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({
          ...pedido,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao editar pedido:', error);
      throw error;
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  }

  async adicionarItem(item: Omit<ItemPedido, 'id' | 'data_criacao'>): Promise<ItemPedido> {
    try {
      const { data, error } = await supabase
        .from('itens_pedido')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar item ao pedido:', error);
      throw error;
    }
  }

  async editarItem(id: string, item: Partial<ItemPedido>): Promise<ItemPedido> {
    try {
      const { data, error } = await supabase
        .from('itens_pedido')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao editar item do pedido:', error);
      throw error;
    }
  }

  async removerItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover item do pedido:', error);
      throw error;
    }
  }

  async listarPorStatus(status: string): Promise<Pedido[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes(nome, email, telefone)
        `)
        .eq('status', status)
        .order('data_pedido', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar pedidos por status:', error);
      throw error;
    }
  }

  async listarPorCliente(clienteId: string): Promise<Pedido[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes(nome, email, telefone)
        `)
        .eq('cliente_id', clienteId)
        .order('data_pedido', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar pedidos do cliente:', error);
      throw error;
    }
  }

  async atualizarStatus(id: string, status: Pedido['status']): Promise<Pedido> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({
          status,
          data_atualizacao: new Date().toISOString(),
          data_entrega_real: status === 'entregue' ? new Date().toISOString() : undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  async registrarPagamento(pedidoId: string, pagamento: {
    forma_pagamento: string;
    valor_pago: number;
    status?: string;
    codigo_transacao?: string;
    gateway_pagamento?: string;
    observacoes?: string;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert({
          ...pagamento,
          pedido_id: pedidoId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  }

  async buscarResumoVendas(dataInicio: string, dataFim: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('resumo_vendas', {
          p_data_inicio: dataInicio,
          p_data_fim: dataFim
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo de vendas:', error);
      throw error;
    }
  }

  async calcularTotalPedido(pedidoId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calcular_total_pedido', {
          p_pedido_id: pedidoId
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Erro ao calcular total do pedido:', error);
      throw error;
    }
  }
}

export const pedidosService = new PedidosService();

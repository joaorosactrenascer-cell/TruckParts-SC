import { supabase } from '../lib/supabase';

export interface Estoque {
  id: string;
  empresa_id: string;
  produto_id: string;
  quantidade_disponivel: number;
  quantidade_reservada: number;
  quantidade_total: number;
  localizacao?: string;
  data_ultima_atualizacao: string;
}

export interface MovimentacaoEstoque {
  id: string;
  empresa_id: string;
  produto_id: string;
  tipo_movimentacao: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_posterior: number;
  motivo?: string;
  documento_referencia?: string;
  usuario_id?: string;
  data_movimentacao: string;
}

export interface EstoqueComProduto extends Estoque {
  produto: {
    id: string;
    nome: string;
    sku: string;
    imagem_url?: string;
    controla_estoque: boolean;
    estoque_minimo: number;
  };
}

class EstoqueService {
  async listar(): Promise<EstoqueComProduto[]> {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select(`
          *,
          produtos(nome, sku, imagem_url, controla_estoque, estoque_minimo)
        `)
        .order('data_ultima_atualizacao', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar estoque:', error);
      throw error;
    }
  }

  async buscarPorProduto(produtoId: string): Promise<Estoque | null> {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('produto_id', produtoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar estoque do produto:', error);
      throw error;
    }
  }

  async atualizarEstoque(
    produtoId: string,
    quantidade: number,
    tipo: 'entrada' | 'saida' | 'ajuste',
    motivo?: string,
    documento?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('atualizar_estoque', {
          p_produto_id: produtoId,
          p_quantidade: quantidade,
          p_tipo_movimentacao: tipo,
          p_motivo: motivo,
          p_documento_referencia: documento
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }

  async listarMovimentacoes(produtoId?: string, limite: number = 50): Promise<MovimentacaoEstoque[]> {
    try {
      let query = supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          usuarios(nome),
          produtos(nome, sku)
        `)
        .order('data_movimentacao', { ascending: false })
        .limit(limite);

      if (produtoId) {
        query = query.eq('produto_id', produtoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      throw error;
    }
  }

  async listarEstoqueBaixo(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('produtos_estoque_baixo');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar produtos com estoque baixo:', error);
      throw error;
    }
  }

  async verificarDisponibilidade(produtoId: string, quantidade: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('verificar_disponibilidade_produto', {
          p_produto_id: produtoId,
          p_quantidade: quantidade
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }

  async reservarEstoque(produtoId: string, quantidade: number, motivo: string): Promise<void> {
    try {
      await this.atualizarEstoque(
        produtoId,
        quantidade,
        'saida',
        `Reserva: ${motivo}`,
        'RESERVA'
      );
    } catch (error) {
      console.error('Erro ao reservar estoque:', error);
      throw error;
    }
  }

  async liberarEstoque(produtoId: string, quantidade: number, motivo: string): Promise<void> {
    try {
      await this.atualizarEstoque(
        produtoId,
        quantidade,
        'entrada',
        `Liberação: ${motivo}`,
        'LIBERACAO'
      );
    } catch (error) {
      console.error('Erro ao liberar estoque:', error);
      throw error;
    }
  }

  async ajustarEstoque(produtoId: string, quantidade: number, motivo: string): Promise<void> {
    try {
      await this.atualizarEstoque(
        produtoId,
        quantidade,
        'ajuste',
        motivo,
        'AJUSTE'
      );
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      throw error;
    }
  }

  async darEntradaEstoque(
    produtoId: string,
    quantidade: number,
    motivo: string,
    documento?: string
  ): Promise<void> {
    try {
      await this.atualizarEstoque(
        produtoId,
        quantidade,
        'entrada',
        motivo,
        documento
      );
    } catch (error) {
      console.error('Erro ao dar entrada no estoque:', error);
      throw error;
    }
  }

  async darSaidaEstoque(
    produtoId: string,
    quantidade: number,
    motivo: string,
    documento?: string
  ): Promise<void> {
    try {
      await this.atualizarEstoque(
        produtoId,
        quantidade,
        'saida',
        motivo,
        documento
      );
    } catch (error) {
      console.error('Erro ao dar saída no estoque:', error);
      throw error;
    }
  }

  async buscarRelatorioEstoque(): Promise<{
    total_produtos: number;
    valor_total_estoque: number;
    produtos_sem_estoque: number;
    produtos_estoque_baixo: number;
  }> {
    try {
      // Get total products
      const { data: totalProdutos, error: error1 } = await supabase
        .from('produtos')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true);

      // Get total inventory value
      const { data: estoqueComProdutos, error: error2 } = await supabase
        .from('estoque')
        .select(`
          quantidade_disponivel,
          produtos!inner(preco_venda)
        `);

      // Get products without stock
      const { data: semEstoque, error: error3 } = await supabase
        .from('estoque')
        .select('produto_id')
        .lte('quantidade_disponivel', 0);

      // Get products with low stock
      const { data: estoqueBaixo, error: error4 } = await supabase
        .rpc('produtos_estoque_baixo');

      if (error1 || error2 || error3 || error4) {
        throw new Error('Erro ao gerar relatório de estoque');
      }

      const valorTotalEstoque = estoqueComProdutos?.reduce((total, item: any) => {
        return total + (item.quantidade_disponivel * item.produtos.preco_venda);
      }, 0) || 0;

      return {
        total_produtos: (totalProdutos as any)?.[0]?.count || 0,
        valor_total_estoque: valorTotalEstoque,
        produtos_sem_estoque: semEstoque?.length || 0,
        produtos_estoque_baixo: estoqueBaixo?.length || 0
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de estoque:', error);
      throw error;
    }
  }

  async buscarHistoricoMovimentacoes(
    produtoId: string,
    dataInicio?: string,
    dataFim?: string
  ): Promise<MovimentacaoEstoque[]> {
    try {
      let query = supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          usuarios(nome),
          produtos(nome, sku)
        `)
        .eq('produto_id', produtoId)
        .order('data_movimentacao', { ascending: false });

      if (dataInicio) {
        query = query.gte('data_movimentacao', dataInicio);
      }

      if (dataFim) {
        query = query.lte('data_movimentacao', dataFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de movimentações:', error);
      throw error;
    }
  }
}

export const estoqueService = new EstoqueService();

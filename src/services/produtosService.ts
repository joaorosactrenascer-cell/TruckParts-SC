import { supabase } from '../lib/supabase';

export interface Produto {
  id: string;
  empresa_id: string;
  categoria_id?: string;
  nome: string;
  descricao?: string;
  sku: string;
  codigo_barras?: string;
  preco_venda: number;
  preco_custo: number;
  margem_lucro: number;
  unidade_medida: string;
  peso?: number;
  dimensoes?: any;
  marca?: string;
  modelo?: string;
  ativo: boolean;
  controla_estoque: boolean;
  estoque_minimo: number;
  estoque_maximo: number;
  imagem_url?: string;
  observacoes?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ProdutoComEstoque extends Produto {
  quantidade_disponivel: number;
  quantidade_reservada: number;
  quantidade_total: number;
}

class ProdutosService {
  async listar(): Promise<ProdutoComEstoque[]> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          estoque(
            quantidade_disponivel,
            quantidade_reservada,
            quantidade_total
          ),
          categorias(nome)
        `)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias(nome),
          estoque(
            quantidade_disponivel,
            quantidade_reservada,
            quantidade_total
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  async criar(produto: Omit<Produto, 'id' | 'data_criacao' | 'data_atualizacao' | 'margem_lucro'>): Promise<Produto> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(produto)
        .select()
        .single();

      if (error) throw error;

      // Create inventory record
      if (produto.controla_estoque) {
        await this.criarEstoque(data.id);
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  async editar(id: string, produto: Partial<Produto>): Promise<Produto> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update({
          ...produto,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      throw error;
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  async buscarPorSKU(sku: string): Promise<Produto | null> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          estoque(
            quantidade_disponivel,
            quantidade_reservada,
            quantidade_total
          )
        `)
        .eq('sku', sku)
        .eq('ativo', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar produto por SKU:', error);
      throw error;
    }
  }

  async listarPorCategoria(categoriaId: string): Promise<ProdutoComEstoque[]> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          estoque(
            quantidade_disponivel,
            quantidade_reservada,
            quantidade_total
          ),
          categorias(nome)
        `)
        .eq('categoria_id', categoriaId)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar produtos por categoria:', error);
      throw error;
    }
  }

  async buscarEstoqueBaixo(): Promise<ProdutoComEstoque[]> {
    try {
      const { data, error } = await supabase
        .rpc('produtos_estoque_baixo');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }

  private async criarEstoque(produtoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('estoque')
        .insert({
          produto_id: produtoId,
          quantidade_disponivel: 0,
          quantidade_reservada: 0
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao criar estoque:', error);
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

  async listarMaisVendidos(limite: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('produtos_mais_vendidos', {
          p_limite: limite
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar produtos mais vendidos:', error);
      throw error;
    }
  }
}

export const produtosService = new ProdutosService();

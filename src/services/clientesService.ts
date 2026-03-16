import { supabase } from '../lib/supabase';

export interface Cliente {
  id: string;
  empresa_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  limite_credito: number;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface ClienteComEnderecos extends Cliente {
  enderecos: Array<{
    id: string;
    tipo_endereco: string;
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    cep?: string;
    principal: boolean;
  }>;
}

class ClientesService {
  async listar(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<ClienteComEnderecos | null> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          enderecos(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  async criar(cliente: Omit<Cliente, 'id' | 'data_cadastro' | 'data_atualizacao'>): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async editar(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          ...cliente,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
      throw error;
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async buscarPorDocumento(documento: string): Promise<Cliente | null> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('documento', documento)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cliente por documento:', error);
      throw error;
    }
  }

  async buscarPorEmail(email: string): Promise<Cliente | null> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      throw error;
    }
  }

  async listarPorCidade(cidade: string): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .ilike('cidade', `%${cidade}%`)
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar clientes por cidade:', error);
      throw error;
    }
  }

  async criarEndereco(clienteId: string, endereco: {
    tipo_endereco: string;
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    cep?: string;
    principal?: boolean;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .insert({
          ...endereco,
          cliente_id: clienteId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    }
  }

  async editarEndereco(enderecoId: string, endereco: Partial<any>): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .update({
          ...endereco,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', enderecoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao editar endereço:', error);
      throw error;
    }
  }

  async deletarEndereco(enderecoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('enderecos')
        .delete()
        .eq('id', enderecoId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    }
  }

  async definirEnderecoPrincipal(clienteId: string, enderecoId: string): Promise<void> {
    try {
      // First, set all addresses as not principal
      await supabase
        .from('enderecos')
        .update({ principal: false })
        .eq('cliente_id', clienteId);

      // Then set the selected address as principal
      const { error } = await supabase
        .from('enderecos')
        .update({ principal: true })
        .eq('id', enderecoId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao definir endereço principal:', error);
      throw error;
    }
  }
}

export const clientesService = new ClientesService();

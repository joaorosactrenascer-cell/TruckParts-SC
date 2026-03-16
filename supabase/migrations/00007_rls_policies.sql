-- Row Level Security Policies for Multi-Tenant SaaS
-- Users can only access data from their own company

-- Empresas Policies
-- Only system admins can create new companies
CREATE POLICY "Empresas insert policy" ON empresas
  FOR INSERT WITH CHECK (false);

-- Users can view their own company
CREATE POLICY "Empresas select policy" ON empresas
  FOR SELECT USING (
    id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Company admins can update their company
CREATE POLICY "Empresas update policy" ON empresas
  FOR UPDATE USING (
    id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Usuarios Policies
-- Only company admins can create users
CREATE POLICY "Usuarios insert policy" ON usuarios
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Users can view users from their company
CREATE POLICY "Usuarios select policy" ON usuarios
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Users can update their own profile or company admins can update any user
CREATE POLICY "Usuarios update policy" ON usuarios
  FOR UPDATE USING (
    id = auth.uid() OR
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Clientes Policies
-- Users can insert customers for their company
CREATE POLICY "Clientes insert policy" ON clientes
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Users can view customers from their company
CREATE POLICY "Clientes select policy" ON clientes
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Users can update customers from their company
CREATE POLICY "Clientes update policy" ON clientes
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Categorias Policies
CREATE POLICY "Categorias insert policy" ON categorias
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Categorias select policy" ON categorias
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Categorias update policy" ON categorias
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Produtos Policies
CREATE POLICY "Produtos insert policy" ON produtos
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Produtos select policy" ON produtos
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Produtos update policy" ON produtos
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Estoque Policies
CREATE POLICY "Estoque insert policy" ON estoque
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Estoque select policy" ON estoque
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Estoque update policy" ON estoque
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Movimentacoes Estoque Policies
CREATE POLICY "Movimentacoes insert policy" ON movimentacoes_estoque
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Movimentacoes select policy" ON movimentacoes_estoque
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Pedidos Policies
CREATE POLICY "Pedidos insert policy" ON pedidos
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Pedidos select policy" ON pedidos
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Pedidos update policy" ON pedidos
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Itens Pedido Policies
CREATE POLICY "Itens pedido insert policy" ON itens_pedido
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Itens pedido select policy" ON itens_pedido
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Enderecos Policies
CREATE POLICY "Enderecos insert policy" ON enderecos
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Enderecos select policy" ON enderecos
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Enderecos update policy" ON enderecos
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Pagamentos Policies
CREATE POLICY "Pagamentos insert policy" ON pagamentos
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Pagamentos select policy" ON pagamentos
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Pagamentos update policy" ON pagamentos
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
CREATE INDEX IF NOT EXISTS idx_categorias_empresa_id ON categorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoque_empresa_id ON estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoque_produto_id ON estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_empresa_id ON pedidos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_empresa_id ON itens_pedido(empresa_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_produto_id ON itens_pedido(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_empresa_id ON movimentacoes_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_empresa_id ON enderecos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_cliente_id ON enderecos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_empresa_id ON pagamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido_id ON pagamentos(pedido_id);

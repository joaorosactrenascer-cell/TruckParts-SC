-- SQL Functions and Triggers for TruckParts SC
-- Business logic automation

-- Function to get user's empresa_id
CREATE OR REPLACE FUNCTION get_empresa_id_usuario()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT empresa_id FROM usuarios 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate order total
CREATE OR REPLACE FUNCTION calcular_total_pedido(p_pedido_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(valor_total), 0) INTO v_total
  FROM itens_pedido
  WHERE pedido_id = p_pedido_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory
CREATE OR REPLACE FUNCTION atualizar_estoque(
  p_produto_id UUID,
  p_quantidade NUMERIC,
  p_tipo_movimentacao TEXT,
  p_motivo TEXT DEFAULT NULL,
  p_documento_referencia TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_quantidade_anterior NUMERIC;
  v_quantidade_nova NUMERIC;
  v_empresa_id UUID;
BEGIN
  -- Get empresa_id from produto
  SELECT empresa_id INTO v_empresa_id
  FROM produtos
  WHERE id = p_produto_id;
  
  -- Get current quantity
  SELECT COALESCE(quantidade_disponivel, 0) INTO v_quantidade_anterior
  FROM estoque
  WHERE produto_id = p_produto_id AND empresa_id = v_empresa_id;
  
  -- Calculate new quantity
  IF p_tipo_movimentacao = 'entrada' THEN
    v_quantidade_nova := v_quantidade_anterior + p_quantidade;
  ELSIF p_tipo_movimentacao = 'saida' THEN
    v_quantidade_nova := v_quantidade_anterior - p_quantidade;
  ELSIF p_tipo_movimentacao = 'ajuste' THEN
    v_quantidade_nova := p_quantidade;
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', p_tipo_movimentacao;
  END IF;
  
  -- Update or insert inventory
  INSERT INTO estoque (
    empresa_id, produto_id, quantidade_disponivel, data_ultima_atualizacao
  ) VALUES (
    v_empresa_id, p_produto_id, v_quantidade_nova, NOW()
  )
  ON CONFLICT (empresa_id, produto_id) 
  DO UPDATE SET 
    quantidade_disponivel = v_quantidade_nova,
    data_ultima_atualizacao = NOW();
  
  -- Register movement
  INSERT INTO movimentacoes_estoque (
    empresa_id, produto_id, tipo_movimentacao, 
    quantidade, quantidade_anterior, quantidade_posterior,
    motivo, documento_referencia, usuario_id, data_movimentacao
  ) VALUES (
    v_empresa_id, p_produto_id, p_tipo_movimentacao,
    p_quantidade, v_quantidade_anterior, v_quantidade_nova,
    p_motivo, p_documento_referencia, auth.uid(), NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order number
CREATE OR REPLACE FUNCTION gerar_numero_pedido(p_empresa_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_numero TEXT;
  v_sequencial INTEGER;
BEGIN
  -- Get next sequence number for the company
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO v_sequencial
  FROM pedidos
  WHERE empresa_id = p_empresa_id
    AND numero_pedido ~ '^PED-[0-9]+$';
  
  -- Generate order number
  v_numero := 'PED-' || LPAD(v_sequencial::TEXT, 6, '0');
  
  RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Function to check product availability
CREATE OR REPLACE FUNCTION verificar_disponibilidade_produto(
  p_produto_id UUID,
  p_quantidade NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
  v_disponivel NUMERIC;
  v_empresa_id UUID;
BEGIN
  -- Get empresa_id from produto
  SELECT empresa_id INTO v_empresa_id
  FROM produtos
  WHERE id = p_produto_id;
  
  -- Get available quantity
  SELECT COALESCE(quantidade_disponivel, 0) INTO v_disponivel
  FROM estoque
  WHERE produto_id = p_produto_id AND empresa_id = v_empresa_id;
  
  RETURN v_disponivel >= p_quantidade;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update order total
CREATE OR REPLACE FUNCTION atualizar_total_pedido_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_total := calcular_total_pedido(NEW.id);
  NEW.subtotal := NEW.valor_total - NEW.desconto - NEW.valor_frete - NEW.valor_impostos;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update inventory on order item
CREATE OR REPLACE FUNCTION atualizar_estoque_item_pedido_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- When inserting order item, reserve inventory
  IF TG_OP = 'INSERT' THEN
    PERFORM atualizar_estoque(
      NEW.produto_id,
      NEW.quantidade,
      'saida',
      'Reserva para pedido: ' || NEW.pedido_id,
      'PED-' || NEW.pedido_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate order number
CREATE OR REPLACE FUNCTION gerar_numero_pedido_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_empresa_id UUID;
BEGIN
  IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
    v_empresa_id := get_empresa_id_usuario();
    NEW.numero_pedido := gerar_numero_pedido(v_empresa_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_atualizar_total_pedido
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION atualizar_total_pedido_trigger();

CREATE TRIGGER trigger_atualizar_estoque_item_pedido
  AFTER INSERT ON itens_pedido
  FOR EACH ROW EXECUTE FUNCTION atualizar_estoque_item_pedido_trigger();

CREATE TRIGGER trigger_gerar_numero_pedido
  BEFORE INSERT ON pedidos
  FOR EACH ROW EXECUTE FUNCTION gerar_numero_pedido_trigger();

-- Function to get low stock products
CREATE OR REPLACE FUNCTION produtos_estoque_baixo(p_empresa_id UUID)
RETURNS TABLE(
  produto_id UUID,
  nome TEXT,
  sku TEXT,
  quantidade_atual NUMERIC,
  estoque_minimo NUMERIC,
  diferenca NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.sku,
    COALESCE(e.quantidade_disponivel, 0) as quantidade_atual,
    COALESCE(p.estoque_minimo, 0) as estoque_minimo,
    COALESCE(e.quantidade_disponivel, 0) - COALESCE(p.estoque_minimo, 0) as diferenca
  FROM produtos p
  LEFT JOIN estoque e ON p.id = e.produto_id AND p.empresa_id = e.empresa_id
  WHERE p.empresa_id = p_empresa_id
    AND p.controla_estoque = true
    AND p.ativo = true
    AND COALESCE(e.quantidade_disponivel, 0) <= COALESCE(p.estoque_minimo, 0)
  ORDER BY diferenca ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sales summary
CREATE OR REPLACE FUNCTION resumo_vendas(
  p_empresa_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE(
  total_pedidos BIGINT,
  valor_total NUMERIC,
  ticket_medio NUMERIC,
  produtos_vendidos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id) as total_pedidos,
    COALESCE(SUM(p.valor_total), 0) as valor_total,
    COALESCE(AVG(p.valor_total), 0) as ticket_medio,
    COALESCE(SUM(ip.quantidade), 0) as produtos_vendidos
  FROM pedidos p
  LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id
  WHERE p.empresa_id = p_empresa_id
    AND DATE(p.data_pedido) BETWEEN p_data_inicio AND p_data_fim
    AND p.status NOT IN ('rascunho', 'cancelado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION produtos_mais_vendidos(
  p_empresa_id UUID,
  p_limite INTEGER DEFAULT 10
)
RETURNS TABLE(
  produto_id UUID,
  nome TEXT,
  sku TEXT,
  quantidade_vendida NUMERIC,
  valor_total NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.sku,
    SUM(ip.quantidade) as quantidade_vendida,
    SUM(ip.valor_total) as valor_total
  FROM produtos p
  JOIN itens_pedido ip ON p.id = ip.produto_id
  JOIN pedidos ped ON ip.pedido_id = ped.id
  WHERE p.empresa_id = p_empresa_id
    AND ped.status NOT IN ('rascunho', 'cancelado')
    AND ped.data_pedido >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY p.id, p.nome, p.sku
  ORDER BY quantidade_vendida DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_empresa_id_usuario() TO authenticated;
GRANT EXECUTE ON FUNCTION calcular_total_pedido(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION atualizar_estoque(UUID, NUMERIC, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION gerar_numero_pedido(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_disponibilidade_produto(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION produtos_estoque_baixo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resumo_vendas(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION produtos_mais_vendidos(UUID, INTEGER) TO authenticated;

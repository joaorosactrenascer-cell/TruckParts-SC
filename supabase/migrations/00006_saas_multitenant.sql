-- SaaS Multi-Tenant Structure for TruckParts SC
-- All tables with empresa_id for multi-tenancy

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Empresas (Tenants)
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  telefone TEXT,
  email TEXT UNIQUE,
  site TEXT,
  logo_url TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  plano TEXT DEFAULT 'basico', -- basico, profissional, enterprise
  status TEXT DEFAULT 'ativo', -- ativo, suspenso, cancelado
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios (Users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  senha TEXT NOT NULL, -- hash
  perfil TEXT DEFAULT 'usuario', -- admin, gerente, usuario
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, email)
);

-- Clientes (Customers)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  documento TEXT, -- CPF/CNPJ
  tipo_pessoa TEXT, -- fisica, juridica
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  limite_credito NUMERIC(15,2) DEFAULT 0,
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, documento)
);

-- Categorias (Categories)
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_pai_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

-- Produtos (Products)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  sku TEXT NOT NULL,
  codigo_barras TEXT,
  preco_venda NUMERIC(15,2) NOT NULL DEFAULT 0,
  preco_custo NUMERIC(15,2) DEFAULT 0,
  margem_lucro NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN preco_custo > 0 THEN ROUND(((preco_venda - preco_custo) / preco_custo) * 100, 2)
      ELSE 0 
    END
  ) STORED,
  unidade_medida TEXT DEFAULT 'UN',
  peso NUMERIC(10,3),
  dimensoes JSONB, -- {comprimento, largura, altura}
  marca TEXT,
  modelo TEXT,
  ativo BOOLEAN DEFAULT true,
  controla_estoque BOOLEAN DEFAULT true,
  estoque_minimo NUMERIC(15,2) DEFAULT 0,
  estoque_maximo NUMERIC(15,2) DEFAULT 0,
  imagem_url TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, sku)
);

-- Estoque (Inventory)
CREATE TABLE IF NOT EXISTS estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_disponivel NUMERIC(15,2) NOT NULL DEFAULT 0,
  quantidade_reservada NUMERIC(15,2) NOT NULL DEFAULT 0,
  quantidade_total NUMERIC(15,2) GENERATED ALWAYS AS (
    quantidade_disponivel + quantidade_reservada
  ) STORED,
  localizacao TEXT,
  data_ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, produto_id)
);

-- Movimentacoes Estoque (Inventory Movements)
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL, -- entrada, saida, ajuste, transferencia
  quantidade NUMERIC(15,2) NOT NULL,
  quantidade_anterior NUMERIC(15,2),
  quantidade_posterior NUMERIC(15,2),
  motivo TEXT,
  documento_referencia TEXT, -- numero da nota fiscal, pedido, etc.
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_movimentacao TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos (Orders)
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero_pedido TEXT UNIQUE,
  status TEXT DEFAULT 'rascunho', -- rascunho, confirmado, em_separacao, faturado, enviado, entregue, cancelado
  data_pedido TIMESTAMPTZ DEFAULT NOW(),
  data_entrega_prevista TIMESTAMPTZ,
  data_entrega_real TIMESTAMPTZ,
  subtotal NUMERIC(15,2) DEFAULT 0,
  desconto NUMERIC(15,2) DEFAULT 0,
  valor_frete NUMERIC(15,2) DEFAULT 0,
  valor_impostos NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) DEFAULT 0,
  forma_pagamento TEXT, -- dinheiro, cartao, boleto, pix
  condicao_pagamento TEXT,
  observacoes TEXT,
  vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Itens Pedido (Order Items)
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade NUMERIC(15,2) NOT NULL,
  preco_unitario NUMERIC(15,2) NOT NULL,
  subtotal NUMERIC(15,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  desconto NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) GENERATED ALWAYS AS (
    (quantidade * preco_unitario) - COALESCE(desconto, 0)
  ) STORED,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Enderecos (Addresses)
CREATE TABLE IF NOT EXISTS enderecos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_endereco TEXT, -- entrega, cobranca, ambos
  logradouro TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT,
  principal BOOLEAN DEFAULT false,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos (Payments)
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  forma_pagamento TEXT NOT NULL, -- dinheiro, cartao, boleto, pix, transferencia
  valor_pago NUMERIC(15,2) NOT NULL,
  data_pagamento TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pendente', -- pendente, confirmado, cancelado, estornado
  codigo_transacao TEXT,
  gateway_pagamento TEXT, -- stripe, mercadopago, etc.
  observacoes TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

# 🚀 TruckParts SC - SaaS Multi-Tenant Setup Guide

## 📋 Overview

TruckParts SC agora é um **SaaS Multi-Tenant completo** para gestão de autopeças. Cada empresa (tenant) tem seus dados isolados com segurança total.

## 🏗️ Arquitetura Implementada

### 🗄️ Banco de Dados Multi-Tenant
- **Empresas:** Gerenciamento de tenants
- **Usuários:** Sistema de usuários por empresa
- **Clientes:** Cadastro de clientes por empresa
- **Produtos:** Catálogo de produtos por empresa
- **Categorias:** Categorias hierárquicas por empresa
- **Estoque:** Controle de estoque por empresa
- **Pedidos:** Sistema de pedidos por empresa
- **Pagamentos:** Controle de pagamentos

### 🔒 Segurança (RLS)
- **Row Level Security** em todas as tabelas
- **Isolamento total** entre empresas
- **Acesso granular** por perfil de usuário

### ⚡ Performance
- **Índices otimizados** para todas as queries
- **Funções SQL** para lógica de negócio
- **Triggers automáticos** para consistência

---

## 🚀 Setup Rápido

### 1️⃣ Configurar Ambiente

```bash
# Copiar template de ambiente
cp SETUP_ENV.md .env.local

# Editar com suas credenciais
# VITE_SUPABASE_URL=seu-project.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 2️⃣ Instalar Supabase CLI

```bash
# Baixar e instalar CLI
# (Windows já configurado)
C:\tools\supabase.exe --version
```

### 3️⃣ Deploy Completo

```bash
# Executar script de deploy
node scripts/deploy-saas.js

# Ou deploy manual:
supabase db push
supabase functions deploy
npm run build
```

---

## 📱 Funcionalidades Disponíveis

### 🏪 Gestão de Produtos
**URL:** `/produtos`

**Features:**
- ✅ Cadastro de produtos com todos os campos
- ✅ Controle de estoque automático
- ✅ Categorias hierárquicas
- ✅ Preços com margem de lucro automática
- ✅ Busca por nome e SKU
- ✅ Imagens e descrições
- ✅ Ativação/desativação

### 👥 Gestão de Clientes
**URL:** `/clientes`

**Features:**
- ✅ Cadastro completo de clientes
- ✅ Múltiplos endereços por cliente
- ✅ Pessoa física e jurídica
- ✅ Limite de crédito
- ✅ Histórico de pedidos
- ✅ Busca avançada

### 📦 Gestão de Pedidos
**URL:** `/pedidos`

**Features:**
- ✅ Criação de pedidos com itens
- ✅ Cálculo automático de totais
- ✅ Status do pedido (rascunho → entregue)
- ✅ Múltiplas formas de pagamento
- ✅ Reserva automática de estoque
- ✅ Histórico completo

### 📊 Controle de Estoque
**URL:** `/estoque`

**Features:**
- ✅ Visualização em tempo real
- ✅ Movimentações (entrada/saída/ajuste)
- ✅ Alertas de estoque baixo
- ✅ Histórico completo
- ✅ Relatórios gerenciais
- ✅ Ajustes manuais

### 🔍 Busca Inteligente
**URL:** `/smart-search`

**Features:**
- ✅ Busca por IA com parse de queries
- ✅ Extração de marca/modelo/ano
- ✅ Busca por número de peça
- ✅ Scoring de relevância
- ✅ Sugestões automáticas

---

## 🛠️ API e Services

### 📁 Services TypeScript
```typescript
// Produtos
import { produtosService } from './services';
await produtosService.listar();
await produtosService.criar(produto);
await produtosService.editar(id, produto);
await produtosService.deletar(id);

// Clientes
import { clientesService } from './services';
await clientesService.listar();
await clientesService.criar(cliente);

// Pedidos
import { pedidosService } from './services';
await pedidosService.listar();
await pedidosService.criar(pedido);

// Estoque
import { estoqueService } from './services';
await estoqueService.listar();
await estoqueService.atualizarEstoque(produtoId, quantidade, 'entrada');
```

### 🗄️ Funções SQL
```sql
-- Calcular total do pedido
SELECT calcular_total_pedido('pedido-id');

-- Atualizar estoque
SELECT atualizar_estoque('produto-id', 10, 'entrada', 'Compra', 'NF-123');

-- Verificar disponibilidade
SELECT verificar_disponibilidade_produto('produto-id', 5);

-- Produtos com estoque baixo
SELECT * FROM produtos_estoque_baixo('empresa-id');

-- Resumo de vendas
SELECT * FROM resumo_vendas('empresa-id', '2024-01-01', '2024-12-31');
```

---

## 🔐 Segurança Multi-Tenant

### Row Level Security (RLS)
- **Isolamento total:** Cada empresa vê apenas seus dados
- **Políticas granulares:** Por tipo de usuário
- **Proteção automática:** Contra acessos não autorizados

### Exemplo de Política SQL
```sql
-- Usuário só vê dados da sua empresa
CREATE POLICY "Usuarios select policy" ON usuarios
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE id = auth.uid()
    )
  );
```

---

## 📊 Relatórios e Analytics

### 📈 Relatórios Disponíveis
- **Vendas:** Resumo por período
- **Estoque:** Produtos em falta, valor total
- **Clientes:** Top compradores, inadimplência
- **Produtos:** Mais vendidos, margem de lucro
- **Movimentações:** Histórico completo

### 📊 Dashboard Analytics
- **KPIs em tempo real**
- **Gráficos interativos**
- **Filtros por período**
- **Exportação de dados**

---

## 🚀 Deploy em Produção

### 1️⃣ Preparar Ambiente
```bash
# Verificar variáveis de ambiente
cat .env.local

# Testar conexão com Supabase
node scripts/validate-evolution.js
```

### 2️⃣ Deploy Automatizado
```bash
# Deploy completo
node scripts/deploy-saas.js

# Deploy específico
node scripts/deploy-saas.js --migrate-only
node scripts/deploy-saas.js --functions-only
node scripts/deploy-saas.js --build-only
```

### 3️⃣ Deploy Manual
```bash
# 1. Aplicar migrations
supabase db push

# 2. Deploy Edge Functions
supabase functions deploy

# 3. Build Frontend
npm run build

# 4. Deploy para Vercel
vercel --prod
```

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```bash
# Supabase
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=service-key

# Serviços Externos
VITE_GEMINI_API_KEY=gemini-key
VITE_STRIPE_PUBLIC_KEY=stripe-key
VITE_MERCADOPAGO_TOKEN=mp-token
```

### Edge Functions
```bash
# Listar functions
supabase functions list

# Deploy específica
supabase functions deploy smart-search

# Verificar logs
supabase functions logs smart-search
```

---

## 📚 Documentação

### 📁 Estrutura de Arquivos
```
truckparts-sc/
├── src/
│   ├── pages/           # Telas React
│   ├── services/         # Services TypeScript
│   └── lib/            # Bibliotecas (Supabase)
├── supabase/
│   ├── migrations/      # Schema do banco
│   └── functions/       # Edge Functions
├── scripts/            # Scripts de automação
└── tests/             # Testes automatizados
```

### 🔗 URLs Importantes
- **Aplicação:** `http://localhost:5173`
- **Dashboard Admin:** `http://localhost:5173/admin`
- **Smart Search:** `http://localhost:5173/smart-search`
- **Produtos:** `http://localhost:5173/produtos`
- **Clientes:** `http://localhost:5173/clientes`
- **Pedidos:** `http://localhost:5173/pedidos`
- **Estoque:** `http://localhost:5173/estoque`
- **Supabase Dashboard:** `https://supabase.com/dashboard`

---

## 🎯 Próximos Passos

### 1️⃣ Configuração Inicial
1. **Criar empresa administradora**
2. **Criar usuário admin**
3. **Configurar autenticação**
4. **Testar todas as funcionalidades**

### 2️⃣ Personalização
1. **Branding da aplicação**
2. **Configurar domínio personalizado**
3. **Integrar gateway de pagamento**
4. **Configurar e-mails transacionais**

### 3️⃣ Escalabilidade
1. **Monitoramento de performance**
2. **Backup automático**
3. **Cache de consultas**
4. **Balanceamento de carga**

---

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

#### ❌ "Supabase URL not configured"
```bash
# Solução
cp SETUP_ENV.md .env.local
# Editar com credenciais reais
```

#### ❌ "Function not found"
```bash
# Solução
supabase functions deploy
# Verificar se todas as functions foram deployadas
```

#### ❌ "RLS permission denied"
```bash
# Solução
# Verificar se usuário está autenticado
# Verificar se empresa_id está correto
```

### 📞 Contato e Suporte
- **Documentação:** Ver arquivos do projeto
- **Logs:** `supabase functions logs`
- **Debug:** `console.log` no browser
- **Database:** Supabase Dashboard

---

## 🎉 Conclusão

O TruckParts SC agora é um **SaaS Multi-Tenant enterprise-ready** com:

- ✅ **Multi-tenancy completa**
- ✅ **Segurança de nível enterprise**
- ✅ **Performance otimizada**
- ✅ **API completa**
- ✅ **Frontend moderno**
- ✅ **Deploy automatizado**

**Sistema pronto para produção e escalabilidade!** 🚀

---

*Guia criado por:* Cascade AI Assistant  
*Versão:* 2.0.0 - SaaS Multi-Tenant  
*Data:* 16 de Março de 2026

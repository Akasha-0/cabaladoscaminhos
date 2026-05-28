# API Reference - Cabala dos Caminhos

Visão geral da API REST do projeto Cabala dos Caminhos.

## Base URL

```
http://localhost:3000/api
```

## OpenAPI Specification

This API follows OpenAPI 3.0 conventions. For machine-readable spec:

```
GET /api/docs (Swagger UI - TODO)
```

---

## Authentication

### Supabase Auth (Principal)

A autenticação principal utiliza Supabase. O token é obtido via cliente Supabase:

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### JWT (Legacy)

O sistema suporta autenticação via JWT para rotas legadas:

```typescript
// Header
Authorization: Bearer <token>

// Cookie (preferido)
Auth-Token: <token>
```

### Sessão de Checkout

Para operações administrativas (webhooks), usar a variável de ambiente:

```bash
STRIPE_WEBHOOK_SECRET
```

---

## Rate Limiting

Todas as rotas aplicam rate limiting baseado em IP e userId:

| Rota | Limite | Janela |
|------|--------|--------|
| `/chat/mensagem` | 10 requests | 60 segundos |
| `/insights/diario` | 5 requests | 60 segundos |

**Resposta quando excedido:**

```json
{
  "error": "Rate limit excedido",
  "retryAfter": 30
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `400` | Parâmetros inválidos ou faltando |
| `401` | Não autenticado |
| `403` | Acesso negado |
| `404` | Recurso não encontrado |
| `429` | Rate limit excedido |
| `500` | Erro interno do servidor |

---

## Endpoints

### Auth

#### `POST /auth/login`

Login de usuário com email e senha.

**Autenticação:** Nenhuma

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | string | Sim | Email do usuário |
| `password` | string | Sim | Senha do usuário |

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "nomeCompleto": "Nome Completo"
  }
}
```

**Errors:**
- `400` - Email ou senha não fornecidos
- `401` - Credenciais inválidas
- `500` - Erro interno

---

#### `POST /auth/logout`

Encerra a sessão do usuário.

**Autenticação:** Supabase (obrigatório)

**Response (200):**
```json
{
  "success": true
}
```

---

### Chat

#### `POST /chat/mensagem`

Envia mensagem para o assistente espiritual.

**Autenticação:** Supabase (obrigatório)  
**Rate Limit:** 10 req/min  
**Custo:** 2 créditos por mensagem

**Request:**
```json
{
  "pergunta": "Qual é o melhor dia para iniciar um projeto?",
  "tema": "trabalho"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `pergunta` | string | Sim | Mensagem do usuário |
| `tema` | enum | Sim | Categoria da consulta |

**Temas disponíveis:**
- `relacionamento`
- `trabalho`
- `dinheiro`
- `saude`
- `espiritualidade`
- `proposito`
- `outros`

**Response (200):**
```json
{
  "resposta": "Resposta do assistente espiritual...",
  "novoSaldo": 98
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `resposta` | string | Resposta do assistente |
| `novoSaldo` | number | Saldo de créditos após deduction |

**Errors:**
- `401` - Não autenticado
- `402` - Créditos insuficientes
- `429` - Rate limit excedido

---

#### `GET /chat/historico`

Lista conversas anteriores do usuário.

**Autenticação:** Supabase (obrigatório)

**Response (200):**
```json
{
  "conversas": [
    {
      "id": "uuid",
      "tema": "trabalho",
      "mensagens": [
        {
          "id": "msg-1",
          "tipo": "usuario",
          "conteudo": "Minha pergunta",
          "timestamp": "2024-01-15T10:00:00Z"
        }
      ],
      "criadaEm": "2024-01-15T10:00:00Z",
      "atualizadaEm": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Errors:**
- `401` - Não autenticado

---

#### `POST /chat/historico`

Salva uma nova conversa.

**Autenticação:** Supabase (obrigatório)

**Request:**
```json
{
  "tema": "trabalho",
  "mensagens": [
    {
      "id": "msg-1",
      "tipo": "usuario",
      "conteudo": "Minha pergunta",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `tema` | enum | Sim | Categoria da conversa |
| `mensagens` | array | Sim | Lista de mensagens |

**Response (200):**
```json
{
  "id": "uuid",
  "tema": "trabalho",
  "criadaEm": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- `400` - Payload inválido
- `401` - Não autenticado

---

### Insights

#### `GET /insights/diario`

Gera insight espiritual diário personalizado.

**Autenticação:** Supabase (obrigatório)  
**Rate Limit:** 5 req/min  
**Custo:** 1 crédito por insight

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `data` | string | Sim | Data de nascimento (YYYY-MM-DD) |
| `nome` | string | Sim | Nome completo |
| `odu` | string | Sim | Odú de nascimento (ex: "Irosun") |
| `numero` | number | Não | Número pessoal de numerologia |

**Exemplo:**
```
GET /api/insights/diario?data=1990-05-15&nome=João Silva&odu=Irosun&numero=7
```

**Response (200):**
```json
{
  "insight": "Texto do insight espiritual...",
  "tema": "espiritualidade",
  "cor": "#somecolor",
  "orixa": "Oxum",
  "numerosSagrados": [3, 7, 21],
  "afirmacoes": ["Afirmação 1", "Afirmação 2"],
  "ciclo": {
    "tipo": "ano",
    "numero": 7,
    "descricao": "Ciclo de reflexão"
  }
}
```

**Errors:**
- `400` - Parâmetros inválidos ou faltando
- `401` - Não autenticado
- `402` - Créditos insuficientes
- `429` - Rate limit excedido

---

### Astrologia

#### `GET /astrologia/mapa-natal`

Calcula o mapa natal completo com posições planetárias.

**Autenticação:** Nenhuma

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `dataNascimento` | string | Sim | Data de nascimento (YYYY-MM-DD) |
| `horaNascimento` | string | Não | Hora (padrão: 12:00) |
| `latitude` | number | Sim | Latitude do local |
| `longitude` | number | Sim | Longitude do local |

**Exemplo:**
```
GET /api/astrologia/mapa-natal?dataNascimento=1990-05-15&horaNascimento=14:30&latitude=-23.5505&longitude=-46.6333
```

**Response (200):**
```json
{
  "mapaNatal": {
    "planeta": {
      "sol": { "signo": "touro", "grau": 25, "casa": 5 },
      "lua": { "signo": "escorpião", "grau": 12, "casa": 12 },
      "mercurio": { "signo": "touro", "grau": 20, "casa": 5 },
      "venus": { "signo": "aries", "grau": 5, "casa": 4 },
      "marte": { "signo": "peixes", "grau": 18, "casa": 11 }
    },
    "ascendente": 25.3,
    "mediumCoeli": 180.5,
    "houses": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  "aspectos": [
    { "planeta1": "sol", "planeta2": "lua", "tipo": "trino", "grau": 120 }
  ],
  "interpretacao": "Sol em Touro, Ascendente em Capricórnio..."
}
```

**Errors:**
- `400` - Parâmetros inválidos ou faltando

---

#### `GET /astrologia/transitos`

Calcula trânsitos planetários ativos para o momento atual.

**Autenticação:** Nenhuma

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `dataNascimento` | string | Sim | Data de nascimento (YYYY-MM-DD) |
| `horaNascimento` | string | Não | Hora (padrão: 12:00) |
| `latitude` | number | Sim | Latitude do local |
| `longitude` | number | Sim | Longitude do local |
| `dataAtual` | string | Não | Data de referência (padrão: hoje) |

**Exemplo:**
```
GET /api/astrologia/transitos?dataNascimento=1990-05-15&latitude=-23.5505&longitude=-46.6333
```

**Response (200):**
```json
{
  "transitos": [
    {
      "planeta": "saturno",
      "signo": "peixes",
      "casa": 12,
      "aspecto": "oposicao",
      "planetaNatal": "sol",
      "grau": 180,
      "interpretacao": "Saturno em oposição ao Sol..."
    }
  ],
  " моментальныхAspectos": [
    { "planeta1": "sol", "planeta2": "jupiter", "tipo": "trino" }
  ]
}
```

**Errors:**
- `400` - Parâmetros inválidos ou faltando

---

### Numerologia

#### `GET /numerologia`

Calcula números numerológicos baseados em diferentes sistemas.

**Autenticação:** Nenhuma

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `tipo` | enum | Sim | Tipo de cálculo |
| `nome` | string | Condicional | Nome para cálculos pessoais |
| `data` | string | Condicional | Data para cálculos de destino |

**Tipos disponíveis:**

| Tipo | Descrição | Parâmetros |
|------|-----------|------------|
| `pitagorica` | Sistema pitagórico | `nome` |
| `caldeia` | Sistema caldeu | `nome` |
| `cabalistica` | Sistema cabalístico | `nome` |
| `tantrica` | Numerologia tântrica | `data` |
| `pitagorica-data` | Pitagórico pela data | `data` |
| `destino` | Número do destino | `nome` + `data` |

**Exemplo:**
```
GET /api/numerologia?tipo=pitagorica&nome=Maria da Silva
```

**Response (200):**
```json
{
  "numero": 7,
  "tipo": "pitagorica",
  "interpretacao": {
    "titulo": "O Investigador",
    "descricao": "Descrição do número...",
    "pontosFortes": ["Intuição", "Análise", "Espiritualidade"],
    "pontosDesafio": ["Isolamento", "Ceticismo excessivo"],
    "caminho": "Caminho de busca interior e sabedoria"
  }
}
```

**Errors:**
- `400` - Tipo inválido ou parâmetros faltando

---

### Ciclos Temporais

#### `GET /ciclos`

Calcula ciclos de ano, mês e dia pessoal.

**Autenticação:** Nenhuma

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `data` | string | Sim | Data de nascimento (YYYY-MM-DD) |
| `tipo` | enum | Não | `ano`, `mes`, `dia`, `todos` (padrão: `todos`) |

**Exemplo:**
```
GET /api/ciclos?data=1990-05-15&tipo=ano
```

**Response (200):**
```json
{
  "tipo": "ano",
  "numero": 7,
  "interpretacao": "Ano de reflexão e estudo profundo",
  "descricao": "Este é um ano de transformação interior",
  "conselhos": ["Dedique-se aos estudos", "Pratique meditação", "Cuide da saúde mental"],
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Response (200) - tipo=todos:**
```json
{
  "ano": {
    "numero": 7,
    "interpretacao": "..."
  },
  "mes": {
    "numero": 3,
    "interpretacao": "..."
  },
  "dia": {
    "numero": 5,
    "interpretacao": "..."
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- `400` - Parâmetros inválidos

---

### Odús (Candomblé)

#### `GET /odus`

Calcula Odús de nascimento e retorna informações ritualísticas.

**Autenticação:** Nenhuma

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `data` | string | Sim | Data de nascimento (YYYY-MM-DD) |
| `tipo` | enum | Não | `principal`, `todos` (padrão: `principal`) |

**Exemplo:**
```
GET /api/odus?data=1990-05-15
```

**Response (200):**
```json
{
  "principal": {
    "nome": "Irosun",
    "numero": 4,
    "significado": "Aviso, sangue, visão espiritual",
    "orixas": ["Iemanjá", "Oxóssi"],
    "ebos": ["Banho de folhas frias", "Canjica na beira-mar"],
    "cores": ["azul", "branco"],
    "diaSagrado": "quarta-feira"
  },
  "secundario": {
    "nome": "Oxé",
    "numero": 5,
    "significado": "Comando, senhorio",
    "orixas": ["Oxum"],
    "ebos": ["Oferecimento de mel"],
    "cores": ["amarelo", "ouro"],
    "diaSagrado": "sexta-feira"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- `400` - Parâmetros inválidos
---

### Odús Data (Ifá)

#### `GET /api/odu/data`

Retorna dados detalhados dos Odús do sistema Ifá com filtros opcionais.

**Autenticação:** Nenhuma

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `numero` | number | Não | Número do Odú (1-16) |
| `nome` | string | Não | Nome do Odú (ex: "Irosun", "Oxé") |
| `orixa` | string | Não | Orixá associado |
| `elemento` | string | Não | Elemento (água, fogo, terra, ar) |
| `tipo` | enum | Não | Tipo de consulta especial |

**Valores disponíveis para `tipo`:**

| Valor | Descrição |
|-------|-----------|
| `todos` | Retorna todos os Odús |
| `quizilas` | Retorna apenas Quizilás |
| `ebos` | Retorna todos Ebós |
| `orixas` | Retorna lista de Orixás com contagem |
| `elementos` | Retorna lista de Elementos com contagem |

**Exemplo - Buscar por número:**
```
GET /api/odu/data?numero=4
```

**Exemplo - Buscar por nome:**
```
GET /api/odu/data?nome=Irosun
```

**Exemplo - Listar todos:**
```
GET /api/odu/data?tipo=todos
```

**Response (200) - Por número:**
```json
{
  "odu": {
    "nome": "Irosun",
    "numero": 4,
    "significado": "Aviso, sangue, visão espiritual",
    "orixas": ["Iemanjá", "Oxóssi"],
    "ebos": ["Banho de folhas frias", "Canjica na beira-mar"],
    "cores": ["azul", "branco"],
    "elemento": "água"
  }
}
```

**Response (200) - Listar todos:**
```json
{
  "odus": [
    {
      "nome": "Ogundá",
      "numero": 1,
      "significado": "...",
      "orixas": [],
      "ebos": [],
      "cores": [],
      "elemento": "..."
    }
  ],
  "total": 16,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- `400` - Parâmetros inválidos
- `404` - Odú não encontrado
- `500` - Erro interno do servidor

---

### Créditos

#### `POST /creditos/adicionar`

Adiciona créditos à conta do usuário (admin).

**Autenticação:** Supabase (obrigatório)

**Request:**
```json
{
  "quantidade": 100,
  "descricao": "Compra de pacote básico"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `quantidade` | number | Sim | Quantidade de créditos a adicionar |
| `descricao` | string | Não | Descrição da transação |

**Response (200):**
```json
{
  "success": true,
  "novoSaldo": 200
}
```

**Errors:**
- `400` - Payload inválido
- `401` - Não autenticado
- `403` - Sem permissão

---

#### `POST /creditos/debitar`

Debita créditos da conta do usuário.

**Autenticação:** Supabase (obrigatório)

**Request:**
```json
{
  "quantidade": 2,
  "operacao": "chat_mensagem"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `quantidade` | number | Sim | Quantidade de créditos a debitar |
| `operacao` | string | Sim | Tipo de operação |

**Response (200):**
```json
{
  "success": true,
  "novoSaldo": 98
}
```

**Response (400) - Saldo insuficiente:**
```json
{
  "error": "Créditos insuficientes",
  "saldoAtual": 1,
  "saldoNecessario": 2
}
```

**Errors:**
- `400` - Payload inválido ou saldo insuficiente
- `401` - Não autenticado

---

### Payments

#### `POST /payments/checkout`

Cria sessão de checkout Stripe para compra de créditos.

**Autenticação:** Supabase (obrigatório)

**Request:**
```json
{
  "userId": "uuid",
  "planoId": "plano-basico"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `userId` | string | Sim | ID do usuário |
| `planoId` | string | Sim | ID do plano de créditos |

**Planos disponíveis:**
- `plano-basico` - 100 créditos
- `plano-intermediario` - 500 créditos
- `plano-avancado` - 1000 créditos

**Response (200):**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

**Errors:**
- `400` - Payload inválido
- `401` - Não autenticado

---

#### `POST /payments/portal`

Cria sessão do portal de assinaturas Stripe.

**Autenticação:** Supabase (obrigatório)

**Request:**
```json
{
  "userId": "uuid"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `userId` | string | Sim | ID do usuário |

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Errors:**
- `400` - Payload inválido
- `401` - Não autenticado

---

### Webhooks

#### `POST /webhooks/stripe`

Webhook para processar eventos do Stripe.

**Autenticação:** Stripe Signature (obrigatório)

**Headers:**
```
stripe-signature: <signature>
```

**Eventos processados:**

| Evento | Descrição |
|--------|-----------|
| `checkout.session.completed` | Pagamento concluído com sucesso |
| `customer.subscription.deleted` | Assinatura cancelada |
| `invoice.payment_failed` | Falha no pagamento |
| `customer.subscription.updated` | Assinatura atualizada |

**Request (example):**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_...",
      "customer": "cus_...",
      "metadata": {
        "userId": "uuid",
        "planoId": "plano-basico"
      }
    }
  }
}
```

**Response (200):**
```json
{
  "received": true
}
```

**Errors:**
- `400` - Assinatura inválida

---

### Admin

#### `GET /admin/rate-limit`

Retorna estatísticas de rate limiting e saúde do sistema.

**Autenticação:** Admin (obrigatório)

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `window` | number | Não | Janela de tempo em ms (padrão: 3600000 = 1h) |

**Exemplo:**
```
GET /api/admin/rate-limit?window=60000
```

**Response (200):**
```json
{
  "stats": {
    "totalRequests": 1234,
    "blockedRequests": 56,
    "avgLatencyMs": 45,
    "byEndpoint": {
      "/chat/mensagem": { "requests": 800, "blocked": 10 },
      "/insights/diario": { "requests": 434, "blocked": 46 }
    }
  },
  "health": {
    "status": "healthy",
    "uptime": 86400,
    "memoryUsage": { "used": 128000000, "total": 268435456 }
  }
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `stats.totalRequests` | number | Total de requisições na janela |
| `stats.blockedRequests` | number | Requisições bloqueadas por rate limit |
| `stats.avgLatencyMs` | number | Latência média em ms |
| `stats.byEndpoint` | object | Estatísticas por endpoint |
| `health.status` | string | Estado do sistema |
| `health.uptime` | number | Tempo de atividade em segundos |
| `health.memoryUsage` | object | Uso de memória |

**Errors:**
- `401` - Não autenticado
- `403` - Acesso negado (não é admin)

---

### Notifications

#### `GET /notifications/preferences`

Retorna as preferências de notificação do usuário autenticado.

**Autenticação:** Supabase (obrigatório)

**Response (200):**
```json
{
  "email": true,
  "push": false,
  "transitAlerts": true,
  "dailyInsights": true
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | boolean | Notificações por email habilitadas |
| `push` | boolean | Notificações push habilitadas |
| `transitAlerts` | boolean | Alertas de trânsitos planetários |
| `dailyInsights` | boolean | Insights diários |

**Errors:**
- `401` - Não autenticado

---

#### `PUT /notifications/preferences`

Atualiza as preferências de notificação do usuário autenticado.

**Autenticação:** Supabase (obrigatório)

**Request:**
```json
{
  "email": true,
  "push": true,
  "transitAlerts": false,
  "dailyInsights": true
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | boolean | Não | Notificações por email |
| `push` | boolean | Não | Notificações push |
| `transitAlerts` | boolean | Não | Alertas de trânsitos planetários |
| `dailyInsights` | boolean | Não | Insights diários |

**Response (200):**
```json
{
  "email": true,
  "push": true,
  "transitAlerts": false,
  "dailyInsights": true
}
```

**Errors:**
- `400` - Payload inválido (campos não são booleanos)
- `401` - Não autenticado

---

## Custos de Créditos

| Operação | Custo |
|----------|-------|
| Chat (mensagem) | 2 créditos |
| Insight Diário | 1 crédito |

---

## Ambiente Local

Para testar localmente, configure o arquivo `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Prisma
DATABASE_URL=postgresql://...
```

---

## Validação

O projeto utiliza Zod para validação de schemas. Verifique `src/lib/validators.ts` para schemas de validação compartilhados.

---

## Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | 2024-01-15 | Versão inicial |
| 1.1 | 2024-03-20 | Adicionados endpoints Admin e Notifications |
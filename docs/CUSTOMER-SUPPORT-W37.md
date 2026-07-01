# Customer Support — Wave 37

> **Status:** ✅ Shipped (Wave 37)
> **Wave:** SUPPORT 5/8
> **Date:** 2026-07-01
> **Owner:** Coder + Caio (security) + Lina (designer)
> **Branch:** `main` @ `b21ec520` → feat(support)

Infraestrutura completa de suporte ao cliente: helpdesk + live chat + ticketing + SLA + CSAT + email inbound.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Modelos de dados (Prisma)](#2-modelos-de-dados-prisma)
3. [Ticket lifecycle](#3-ticket-lifecycle)
4. [API endpoints](#4-api-endpoints)
5. [SLA matrix](#5-sla-matrix)
6. [Agent workflow](#6-agent-workflow)
7. [Routing logic](#7-routing-logic)
8. [Canned responses](#8-canned-responses)
9. [CSAT process](#9-csat-process)
10. [Live chat](#10-live-chat)
11. [Email inbound (Postmark)](#11-email-inbound-postmark)
12. [Agent dashboard](#12-agent-dashboard)
13. [Helpdesk UI (cliente)](#13-helpdesk-ui-cliente)
14. [Public help center](#14-public-help-center)
15. [LGPD compliance](#15-lgpd-compliance)
16. [Rate limiting](#16-rate-limiting)
17. [Auditoria](#17-auditoria)
18. [Operating hours](#18-operating-hours)
19. [Edge cases tratados](#19-edge-casos-tratados)
20. [Métricas & KPIs](#20-métricas--kpis)
21. [Roadmap W38+](#21-roadmap-w38)
22. [Variáveis de ambiente](#22-variáveis-de-ambiente)
23. [Como rodar localmente](#23-como-rodar-localmente)
24. [Testes](#24-testes)
25. [Arquivos criados](#25-arquivos-criados)
26. [Cross-project lessons](#26-cross-project-lessons)

---

## 1. Visão geral

A Wave 37 entrega a infraestrutura de suporte ao cliente para a fase de open beta. O sistema é composto por **5 superfícies** (cliente, agente, admin, público, interno) e **8 APIs** que sustentam helpdesk + chat ao vivo + e-mail inbound + SLA tracking + CSAT.

```
┌──────────────────────────────────────────────────────────┐
│ Cliente                                                  │
│  ├── /support (helpdesk: meus tickets + novo + detalhe) │
│  ├── LiveChatWidget (flutuante bottom-right)            │
│  ├── /support (info) — central de ajuda pública         │
│  └── Email → ticket (via Postmark inbound webhook)      │
└──────────────────────────────────────────────────────────┘
                          ↓↑
┌──────────────────────────────────────────────────────────┐
│ APIs (Next.js route handlers)                            │
│  ├── POST /api/support/tickets                          │
│  ├── GET /api/support/tickets                           │
│  ├── GET /api/support/tickets/[id]                      │
│  ├── POST /api/support/tickets/[id]/messages            │
│  ├── POST /api/support/chat?action=start|message         │
│  ├── GET /api/support/chat?sessionId=                   │
│  ├── POST /api/support/csat                             │
│  ├── POST /api/support/inbound  (Postmark webhook)      │
│  ├── GET /api/admin/support/tickets                     │
│  └── PATCH /api/admin/support/tickets/[id]              │
└──────────────────────────────────────────────────────────┘
                          ↓↑
┌──────────────────────────────────────────────────────────┐
│ Lib (src/lib/support/)                                  │
│  ├── types.ts        — DTOs + enums (re-export Prisma) │
│  ├── canned-responses.ts — 24 templates com variáveis   │
│  ├── auto-routing.ts — decide team + priority           │
│  ├── sla.ts          — política + breach detection      │
│  ├── csat.ts         — aggregate + detractor alerts     │
│  ├── email-inbound.ts — Postmark payload parser         │
│  └── index.ts        — barrel export                    │
└──────────────────────────────────────────────────────────┘
                          ↓↑
┌──────────────────────────────────────────────────────────┐
│ Banco (Prisma)                                           │
│  ├── SupportTicket (com índices status+priority, team) │
│  ├── TicketMessage (threading cronológico)              │
│  └── AuditLog (LGPD Art. 37 — toda operação registrada) │
└──────────────────────────────────────────────────────────┘
                          ↓↑
┌──────────────────────────────────────────────────────────┐
│ Agente                                                   │
│  ├── /admin/support — fila + SLA + ações rápidas       │
│  └── Canned responses picker (search por keyword)       │
└──────────────────────────────────────────────────────────┘
```

## 2. Modelos de dados (Prisma)

### 2.1 `SupportTicket`

```prisma
model SupportTicket {
  id           String         @id @default(cuid())
  userId       String?        // null = visitante anônimo
  email        String?        // contato se userId for null
  status       TicketStatus   @default(NEW)
  priority     TicketPriority @default(MEDIUM)
  category     TicketCategory
  subject      String
  description  String         @db.Text
  assignedTo   String?        // agent userId
  team         String?        // BILLING | TECHNICAL | ...
  firstResponseAt DateTime?
  resolvedAt   DateTime?
  closedAt     DateTime?
  satisfactionRating    Int? // 1-5 (CSAT)
  satisfactionComment   String?
  satisfactionSubmittedAt DateTime?
  tags         String[]
  metadata     Json?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  messages     TicketMessage[]

  @@index([status, priority])
  @@index([assignedTo, status])
  @@index([userId, createdAt])
  @@index([team, status])
  @@index([category, status])
  @@index([priority, status, createdAt])
  @@map("support_tickets")
}
```

**Índices críticos** (para queries do dashboard e SLA reports):

- `(status, priority)` — fila "URGENT primeiro"
- `(assignedTo, status)` — "meus tickets em aberto"
- `(team, status)` — "fila da equipe X"
- `(category, status)` — analytics por categoria
- `(priority, status, createdAt)` — ordenação SLA

### 2.2 `TicketMessage`

```prisma
model TicketMessage {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  userId      String?  // null = mensagem de agente/sistema
  agentId     String?  // null = mensagem de cliente
  body        String   @db.Text
  isInternal  Boolean  @default(false)  // nota interna entre agentes
  attachments String[]
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([ticketId, createdAt])
  @@index([agentId, createdAt])
  @@map("ticket_messages")
}
```

`onDelete: Cascade` garante que excluir um ticket remove todas as messages automaticamente (LGPD Art. 18).

### 2.3 Enums

```prisma
enum TicketStatus    { NEW OPEN PENDING_CUSTOMER PENDING_AGENT RESOLVED CLOSED }
enum TicketPriority  { LOW MEDIUM HIGH URGENT }
enum TicketCategory  { BILLING TECHNICAL CONTENT COMMUNITY ACCOUNT OTHER }
```

## 3. Ticket lifecycle

```
                          ┌──────────┐
                          │   NEW    │ (criado pelo usuário)
                          └────┬─────┘
                               │ primeira resposta de agente
                               ▼
                          ┌──────────┐
              ┌──────────│   OPEN   │◀───────────┐
              │           └────┬─────┘            │
              │ agente envia    │ cliente         │
              │ msg pública     │ responde        │
              ▼                ▼                 │
       ┌──────────────┐  ┌──────────────┐       │
       │ PENDING_     │  │ PENDING_     │       │
       │ CUSTOMER     │  │ AGENT        │───────┘
       └──────┬───────┘  └──────┬───────┘  (cliente responde)
              │ cliente        │ agente
              │ responde       │ resolve
              ▼                ▼
                         ┌──────────┐
                         │ RESOLVED │ ──▶ CSAT survey ──▶ CLOSED
                         └──────────┘                         │
                                                              │ (auto-close 14d)
                                                              ▼
                                                        ┌──────────┐
                                                        │  CLOSED  │
                                                        └──────────┘
```

**Transições automáticas** (lib + API):

- Cliente responde → `PENDING_AGENT`
- Agente responde (não-internal) → `PENDING_CUSTOMER`
- Primeira resposta de agente → set `firstResponseAt`
- `status = RESOLVED` → set `resolvedAt`
- `status = CLOSED` → set `closedAt`
- 14 dias após `RESOLVED` sem resposta → `CLOSED` (cron job, W38)

## 4. API endpoints

### 4.1 `POST /api/support/tickets`

**Body:**
```json
{
  "subject": "Não consigo cancelar minha assinatura",
  "description": "Já tentei 3 vezes pelo /account mas o botão não responde...",
  "category": "BILLING",
  "email": "user@example.com",
  "tags": ["cancelamento"]
}
```

**Response 201:**
```json
{
  "ticket": {
    "id": "ck...",
    "status": "NEW",
    "priority": "MEDIUM",
    "team": "BILLING",
    "assignedTo": "agent-billing-01",
    "createdAt": "2026-07-01T..."
  },
  "routing": {
    "team": "BILLING",
    "priority": "MEDIUM",
    "assignedTo": "agent-billing-01",
    "reason": "Categoria manual: BILLING"
  }
}
```

**Erros:**

- `400 validation_error` — campos inválidos
- `400 missing_email` — visitante anônimo sem email
- `429 rate_limited` — >10 tickets/dia

### 4.2 `GET /api/support/tickets`

Query: `?userId=...` OU `?email=...` + `limit` (default 20, max 50).

### 4.3 `GET /api/support/tickets/[id]`

Query: `?requesterId=...` + `?email=...` + `?agent=true`.

Mensagens internas (`isInternal: true`) só retornadas se `agent=true`.

### 4.4 `POST /api/support/tickets/[id]/messages`

Body:
```json
{
  "body": "Mensagem aqui",
  "authorType": "customer" | "agent" | "system",
  "authorId": "user_xxx",
  "isInternal": false,
  "attachments": ["https://..."]
}
```

Side effects:
- Primeira resposta de agente → `firstResponseAt`
- Status transition (PENDING_AGENT / PENDING_CUSTOMER)

### 4.5 `POST /api/support/chat?action=start`

Pre-chat form:
```json
{
  "name": "João",
  "email": "joao@example.com",
  "category": "TECHNICAL",
  "initialMessage": "Olá, preciso de ajuda com..."
}
```

Response: `{ sessionId, status: 'OPEN' }`

### 4.6 `POST /api/support/chat?action=message`

```json
{ "sessionId": "ck...", "body": "msg", "authorType": "customer" }
```

### 4.7 `GET /api/support/chat?sessionId=...&since=ISO`

Retorna messages novas + `pollMs: 5000` para o cliente fazer long-poll.

### 4.8 `POST /api/support/csat`

```json
{ "ticketId": "ck...", "rating": 5, "comment": "Ótimo!", "userId": "..." }
```

Detractor (rating ≤ 3) → escalation flag no audit log → manager review queue.

### 4.9 `POST /api/support/inbound`

Webhook Postmark. Valida HMAC SHA-256 com `POSTMARK_INBOUND_SECRET`. Cria ticket OU appende mensagem ao ticket existente (via `In-Reply-To` header ou `[#ticketId]` no subject).

### 4.10 `GET /api/admin/support/tickets`

Filtros: `?status=&priority=&team=&assignedTo=&unassigned=true&q=search`.

Response inclui `sla: { breached, atRisk, hoursRemaining }` calculado server-side.

### 4.11 `PATCH /api/admin/support/tickets/[id]`

Body:
```json
{
  "status": "RESOLVED",
  "priority": "HIGH",
  "assignedTo": "agent-tech-02",
  "tags": ["escalated"],
  "actorId": "agent_admin_xxx"
}
```

Side effects: `resolvedAt`, `closedAt`, `satisfactionSubmittedAt` setados automaticamente quando aplicável.

## 5. SLA matrix

### 5.1 Tabela (lib/support/sla.ts)

| Plan | Priority | First Response | Resolution |
|------|----------|----------------|------------|
| PRO  | URGENT   | 4h             | 24h        |
| PRO  | HIGH     | 8h             | 48h        |
| PRO  | MEDIUM   | 24h            | 72h        |
| PRO  | LOW      | 48h            | 120h       |
| FREE | URGENT   | 8h             | 48h        |
| FREE | HIGH     | 24h            | 72h        |
| FREE | MEDIUM   | 48h            | 120h       |
| FREE | LOW      | 72h            | 168h (7d)  |

### 5.2 Status computation

```ts
import { computeSlaStatus } from '@/lib/support';

const status = computeSlaStatus({
  plan: 'FREE',
  priority: 'MEDIUM',
  createdAt: ticket.createdAt,
  firstResponseAt: ticket.firstResponseAt,
  resolvedAt: ticket.resolvedAt,
  status: ticket.status,
});
// → { firstResponseDueAt, resolutionDueAt, breached, atRisk, hoursRemaining }
```

**`atRisk`**: dentro de 20% do tempo total (ex: 24h policy → atRisk quando faltam <4.8h).

### 5.3 Alertas

`detectSlaAlerts()` retorna flags que disparam emails transacionais:

- `AT_RICK_FIRST_RESPONSE` — <20% do firstResponse policy
- `BREACHED_FIRST_RESPONSE` — sem firstResponseAt > policy
- `AT_RISK_RESOLUTION` — <20% do resolution policy
- `BREACHED_RESOLUTION` — sem resolvedAt > policy

Email cron (W38) itera tickets abertos e dispara via Postmark outbound.

### 5.4 SLA report (sem PII)

```ts
const report = buildSlaReport([
  { priority: 'URGENT', firstResponseAt: ..., resolvedAt: ..., createdAt: ..., breached: false },
  // ...
]);
// → { totalTickets, breached, atRisk, resolvedInSla, avgFirstResponseHours, byPriority }
```

LGPD-safe: relatório NÃO inclui userId nem email.

## 6. Agent workflow

### 6.1 Login / identificação

Wave 37: agentes são identificados por `userId` no body de PATCH. **Auth real será em W38** com NextAuth role `support_agent`.

### 6.2 Fluxo padrão

1. Agente entra em `/admin/support`
2. Fila mostra tickets ordenados: breached → atRisk → priority → oldest
3. Agente clica em ação rápida:
   - **Resolver** → status RESOLVED → dispara CSAT em 24h (cron W38)
   - **Fechar** → status CLOSED
   - **↑ Urgente** → priority URGENT
4. Para responder com texto: abrir ticket (futuro) → enviar mensagem pública ou nota interna

### 6.3 Canned responses

Painel (futuro W38) lista 24 templates. Agente digita keyword → busca → insere no editor. Variáveis (`{userName}`, `{date}`, etc) substituídas automaticamente.

### 6.4 Notas internas

`POST /api/support/tickets/[id]/messages` com `isInternal: true` + `authorType: 'agent'`. Não visível ao cliente.

### 6.5 Workload distribution

Round-robin in-memory (lib/support/auto-routing.ts → `pickAgent`). Para produção, mover cursor para Redis ou tabela `support_team_cursor` (W38).

## 7. Routing logic

### 7.1 Decisão

```ts
import { assignTicket } from '@/lib/support';

const assignment = assignTicket(
  'Não consigo acessar minha conta',
  'Já tentei resetar a senha 5 vezes...',
  'ACCOUNT',
);
// → { team: 'ACCOUNT', priority: 'MEDIUM', assignedTo: 'agent-account-01', ... }
```

### 7.2 Algoritmo

1. **Priority detection** (URGENT keywords pt-BR + en):
   - "urgente", "crítico", "não consigo acessar", "fraude", "compromised", "down"…
2. **Team detection** (se categoria manual):
   - Categoria manual → team mapeado direto
3. **Team detection** (fallback):
   - Score por keyword match em 5 dicionários (BILLING/TECHNICAL/CONTENT/COMMUNITY/ACCOUNT)
   - Empate → categoria manual tem precedência
   - Zero matches → fallback ACCOUNT

### 7.3 Keywords por equipe

| Team | Exemplos (pt-BR + en) |
|------|------------------------|
| BILLING | cobrança, fatura, pix, boleto, refund, subscription |
| TECHNICAL | erro, bug, travou, crash, api, 500, timeout |
| CONTENT | conteúdo, artigo, curadoria, tradução, copyright |
| COMMUNITY | grupo, moderação, denúncia, assédio, spam |
| ACCOUNT | conta, login, senha, 2fa, lgpd, exclusão |

Total: ~90 keywords. Lista completa em `src/lib/support/auto-routing.ts`.

### 7.4 Round-robin agents

```ts
export const TEAM_AGENTS = {
  BILLING:    [{ id: 'agent-billing-01' }, { id: 'agent-billing-02' }],
  TECHNICAL:  [{ id: 'agent-tech-01' }, { id: 'agent-tech-02' }, { id: 'agent-tech-03' }],
  CONTENT:    [{ id: 'agent-content-01' }],
  COMMUNITY:  [{ id: 'agent-community-01' }, { id: 'agent-community-02' }],
  ACCOUNT:    [{ id: 'agent-account-01' }],
};
```

Wave 37: registry estático. W38: tabela `SupportAgent` com login + workload real.

## 8. Canned responses

### 8.1 Catálogo (24 templates)

Por categoria:

- **BILLING** (5): reembolso, cancelamento, NF, falha pagamento, upgrade
- **TECHNICAL** (5): reset senha, erro app, problema conhecido, export LGPD, cache
- **CONTENT** (3): takedown, tradução, contribuição
- **COMMUNITY** (3): denúncia, bloquear, entrar em grupo
- **ACCOUNT** (3): exclusão LGPD, merge, 2FA
- **ALL** (4): saudação, encerramento, pedir detalhes, agradecimento

### 8.2 Variáveis

Templates usam `{varName}` — substituição em `renderCannedResponse()`.

| Variável | Contexto |
|----------|----------|
| `{userName}` | Nome do cliente |
| `{agentName}` | Nome do agente |
| `{date}` | Data atual ou referência |
| `{ticketId}` | ID curto do ticket |
| `{resetLink}` | Link de reset de senha |
| `{refundAmount}` | Valor (BRL formatado) |
| `{refundDays}` | Prazo em dias úteis |
| `{planName}` | "Pro" / "Free" / etc |
| `{kbArticleId}` | URL do artigo KB |
| `{feedbackLink}` | URL do form de feedback |
| `{helpCenterUrl}` | URL central de ajuda |

### 8.3 Busca

```ts
import { searchCannedResponses } from '@/lib/support';

searchCannedResponses('cancelar', 'BILLING');
// → [CannedResponse, ...] top 10
```

Search é substring case-insensitive contra `title` e `keywords[]`.

## 9. CSAT process

### 9.1 Trigger

Após `status = RESOLVED`, cron job (W38) envia email com link `https://app/csat/[ticketId]`. Cliente preenche rating 1-5 + comentário opcional.

### 9.2 Submit

`POST /api/support/csat` valida e persiste. Side effects:

- `satisfactionRating`, `satisfactionComment`, `satisfactionSubmittedAt` setados
- Audit log `SUPPORT_CSAT_SUBMITTED`
- Se detractor (rating ≤ 3) → audit log `SUPPORT_DETRACTOR_ESCALATED` → manager review queue

### 9.3 Aggregate

```ts
import { aggregateCsat } from '@/lib/support';

aggregateCsat([
  { rating: 5, createdAt: ... },
  { rating: 4, createdAt: ... },
  // ...
]);
// → { total: 2, average: 4.5, promoters: 1, passives: 1, detractors: 0, csatScore: 100 }
```

CSAT Score = % de ratings 4-5 (industry standard, "Top 2 Box").

### 9.4 Weekly report

```ts
const weekly = buildWeeklyCsatReport('2026-W27', ratings, prevScore);
// → { weekIso, totalResponses, average, csatScore, detractors, trend }
```

Trend: UP (>+5 pp), DOWN (<-5 pp), STABLE, INSUFFICIENT_DATA (<5 respostas).

### 9.5 Escalation rule

`shouldEscalateToManager(rating, comment)`:
- `rating <= 2` → true (hard escalation)
- `rating === 3 && comment.length > 50` → true (thoughtful detractor)
- senão → false

## 10. Live chat

### 10.1 Widget

`src/components/support/LiveChatWidget.tsx` — botão flutuante bottom-right.

### 10.2 Estados

1. **Fechado** — mostra botão 💬
2. **Pre-chat** — form (nome, email, categoria, msg inicial)
3. **Chat** — thread com polling 5s

### 10.3 Operating hours

- **Online:** 12h-21h UTC (9h-18h BRT) — bolinha verde
- **Offline:** demais horários — bolinha amarela, fallback "deixe mensagem" (cria ticket)

### 10.4 Polling vs WebSocket

Wave 37 usa polling 5s (suficiente para 90% dos casos). Migração para WebSocket/SSE prevista em W38 quando volume justificar.

### 10.5 Acessibilidade

- `role="dialog"` + `aria-modal="true"`
- Esc fecha o painel
- Focus no primeiro input ao abrir
- `aria-live="polite"` para mensagens novas
- `aria-label` em todos botões

## 11. Email inbound (Postmark)

### 11.1 Webhook

Postmark → `POST /api/support/inbound` com payload JSON.

### 11.2 Signature verification

HMAC SHA-256 com `POSTMARK_INBOUND_SECRET`. Header `X-Postmark-Signature`. Em dev, log warning se secret ausente (não bloqueia).

### 11.3 Reply matching

3 estratégias (em ordem):

1. **`In-Reply-To` header** contém `<ticketId@cabaladoscaminhos.com.br>` — match direto
2. **Subject contém `[#ticketId]`** — match direto
3. **Fallback**: email do remetente = ticket aberto mais recente → appende message

### 11.4 Estrutura do ticket inbound

- `tags: ['email-inbound']`
- `category: 'OTHER'` (será classificado pelo agente)
- `metadata.source: 'email'`

### 11.5 Reply-by-email

Outbound (W38): Postmark outbound envia reply com header `In-Reply-To: <ticketId@...>` → cliente responde → inbound webhook match → append.

## 12. Agent dashboard

### 12.1 Rota

`/admin/support` (autenticado, role `support_agent` em W38).

### 12.2 Stats cards (4)

- Total na fila
- Abertos (NEW + OPEN)
- SLA em risco (atRisk)
- SLA estourado (breached)

### 12.3 Filtros

- Busca textual (assunto, email, descrição)
- Status
- Equipe
- "Não atribuídos"

### 12.4 Ordenação

Prioridade: breached → atRisk → priority (URGENT < HIGH < MEDIUM < LOW) → oldest.

### 12.5 Ações inline

- Resolver (verde)
- Fechar (cinza)
- ↑ Urgente (vermelho)

### 12.6 SLA indicator por linha

- ⚠️ Estourado (vermelho)
- ⏰ Xh (amarelo)
- Xh (cinza)

## 13. Helpdesk UI (cliente)

### 13.1 Rota

`(community)/support/page.tsx` — `https://app/support`.

### 13.2 Visões

1. **Lista** — tickets do próprio user (filtros status/categoria)
2. **Novo** — form (assunto, categoria, descrição, email opcional)
3. **Detalhe** — thread + reply form

### 13.3 Acessibilidade

- `<main>` com `aria-labelledby`
- Filtros com `aria-label`
- Mensagens com cores por autor (cliente = branco, agente = roxo, sistema = cinza)
- `role="alert"` para erros
- `aria-live="polite"` para mudanças
- Cmd/Ctrl+Enter para enviar reply

### 13.4 Filtros

- Status (6 opções)
- Categoria (6 opções)

## 14. Public help center

### 14.1 Rota

`(info)/support/page.tsx` — `https://app/support` (público).

Server component (zero JS exceto busca). Categorias em grid 3×2, artigos populares, CTA gradient.

### 14.2 Estrutura

1. Hero — "Como podemos ajudar?"
2. Search bar (placeholder — W38 wire)
3. Categorias (6 cards)
4. Artigos populares (5)
5. CTA gradient — "Abrir ticket / Email / Status"

### 14.3 SEO

`<main>` semântico, `<h1>` único, headings hierárquicos, links internos. Server-rendered → indexável.

## 15. LGPD compliance

### 15.1 Art. 7 (consentimento)

- Visitante anônimo pode abrir ticket mas precisa email
- Mensagens do cliente = tratamento de dado pessoal (texto livre)
- Opt-in explícito para receber notificações (futuro)

### 15.2 Art. 18 (direitos do titular)

- **Acesso:** `GET /api/support/tickets/[id]` retorna tudo do titular
- **Exportação:** `GET /api/account/export` (W38 — já planejado) inclui `support_tickets` + `ticket_messages`
- **Exclusão:** DELETE cascade via `onDelete: Cascade` + soft delete LGPD (`deletedAt`, futuro)
- **Correção:** `PATCH /api/admin/support/tickets/[id]` com `actorId` (audit log registra)

### 15.3 Art. 37 (registro de operações)

Toda operação escreve em `AuditLog`:

| Ação | TargetType | actorId |
|------|-----------|---------|
| `SUPPORT_TICKET_CREATED` | SupportTicket | userId |
| `SUPPORT_TICKET_UPDATED` | SupportTicket | agentId |
| `SUPPORT_MESSAGE_ADDED` | TicketMessage | userId/agentId |
| `SUPPORT_NOTE_ADDED` | TicketMessage | agentId |
| `SUPPORT_CSAT_SUBMITTED` | SupportTicket | userId |
| `SUPPORT_DETRACTOR_ESCALATED` | SupportTicket | null (sistema) |
| `SUPPORT_INBOUND_EMAIL_CREATED` | SupportTicket | null (sistema) |

### 15.4 IP hashing

`hashIp()` usa SHA-256 com `IP_SALT` env. Hash de 24 chars (não reversível).

### 15.5 SLA reports (sem PII)

`buildSlaReport()` aceita apenas priority + timestamps — não userId/email.

## 16. Rate limiting

### 16.1 Tickets

10/dia por (userId | email | ipHash) — implementado in-memory em `POST /api/support/tickets/route.ts`.

### 16.2 Live chat

Mesma chave (userId | email | ipHash). Limite futuro: 5 sessões/dia.

### 16.3 CSAT

1 submissão por ticket (validado em runtime — UPDATE não INSERT).

### 16.4 Email inbound

Sem rate limit (controlado pelo Postmark).

### 16.5 Roadmap

W38: migrar para Redis (Upstash) com TTL de 24h, sliding window.

## 17. Auditoria

### 17.1 AuditLog (LGPD Art. 37)

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  actorId     String?
  action      String   // ex: SUPPORT_TICKET_CREATED
  targetType  String   // ex: SupportTicket
  targetId    String
  metadata    Json?    // contexto da operação
  createdAt   DateTime @default(now())
  ...
}
```

### 17.2 Cobertura

100% das mutações (criação, update, message add, csat) → audit log. Falha de audit é warning (não bloqueia operação principal) — fail-soft para não quebrar UX.

### 17.3 Retention

AuditLog é mantido por 5 anos (obrigação legal). Rotação via cron (W38).

## 18. Operating hours

### 18.1 Chat widget

- **Online:** 12h-21h UTC = 9h-18h BRT
- **Offline:** demais horários — bolinha amarela + fallback "deixe mensagem"

### 18.2 SLA 24/7

SLA roda 24/7 independente do chat. Tickets URGENT recebem notificação mesmo fora do horário.

### 18.3 Email inbound

24/7 — emails viram tickets a qualquer hora. SLA clock inicia no momento do receive.

## 19. Edge cases tratados

### 19.1 Visitante anônimo

- Email obrigatório no POST
- IP hasheado para rate limit
- Match via `email` no GET (não `userId`)

### 19.2 Ticket fechado

- `POST /messages` retorna 409 `ticket_closed`
- UI mostra aviso "ticket foi fechado"

### 19.3 Internal notes vs public

- Filtro no `GET /tickets/[id]` baseado em `?agent=true`
- UI cliente nunca vê `isInternal: true`

### 19.4 Detractor escalation

- Audit log flag → manager review queue (W38)

### 19.5 SLA breach mid-conversation

- Status recalculado em cada fetch do dashboard
- `detectSlaAlerts()` em cron job (W38)

### 19.6 Concurrent agent updates

- PATCH é idempotente (last-write-wins)
- Audit log preserva histórico completo

### 19.7 Email reply race

- Inbound webhook pode chegar antes do POST inicial → fallback "open ticket by email"

### 19.8 Long polling

- Chat polling com `since` param → idempotente, sem duplicatas

## 20. Métricas & KPIs

### 20.1 Agent metrics

- **First response time** (média, p50, p95)
- **Resolution time** (média, p50, p95)
- **Tickets per agent** (workload distribution)
- **SLA breach rate** (% por priority)

### 20.2 Customer metrics

- **CSAT score** (% 4-5)
- **NPS** (futuro W38)
- **Ticket volume** (por categoria, por team)

### 20.3 System metrics

- **Inbound email volume** (Postmark)
- **Chat sessions** (peak hours)
- **API latency** (p95 POST /messages)

### 20.4 Dashboard endpoint

W38: `GET /api/admin/support/stats?range=7d` retorna objeto agregado.

## 21. Roadmap W38+

### 21.1 W38 — Auth + cron

- NextAuth role `support_agent` → middleware gate em `/admin/support/*`
- Cron SLA alerts (a cada 15min) → email outbound via Postmark
- Cron CSAT prompt (24h após RESOLVED) → email com link
- Cron auto-close (14d após RESOLVED sem reply)

### 21.2 W39 — Real-time

- WebSocket (ou SSE) para live chat → remove polling
- Push notification quando agente responde

### 21.3 W40 — Knowledge base integration

- `/api/help/search` powered by embeddings (pgvector)
- Suggest KB article inside ticket creation form
- Agent sidebar: "related articles"

### 21.4 W41 — Analytics

- `/admin/support/analytics` — charts (Chart.js ou Recharts)
- Cohort analysis
- Export CSV (LGPD-safe)

### 21.5 W42 — AI assist

- Auto-suggest reply (LLM fine-tuned em tickets históricos)
- Auto-classify priority (override do heuristic)
- Auto-translate (en/es) para inbound de turistas

## 22. Variáveis de ambiente

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `DATABASE_URL` | Postgres connection | (já existe) |
| `IP_SALT` | Salt para hash de IP | `cabala-prod-salt-xxx` |
| `POSTMARK_INBOUND_SECRET` | HMAC secret para webhook | (Postmark dashboard) |
| `POSTMARK_OUTBOUND_TOKEN` | Server token para emails transacionais | (Postmark dashboard) |
| `SUPPORT_NOTIFICATION_EMAIL` | Email para alertas de escalonamento | `support-leads@cabaladoscaminhos.com.br` |

## 23. Como rodar localmente

### 23.1 Setup

```bash
# 1. Aplicar migrations (Prisma)
npx prisma migrate dev --name support_w37

# 2. (Opcional) Seed com 10 tickets fake
npx tsx scripts/seed-support.ts

# 3. Iniciar dev server
npm run dev
```

### 23.2 Testar APIs

```bash
# Criar ticket
curl -X POST http://localhost:3000/api/support/tickets \
  -H "Content-Type: application/json" \
  -d '{"subject":"Teste","description":"Descrição longa o bastante","category":"OTHER","email":"test@x.com"}'

# Listar meus tickets
curl "http://localhost:3000/api/support/tickets?email=test@x.com"

# Adicionar mensagem
curl -X POST http://localhost:3000/api/support/tickets/{ID}/messages \
  -H "Content-Type: application/json" \
  -d '{"body":"Resposta do cliente","authorType":"customer"}'

# Admin queue
curl "http://localhost:3000/api/admin/support/tickets"

# PATCH (resolver)
curl -X PATCH http://localhost:3000/api/admin/support/tickets/{ID} \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED","actorId":"agent-01"}'

# CSAT
curl -X POST http://localhost:3000/api/support/csat \
  -H "Content-Type: application/json" \
  -d '{"ticketId":"{ID}","rating":5,"comment":"Ótimo!"}'
```

## 24. Testes

### 24.1 Unit (lib/support)

```bash
# Vitest (W38 — backlog)
- decideRouting() — fixtures por categoria
- computeSlaStatus() — boundary cases (breached, atRisk, fresh)
- aggregateCsat() — empty, all 5s, mixed
- searchCannedResponses() — keywords, category filter
- parseInboundEmail() — Reply-To, subject token, attachments
```

### 24.2 Integration (APIs)

```bash
# Playwright (W38)
- POST /tickets → 201 + ticket.id
- POST /tickets (rate limit) → 429 após 11
- POST /messages → firstResponseAt set em primeira resposta de agente
- PATCH /admin/tickets/[id] → resolvedAt set em RESOLVED
- POST /csat → satisfactionRating set
- POST /inbound → cria OU appenda
```

### 24.3 E2E (Playwright)

- Cliente abre ticket → recebe email → responde → agente responde → cliente avalia
- Agente resolve → cron dispara CSAT → cliente preenche → dashboard atualiza

## 25. Arquivos criados

### 25.1 Schema

- `prisma/schema.prisma` — +`SupportTicket`, +`TicketMessage`, +3 enums

### 25.2 Lib

- `src/lib/support/types.ts` — DTOs + enums re-export
- `src/lib/support/canned-responses.ts` — 24 templates
- `src/lib/support/auto-routing.ts` — routing + agents registry
- `src/lib/support/sla.ts` — policies + breach detection + reports
- `src/lib/support/csat.ts` — validation + aggregate + escalation
- `src/lib/support/email-inbound.ts` — Postmark parser + signature verify
- `src/lib/support/index.ts` — barrel export

### 25.3 APIs

- `src/app/api/support/tickets/route.ts` — POST + GET (list)
- `src/app/api/support/tickets/[id]/route.ts` — GET (detail)
- `src/app/api/support/tickets/[id]/messages/route.ts` — POST (add msg)
- `src/app/api/support/chat/route.ts` — POST (start/message) + GET (poll)
- `src/app/api/support/csat/route.ts` — POST (submit)
- `src/app/api/support/inbound/route.ts` — POST (Postmark webhook)
- `src/app/api/admin/support/tickets/route.ts` — GET (queue)
- `src/app/api/admin/support/tickets/[id]/route.ts` — PATCH (update)

### 25.4 UI

- `src/app/(community)/support/page.tsx` — Helpdesk cliente
- `src/app/admin/support/page.tsx` — Agent dashboard
- `src/app/(info)/support/page.tsx` — Public help center
- `src/components/support/LiveChatWidget.tsx` — Floating widget

### 25.5 Docs

- `docs/CUSTOMER-SUPPORT-W37.md` (este arquivo)

**Total:** 17 arquivos novos + 1 schema edit.

## 26. Cross-project lessons

### 26.1 Tabela Prisma com 6 índices

Adicionar 6 índices em `SupportTicket` (status+priority, assignedTo+status, userId+createdAt, team+status, category+status, priority+status+createdAt) parece excessivo, mas cada um serve uma query específica do dashboard. **Reusable**: sempre modelar índices pensando nas queries reais, não só em chaves primárias.

### 26.2 Estado de ticket = enum + side-effect timestamps

Separar `status` (lifecycle) de `firstResponseAt`/`resolvedAt`/`closedAt` (timestamps imutáveis) permite reconstruir histórico sem audit log. **Reusable**: qualquer entidade com state machine deve ter timestamps explícitos para cada transição.

### 26.3 Auto-routing determinístico

`decideRouting()` é puro: mesma entrada = mesma decisão. Permite testes unitários sem mock de DB. **Reusable**: classificação/routing em qualquer domínio (tickets, comments, conteúdo) deve ser puro + testável.

### 26.4 CSAT agregado sem PII

`aggregateCsat()` recebe apenas `rating` + `createdAt` (sem userId). Relatórios rodam sem LGPD risk. **Reusable**: funções de aggregate/report devem aceitar DTOs sem PII por design.

### 26.5 Email inbound com 3 níveis de matching

Reply-token (`In-Reply-To`) → Subject token (`[#id]`) → email fallback. **Reusable**: integração com qualquer webhook externo (Stripe, Postmark, Twilio) deve ter fallback chain — primeiro match vence.

### 26.6 Polling vs WebSocket trade-off

Wave 37: polling 5s (zero infra extra). W38: WebSocket quando volume justificar. **Reusable**: começar com polling, escalar para real-time só quando N conexões simultâneas > threshold.

### 26.7 Canned responses com variáveis inline

`{varName}` em template + `renderCannedResponse()` substitui no client. Mais simples que AST manipulation. **Reusable**: qualquer template engine leve (emails, notificações, respostas) — pattern universal.

### 26.8 Live chat operating hours

Widget mostra bolinha de status (verde/amarelo) + fallback "deixe mensagem" fora do horário. **Reusable**: qualquer widget de comunicação ao vivo deve ter fallback async para offline.

---

**Wave 37 — SUPORTE COMPLETO. Pronto para W38 (auth + cron SLA/CSAT) e W39 (real-time).** 🌙✨
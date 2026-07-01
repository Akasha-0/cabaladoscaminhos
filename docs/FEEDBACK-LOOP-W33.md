# Feedback Loop Wave 33 — Sistema de feedback in-app + NPS + Surveys

**Wave:** 33 (FEEDBACK 7/8) · **Data:** 2026-07-01 · **Status:** ✅ Entregue

> Documentação canônica do sistema de feedback que fecha o ciclo de
> validação com a comunidade. Substitui e complementa o `/feedback`
> placeholder de Wave 28 e adiciona NPS automation + survey semanal.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Modelo de dados (Prisma)](#3-modelo-de-dados-prisma)
4. [API: `/api/feedback`](#4-api-apifeedback)
5. [API: `/api/feedback/mine`](#5-api-apifeedbackmine)
6. [API: `/api/nps`](#6-api-apinps)
7. [API: `/api/admin/feedback`](#7-api-apiadminfeedback)
8. [API: `/api/admin/feedback/[id]`](#8-api-apiadminfeedbackid)
9. [API: `/api/cron/nps-prompt`](#9-api-apicronnps-prompt)
10. [Páginas: `/feedback` e `/admin/feedback`](#10-páginas-feedback-e-adminfeedback)
11. [Componente `NpsPrompt`](#11-componente-npsprompt)
12. [Componente `WeeklySurvey`](#12-componente-weeklysurvey)
13. [NPS automation schedule (Day 1/3/7/14/30)](#13-nps-automation-schedule-day-1371430)
14. [Survey templates & rotação semanal](#14-survey-templates--rotação-semanal)
15. [Métricas e dashboards](#15-métricas-e-dashboards)
16. [Integração Sentry + PostHog](#16-integração-sentry--posthog)
17. [LGPD Art. 7/18 — consentimento e direitos do titular](#17-lgpd-art-718--consentimento-e-direitos-do-titular)
18. [Universalismo (Design Inclusivo)](#18-universalismo-design-inclusivo)
19. [Rate limiting e anti-abuso](#19-rate-limiting-e-anti-abuso)
20. [Roadmap Wave 34+](#20-roadmap-wave-34)
21. [Glossário de termos](#21-glossário-de-termos)
22. [Runbook operacional](#22-runbook-operacional)
23. [Apêndice: schema SQL gerado](#23-apêndice-schema-sql-gerado)

---

## 1. Visão geral

O sistema de feedback Wave 33 implementa três canais complementares de
escuta ativa, alinhados com o plano W32-8 Beta Strategy:

- **Feedback estruturado in-app** (`/feedback`) — formulário com tipo,
  categoria, mensagem, rating 1-5, NPS opcional. Rate limit 3/dia.
- **NPS automation** — widget modal não-bloqueante, disparado pelo cron
  nos dias 1/3/7/14/30 da jornada do usuário. Escala 0-10 + razão.
- **Micro-survey semanal** — 4 perguntas rotativas, multi-step,
  persistidas com seed determinístico (userId + ISO week).

A motivação é tripla:

1. **Validar retenção** — NPS é a métrica padrão de growth (Day 30 é o
   pico de churn para apps mobile-first sensíveis; medir nesse momento
   é crítico).
2. **Priorizar roadmap** — feedback categorizado entra na fila admin com
   status (NEW → IN_REVIEW → PLANNED → DONE/WONT_FIX). Prioridade
   bumpeada manualmente.
3. **Fechar o loop** — admin pode adicionar `reviewNote` visível ao
   usuário em `/api/feedback/mine`, transformando feedback unidirecional
   em conversa.

---

## 2. Arquitetura

```
                        ┌─────────────────────────────────┐
                        │         Cliente (Next.js)       │
                        │                                 │
                        │  /feedback (form)               │
                        │  NpsPrompt modal (global)       │
                        │  WeeklySurvey sidebar           │
                        └─────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
    ┌───────────────┐         ┌─────────────────┐        ┌────────────────┐
    │ /api/feedback │         │   /api/nps      │        │ /api/cron/...  │
    │ (POST/mine)   │         │ (POST)          │        │ nps-prompt     │
    └───────────────┘         └─────────────────┘        └────────────────┘
            │                          │                          │
            │              ┌───────────┴──────┐                   │
            ▼              ▼                  ▼                   ▼
        ┌────────────────────────────────────────────────────────────┐
        │                  Domain (lib/feedback)                    │
        │   zod schemas, rate limit, NPS classify, summary, CSV     │
        └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
        ┌────────────────────────────────────────────────────────────┐
        │                  Prisma + PostgreSQL                       │
        │   FeedbackSubmission · NpsResponse · WeeklySurveyResponse │
        │   NpsPromptSchedule · AuditLog                             │
        └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
        ┌────────────────────────────────────────────────────────────┐
        │         Admin (Next.js, requireAdmin gate)                 │
        │   /admin/feedback (dashboard) + /api/admin/feedback       │
        │   CSV export · фильтры · status transitions               │
        └────────────────────────────────────────────────────────────┘
```

**Stack:**

- **Next.js 14 App Router** (route handlers + server components)
- **Prisma 5** + **PostgreSQL** (mesmo DB do projeto principal)
- **zod 3** para validação
- **NextAuth** para sessão (mesmo `authOptions` da plataforma)
- **Tailwind + tokens semânticos** (`spiritual-gold`, `border`,
  `background`, etc.)
- **Vitest** para unit tests (futuro wave)

**Não-objetivos desta wave:**

- Upload de screenshot (placeholder; virá em W34 via `/api/upload`)
- Análise de sentimento automática (reservado para Wave 35+)
- Integração PostHog ativa (stubs prontos em `events.ts`)

---

## 3. Modelo de dados (Prisma)

Adicionado em `prisma/schema.prisma`:

```prisma
model FeedbackSubmission {
  id          String          @id @default(cuid())
  userId      String?
  type        FeedbackType
  category    String?
  rating      Int?
  nps         Int?
  message     String          @db.Text
  metadata    Json?
  status      FeedbackStatus  @default(NEW)
  priority    Int             @default(0)
  createdAt   DateTime        @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?
  reviewNote  String?
  @@index([userId, type])
  @@index([status, createdAt])
  @@index([type, createdAt])
  @@index([priority, createdAt])
  @@map("feedback_submissions")
}

model NpsResponse {
  id          String        @id @default(cuid())
  userId      String
  score       Int
  reason      String?
  trigger     NpsTrigger
  triggerAt   DateTime
  metadata    Json?
  createdAt   DateTime      @default(now())
  @@unique([userId, trigger, triggerAt])
  @@index([userId, trigger])
  @@map("nps_responses")
}

model WeeklySurveyResponse {
  id            String    @id @default(cuid())
  userId        String
  weekIso       String
  questionId    String
  version       Int       @default(1)
  answer        Json
  metadata      Json?
  createdAt     DateTime  @default(now())
  supersededAt  DateTime?
  @@unique([userId, weekIso, questionId, version])
  @@map("weekly_survey_responses")
}

model NpsPromptSchedule {
  id              String    @id @default(cuid())
  userId          String    @unique
  triggersShown   String[]  @default([])
  lastPromptedAt  DateTime?
  skippedAt       DateTime?
  pausedUntil     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  @@map("nps_prompt_schedule")
}

enum FeedbackType { BUG FEATURE CONTENT USABILITY COMMUNITY OTHER }
enum FeedbackStatus { NEW IN_REVIEW PLANNED DONE WONT_FIX }
enum NpsTrigger { DAY_1 DAY_3 DAY_7 DAY_14 DAY_30 QUARTERLY MANUAL }
```

### Decisões

- **`userId` nullable** em `FeedbackSubmission` — permite feedback
  anônimo (LGPD + acessibilidade). Para usuários autenticados sem
  opt-out, `userId` é preenchido.
- **`@@unique([userId, trigger, triggerAt])`** em `NpsResponse` —
  garante idempotência do upsert no endpoint.
- **`triggersShown String[]`** em `NpsPromptSchedule` — simples e
  portável. Migração para `NpsTrigger[]` requer cast `text[]` → enum.
- **`supersededAt DateTime?`** em `WeeklySurveyResponse` — permite
  versionamento sem hard delete; LGPD Art. 18 (esquecimento) é via
  supersede + auditoria, não exclusão física.
- **`reviewNote`** — visível ao usuário em `/api/feedback/mine`. É o
  "fechar o loop" mencionado em §1.

### Migração

```bash
npx prisma migrate dev --name feedback-wave33
npx prisma generate
```

A migração cria `feedback_submissions`, `nps_responses`,
`weekly_survey_responses` e `nps_prompt_schedule`. Enums são
mapeados como PG types (`text` para segurança de migração).

---

## 4. API: `/api/feedback`

**Métodos:** `POST` (submeter) · `GET` (305 → redireciona para `/mine`)

### `POST /api/feedback`

**Body (zod `FeedbackSubmissionSchema`):**

```ts
{
  type: 'BUG' | 'FEATURE' | 'CONTENT' | 'USABILITY' | 'COMMUNITY' | 'OTHER',
  category?: string | null,   // max 64 chars
  rating?: number | null,     // 1-5
  nps?: number | null,        // 0-10
  message: string,            // 10..4000 chars
  metadata?: Record<string, unknown>,
}
```

**Rate limit:** 3 submissões/dia/`(userId OR ipHash)`. Janela móvel 24h.

**Respostas:**

| Status | Significado |
|---|---|
| `201` | Criado. Body: `{ ok, id, createdAt, remaining }` |
| `400` | Validação falhou. Body: `{ error: 'validation_error', issues[] }` |
| `401` | Não requer, mas... (não retorna 401 — anônimo OK) |
| `429` | Rate limit. Body: `{ error: 'rate_limited', message, resetAt }` |
| `500` | Erro interno |

**Audit:** `FEEDBACK_SUBMITTED` registrado em `AuditLog`.

**IP hashing:** SHA-256(ip + IP_SALT env) truncado a 24 chars. Não
reversível; suficiente para rate limit sem armazenar PII.

### Exemplo

```bash
curl -X POST https://app/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "BUG",
    "category": "notifications",
    "rating": 2,
    "message": "Não estou recebendo push de curtidas no iOS 17.4.",
    "metadata": { "device": "iPhone 13", "os": "iOS 17.4" }
  }'
```

```json
{
  "ok": true,
  "id": "ckz9w3b2p0001",
  "createdAt": "2026-07-01T03:47:12.213Z",
  "remaining": 2
}
```

---

## 5. API: `/api/feedback/mine`

**Método:** `GET`

**Auth:** sessão obrigatória.

**Resposta:**

```ts
{
  data: Array<{
    id: string;
    type: FeedbackType;
    category: string | null;
    rating: number | null;
    nps: number | null;
    message: string;
    status: FeedbackStatus;
    priority: number;
    createdAt: string;     // ISO
    reviewedAt: string | null;
    reviewNote: string | null;
  }>;
  count: number;
}
```

**Ordenação:** `createdAt DESC`, **limite:** 50 mais recentes.

**LGPD Art. 18:** o endpoint `/api/account/export` (Wave 26) já inclui
todas as `FeedbackSubmission.userId = self.id` em formato JSON + CSV.
Esta rota é o atalho "dashboard do meu feedback" com o benefício
adicional de mostrar `reviewNote` (admin responder).

---

## 6. API: `/api/nps`

**Método:** `POST`

**Auth:** sessão obrigatória (NPS é autenticado por design — anônimo é
capturado via `FB.feedbackNps` em outro lugar se necessário).

**Body (zod `NpsSubmissionSchema`):**

```ts
{
  score: number,          // 0..10 inteiro
  reason?: string | null, // max 2000 chars
  trigger: 'DAY_1' | 'DAY_3' | 'DAY_7' | 'DAY_14' | 'DAY_30' | 'QUARTERLY' | 'MANUAL',
  triggerAt?: string,     // ISO; default now()
  metadata?: Record<string, unknown>,
}
```

**Resposta:**

| Status | Significado |
|---|---|
| `201` | Criado/atualizado (upsert idempotente) |
| `400` | Validação falhou |
| `401` | Sem sessão |

**Audit:** `NPS_SUBMITTED` com `score`, `trigger`, `hasReason`.

**Nota:** `score: -1` enviado pelo `NpsPrompt` quando o usuário pulou é
convertido para `null` no cliente. O endpoint não persiste score negativo.

---

## 7. API: `/api/admin/feedback`

**Método:** `GET`

**Auth:** `requireAdmin()` (env `ADMIN_EMAILS` ou `User.planoAssinatura === 'ADMIN'`).

**Query params (`zod querySchema`):**

| Param | Tipo | Descrição |
|---|---|---|
| `type` | enum | `BUG / FEATURE / CONTENT / USABILITY / COMMUNITY / OTHER` |
| `status` | enum | `NEW / IN_REVIEW / PLANNED / DONE / WONT_FIX` |
| `userId` | string | Filtro exato |
| `dateFrom` | ISO | `createdAt >= dateFrom` |
| `dateTo` | ISO | `createdAt <= dateTo` |
| `priority` | `0\|1\|2` | Normal / Alta / Urgente |
| `format` | `json\|csv` | Default JSON |
| `page` | int | 1-based |
| `pageSize` | int | 1-200, default 50 |

**Resposta JSON:**

```ts
{
  data: FeedbackRow[],
  total: number,
  page: number,
  pageSize: number,
  summary: {
    total: number,
    byStatus: Record<FeedbackStatus, number>,
    byType: Record<FeedbackType, number>,
    avgRating: number | null,
    avgNps: number | null,
    npsBreakdown: { promoters: number; passives: number; detractors: number },
    openCount: number,
    resolvedLast7d: number,
  },
}
```

**Resposta CSV** (`?format=csv`): `Content-Type: text/csv` + filename
com data atual. Usado para LGPD Art. 18 (export ao titular).

---

## 8. API: `/api/admin/feedback/[id]`

**Métodos:** `PATCH` (revisar) · `DELETE` (fechar)

### `PATCH` body

```ts
{
  status?: FeedbackStatus,
  priority?: number,        // 0-2
  reviewNote?: string | null,
}
```

Qualquer campo é opcional, mas pelo menos um deve ser fornecido (zod
refine). Atualiza `reviewedAt` automaticamente se `status` mudou.

### `DELETE`

Soft close: marca `status = WONT_FIX` + `reviewedAt = now` +
`reviewedBy = adminId`. **Não** é hard delete — preserva auditoria
(LGPD Art. 37).

### Audit

Ambas as ações geram entradas em `AuditLog`:
`FEEDBACK_REVIEWED` (PATCH) ou `FEEDBACK_CLOSED` (DELETE).

---

## 9. API: `/api/cron/nps-prompt`

**Métodos:** `GET` (cliente), `POST` (cron job)

### `GET /api/cron/nps-prompt`

Auth: sessão autenticada. Retorna o trigger pendente para o usuário
atual **ou** `pending: null` com motivo:

```ts
{ pending: { trigger: 'DAY_3', triggerAt: '...' } | null, reason?: 'opted_out' | 'paused' | 'too_recent' | 'all_done' | 'no_user' }
```

**Regras:**
- Respeita `User.optOutSurveys` (campo a ser adicionado em Wave 34 +
  settings page).
- Respeita `NpsPromptSchedule.pausedUntil` (opt-out temporário).
- Cooldown de 7 dias entre prompts (medida anti-fadiga).
- Calcula próximo trigger via `nextNpsTrigger()` baseado em
  `User.createdAt + dayOffset - já mostrados`.

### `POST /api/cron/nps-prompt`

Auth: header `x-cron-secret` matches `process.env.CRON_SECRET`.

Comportamento:
1. Lista usuários criados nos últimos 60 dias (cap 1000).
2. Para cada um, calcula próximo trigger pendente.
3. Upsert em `NpsPromptSchedule.triggersShown` + `lastPromptedAt = now`.
4. Audit `NPS_TRIGGER_SCHEDULED`.

Resposta:

```ts
{ ok: true, scanned: number, updated: number, promptsTriggered: number, ranAt: ISO }
```

**Configuração recomendada (vercel.json / GitHub Actions):**

```json
{
  "crons": [
    { "path": "/api/cron/nps-prompt", "schedule": "0 9 * * *" },
    { "path": "/api/cron/weekly-survey-prompt", "schedule": "0 10 * * 1" }
  ]
}
```

> O segundo cron (`weekly-survey-prompt`) é stub de Wave 34 — ainda
> não necessário pois WeeklySurvey roda no cliente com seed determinístico.

---

## 10. Páginas: `/feedback` e `/admin/feedback`

### `/feedback`

- Server component com `<FeedbackForm />` client island.
- LGPD banner explicando coleta (URL, user-agent, fingerprint) + retenção (90 dias).
- Acessibilidade: h1 + h2 hierárquicos, focus rings, aria-labelledby em sections.
- Componente `FeedbackForm`:
  - 6 tipos visuais (BUG/FEATURE/CONTENT/USABILITY/COMMUNITY/OTHER) com emojis.
  - Categoria opcional livre (ex: "notifications").
  - Rating 1-5 com emojis.
  - Reset após sucesso + contagem regressiva (`remaining`).
  - Mensagens `role="alert"` (erro) e `role="status"` (sucesso).

### `/admin/feedback`

- Server component (gate via `isAdmin(userId)`).
- Lista 50 mais recentes + summary cards:
  - Total
  - NPS score (calculado: promoters - detractors / total × 100)
  - Abertos (NEW + IN_REVIEW + PLANNED)
  - Resolvidos 7d (DONE + WONT_FIX)
- Client `FeedbackDashboardClient`:
  - Filtros por tipo e status (URL params sincronizados).
  - Export CSV via `/api/admin/feedback?format=csv`.
  - Botões inline para mudar status/priority e adicionar `reviewNote`.
  - Visual priority: 🔥 Urgente, ⚠️ Alta, sem badge = Normal.
- Soft metrics no header:
  - `total` submissions
  - `summary.openCount` abertas
  - `summary.resolvedLast7d` resolvidas

---

## 11. Componente `NpsPrompt`

**Path:** `src/components/feedback/NpsPrompt.tsx`

Modal full-screen (mobile: bottom-sheet pattern; desktop: center dialog).
Carrega `/api/cron/nps-prompt?action=next` ao montar (só se autenticado).

**Comportamento:**

- Score 0-10 em grid 11 colunas (`grid-cols-11`).
- Cores semânticas: 9-10 verde (PROMOTER), 7-8 amarelo (PASSIVE), 0-6 vermelho (DETRACTOR).
- Reason textarea opcional (max 2000 chars).
- Botão "Pular" envia `metadata: { skipped: true }` sem score.
- Foco: trap com `Tab` / `Shift+Tab`, esc fecha.
- `prefers-reduced-motion` respeitado (sem animation quando set).
- Localizado em PT-BR (alinhado com i18n atual).

**Props audit:**

- Submit: POST `/api/nps` com `{ score, reason, trigger, triggerAt, metadata? }`.
- Close: POST com metadata `{ skipped: true }` (score sentinela é descartado server-side).

**Quando montar:**

```tsx
// src/app/layout.tsx ou src/app/(authenticated)/layout.tsx
import { NpsPrompt } from '@/components/feedback/NpsPrompt';
// ...
<NpsPrompt />  // renderiza null se não há pending
```

---

## 12. Componente `WeeklySurvey`

**Path:** `src/components/feedback/WeeklySurvey.tsx`

Sidebar/card lateral com 4 perguntas rotativas.

**Semente de rotação:**

```
seed = hashCode(`${userId}-${isoWeek()}`)  // estável por 7 dias
questions = shuffle(QUESTION_BANK, seed).slice(0, 4)
```

Cada usuário vê um conjunto **diferente mas estável** de perguntas
durante a semana. Reset no segunda-feira quando `isoWeek()` muda.

**Perguntas atuais (`QUESTION_BANK`):**

1. `satisfaction` — NPS-like (0-10)
2. `feature_use` — select (Posts, Grupos, Eventos, etc.)
3. `blocker` — texto livre
4. `referral` — Sim/Não
5. `theme_preference` — select (Cabala, Ifá, Tantra, ...)

**Persistência:**

- Local: `localStorage.setItem('weekly_survey:${week}', 'done')` —
  não mostra 2x na mesma semana.
- Servidor: FeedbackSubmission ÚNICO ao final com `type: 'OTHER'`,
  `category: 'weekly_survey'`, `metadata: { week, questions, answers }`.

**Multi-step pattern:**

- Progress bar com `role="progressbar"`, `aria-valuenow` dinâmico.
- Skip por pergunta (botão "Pular pergunta") — não bloqueia.
- Botão "Próxima →" desabilitado até responder (`answers[q.id] !== undefined`).
- Última pergunta: "Concluir" chama `persist()` e fecha.

**Quando montar:**

```tsx
// Em qualquer layout autenticado, ex: dashboard sidebar
<WeeklySurvey />
```

---

## 13. NPS automation schedule (Day 1/3/7/14/30)

### Mapeamento de dias para trigger

| Day | Trigger | Quando | Objetivo |
|---|---|---|---|
| 0 | (welcome) | Signup | Não envia NPS — onboarding confunde |
| 1 | `DAY_1` | T+24h | First impression (UX, navegação) |
| 3 | `DAY_3` | T+72h | Activation check ("você criou post/grupo?") |
| 7 | `DAY_7` | T+7d | Habit formation ("voltou 3+ vezes?") |
| 14 | `DAY_14` | T+14d | Content fit ("achou o que queria?") |
| 30 | `DAY_30` | T+30d | Retention score (churn iminente) |

### Lógica em `nextNpsTrigger()`

```ts
function nextNpsTrigger(createdAt, triggersShown, now = new Date()) {
  const NPS_DAYS = { DAY_1: 1, DAY_3: 3, DAY_7: 7, DAY_14: 14, DAY_30: 30 };
  for (const [trigger, days] of Object.entries(NPS_DAYS)) {
    if (triggersShown.includes(trigger)) continue;
    const triggerAt = new Date(createdAt.getTime() + days * 86400000);
    if (now >= triggerAt) return { trigger, triggerAt };
  }
  return null;
}
```

### Cron job

- **Frequência:** uma vez por dia (recomendado 09:00 UTC).
- **Escopo:** usuários criados nos últimos 60 dias.
- **Rate:** atualiza `triggersShown` para todos com trigger devido.
- **Cooldown:** 7 dias entre prompts (se um usuário respondeu `DAY_1`,
  próximo `DAY_3` só dispara 7+ dias depois — anti-fadiga).

### Opt-out

- `User.optOutSurveys: Boolean` (TODO W34): usuário pode desativar NPS + survey.
- `NpsPromptSchedule.pausedUntil: DateTime?`: opt-out temporário (ex: "me deixe em paz por 30 dias").

---

## 14. Survey templates & rotação semanal

Templates vivem em **código** (`WeeklySurvey.tsx`) por design:

- Simples de atualizar (PR para mudar banco vs. constante edit).
- Type-safe (TypeScript infere opções).
- Versionamento via git + code review.
- Migração de respostas antigas via campo `version` em
  `WeeklySurveyResponse`.

### Como adicionar uma nova pergunta

```ts
// src/components/feedback/WeeklySurvey.tsx
const QUESTION_BANK: Question[] = [
  // ...existing
  {
    id: 'audio_preference',
    text: 'Conteúdos em áudio (podcast) seriam úteis para você?',
    kind: 'boolean',
  },
];
```

A próxima segunda-feira a pergunta aparece automaticamente no seed
`hash(userId, weekISO)`.

### Customização por persona

Wave 34+ pode introduzir `QUESTION_BANK` por persona (ex: perguntas
para usuários B2C vs. terapeutas B2B). Estrutura já suporta isso via
um array extra + chave de persona.

---

## 15. Métricas e dashboards

### Cards em `/admin/feedback`

| Card | Query | Uso |
|---|---|---|
| Total | `count(*)` | Volume |
| NPS | `(promoters - detractors) / total × 100` | Sentimento agregado |
| Abertos | `count(status IN (NEW, IN_REVIEW, PLANNED))` | Fila ativa |
| Resolvidos 7d | `count(status IN (DONE, WONT_FIX) AND reviewedAt >= now-7d)` | Velocidade |

### KPIs derivados (queries SQL brutas a serem adicionadas W34)

| KPI | Query sketch |
|---|---|
| **NPS trend** | `avg(score) by week` + rolling median |
| **Response rate** | `count(received) / count(triggered) by trigger` |
| **Time to resolution** | `avg(reviewedAt - createdAt)` por tipo/status |
| **Feedback velocity** | `count(*) by day` (linha do tempo) |
| **Categorias top** | `group by category order by count desc limit 10` |

### Export para DPO / auditoria

- CSV via `GET /api/admin/feedback?format=csv` (LGPD Art. 18).
- Filtros aplicáveis (período, user, status).
- JSON via `GET /api/account/export` (já existente em W26).

---

## 16. Integração Sentry + PostHog

### Sentry

- **Bug feedback capture**: `FeedbackForm` envia `type: 'BUG'` com
  `metadata.source` e ID. Em produção, futuro W34 adiciona correlação
  com `Sentry.lastEventId()` no metadata.
- **Tagging**: feedbacks viram tag `feedback.type=Bug` no session
  replay do Sentry (cliente) para triage mais rápida.

### PostHog

- Hooks stub em `src/lib/analytics/events.ts` (`feedbackSubmitted`,
  `feedbackVoted` etc. — preexistentes).
- Esta wave adiciona (W34):
  ```ts
  events.npsPrompted(trigger: NpsTrigger, score: number)
  events.surveyAnswered(week: string, count: number)
  events.adminFeedbackReviewed(status: FeedbackStatus)
  ```
- Sessão PostHog auto-detecta `analyticsConsent` e bloqueia eventos
  sem consentimento (LGPD Art. 7).

### Mixpanel / GA4

- Não integrados nesta wave. Stubs genéricos em `events.ts`
  facilitam adição futura (mesmo shape `trackEvent({ name, properties })`).

---

## 17. LGPD Art. 7/18 — consentimento e direitos do titular

### Art. 7 (consentimento)

- **Feedback anônimo**: permitido sem consentimento (dado não
  pessoal identificável — apenas `metadata.ipHash`, que NÃO permite
  re-identificação sem o `IP_SALT`).
- **Feedback autenticado**: requer `analyticsConsent` aceito OU ação
  explícita de submit (consentimento por ato).
- **NPS**: requer sessão (consentimento implícito via uso da plataforma)
  — usuário pode pular (não persistir).

### Art. 18 (direitos do titular)

- **Acesso**: `GET /api/feedback/mine` (já documentado).
- **Correção**: admin pode adicionar `reviewNote` mas **não pode
  editar** o `message` original (preserva integridade da denúncia).
- **Exclusão**: hard delete via `DELETE /api/account/delete` (já
  existente em W26) cascateia para `FeedbackSubmission`,
  `NpsResponse`, `WeeklySurveyResponse`, `NpsPromptSchedule`.
- **Portabilidade**: CSV export no endpoint admin + JSON no
  `/api/account/export`.

### Art. 37 (registro de operações)

Todas as ações geram `AuditLog`:

- `FEEDBACK_SUBMITTED`
- `FEEDBACK_REVIEWED`
- `FEEDBACK_CLOSED`
- `NPS_SUBMITTED`
- `NPS_TRIGGER_SCHEDULED`

Campos: `actorId`, `action`, `targetType`, `targetId`, `metadata`.

### Retenção

- `metadata.ipHash` expira em 90 dias (cron de limpeza em W26 já
  purge AuditLog > 1 ano; feedback metadata pode manter mais).
- `FeedbackSubmission.message` retida indefinidamente (anonimizada
  se userId removido).

---

## 18. Universalismo (Design Inclusivo)

Aplicado em **todos** os componentes desta wave:

| Critério | Como |
|---|---|
| Touch targets ≥ 44×44px | Botões do NPS, radio do form, CTAs |
| Contraste AA mínimo | Tokens `spiritual-gold`, `foreground`, `muted` calibrados |
| Foco visível | `focus:ring-2` em todos os botões/inputs |
| Labels associadas | `<label htmlFor>` em todos os campos |
| Roles ARIA | `role="dialog"`, `role="radiogroup"`, `role="alert"`, `role="progressbar"` |
| Keyboard nav | Tab order, Enter submit, Esc to close (modal) |
| Texto legível | `text-base` (16px), `leading-relaxed` |
| Linguagem | PT-BR, sem jargão técnico |
| `prefers-reduced-motion` | `motion-safe:` prefix em animações |
| Mobile-first | Layout empilhado em sm, expande em md/lg |
| Status messages | `role="alert"` (urgente) + `role="status"` (info) |
| Idioma da página | `<html lang="pt-BR">` (W28 já) |

### Emojis como reforço visual

- Emojis (🐛 💡 📜 🎨 🤝 ✨ 😞 😐 🙂 🤩) servem **junto** com labels
  verbais — não substituem. Cego/screen reader ouve o label.

---

## 19. Rate limiting e anti-abuso

### `/api/feedback`

- **Limite:** 3/dia/`(userId OR ipHash)`.
- **Janela:** móvel 24h (`createdAt > now - 24h`).
- **Resposta:** `429` + `resetAt` ISO + mensagem PT-BR.
- **Hash do IP:** SHA-256(ip + IP_SALT) truncado 24 chars. Não reversível.

### `/api/nps`

- **Limite:** implícito pela uniqueness `(userId, trigger, triggerAt)`.
- **Cooldown:** 7 dias entre prompts (client + server).
- **Skip:** não persiste (não vira linha).

### `/api/admin/feedback`

- Sem rate limit (admin); entretanto, export CSV com `pageSize > 200`
  é rejeitado pelo zod (anti-prompt-injection).

### Anti-bot patterns (futuras waves)

- **CAPTCHA invisível** (Cloudflare Turnstile) em W34.
- **Honeypot field** (`<input name="company" className="hidden" />`) —
  TODO W34.
- **Behavioral signals** (mouse moves, typing cadence) via PostHog.

---

## 20. Roadmap Wave 34+

| Prioridade | Item | Justificativa |
|---|---|---|
| 🔴 P0 | Add `User.optOutSurveys` + settings UI | Cumprir opt-out sem admin |
| 🔴 P0 | Sentry `lastEventId` correlation em BUG | Bug reports mais úteis |
| 🟡 P1 | Upload screenshot no `FeedbackForm` (s3/presigned) | Visual > texto |
| 🟡 P1 | `/api/survey/weekly` endpoint dedicado (não usar `/feedback`) | Granularidade perguntas isoladas |
| 🟡 P1 | Auto-classify `category` (regex + IA) | Reduz triagem manual |
| 🟢 P2 | Notificação ao usuário quando admin responde (reviewNote) | Fechar loop |
| 🟢 P2 | NPS trend chart no admin (Recharts) | Visão temporal |
| 🟢 P2 | Bulk import (respostas de Typeform) | Migração de canais |
| 🟢 P2 | Slack digest semanal (`@channel`) | Awareness do time |
| ⚪ P3 | Sub-feedback threads (respostas do usuário) | Conversa profunda |
| ⚪ P3 | Marketplace de feature requests (upvotes) | Comunidade vota |

---

## 21. Glossário de termos

| Termo | Definição |
|---|---|
| **NPS** | Net Promoter Score — metodologia da Bain & Company medindo lealdade (0-10) |
| **Promoter** | Score 9-10 — recomendaria ativamente |
| **Passive** | Score 7-8 — indiferente |
| **Detractor** | Score 0-6 — não recomendaria |
| **Trigger** | Janela de tempo em que o NPS deve aparecer (DAY_1, DAY_3, etc.) |
| **Cron** | Job agendado (vercel/curl + CRON_SECRET) |
| **idempotente** | Operação que pode ser repetida sem mudar o resultado |
| **LGPD** | Lei Geral de Proteção de Dados (Brasil, 2020) |
| **Art. 7** | Base legal para tratamento de dados |
| **Art. 18** | Direitos do titular (acesso, correção, exclusão, portabilidade) |
| **Art. 37** | Registro de operações de tratamento |
| **Universalismo** | Design inclusivo para a maior diversidade de pessoas |
| **WCAG AA** | Padrão de acessibilidade (contraste 4.5:1 texto) |
| **SCHEDULE** | Janela NPS (cron internal) |
| **schedule_id** | `nps_prompt_schedule.id` (cuid) — unique por userId |

---

## 22. Runbook operacional

### Configurar cron secret

```bash
# .env.local
CRON_SECRET="$(openssl rand -hex 32)"
```

```bash
# vercel.json
{
  "crons": [
    { "path": "/api/cron/nps-prompt", "schedule": "0 9 * * *" }
  ]
}
```

### Deploy manual do cron (curl)

```bash
curl -X POST https://app/api/cron/nps-prompt \
  -H "x-cron-secret: ${CRON_SECRET}"
```

Resposta esperada:

```json
{
  "ok": true,
  "scanned": 234,
  "updated": 12,
  "promptsTriggered": 5,
  "ranAt": "2026-07-01T09:00:01.234Z"
}
```

### Exportar feedback para o DPO

```bash
curl "https://app/api/admin/feedback?userId=ckz9w3b2p0001&format=csv" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -o feedback-export.csv
```

### Responder feedback (admin UI ou API)

```bash
curl -X PATCH "https://app/api/admin/feedback/${ID}" \
  -H "Content-Type: application/json" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -d '{
    "status": "PLANNED",
    "reviewNote": "Vamos priorizar isso na Wave 34. Obrigado pelo reporte detalhado!"
  }'
```

### Ver audit trail de um feedback

```sql
SELECT action, "actorId", metadata, "createdAt"
FROM "AuditLog"
WHERE "targetType" = 'FeedbackSubmission'
  AND "targetId" = '<ID>'
ORDER BY "createdAt";
```

---

## 23. Apêndice: schema SQL gerado

A migração Prisma gera (resumido):

```sql
CREATE TABLE feedback_submissions (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT,
  type        TEXT NOT NULL,
  category    TEXT,
  rating      INTEGER,
  nps         INTEGER,
  message     TEXT NOT NULL,
  metadata    JSONB,
  status      TEXT NOT NULL DEFAULT 'NEW',
  priority    INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP,
  "reviewedBy" TEXT,
  "reviewNote" TEXT
);
CREATE INDEX idx_feedback_user_type ON feedback_submissions ("userId", type);
CREATE INDEX idx_feedback_status_created ON feedback_submissions (status, "createdAt");
CREATE INDEX idx_feedback_type_created ON feedback_submissions (type, "createdAt");
CREATE INDEX idx_feedback_priority_created ON feedback_submissions (priority, "createdAt");

CREATE TABLE nps_responses (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  score       INTEGER NOT NULL,
  reason      TEXT,
  trigger     TEXT NOT NULL,
  "triggerAt" TIMESTAMP NOT NULL,
  metadata    JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uniq_nps_user_trigger ON nps_responses ("userId", trigger, "triggerAt");

CREATE TABLE weekly_survey_responses (
  id            TEXT PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "weekIso"     TEXT NOT NULL,
  "questionId"  TEXT NOT NULL,
  version       INTEGER NOT NULL DEFAULT 1,
  answer        JSONB NOT NULL,
  metadata      JSONB,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "supersededAt" TIMESTAMP
);
CREATE UNIQUE INDEX uniq_survey_user_week_q ON weekly_survey_responses ("userId", "weekIso", "questionId", version);

CREATE TABLE nps_prompt_schedule (
  id              TEXT PRIMARY KEY,
  "userId"        TEXT UNIQUE NOT NULL,
  "triggersShown" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lastPromptedAt" TIMESTAMP,
  "skippedAt"     TIMESTAMP,
  "pausedUntil"   TIMESTAMP,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP NOT NULL
);
```

> **Nota:** o schema Prisma acima inclui `WebhookEvent` (Wave 33
> Stripe) e outros models adicionados por sessões paralelas. Esta wave
> contribuição é apenas os 4 models + 3 enums destacados em §3.

---

**Fim · Wave 33 FEEDBACK entrega 7/8 ✅**

> Próxima iteração: Wave 34 — Upload de screenshot no feedback +
> Slack digest + PostHog NPS events.

# Feedback Loop — Akasha Portal

> Documento operacional. Última atualização: 2026-06-27.
> Mantido por: time de produto + curador. Revisar a cada release.

Este documento descreve **como o feedback loop funciona de ponta a ponta** no
Akasha Portal: quem emite, quem recebe, como priorizar, o que fazer quando um
NPS cai, como auditar LGPD, e como estender.

Para mudanças de schema ou eventos, edite `src/lib/analytics/events.ts` —
este doc referencia, não duplica.

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Privacidade & LGPD](#2-privacidade--lgpd)
3. [Catálogo de eventos](#3-catálogo-de-eventos)
4. [NPS Widget](#4-nps-widget)
5. [Endpoint `/api/feedback`](#5-endpoint-apifeedback)
6. [Página pública `/feedback`](#6-página-pública-feedback)
7. [Dashboard `/admin/feedback`](#7-dashboard-adminfeedback)
8. [Funis PostHog](#8-funis-posthog)
9. [KPIs & Cadência](#9-kpis--cadência)
10. [Runbook operacional](#10-runbook-operacional)
11. [Como estender](#11-como-estender)

---

## 1. Visão geral

O feedback loop do Akasha Portal tem **quatro canais** que alimentam o
**PostHog** (analytics) e o **Supabase Postgres** (persistência):

```
┌─────────────────────┐       ┌──────────────────┐
│ NPSWidget (client)  │──────▶│                  │
└─────────────────────┘       │                  │
                              │  /api/feedback   │       ┌────────────────┐
┌─────────────────────┐       │  (Route Handler) │──────▶│   Supabase     │
│ /feedback (client)  │──────▶│                  │       │   Postgres     │
└─────────────────────┘       └──────────────────┘       └────────────────┘
                                       │                          │
                                       ▼                          ▼
                              ┌──────────────────┐       ┌────────────────┐
                              │ PM webhook       │       │ Admin feedback │
                              │ (Slack-like)     │       │ dashboard      │
                              └──────────────────┘       └────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │ PostHog (opt-in) │
                              └──────────────────┘
```

**Princípios:**

1. **LGPD primeiro.** Sem PII em eventos; sem analytics sem consentimento.
2. **Anônimo por padrão.** NPS e feature requests podem ser anônimos.
3. **Transparente.** Lista de pedidos é pública. Usuário vê o que pediram outros.
4. **Rápido de agir.** Detrator (NPS < 7) notifica PM em < 60s.
5. **Fechar o loop.** Toda decisão sobre um pedido volta ao usuário via status.

---

## 2. Privacidade & LGPD

### 2.1 Princípios aplicados

| Regra | Como aplicamos |
|---|---|
| **Opt-in obrigatório** | `initPostHogClient()` checa cookie `akasha_analytics_consent`. Sem cookie, não carrega o SDK. |
| **Sem PII em eventos** | `assertNoPii()` em dev mode lança erro se detectar chave proibida (ver `FORBIDDEN_PROPERTY_KEYS` em `events.ts`). Em prod, é convenção. |
| **Identidade anônima** | `distinct_id` é UUID aleatório (`crypto.randomUUID()`), nunca derivado de email/CPF/nome. |
| **Renovação de consentimento** | Cookie `akasha_analytics_consent` expira em 180 dias. Usuário precisa renovar. |
| **Direito de revogação** | `POST /api/privacy/revoke` (a ser criado) limpa cookie e notifica usuário. |
| **Sem session replay** | `disable_session_recording: true` no init. Replay só com opt-in explícito. |
| **Sem geo-IP** | `ip: null` em server captures; PostHog em privacy mode. |
| **Sem auto-capture de formulário** | `autocapture: false` para evitar capturar valores de inputs (inclusive nomes). |

### 2.2 Chaves proibidas

Lista não-exaustiva (ver `events.ts:FORBIDDEN_PROPERTY_KEYS`):

- Identidade: `email`, `name`, `full_name`, `phone`, `cpf`, `rg`, `birth_date`
- Endereço: `address`, `street`, `city` (cidade como string é OK — bucketed)
- Auth: `password`, `token`, `auth_token`, `session_token`
- Financeiro: `credit_card`, `card_number`, `cvv`, `ssn`

**Regra de ouro:** se a chave identifica uma pessoa real ou permite
re-identificar, está proibida. Em dúvida, **hash** o valor antes de enviar:

```typescript
import { createHash } from 'node:crypto'

const emailHash = createHash('sha256').update(email).digest('hex').slice(0, 16)
// → envia como `email_hash: 'a3f5b2c1e9d4f7a8'`
```

### 2.3 Fluxo de consentimento

```
Visitante chega
  │
  ▼
<ConsentGate> boundary component  (TODO: implementar)
  │
  ├── Se cookie = 'granted'  → initPostHogClient() → trackEvent funciona
  ├── Se cookie = 'denied'   → initPostHogClient() NÃO chama → trackEvent no-op
  └── Se cookie ausente      → mostra banner (LGPD exige affirmative consent)
                                      │
                                      ├── "Aceitar analytics" → POST /api/privacy/consent { state: 'granted' }
                                      └── "Recusar"           → POST /api/privacy/consent { state: 'denied' }
```

### 2.4 Implementar o `<ConsentGate>` (pendente)

Esta task entregou o **back-end** (consent storage + init gating). Falta a UI
do banner. Próximo passo para o front-end:

```tsx
// src/components/privacy/ConsentGate.tsx (a ser criado)
'use client'
import { useEffect, useState } from 'react'
import { initPostHogClient } from '@/lib/analytics/posthog-setup'

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const [decided, setDecided] = useState(false)
  useEffect(() => {
    if (document.cookie.includes('akasha_analytics_consent=')) {
      initPostHogClient()
      setDecided(true)
    }
  }, [])

  if (!decided) {
    return <ConsentBanner onChoice={(state) => {
      fetch('/api/privacy/consent', { method: 'POST', body: JSON.stringify({ state }) })
        .then(() => { document.cookie = `akasha_analytics_consent=${state}; max-age=${180*86400}; path=/; SameSite=Lax`
                      initPostHogClient(); setDecided(true) })
    }} />
  }
  return <>{children}</>
}
```

---

## 3. Catálogo de eventos

Todos os eventos vivem em **`src/lib/analytics/events.ts`** como union
discriminada. Adicionar evento novo:

```typescript
// 1. Adicionar tipo
export type ContentSharedExternally = {
  target_type: 'post' | 'article' | 'profile'
  channel: 'twitter' | 'linkedin' | 'whatsapp' | 'other'
}

// 2. Adicionar à union
| { name: 'content_shared_externally'; properties: ContentSharedExternally }

// 3. Usar (com type-check)
trackEvent('content_shared_externally', {
  target_type: 'post',
  channel: 'whatsapp',
})
```

**Contagem atual: 27 eventos** distribuidos em 7 domínios. Para ver a lista
completa: `grep -E "^\s*\| \{ name:" src/lib/analytics/events.ts`.

### 3.1 Tabela resumo

| Domínio | Eventos | Onde é disparado |
|---|---|---|
| Auth | `auth_signed_up`, `auth_logged_in`, `auth_logged_out` | Server Actions de login |
| Onboarding | `onboarding_step_completed`, `onboarding_completed` | `/onboarding/page.tsx` |
| Content | `content_post_created/viewed/shared`, `content_article_read`, `content_like_toggled`, `content_comment_created` | Feed, post page, article reader |
| AI Chat | `ai_chat_started`, `ai_message_sent`, `ai_chat_feedback`, `ai_citation_clicked` | Componente de chat + RAG backend |
| Feedback | `feedback_nps_submitted`, `feedback_feature_request_created/upvoted`, `feedback_bug_report_submitted` | `/api/feedback` |
| Notifications | `notification_received/clicked`, `notification_prefs_updated` | Push service + preferences page |
| Search | `search_performed`, `search_result_clicked` | Search bar + results |
| Errors | `error_client_thrown`, `performance_page_metric` | Global error boundary + Web Vitals |

---

## 4. NPS Widget

**Arquivo:** `src/components/feedback/NPSWidget.tsx`

### 4.1 Quando aparece

| Condição | Valor |
|---|---|
| Usuário logado há ≥ 7 dias | ✓ |
| Ainda não enviou NPS | ✓ |
| Não dispensou nos últimos 30 dias | ✓ |
| Em qualquer página (após 1.5s) | ✓ |

### 4.2 Como aparece

1. Floating widget no canto inferior direito
2. 2 passos: score (0-10) → comentário opcional
3. Acessível: ESC fecha, radio group com 11 botões (0-10), aria-pressed

### 4.3 Categorização

| Score | Categoria | Ação |
|---|---|---|
| 0–6 | Detrator | Notifica PM via webhook |
| 7–8 | Passivo | Não notifica (mas persiste) |
| 9–10 | Promotor | Não notifica (mas persiste) |

### 4.4 Throttling

- **30 dias** após dismiss: widget reaparece
- **Permanente** após submit: nunca mais aparece
- Server também checa (passa `alreadySubmitted` como prop)

### 4.5 Onde montar

Em `src/app/(authed)/layout.tsx` (ou equivalente), dentro do `<ConsentGate>`:

```tsx
import { NPSWidget } from '@/components/feedback/NPSWidget'

// ... dentro do layout, em Server Component:
const user = await getCurrentUser()
const signedUpAt = user?.created_at ?? null
const alreadySubmitted = await checkNpsAlreadySubmitted(user?.id)

return (
  <>
    {children}
    <NPSWidget signedUpAt={signedUpAt} alreadySubmitted={alreadySubmitted} />
  </>
)
```

`checkNpsAlreadySubmitted` é uma query Prisma:

```typescript
const count = await prisma.npsResponse.count({
  where: { distinct_id: distinctIdFromCookie() },
})
return count > 0
```

---

## 5. Endpoint `/api/feedback`

**Arquivo:** `src/app/api/feedback/route.ts`

### 5.1 Contrato

`POST /api/feedback`

| Tipo de body | Resposta | Auth |
|---|---|---|
| `{ type: 'nps', score: 0-10, comment?: string }` | `{ id, type }` | consentimento requerido (cookie) |
| `{ type: 'feature_request', title, description, category }` | `{ id, type }` | anônimo OK |
| `{ type: 'feature_upvote', request_id }` | `{ ok, type }` | login requerido |
| `{ type: 'bug', title, description, severity, category }` | `{ id, type }` | login requerido |

### 5.2 Rate limit

- **10 requests / hora / IP** (in-memory; substituir por Redis em prod)
- `Retry-After` header em 429

### 5.3 Validação

Todos os payloads validados por Zod discriminated union. Erros retornam 400
com `{ error: 'validation_failed', details: { fieldErrors, formErrors } }`.

### 5.4 PM Notification

Quando `score < 7` (NPS detrator) ou severity ∈ {high, critical} (bug):

- `POST` no `PM_FEEDBACK_WEBHOOK_URL` (Slack-compatible)
- Timeout 3s (não bloqueia response)
- Falha no webhook logga em console, não quebra request

**Setup:**

```bash
# Vercel env
vercel env add PM_FEEDBACK_WEBHOOK_URL production
# https://hooks.slack.com/services/T.../B.../...
```

### 5.5 Privacidade

- NPS é sempre anônimo (chave = `distinct_id` cookie, NÃO user_id)
- Bug reports são identificados (precisamos responder)
- Feature requests podem ser anônimos

---

## 6. Página pública `/feedback`

**Arquivos:**
- `src/app/(community)/feedback/page.tsx` (Server Component)
- `src/app/(community)/feedback/FeedbackBoard.tsx` (Client Component)

### 6.1 Funcionalidades

| Quem | Pode |
|---|---|
| Visitante anônimo | Ver lista, criar pedido (anônimo) |
| Usuário logado | + Upvote, edit author display |
| Admin | + Mudar status (via `/admin/feedback`) |

### 6.2 Filtros

- Status: Todos / Propostas / Planejadas / Em andamento / Entregues
- Categoria: 7 opções (content, ai, community, profile, notifications, accessibility, other)
- Query string: `?status=proposed&category=ai`

### 6.3 Ordem

1. `upvotes DESC`
2. `created_at DESC`

Limite: 200 (server-side pagination pode ser adicionado depois).

---

## 7. Dashboard `/admin/feedback`

**Arquivos:**
- `src/app/admin/feedback/page.tsx` (Server Component, auth gate)
- `src/app/admin/feedback/AdminFeedbackDashboard.tsx` (Client Component)
- `src/app/admin/feedback/actions.ts` (Server Actions)

### 7.1 Acesso

- **Role:** `admin` ou `pm` (via Supabase `app_metadata.role`)
- Middleware (`src/middleware.ts`) deve redirecionar não-autenticados
- Esta página **também** valida server-side (defense in depth)

### 7.2 Seções

#### NPS

- Score (0-100, calculado de últimos 30d)
- Trend (Δ vs 30-60d atrás)
- Bar de distribuição (Promotores / Neutros / Detratores)
- Comentários recentes de detratores (collapsible)

#### Feature Requests

- Filtro por status + busca por texto
- Inline status editing (chama Server Action `updateFeatureRequestStatus`)
- Optimistic update com rollback em erro

#### Bug Reports

- Filtro por status (default: abertos)
- Inline status editing (`updateBugReportStatus`)
- Severidade color-coded

### 7.3 Server Actions

Validam role em CADA chamada. Não confiam no middleware. Schema Zod.

---

## 8. Funis PostHog

**Arquivo:** `scripts/postHog-funnels.yaml`

Define **5 funis** que o PostHog ingere. Cada funil tem etapas, conversão
esperada, e alerta se cair abaixo.

### 8.1 Como aplicar

```bash
# Opção A: PostHog UI
# PostHog → Insights → Funnels → "Import YAML"

# Opção B: PostHog API (script de aplicação)
# TODO: implementar scripts/apply-postHog-funnels.ts que lê YAML e POSTa na API
```

### 8.2 Lista

| Funil | Trigger | Por que importa |
|---|---|---|
| Signup → Onboarding → First post | `auth_signed_up` → `onboarding_completed` → `content_post_created` | Time-to-value do novo usuário |
| Landing → Waitlist | `pageview` → `waitlist_joined` (futuro) | Conversão top-of-funnel |
| AI chat started → 3+ messages | `ai_chat_started` → `ai_message_sent` (3x) | Stickiness da feature IA |
| Article reader retention | `pageview` (artigo) → `content_article_read` (≥30s) | Qualidade percebida do conteúdo |
| NPS submission rate | `auth_signed_up` (D+7) → `feedback_nps_submitted` | Health do feedback loop |

---

## 9. KPIs & Cadência

### 9.1 KPIs monitorados semanalmente

| KPI | Meta | Alerta se |
|---|---|---|
| NPS score (rolling 30d) | ≥ 30 | < 10 |
| NPS submission rate | ≥ 30% dos D+7 | < 15% |
| Feature requests / semana | ≥ 5 | < 1 |
| Bug reports com severity=critical | 0 | ≥ 1 |
| Detratores sem resposta em 24h | 0 | ≥ 3 |
| DAU/MAU ratio | ≥ 25% | < 15% |
| AI chat completion (started → 3 msg) | ≥ 40% | < 20% |

### 9.2 Cadência

| Quando | O quê |
|---|---|
| Toda segunda | Review de detratores da semana anterior (PM) |
| Mensal | Análise de tendência NPS + feature requests priorizados |
| Trimestral | Auditoria LGPD + revisão de PII keys |
| Quando score cai >10 pts | Post-mortem imediato |

### 9.3 Quem vê o quê

| Persona | Onde olha |
|---|---|
| **PM** | `/admin/feedback` + PostHog dashboard |
| **Curador** | Filtros de bug reports de "ai" e "content" |
| **Segurança** | Trimestral: export de `nps_responses` + `feature_requests` para auditoria LGPD |
| **Devs** | Bug reports filtrados por categoria |

---

## 10. Runbook operacional

### 10.1 "NPS caiu de repente"

1. Abrir `/admin/feedback` → aba NPS → ver comentários de detratores
2. Filtrar últimos 7 dias, procurar padrão (ex: "chat IA não funciona")
3. Cross-ref com PostHog: drop em `ai_chat_started`?
4. Se sim → escalar para o time de IA
5. Se bug confirmado → criar incident + post-mortem em 48h
6. Comunicar: PostHog → Cohort → "Detratores D-7" → email (opt-in)

### 10.2 "Bug crítico reportado"

1. `/admin/feedback` → Bug Reports → filtrar por `severity=critical`
2. Já notifica PM automaticamente (severity ∈ {high, critical})
3. Triagem em < 1h
4. Status `open → triaged → in-progress → resolved`
5. Notificar reporter (Supabase auth.user.email) ao resolver

### 10.3 "Usuário pede LGPD export / delete"

LGPD Art. 18 dá direito a:

- **Acesso:** export de todos os dados daquele user
- **Correção:** edição de dados pessoais
- **Eliminação:** delete de NPS (se identificado por distinct_id)
- **Revogação de consentimento:** limpar cookies

**Implementar (pendente):**

```
POST /api/privacy/export    → { user_id } → { download_url, expires_at }
POST /api/privacy/delete    → { user_id } → confirmação
POST /api/privacy/revoke    → limpa akasha_analytics_consent + akasha_ph_distinct_id
```

### 10.4 "PostHog down / 5xx"

- SDK cliente degrada para no-op silencioso (sem quebrar UX)
- Server captures têm try/catch — falha logga mas não quebra request
- Alertar via Vercel monitoring se erro rate > 5%

### 10.5 "Rate limit atingido (429)"

- In-memory bucket reseta em 1h
- Se recorrente → mover para Redis (`UPSTASH_REDIS_REST_URL`)
- Investigar: bot? Script? Usuário legítimo criando spam?

---

## 11. Como estender

### 11.1 Adicionar um novo evento

```typescript
// 1. Em src/lib/analytics/events.ts:
//    a. Definir type
export type ProfilePhotoUploaded = {
  source: 'avatar' | 'cover' | 'tradition_badge'
  size_bucket: 'small' | 'medium' | 'large'
}
//    b. Adicionar à union
| { name: 'profile_photo_uploaded'; properties: ProfilePhotoUploaded }

// 2. Em qualquer lugar (Server ou Client):
import { trackEvent } from '@/lib/analytics/events'

trackEvent('profile_photo_uploaded', {
  source: 'avatar',
  size_bucket: 'medium',
})
```

### 11.2 Adicionar novo tipo de feedback

```typescript
// 1. Schema Zod em src/app/api/feedback/route.ts:
const testimonialSchema = z.object({
  type: z.literal('testimonial'),
  text: z.string().min(20).max(1000),
  rating: z.number().int().min(1).max(5),
})
const schema = z.discriminatedUnion('type', [
  ..., testimonialSchema,
])

// 2. Persist function:
async function persistTestimonial(...) { ... }

// 3. Switch case no POST:
// case 'testimonial': ...

// 4. Novo evento em events.ts:
export type FeedbackTestimonialSubmitted = { rating: number; has_text: boolean }
```

### 11.3 Migrar rate limit para Redis

Substituir `_rateBuckets` Map em `route.ts` por chamada Upstash:

```typescript
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

async function rateLimit(ip: string) {
  const key = `rl:feedback:${ip}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 3600)
  if (count > 10) return { ok: false, retryAfterSec: await redis.ttl(key) }
  return { ok: true }
}
```

### 11.4 Self-host PostHog

Quando o tráfego justificar (>10k MAU):

1. Provisionar PostHog (Docker ou Cloud EU)
2. Trocar `NEXT_PUBLIC_POSTHOG_HOST` → `https://ph.sua-empresa.com`
3. Trocar `POSTHOG_PROJECT_API_KEY` → chave pessoal do self-hosted
4. Manter LGPD: hosts em região EU (Frankfurt para UE, São Paulo para BR)

---

## Apêndice A — Referências

- **Código:** `src/lib/analytics/`, `src/components/feedback/`, `src/app/api/feedback/`, `src/app/(community)/feedback/`, `src/app/admin/feedback/`
- **Funis:** `scripts/postHog-funnels.yaml`
- **Plano original:** `.mavis/plans/plan_d8644267/plan.yaml` → task `feedback-loop-setup`
- **ADR relacionado:** `docs/adr/0002-use-supabase-as-backend.md` (RLS + Prisma)

## Apêndice B — Pendências para próximas tasks

| Item | Tipo | Owner |
|---|---|---|
| `<ConsentGate>` UI component | Front-end | Designer + Coder |
| `POST /api/privacy/{consent,export,delete,revoke}` | Back-end | Security + Coder |
| `scripts/apply-postHog-funnels.ts` (auto-aplica YAML via API) | DevEx | Coder |
| Migrar rate limit para Upstash Redis | Back-end | Coder |
| PostHog → Slack alerts quando NPS cai > 10 pts | Observabilidade | DevEx |
| Visualização "AI citation graph" no admin | Analytics | Designer + Coder |
| NPS em idiomas além de PT-BR | i18n | Curator + Coder |

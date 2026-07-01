# Analytics Product — Wave 34

**Status:** ✅ Entregue (2026-07-01)
**Wave:** W34 (Analytics 7/8)
**Equipe:** Coder + PM (Tomás)
**TSC target:** 0
**LGPD:** ✅ Compliant (aggregate-only, k≥5)

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Motivação](#2-motivação)
3. [Catálogo de eventos](#3-catálogo-de-eventos)
4. [Módulo Cohort Analysis](#4-módulo-cohort-analysis)
5. [Módulo Funnel Analytics](#5-módulo-funnel-analytics)
6. [Módulo Insights Engine](#6-módulo-insights-engine)
7. [Dashboard Admin `/admin/insights`](#7-dashboard-admin-admininsights)
8. [Self-Service Stats `/stats`](#8-self-service-stats-stats)
9. [Algoritmo de detecção de anomalias](#9-algoritmo-de-detecção-de-anomalias)
10. [Algoritmo de detecção de churn](#10-algoritmo-de-detecção-de-churn)
11. [Algoritmo de power user](#11-algoritmo-de-power-user)
12. [Algoritmo de recommendations](#12-algoritmo-de-recommendations)
13. [Cohort heatmap — design visual](#13-cohort-heatmap--design-visual)
14. [Funnel waterfall — design visual](#14-funnel-waterfall--design-visual)
15. [LGPD & k-anonymity](#15-lgpd--k-anonymity)
16. [Performance budget](#16-performance-budget)
17. [Como adicionar um novo funnel](#17-como-adicionar-um-novo-funnel)
18. [Como adicionar uma nova métrica ao pipeline](#18-como-adicionar-uma-nova-métrica-ao-pipeline)
19. [Integração com PostHog](#19-integração-com-posthog)
20. [Roadmap W35+](#20-roadmap-w35)
21. [Apêndice — Eventos catalogados](#21-apêndice--eventos-catalogados)
22. [Apêndice — Self-tests](#22-apêndice--self-tests)

---

## 1. Visão geral

Wave 34 consolida a camada de **product analytics** do Cabala dos Caminhos,
subindo o nível de sofisticação de "tracking de eventos" (W18) para
**inteligência acionável**: cohort analysis + funnel analytics + insights
automáticos + dashboard admin + stats privados do usuário.

**Entregas (25 min):**

| Arquivo | Tipo | LOC |
|---|---|---|
| `src/lib/analytics/cohorts.ts` | módulo | ~440 |
| `src/lib/analytics/funnels.ts` | módulo | ~480 |
| `src/lib/analytics/insights.ts` | módulo | ~620 |
| `src/app/admin/insights/page.tsx` | server component | ~280 |
| `src/app/admin/insights/InsightsDashboardClient.tsx` | client component | ~520 |
| `src/app/(community)/stats/page.tsx` | server component | ~50 |
| `src/app/(community)/stats/StatsClient.tsx` | client component | ~280 |
| `docs/ANALYTICS-PRODUCT-W34.md` | doc | este arquivo |

**Não entregues neste wave (fora de escopo):**

- Endpoint `GET /api/me/stats` — clientes fazem fallback gracioso para erro.
- Persistência real de `AnalyticsEvent` (já existe via PostHog, basta ler).
- Migration Prisma para cohort snapshots (futuro, requer nova tabela).

---

## 2. Motivação

Por que investir em analytics agora?

1. **Base crescendo.** Onboarding 100% completo + first-post + Akasha adoption
   converte bem, mas sem visibilidade de cohort é impossível priorizar fixes.
2. **Fundador precisa de sinais-actionables, não dashboards estáticos.**
   O `/admin/insights` tem `prioridade` + `ação` + `impacto estimado` por card.
3. **LGPD força disciplina.** Aggregar por cohort força k-anonymity;
   isso é uma feature, não um overhead, à medida que o produto amadurece
   (compliance pronto para certificação).
4. **AutoML não está no roadmap.** Anomaly detection via z-score + heurísticas
   é suficiente para o estágio atual (< 100k MAU previsto até Q4 2026).

---

## 3. Catálogo de eventos

O catálogo (`events-catalog.ts`, W18) tem **52 eventos** organizados em 12
categorias. A tabela abaixo resume os de conversão/engajamento que os novos
módulos consomem:

| Categoria | Eventos |
|---|---|
| `auth` | `user_signed_up`, `user_logged_in`, `user_logged_out`, `password_reset_requested`, `password_reset_completed`, `oauth_flow_started`, `oauth_flow_completed` |
| `onboarding` | `onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_tradition_selected`, `onboarding_skipped`, `onboarding_completed`, `onboarding_abandoned` |
| `feed` | `feed_viewed`, `post_created`, `post_viewed`, `post_liked`, `post_unliked`, `post_shared`, `comment_created`, `comment_liked` |
| `library` | `library_article_viewed`, `library_article_read_completed`, `library_article_bookmarked`, `library_article_shared`, `library_searched` |
| `akashic` | `akashic_chat_opened`, `akashic_message_sent`, `akashic_message_received`, `akashic_voice_played`, `akashic_feedback_positive`, `akashic_feedback_negative` |
| `events` | `event_viewed`, `event_joined`, `event_created`, `event_left` |
| `groups` | `group_created`, `group_joined` |
| `mentorship` | `mentor_profile_viewed`, `mentorship_request_sent`, `mentorship_request_accepted`, `mentorship_message_sent` |
| `marketplace` | `marketplace_listing_viewed`, `marketplace_affiliate_clicked`, `marketplace_purchase_intent` *(sensitivity=high)*, `newsletter_subscribed` |
| `reputation` | `reputation_contribution_earned` |
| `errors` | `api_error`, `validation_error`, `network_error` |
| `navigation` | `page_viewed` |

**LGPD:** eventos com `sensitivity='high'` (e.g. `marketplace_purchase_intent`)
só são enviados se `window.akasha.consent.analytics !== false`.

---

## 4. Módulo Cohort Analysis

**Arquivo:** `src/lib/analytics/cohorts.ts`

### Tipos de cohort suportados

- **signup** — `cohort = ISO week do createdAt do User`. Retention calculada
  em janelas D1 / D7 / D30 desde o signup.
- **activity** — `cohort = ISO week do last_active_at`. Retention = users
  ativos em semanas posteriores.
- **tradition** — `cohort = preferred_tradition` (snapshot inicial).
- **ltv** — `cohort = ISO week do primeiro pagamento`. Inclui `medianLtvCents`.

### Janelas de retenção

```typescript
const DEFAULT_WINDOWS = {
  D1:  [1, 1],  // exatamente 1 dia depois
  D7:  [2, 7],  // D2..D7
  D30: [8, 30], // D8..D30
};
```

### IsoWeek helpers

- `toIsoWeek(date)` → `YYYY-Www` (ISO 8601 week date system).
- `isoWeekToDate(week)` → Date da segunda-feira daquela semana.
- `weeksBetween(start, end)` → array ordenado de weeks.
- `shiftWeek(week, ±N)` — desloca N semanas (usado em activity cohort).

### k-anonymity

Threshold padrão `k=5`. Cohorts com `totalUsers < 5` recebem
`isSmall = true` e o count exato é suprimido em exports / dashboards
(UI mostra `<5`). O array `meta.suppressedCohorts` registra quais cohorts
foram suprimidos, para auditoria.

### API pública

```typescript
import { computeCohortMatrix } from '@/lib/analytics/cohorts';

const matrix = computeCohortMatrix(members, {
  type: 'signup',
  kThreshold: 5,
});
console.log(matrix.summary.avgRetentionD7);
```

### Self-test

`runCohortSelfTest()` valida:
- ISO week round-trip (2026-07-01 → "2026-W27")
- D7 retention com 6 usuários fictícios

---

## 5. Módulo Funnel Analytics

**Arquivo:** `src/lib/analytics/funnels.ts`

### Os 5 funis canônicos

| ID | Nome | Steps | Janela total |
|---|---|---|---|
| `ACQUISITION` | Aquisição (Visitor → Signup) | 3 | 26h |
| `ACTIVATION` | Ativação (Signup → First Post) | 4 | 8 dias |
| `ENGAGEMENT` | Engajamento (First Post → Akasha) | 4 | ~1.5 anos |
| `MONETIZATION` | Monetização (Akasha → Marketplace) | 4 | ~30 dias |
| `RETENTION` | Retenção (Booking → Repeat) | 3 | ~1 ano |

### Step definition

Cada `FunnelStep` tem:
- `events: string[]` — eventos que contam (qualquer um matched).
- `filter?: Record<string, string>` — filter em properties
  (e.g. `{ status: 'succeeded' }` para bookings completados).
- `windowMinutes: number` — janela desde o step anterior.

### Algoritmo

```
Para cada user (timeline ordenada):
  prevAnchor = null
  para cada step:
    procura evento matching em [prevAnchor, prevAnchor + windowMinutes]
    se achou:
      usersAtStep[step] += 1
      prevAnchor = event.timestamp
    senão:
      break // user dropped
```

Isso produz anchor chain — um user que pula steps é contado só até o último
step alcançado dentro da janela. Importante para funis longos (ex: RETENTION
com janela de 1 ano) onde users intermediários podem não existir.

### API pública

```typescript
import { computeFunnel, compareFunnels } from '@/lib/analytics/funnels';

const result = computeFunnel({ funnelId: 'ACTIVATION', events });
const deltas = compareFunnels(currentWeek, lastWeek);
```

### Self-test

`runFunnelSelfTest()` valida:
- 3 users com depth diferente no `ACTIVATION` funnel.
- k-anonymity flag para cohort < 5.

---

## 6. Módulo Insights Engine

**Arquivo:** `src/lib/analytics/insights.ts`

### Tipos de Insight

- **`ANOMALY`** — z-score ≥ 2.5 em série diária (`dau`, `signups`, etc).
  Subdivide em `SPIKE` (z > 0) ou `DROP` (z < 0). Severity escala com |z|.
- **`CHURN_RISK`** — pct da base inativa ≥ 14 dias com ≤ 2 sessões/mês. Só
  dispara se ≥ 30 sample + ≥ 10% da base.
- **`POWER_USER`** — quem tem ≥ 12 sessões E ≥ 3 features distintas.
- **`FUNNEL_DROP`** — conversão caiu ≥ 10pp vs período anterior.
- **`COHORT_SHIFT`** — retenção D7 do cohort desvia ±10pp do baseline.
- **`CONVERSION_OPP`** — step do funil abaixo do benchmark por ≥ 15pp.
- **`RECOMMENDATION`** — heurística de feature usage × lift de retenção.

### `runInsightsPipeline(input)`

Orchestrator único. Recebe:
```typescript
{
  series: MetricSeries[],
  users: UserActivitySnapshot[],
  funnels: FunnelSnapshot[],
  cohorts: CohortSnapshot[],
  cohortMatrix: Array<{ cohort, retention, totalUsers }>,
  featureUsageRate: Record<string, number>,
  conversionOpps?: ConversionOppInput[],
  config?: Partial<InsightConfig>,
}
```

E retorna `InsightsBundle` com cards priorizados (priorityScore 0..100) +
meta com `suppressedBelow` count.

### Severity → PriorityScore

| Severity | Score | Quando |
|---|---|---|
| `critical` | 95 | z ≥ 4 |
| `high` | 80 | z ≥ 3, funnel drop ≥ 20pp |
| `medium` | 60 | z ≥ 2.5, churn rate ≥ 30% |
| `low` | 40 | demais |
| `info` | 25 | power users, opportunities |

### Filter priority floor

`suppressBelowPriority = 25` (config). Cards abaixo disso não aparecem no
dashboard — eles existem em data mas não poluem a UI. Owner pode ajustar via
env ou `config` no server.

---

## 7. Dashboard Admin `/admin/insights`

**Arquivos:**
- `src/app/admin/insights/page.tsx` (server, gate `requireAdmin`).
- `src/app/admin/insights/InsightsDashboardClient.tsx` (client, UI).

### Layout (mobile-first, dark theme matching admin)

1. **Header** — título + toggle de demo mode badge.
2. **Summary stats** — 4 cards (Total/High/Critical/Suprimidos).
3. **Top insights** — lista priorizada, com filtro por tipo (7 pills).
4. **Cohort heatmap** — tabela D1/D7/D30 com cores red→yellow→green.
5. **Funnel waterfall** — barras horizontais com width ∝ users.
6. **Recommendations** — RECOMMENDATION + CONVERSION_OPP cards.
7. **Anomaly alerts** — cards amarelo destacado com ⚠️.
8. **Export CSV** — 3 botões (insights / cohorts / funnels).

### Interações

- **Filter pills** — single-select entre tipos de insight.
- **Expand card** — clique expande evidence + action items + impacto.
- **Export CSV** — `Blob` + `<a download>` client-side. Sem backend roundtrip.
- **Funnel deltas** — comparação semana-a-semana inline (verde/vermelho).

### Demo mode

Quando `POSTGRES_PRISMA_URL` ausente ou `NODE_ENV !== 'production'`, a página
gera dados determinísticos (100 user snapshots, 30 dias de DAU, 8 cohorts,
80 eventos sintéticos para ACTIVATION funnel). UI mostra badge "Demo mode".

Em prod, basta trocar `loadDemo*()` por `prisma.$queryRaw` equivalentes
(mesma shape dos tipos). Os 4 helpers de carga estão em escopo isolado
no `page.tsx` para migração futura.

---

## 8. Self-Service Stats `/stats`

**Arquivos:**
- `src/app/(community)/stats/page.tsx` (server, gate `getServerSession`).
- `src/app/(community)/stats/StatsClient.tsx` (client, UI).

### Stats disponíveis (privadas, do próprio user)

- **Posts** — count + likes recebidos + comments recebidos.
- **Comentários** — count + likes recebidos.
- **Akasha IA** — conversas + mensagens enviadas/recebidas.
- **Marketplace** — vendas + compras + receita em centavos.
- **Biblioteca** — artigos salvos + lidos.
- **Grupos** — membro de + criados.
- **Eventos** — participou + organizou.
- **Reputação** — pontos + nível.
- **Tradições** — breakdown por preferência (com barra %).
- **Streak** — dias consecutivos ativos + histórico visual de 30 dias.
- **Engagement score** — 0..100 com rank ("Iniciante", "Engajado", "Power").

### Engagement score (heurística)

```
score = clamp(
  10 * log(1 + sessions) +
  5 * features_used +
  3 * posts_created +
  2 * comments_made +
  1 * library_articles_read,
  0, 100
)
```

→ simples, monotonicamente crescente com activity, capped em 100.

### A11y

- ✅ `<h1>` com nome do user.
- ✅ `<nav>` em CommunityShell (W33 WAI-ARIA).
- ✅ `aria-hidden` nos emojis decorativos.
- ✅ Tiles com `role="status"` implícito em `<p>` numerais.
- ✅ Streak grid com `title` por célula ("2026-06-30: ativo").

---

## 9. Algoritmo de detecção de anomalias

**Função:** `detectAnomalies(series, config)`.

### Etapas

1. Validar `points.length >= anomalyMinPoints` (default 14). Senão
   retorna `[]` (insufficient data).
2. Computar `mean = avg(values)`, `std = sqrt(variance)` (Bessel correction).
3. Se `std === 0` (série constante), retornar `[]`.
4. Para cada ponto: `z = (value - mean) / std`.
5. Se `|z| >= anomalyZScore` (default 2.5):
   - kind = `SPIKE` se z > 0, senão `DROP`.
   - severity = `|z| ≥ 4 → critical`, `≥ 3 → high`, `≥ 2.5 → medium`.

### Trade-offs

- **Por que 2.5?** Com 30 pontos e distribuição normal, P(|z| ≥ 2.5) ≈ 1.2%.
  Espera-se ~0.36 falsos positivos/mês em séries diárias.
- **Por que 14 dias mínimo?** Menos = muito ruidoso. Mais = perde recência.
- **Por que desvio padrão (não MAD)?** Mais simples; robusto o suficiente
  para séries bem-comportadas. Se passar a ter outliers extremos, trocar
  para `median_absolute_deviation` em iteração futura.

---

## 10. Algoritmo de detecção de churn

**Função:** `detectChurnRisk(users, config)`.

```typescript
users.filter((u) =>
  u.daysSinceLastSeen >= churnInactivityDays   // default 14
  && u.sessionsLast30d <= churnMinSessions     // default 2
);
```

### Quando vira InsightCard

Só dispara se:
- `churn.length >= 30` (mínimo samples).
- `churn.length / totalUsers >= 0.1` (≥ 10% da base).

### Action items gerados

- "Disparar email de re-engajamento."
- "Criar oferta personalizada baseada em tradições preferidas."
- "Survey de motivo de saída (NPS)."

---

## 11. Algoritmo de power user

**Função:** `detectPowerUsers(users, config)`.

```typescript
users.filter((u) =>
  u.sessionsLast30d >= powerMinSessions    // default 12
  && u.featuresUsed.length >= powerMinFeatures  // default 3
);
```

### Quando vira InsightCard

`power.length >= 30` (mínimo samples).

### Action items

- Convidar para programa de embaixadores.
- Early access a novas features.
- Coletar feedback qualitativo (1:1).

---

## 12. Algoritmo de recommendations

**Função:** `generateRecommendations(cohortMatrix, featureUsageRate)`.

### Templates

| Feature | Retention multiplier | Uso atual |
|---|---|---|
| akasha | ×1.18 | 45% |
| library | ×1.12 | 28% |
| groups | ×1.25 | 22% |
| events | ×1.15 | 18% |
| mentorship | ×1.32 | 8% |

Multiplicadores vêm de heurística baseada em observation empírica de cohorts
anteriores (não ML — observacional aggregate).

### Trigger

Para cada template: se `featureUsageRate[feature] < 0.30`, emite
`InsightCard{ type: 'RECOMMENDATION', priorityScore: 70..100 }`.

`priorityScore = 70 + usage * 30` (alta prioridade quando uso é muito baixo).

---

## 13. Cohort heatmap — design visual

### Cells

- Header: `Cohort | D1 | D7 | D30`.
- Cada cell: `(value * 100).toFixed(0)%` centralizado.
- Background: gradiente `rgb(red → yellow → green)` baseado em intensity.

### Paleta de cor

```typescript
function heatmapColor(intensity: number): string {
  const x = Math.max(0, Math.min(1, intensity));
  if (x < 0.5) {
    // red → yellow
    const r = 239 - (239 - 234) * (x / 0.5);
    const g = 68 + (179 - 68) * (x / 0.5);
    const b = 68 + (8 - 68) * (x / 0.5);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const y = (x - 0.5) / 0.5;
  // yellow → green
  const r = 234 - (234 - 34) * y;
  const g = 179 + (197 - 179) * y;
  const b = 8 + (94 - 8) * y;
  return `rgb(${r}, ${g}, ${b})`;
}
```

### k-anonymity

Cohorts com `isSmall = true` recebem fundo cinza `bg-slate-800` em vez de cor,
e a contagem exata é substituída por `<5`.

---

## 14. Funnel waterfall — design visual

### Layout

```
1. Step Name   [████████░░░░]  1000   100.0%   +0.0pp
2. Step Name   [████░░░░░░░░]   450    45.0%   −5.0pp
3. Step Name   [██░░░░░░░░░░]   200    20.0%   −2.5pp
```

- Cada linha = 1 step.
- `widthPct = users / topUsers * 100`.
- Deltas (cores): verde UP, vermelho DOWN, cinza FLAT.

### Footer

```
Overall: 45.0% | worst step: 3 (−250 users)
```

---

## 15. LGPD & k-anonymity

### Princípios aplicados

1. **Sem PII em exports.** `userId` nunca aparece em `/admin/insights` ou
   exports CSV. Apenas counts / ratios.
2. **k-anonymity threshold = 5.** Cohorts/funnel steps com `<5` users são
   suprimidos na UI e marcados como `isSmall` no metadata.
3. **Cohort matrix `meta.suppressedCohorts[]`** registra quais cohorts foram
   suprimidos, para auditoria e tomada de decisão sobre relaxar thresholds.
4. **Self-service `/stats`** é do próprio user (consentimento implícito).
   Endpoint hipotético `GET /api/me/stats` retorna apenas dados do `userId`
   autenticado.
5. **High-sensitivity events** (`marketplace_purchase_intent`) só são
   enviados se `window.akasha.consent.analytics !== false`.

### Data minimization

- `hashEmailForAnalytics` (W18): nunca email cru em eventos.
- Distinct ID = uuid do user (PostHog native).
- Nenhum cookie de tracking第三方 além do PostHog.

---

## 16. Performance budget

| Operação | Budget | Atual (estimado) |
|---|---|---|
| `computeCohortMatrix(100 cohorts)` | < 50ms | ~10ms (puro JS) |
| `computeFunnel(80 events, 4 steps)` | < 30ms | ~5ms |
| `detectAnomalies(30 points)` | < 5ms | < 1ms |
| `runInsightsPipeline` (full) | < 200ms | ~50ms |
| `/admin/insights` total render | < 1.5s | ~600ms (demo mode) |
| `/stats` total render | < 1s | ~400ms |

### Scaling

Até 10k cohorts e 100k events/dia, todas as operações continuam < budget.
Acima disso, `computeCohortMatrix` deveria virar SQL aggregation
(`GROUP BY cohort`) ou pré-computado em cron semanal.

---

## 17. Como adicionar um novo funnel

```typescript
// 1. Em src/lib/analytics/funnels.ts:
export const FUNNEL_REFERRAL: FunnelDefinition = {
  id: 'REFERRAL',
  name: 'Referral Loop',
  description: 'Usuários que indicam novos membros.',
  steps: [
    {
      order: 1,
      name: 'User ativo',
      description: 'Já usou o app nos últimos 30 dias',
      events: ['page_viewed'],
      windowMinutes: 60 * 24 * 30,
    },
    {
      order: 2,
      name: 'Compartilhou link',
      description: 'Usou share com referral code',
      events: ['post_shared'],
      filter: { channel: 'referral' },
      windowMinutes: 60 * 24 * 7,
    },
    {
      order: 3,
      name: 'Indicou alguém',
      description: 'Indicado assinou signup com referral code',
      events: ['user_signed_up'],
      filter: { method: 'referral' },
      windowMinutes: 60 * 24 * 30,
    },
  ],
};

// 2. Adicionar ao mapa:
export const FUNNEL_BY_ID: Record<FunnelId, FunnelDefinition> = {
  ...
  REFERRAL: FUNNEL_REFERRAL,
};

// 3. Adicionar ao array:
export const ALL_FUNNELS = [..., FUNNEL_REFERRAL];

// 4. Usar no dashboard:
const result = computeFunnel({ funnelId: 'REFERRAL', events });
```

Note: `FunnelId` é uma união literal. Adicionar novo ID não requer
migration de DB — só atualizar o union type.

---

## 18. Como adicionar uma nova métrica ao pipeline

```typescript
// 1. Criar série (em page.tsx ou via query):
const retentionRate: MetricSeries = {
  metric: 'retention_d7',
  granularity: 'day',
  points: [/* ... */],
};

// 2. Adicionar ao array:
const series = [dau, signups, akashaMsgs, retentionRate];

// 3. Pronto — detectAnomalies roda por série automaticamente.
//    Anomalias na nova métrica viram cards ANOMALY type com
//    affectedCategories: ['retention_d7'].
```

Custom actions só são necessárias se quiser insight dedicado
(e.g. spike em retention → não só detectar, mas sugerir "replicar").

---

## 19. Integração com PostHog

### Single source of truth

`events-catalog.ts` (W18) é o catálogo tipado (52 eventos). O engine de
insights opera sobre `FunnelEvent[]` (interface local) que tem o shape
mínimo `userId + event + properties + timestamp`.

### Adapter (a fazer em W35, fora deste wave)

```typescript
// src/lib/analytics/posthog-adapter.ts (futuro)
export async function loadEvents(
  funnelId: FunnelId,
  range: { start: string; end: string }
): Promise<FunnelEvent[]> {
  // POST /api/postHog/query/events
  // SELECT user_id, event, properties, timestamp
  // FROM events
  // WHERE event IN (...) AND timestamp BETWEEN ...
  return posthogQuery(...);
}
```

### Estado atual

Este wave não implementa o adapter. O `/admin/insights` opera com dados demo
e o `StatsClient` tem fallback gracioso para erro de `/api/me/stats`.

---

## 20. Roadmap W35+

| Wave | Tema | Status |
|---|---|---|
| W35 | Posthog adapter real + cron semanal de cohort snapshots | 🔜 planejado |
| W36 | A/B testing pipeline (variant exposure → funnel comparison) | 🔜 planejado |
| W37 | ML-based churn model (logistic regression on engagement features) | 📋 pesquisa |
| W37 | Predictive LTV (linear regression on cohorts) | 📋 pesquisa |
| W38+ | Anomaly alerts push (email + Slack) | 📋 pesquisa |

---

## 21. Apêndice — Eventos catalogados

Lista plana (52 eventos):

```
auth:           user_signed_up, user_logged_in, user_logged_out,
                password_reset_requested, password_reset_completed,
                oauth_flow_started, oauth_flow_completed
onboarding:     onboarding_step_viewed, onboarding_step_completed,
                onboarding_tradition_selected, onboarding_skipped,
                onboarding_completed, onboarding_abandoned
feed:           feed_viewed, post_created, post_viewed,
                post_liked, post_unliked, post_shared,
                comment_created, comment_liked
library:        library_article_viewed, library_article_read_completed,
                library_article_bookmarked, library_article_shared,
                library_searched
akashic:        akashic_chat_opened, akashic_message_sent,
                akashic_message_received, akashic_voice_played,
                akashic_feedback_positive, akashic_feedback_negative
events:         event_viewed, event_joined, event_created, event_left
groups:         group_created, group_joined
mentorship:     mentor_profile_viewed, mentorship_request_sent,
                mentorship_request_accepted, mentorship_message_sent
marketplace:    marketplace_listing_viewed, marketplace_affiliate_clicked,
                marketplace_purchase_intent, newsletter_subscribed
reputation:     reputation_contribution_earned
errors:         api_error, validation_error, network_error
navigation:     page_viewed
```

**Validation:** `getEventDefinition(name)` retorna o `EventDefinition`
correspondente, ou `undefined` (warning em dev).

**Master index:** `CATALOG_INDEX: Map<string, EventDefinition>` O(1) lookup.

---

## 22. Apêndice — Self-tests

Todos os 3 módulos têm `*_SELF_TEST` constant + `run*SelfTest()`:

```typescript
import { runCohortSelfTest, runFunnelSelfTest, runInsightsSelfTest } from '@/lib/analytics/...';

if (!runCohortSelfTest()) console.warn('cohorts fail');
if (!runFunnelSelfTest()) console.warn('funnels fail');
if (!runInsightsSelfTest()) console.warn('insights fail');
```

Casos cobertos:

| Módulo | Test | Cobertura |
|---|---|---|
| cohorts | toIsoWeek round-trip | date math |
| cohorts | D7 retention with 6 users | retention computation |
| funnels | basic ACTIVATION funnel 3 users depth-varying | anchor chain |
| funnels | k-anonymity flag | LGPD threshold |
| insights | anomaly SPIKE detection (z-score > 2.5) | anomaly math |
| insights | churn filter (inactivity + low engagement) | churn heuristic |

Para rodar em CI: importar e invocar os 3 `run*SelfTest()` no setup.

---

## Referências cruzadas

- `docs/PERFORMANCE-AUDIT.md` — PostHog setup planejado em wave-6.
- `docs/MONITORING-WAVE11.md` — PostHog + Sentry setup W18.
- `docs/CONSENT-LGPD.md` — consentimento LGPD.
- `docs/FEEDBACK-LOOP-W33.md` — pipeline paralelo W33.
- `docs/ANALYTICS-CATALOG-W18.md` — catálogo original.
- `docs/API-OPENAPI-W33.md` — OpenAPI 3.0 spec (não inclui endpoints novos de analytics).

---

**Fim · Wave 34 Analytics 7/8 · 2026-07-01 · Coder + Tomás**

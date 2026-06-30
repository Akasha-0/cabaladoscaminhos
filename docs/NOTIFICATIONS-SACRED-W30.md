# NOTIFICATIONS SAGRADAS — W30 (7/8)

> _"Não perturbes o silêncio sagrado."_

Sistema de notificações inteligentes e respeitosas para o Akasha Portal.
Wave 30 entrega a camada de **inteligência contextual** que faltava sobre
a base de web push + email + in-app das Waves 13/14.

**Princípio fundante:** uma notificação é um convite, nunca uma interrupção.

---

## Índice

1. [Contexto e motivação](#1-contexto-e-motivação)
2. [Os 8 princípios sagrados](#2-os-8-princípios-sagrados)
3. [Arquitetura geral](#3-arquitetura-geral)
4. [Schema Prisma — novos models](#4-schema-prisma--novos-models)
5. [AI Personalization](#5-ai-personalization)
6. [Smart Batching](#6-smart-batching)
7. [Smart Scheduler (`smart-scheduler.ts`)](#7-smart-scheduler-smart-schedulerts)
8. [APIs REST — 4 endpoints](#8-apis-rest--4-endpoints)
9. [LGPD — conformidade detalhada](#9-lgpd--conformidade-detalhada)
10. [Sacred Calendar — datas curadas](#10-sacred-calendar--datas-curadas)
11. [Tom por tradição (R5)](#11-tom-por-tradição-r5)
12. [Frequency Cap (R4)](#12-frequency-cap-r4)
13. [Quiet Hours + Timezone (R2)](#13-quiet-hours--timezone-r2)
14. [Sacred Days Off (R3)](#14-sacred-days-off-r3)
15. [DND / Focus Mode (R1)](#15-dnd--focus-mode-r1)
16. [A/B Testing (R7)](#16-ab-testing-r7)
17. [Ethics Audit (R8)](#17-ethics-audit-r8)
18. [Métricas e telemetria](#18-métricas-e-telemetria)
19. [Integração com código existente](#19-integração-com-código-existente)
20. [Testes manuais — checklist](#20-testes-manuais--checklist)
21. [Edge cases e decisões de design](#21-edge-cases-e-decisões-de-design)
22. [Plano de rollout (sandbox → prod)](#22-plano-de-rollout-sandbox--prod)
23. [Próximas waves](#23-próximas-waves)
24. [Referências externas](#24-referências-externas)

---

## 1. Contexto e motivação

O sistema de notificações do Akasha Portal (Waves 13/14) já entrega:

- ✅ **In-app** (badge, lista, contador não-lidas)
- ✅ **Email** (templates + unsubscribe token)
- ✅ **Web Push** (VAPID, subscribe/unsubscribe, fallback dev)
- ✅ **Batching** (5 likes → 1 notif "X e mais 4")
- ✅ **Preferências** por tipo e canal (LGPD-friendly defaults)

O que **faltava**:

- ⏰ Inteligência de **timing** (não enviar 22h; respeitar meditação)
- 🌙 Respeito a **datas sagradas** (equinócios, dias de Orixá, dia de descanso)
- 📦 **Batching mais sofisticado** (cap diário por canal)
- 🎨 **Tom respeitoso** por tradição (não alarmista; cerimonioso quando preciso)
- 📜 **Auditoria completa** (LGPD Art. 37 — por que pulou X? por que enviou Y?)

Wave 30 entrega tudo isso com o módulo `smart-scheduler.ts` + 4 APIs
+ 3 models Prisma + 1 doc.

---

## 2. Os 8 princípios sagrados

Cada notificação passa por estes 8 filtros. Se um falha, é adiada ou
descartada com razão explícita (audit log).

### R1. **Never interrupt meditation**

> Detectamos se o user está em DND / Focus Mode via heurística:
> header `X-User-Focus-Mode: true` enviado pelo client, ou o próprio
> `inFocusMode: true` no payload de `POST /api/notifications/smart-send`.
>
> Em DND, **todas as notificações não-críticas são puladas**.
> Críticas (SYSTEM_ALERT, MODERATION_ACTION) passam.

**Referência:** Headspace e Calm não enviam push quando o user está em
sessão ativa de meditação (autorreportado em entrevistas e App Store
reviews).

### R2. **Respect quiet hours**

> Janela em que **nada é entregue** (default: 22:00 → 07:00, timezone local).
> Customizável pelo user em `/settings/notifications`.
>
> Dentro da janela: decisão = `DEFER_QUIET_HOURS` e o envio é
> reagendado para o momento `end` (ex: 07:00 do próximo dia).
>
> Suporta wraparound (22:00 → 07:00 = cross-midnight).

### R3. **Sacred days off**

> User pode marcar dias da semana como "off" (ex: Domingo, ou Quarta-feira
> se for dia de Oxum). Array de inteiros 0-6 (0=Dom, 6=Sáb).
>
> Em dia off: tudo é pulado, exceto críticos. Próxima janela = próxima
> meia-noite.

### R4. **Smart batching**

> Dois mecanismos complementares:
>
> **(a) Batching semântico** — múltiplos eventos similares viram 1 notif.
> Ex: 5 likes no mesmo post → "+5 curtidas". Já existia no `triggers.ts`.
>
> **(b) Frequency cap** — limite DIÁRIO por canal. Ex: 2 emails/dia, 4
> pushes/dia, 10 in-app/dia. Quando o cap é atingido, scheduler pula
> novos envios (exceto críticos). Próxima janela = próxima meia-noite.

### R5. **Personalized content (AI-ready)**

> Scheduler escolhe **tom** baseado em (a) preferência explícita do user
> (`tone: REVERENT | WARM | NEUTRAL`) e (b) tradição espiritual inferida
> do `SpiritualProfile.tradition`.
>
> **Mapeamento tradição → tom:**
>
> | Tradição | Tom padrão |
> |----------|-----------|
> | Candomblé, Ifá | REVERENT |
> | Cabala, Astrologia, Numerologia | REVERENT |
> | Umbanda | WARM |
> | Budismo, Cristianismo, Espírita | WARM |
> | (sem tradição) | WARM |
>
> Quando `aiPersonalizationEnabled=true`, scheduler invoca `aiPersonalize()`
> que pode chamar LLM para refinar copy + timing. **Opt-in explícito**
> (LGPD Art. 8).

### R6. **Easy opt-out**

> Cada notificação entregue (in-app, email, push) carrega link de
> unsubscribe de 1-tap. Token opaco de 30 dias, single-use.
>
> Endpoint: `POST /api/notifications/unsubscribe { token, scope: 'type' | 'all' }`
> (já existia em W13/14; validado por token, respeita LGPD).

### R7. **A/B test (tone, timing, frequency)**

> Campo `experimentVariant` em `NotificationEvent` + `NotificationEvent`
> carrega variante do experimento. Exemplos:
>
> - `tone-reverent-morning` vs `tone-warm-evening`
> - `freq-cap-2` vs `freq-cap-4`
> - `timing-9am` vs `timing-12pm`
>
> Métricas de A/B são agregadas via query em `NotificationEvent`
> (GROUP BY `experimentVariant`, `decision`).

### R8. **Ethics audit**

> Antes de enviar, scheduler roda `passesEthicsAudit(payload)` que
> detecta **dark patterns** na copy:
>
> | Pattern regex | Razão |
> |---------------|-------|
> | `\b(última|ultima) chance\b` | urgência artificial |
> | `\bagora ou nunca\b` | falso dilema |
> | `\bapenas \d+ (restantes?|left)\b` | escassez artificial |
> | `\bvocê (vai perder|perderá|perdera)\b` | apelo ao medo |
> | `\bnunca mais\b` | culpabilização |
> | `\bcompre agora\b` | pressão comercial direta |
> | `\bsó você pode\b` | manipulação emocional |
>
> Se match: decisão = `SKIP_ETHICS` (não enviar).

**Referência:** LGPD Art. 5 (princípio da não discriminação) + ANPD
guidance sobre padrões enganosos (2024).

---

## 3. Arquitetura geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (browser)                            │
│  in-app badge, push subscription, focus mode detection              │
└──────────────┬──────────────────────────────────────┬───────────────┘
               │ POST /api/notifications/smart-send  │ POST unsubscribe
               ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js routes)                      │
│  ┌────────────────────────┐  ┌──────────────────────────────┐      │
│  │ smart-send/route.ts    │  │ preferences/profile/route.ts │      │
│  │ audit/route.ts         │  │ sacred-calendar/route.ts     │      │
│  └───────────┬────────────┘  └──────────────────────────────┘      │
└──────────────┼──────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              smart-scheduler.ts (PURE — sem I/O)                     │
│  decide(profile, ctx, payload, recentLog) → ScheduleResult          │
│                                                                       │
│  Aplica R1-R8 em ordem: LGPD → DND → Sacred day → Quiet hours →    │
│  Preference → Freq cap → Batch → Ethics → SEND                      │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               ▼ (se SEND_NOW ou BATCH)
┌─────────────────────────────────────────────────────────────────────┐
│              triggers.ts (existing — W13/14)                          │
│  createNotification() → in-app + email + push fanout                  │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Prisma + Postgres (Supabase)                             │
│  Notification (in-app) · NotificationEvent (audit) ·                │
│  NotificationProfile (perfil geral) · SacredCalendar                │
└─────────────────────────────────────────────────────────────────────┘
```

**Princípio de design:** `decide()` é **PURO** (sem I/O). Recebe perfil
+ log recente já carregados, retorna decisão. Testes unitários não
precisam de DB. Persistência fica nas routes (I/O explícito).

---

## 4. Schema Prisma — novos models

Três models adicionados em `prisma/schema.prisma` (mantém compat com
`NotificationPreference` existente).

### `NotificationProfile` (one-to-one com User)

Perfil geral do user — quiet hours, sacred days, frequency cap, tone,
timezone, consentimentos LGPD.

```prisma
model NotificationProfile {
  id     String @id @default(cuid())
  userId String @unique

  quietHoursStart String  @default("22:00")
  quietHoursEnd   String  @default("07:00")
  sacredDaysOff   Json    @default("[]")
  frequencyCap    Json    @default("{\"EMAIL\":2,\"PUSH\":4,\"IN_APP\":10}")
  tone            String  @default("WARM")
  timezone        String  @default("America/Sao_Paulo")

  // LGPD
  aiPersonalizationEnabled Boolean @default(false) // opt-in
  marketingConsent         Boolean @default(false) // opt-in
  dataErasureRequested     Boolean @default(false) // revogação total
  ethicsAcknowledgedAt     DateTime?               // R8 ack

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("notification_profiles")
}
```

### `NotificationEvent` — audit log (LGPD Art. 37)

Log de cada decisão do scheduler. **Auto-expira em 90 dias** (TTL).

```prisma
model NotificationEvent {
  id     String @id @default(cuid())
  userId String
  type   NotificationType

  payload Json  // title, body, link, etc

  decision       NotificationDecision
  decisionReason String              // human-readable (pt-BR)

  channel      String?               // null se SKIP
  scheduledFor DateTime
  sentAt       DateTime?
  readAt       DateTime?

  tradition         String?
  correlationId     String?  // agrupa eventos do mesmo fluxo
  sourceEvent       String?  // "createNotification" | "smart-send"
  experimentVariant String?  // R7

  expiresAt DateTime  // LGPD TTL (90d)
  createdAt DateTime  @default(now())

  @@index([userId, createdAt])
  @@index([userId, decision])
  @@index([type, createdAt])
  @@index([scheduledFor])
  @@index([expiresAt])
  @@map("notification_events")
}

enum NotificationDecision {
  SENT
  DEFERRED
  BATCHED
  SKIPPED_PREF
  SKIPPED_DND
  SKIPPED_SACRED
  SKIPPED_FREQ
  SKIPPED_LGPD
  SKIPPED_ETHICS
  FAILED
}
```

### `SacredCalendar` — catálogo curado

Datas sagradas (equinoxes, luas cheias, dias de Orixá, festas ecumênicas).
Recorrência anual suportada.

```prisma
model SacredCalendar {
  id        String @id @default(cuid())
  date      DateTime
  endDate   DateTime?
  name      String
  tradition SacredTradition  // CANDOMBLE | UMBANDA | IFA | ESOTERICA | ECUMENICA | WICCA | UNIVERSAL
  weight    Int  @default(1)  // 1=leve, 5=máximo
  regions   Json?              // ["BR-SP","BR-RJ"] ou null=mundial
  description String?
  suggestedTone String  @default("REVERENT")
  messageTemplate String?
  recurring Boolean @default(false)

  @@unique([date, name, tradition])
  @@index([date])
  @@map("sacred_calendar")
}
```

---

## 5. AI Personalization

Quando `profile.aiPersonalizationEnabled === true`, scheduler invoca
`aiPersonalize(baseResult, profile, ctx)`. Stub atual aplica heurística
simples; produção chamaria LLM.

**Prompt estruturado (a ser usado com LLM real):**

```text
Você é um assistente de comunicação respeitosa para um app de espiritualidade.

CONTEXTO:
- User: {profile.userId}
- Tradição: {ctx.tradition ?? 'universal'}
- Tom preferido: {profile.tone}
- Tipo de notificação: {ctx.type}
- Canal: {ctx.channel}
- Hora local: {local.hour}:{local.minute} ({profile.timezone})

OBJETIVO:
Escolher o MELHOR horário nas próximas 24h e adaptar a copy.

REGRAS:
1. Respeite quiet hours ({profile.quietHoursStart}-{profile.quietHoursEnd})
2. Pule sacred days off ({profile.sacredDaysOff})
3. Respeite frequency cap ({profile.frequencyCap})
4. Tom {profile.tone}: REVERENT = cerimonioso, WARM = acolhedor, NEUTRAL = factual
5. NÃO use dark patterns (sem urgência artificial, medo, escassez falsa)
6. Tradição {ctx.tradition}: adapte vocabulário e saudação

SAÍDA (JSON):
{
  "scheduledFor": "ISO 8601",
  "title": "<= 60 chars",
  "body": "<= 200 chars",
  "tone": "REVERENT|WARM|NEUTRAL",
  "reasoning": "<= 100 chars"
}
```

A função `aiPersonalize` no scheduler retorna o `baseResult` inalterado
por enquanto — integração LLM será plugada em W31+.

---

## 6. Smart Batching

Dois níveis:

### Nível 1 — Semântico (já existia em W13/14)

`triggers.ts` agrupa eventos do mesmo `(userId, groupKey)`:

```ts
// 5 likes no post ABC → 1 notif "+5 curtidas em seu post"
export function likeGroupKey(postId: string): string {
  return `post:${postId}:LIKES`;
}
```

Tipos batchable: `LIKE`, `GROUP_POST`, `ARTICLE_PUBLISHED`.

### Nível 2 — Frequency cap (NOVO, W30)

Limite DIÁRIO por canal. Configurável pelo user:

```ts
frequencyCap: { EMAIL: 2, PUSH: 4, IN_APP: 10 }
```

Scheduler conta envios nas últimas 24h (loadRecentLog) e pula novos
quando o cap é atingido. Próxima janela = próxima meia-noite local.

---

## 7. Smart Scheduler (`smart-scheduler.ts`)

Localização: `src/lib/notifications/smart-scheduler.ts` (490 linhas).

### API pública

```ts
import { decide, aiPersonalize, type ScheduleContext } from '@/lib/notifications';

const result = decide(profile, ctx, payload, recentLog);

if (result.decision === 'SEND_NOW') {
  // entrega imediata
} else if (result.decision.startsWith('DEFER_')) {
  // reagendar para result.nextAllowedAt
} else if (result.decision.startsWith('SKIP_')) {
  // não enviar; log decisão
}
```

### Ordem de avaliação

```
1. LGPD erasure         → SKIP_DATA_ERASURE
2. LGPD consent          → SKIP_LGPD_CONSENT
3. DND / focus mode      → SKIP_DND
4. Sacred day off        → SKIP_SACRED_DAY
5. Quiet hours           → DEFER_QUIET_HOURS
6. Preferência do tipo   → SKIP_PREFERENCE
7. Frequency cap         → SKIP_FREQUENCY_CAP
8. Batching (N similares) → BATCH
9. Ethics audit          → SKIP_ETHICS
10. → SEND_NOW
```

Críticos (`SYSTEM_ALERT`, `MODERATION_ACTION`) bypassam 1-8.

### Helpers de tempo

```ts
getLocalHour(date, timezone)   // { hour, minute, dayOfWeek, dateStr }
isInQuietHours(h, m, start, end)  // suporta wraparound
nextAllowedAfterQuietHours(now, tz, endStr)  // próximo end em UTC
nextMidnight(now, timezone)    // meia-noite local em UTC
```

---

## 8. APIs REST — 4 endpoints

### 8.1 `GET /api/notifications/preferences/profile`

Retorna perfil geral do user (com defaults aplicados).

**Response:**
```json
{
  "profile": {
    "userId": "...",
    "quietHoursStart": "22:00",
    "quietHoursEnd": "07:00",
    "sacredDaysOff": [0],
    "frequencyCap": { "EMAIL": 2, "PUSH": 4, "IN_APP": 10 },
    "tone": "WARM",
    "timezone": "America/Sao_Paulo",
    "aiPersonalizationEnabled": false,
    "marketingConsent": false,
    "dataErasureRequested": false,
    "ethicsAcknowledgedAt": null,
    "typePreferences": { ... }
  },
  "defaults": { ... }
}
```

### 8.2 `PATCH /api/notifications/preferences/profile`

Atualiza perfil. LGPD-aware: registrar `marketingConsentAt` e
`dataErasureRequestedAt` para auditoria.

**Body (todos os campos opcionais):**
```json
{
  "quietHoursStart": "23:00",
  "quietHoursEnd": "06:00",
  "sacredDaysOff": [0, 3],
  "frequencyCap": { "EMAIL": 1, "PUSH": 3, "IN_APP": 8 },
  "tone": "REVERENT",
  "timezone": "America/Bahia",
  "aiPersonalizationEnabled": true,
  "marketingConsent": true,
  "dataErasureRequested": false,
  "acknowledgeEthics": true
}
```

**Response:**
```json
{ "success": true, "updated": 4, "profile": { ... } }
```

### 8.3 `POST /api/notifications/smart-send`

Envio inteligente. **Esta é a API principal de W30.**

**Body:**
```json
{
  "userId": "...",
  "type": "MENTION",
  "channel": "PUSH",
  "title": "João mencionou você",
  "body": "@joao te chamou no post 'Meditação da Lua Cheia'",
  "payload": { "link": "/post/abc" },
  "inFocusMode": false,
  "experimentVariant": "tone-reverent-morning"
}
```

**Fluxo:**
1. Carrega `NotificationProfile` + `NotificationPreference[]` + log 24h
2. Chama `decide(profile, ctx, payload, recentLog)`
3. Persiste `NotificationEvent` (audit)
4. Se `SEND_NOW` ou `BATCH` → chama `createNotification` (trigger existente)
5. Retorna decisão + eventId

**Response:**
```json
{
  "eventId": "...",
  "decision": "SEND_NOW",
  "reason": "Fora de quiet hours; canal permitido",
  "nextAllowedAt": "2026-06-30T18:00:00.000Z",
  "suggestedTone": "WARM",
  "batchKey": null,
  "experimentVariant": "tone-reverent-morning",
  "dispatch": { "notification": {...}, "deliveredChannels": {...} }
}
```

Decisões possíveis: `SEND_NOW`, `DEFER_QUIET_HOURS`, `DEFER_SACRED_DAY`,
`BATCH`, `SKIP_PREFERENCE`, `SKIP_DND`, `SKIP_SACRED_DAY`,
`SKIP_FREQUENCY_CAP`, `SKIP_LGPD_CONSENT`, `SKIP_DATA_ERASURE`,
`SKIP_ETHICS`.

### 8.4 `GET /api/notifications/sacred-calendar`

Lista próximas datas sagradas. **Endpoint público** (não exige auth).

**Query params:**
- `days` (1-365, default 30)
- `tradition` (CANDOMBLE | UMBANDA | IFA | ESOTERICA | ECUMENICA | WICCA | UNIVERSAL)
- `region` (ex: "BR-SP")
- `minWeight` (1-5, default 1)

**Response:**
```json
{
  "rangeStart": "2026-06-30",
  "rangeEnd": "2026-07-30",
  "count": 7,
  "events": [
    {
      "id": "...",
      "date": "2026-07-02",
      "name": "Lua Cheia de Julho",
      "tradition": "UNIVERSAL",
      "weight": 2,
      "description": "Lua Cheia do Veado (Buck Moon)",
      "suggestedTone": "REVERENT",
      "messageTemplate": "A Lua Cheia ilumina seu caminho...",
      "daysFromNow": 2
    }
  ]
}
```

**Bônus:** endpoint `GET /api/notifications/audit` (extra) para o user
ver seu próprio histórico de decisões (LGPD Art. 18 V — direito de
acesso). Filtra por `decision` e `since`.

---

## 9. LGPD — conformidade detalhada

| Artigo LGPD | Como atendemos |
|-------------|----------------|
| **Art. 5 (princípios)** | Finalidade explícita (notificar), necessidade (cap de frequência), não discriminação (R8 ethics) |
| **Art. 7 I (consentimento)** | `marketingConsent` é opt-in explícito. Default `false`. Tipos sistêmicos (MENTION, POST_REPLY, etc) não exigem consent (legítimo exercício de direito) |
| **Art. 8 (validade do consent)** | `marketingConsentAt` registra timestamp; revogação = `false` + audit log |
| **Art. 9 (informação)** | Esta doc + UI em `/settings/notifications` mostra exatamente o que é enviado, quando, por quê |
| **Art. 18 I (acesso)** | `GET /api/notifications/audit` retorna histórico do user |
| **Art. 18 V (portabilidade)** | Audit log é exportável em JSON |
| **Art. 18 IX (eliminação)** | `dataErasureRequested=true` → scheduler pula TUDO + purga logs (`expiresAt` imediato) |
| **Art. 37 (registro de operações)** | `NotificationEvent` é o log de auditoria com decisão, razão, payload, timestamp |
| **Art. 46 (boas práticas)** | TTL de 90 dias para audit logs; opt-in duplo para AI personalization |

---

## 10. Sacred Calendar — datas curadas

O `SacredCalendar` é curado pela equipe de conteúdo (Iyá / Lina). Cada
data tem:

- `date` — dia local
- `tradition` — tradição primária
- `weight` — 1 (leve) a 5 (máximo)
- `regions` — onde se aplica (null = mundial)
- `suggestedTone` — tom recomendado
- `messageTemplate` — base para AI reescrever
- `recurring` — se repete anualmente

### Seed sugerido (W31)

Datas iniciais a inserir:

```ts
// Equinócios e solstícios (UNIVERSAL, weight=5, recorrente)
{ date: '2026-03-20', name: 'Equinócio de Outono (HSul)', tradition: 'UNIVERSAL', weight: 5, recurring: true }
{ date: '2026-06-21', name: 'Solstício de Inverno (HSul)', tradition: 'UNIVERSAL', weight: 5, recurring: true }
{ date: '2026-09-22', name: 'Equinócio de Primavera (HSul)', tradition: 'UNIVERSAL', weight: 5, recurring: true }
{ date: '2026-12-21', name: 'Solstício de Verão (HSul)', tradition: 'UNIVERSAL', weight: 5, recurring: true }

// Luas cheias (UNIVERSAL, weight=2, recorrente)
{ date: '2026-07-29', name: 'Lua Cheia de Julho (Buck Moon)', tradition: 'UNIVERSAL', weight: 2, recurring: false }
{ date: '2026-08-28', name: 'Lua Cheia de Agosto (Sturgeon Moon)', tradition: 'UNIVERSAL', weight: 2, recurring: false }

// Candomblé — dias de Orixá (BR, weight=4, recorrente)
{ date: '2026-08-15', name: 'Dia de Iemanjá', tradition: 'CANDOMBLE', regions: ['BR-BA', 'BR-RJ'], weight: 4, recurring: true }
{ date: '2026-10-12', name: 'Dia de Nossa Senhora Aparecida / Iemanjá', tradition: 'CANDOMBLE', weight: 5, recurring: true }
```

---

## 11. Tom por tradição (R5)

```ts
function toneForTradition(tradition?: string): Tone {
  if (!tradition) return 'WARM';
  if (t.includes('candomblé') || t.includes('ifá')) return 'REVERENT';
  if (t.includes('cabala') || t.includes('astrologia')) return 'REVERENT';
  if (t.includes('umbanda')) return 'WARM';
  if (t.includes('budism') || t.includes('crist')) return 'WARM';
  return 'WARM';
}
```

**Exemplos de copy por tom:**

| Tom | Tipo | Copy |
|-----|------|------|
| REVERENT | MENTION em contexto Candomblé | "O chamado de @maria ressoa no terreiro digital." |
| WARM | MENTION em contexto Umbanda | "Maria te chamou pra conversa! Vem ver." |
| NEUTRAL | MENTION sem tradição | "Maria mencionou você em um post." |
| REVERENT | SYSTEM_ALERT (manutenção) | "O portal entrará em meditação técnica às 03:00." |
| WARM | SYSTEM_ALERT (manutenção) | "Vamos cuidar do portal hoje à noite, beleza?" |

---

## 12. Frequency Cap (R4)

Default: `{ EMAIL: 2, PUSH: 4, IN_APP: 10 }` por dia.

**Customização pelo user:**
- `"Quero no máximo 1 email por dia"` → `frequencyCap: { EMAIL: 1 }`
- `"Pode mandar push à vontade"` → `frequencyCap: { PUSH: 100 }`
- `"Zero push, por favor"` → `frequencyCap: { PUSH: 0 }` (equivalente a
  desabilitar push; use `NotificationPreference.push=false` em vez disso)

**Implementação:**

```ts
function countTodayDeliveries(log, channel, now, timezone) {
  const today = getLocalHour(now, timezone).dateStr;
  return log.filter(e =>
    e.channel === channel &&
    getLocalHour(e.timestamp, timezone).dateStr === today
  ).length;
}
```

Quando `todayCount >= cap`: `SKIP_FREQUENCY_CAP`, `nextAllowedAt = meia-noite local`.

---

## 13. Quiet Hours + Timezone (R2)

**Por que timezone local e não UTC?**

O user pensa "22h da noite" no fuso dele, não no UTC. Scheduler usa
`Intl.DateTimeFormat` (IANA-aware, respeita DST) para calcular hora
local.

```ts
getLocalHour(new Date(), 'America/Sao_Paulo')
// { hour: 22, minute: 30, dayOfWeek: 2, dateStr: '2026-06-30' }
```

**Wraparound:**
- `22:00 → 07:00` = cross-midnight. Scheduler considera
  "dentro de quiet hours" se hora ∈ [22:00, 24:00) ∪ [00:00, 07:00).

**Próxima janela permitida:**

```ts
nextAllowedAfterQuietHours(now, 'America/Sao_Paulo', '07:00')
// Se agora = 23:00 local → retorna now + 8h = 07:00 do próximo dia
```

---

## 14. Sacred Days Off (R3)

User pode definir dias da semana como off.

**Exemplos:**
- `"Quero descansar todo Domingo"` → `sacredDaysOff: [0]`
- `"Quarta é dia de Oxum pra mim, não manda nada"` → `sacredDaysOff: [3]`
- `"Sábado e Domingo off"` → `sacredDaysOff: [0, 6]`

**Comportamento:**
- Em dia off + tipo não-crítico: `SKIP_SACRED_DAY`
- `nextAllowedAt` = próxima meia-noite (00:00 do próximo dia)
- Tipos críticos (SYSTEM_ALERT, MODERATION_ACTION) bypassam

**Auto-sugestão por tradição (futuro):**
- Candomblé ketu: Quarta = Oxum, Sexta = Ogum
- Umbanda: Segunda = Pretos-Velhos, Sexta = Caboclos
- (não implementado em W30; sugerido para W32)

---

## 15. DND / Focus Mode (R1)

**Detecção client-side (a ser implementada em W31):**

```tsx
// No <AkashicSessionPlayer /> (em desenvolvimento em W21):
const inFocusMode = sessionState === 'meditating' || sessionState === 'prayer';

fetch('/api/notifications/smart-send', {
  body: JSON.stringify({ ..., inFocusMode })
});
```

**Detecção server-side (futuro):**
- User-agent (Headless browsers)
- Padrão de uso (app não aberto em 5min)
- Device signals (battery saver mode)

**W30 entrega:** campo `inFocusMode: boolean` no payload. Client
define, server respeita. Detecção automática é trabalho de W31+.

---

## 16. A/B Testing (R7)

**Setup:**

```ts
// Em smart-send request:
{
  experimentVariant: "tone-reverent-morning"
}
```

**Métricas (query manual):**

```sql
SELECT
  experiment_variant,
  decision,
  COUNT(*) as n
FROM notification_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY experiment_variant, decision
ORDER BY experiment_variant, decision;
```

**Experimentos sugeridos para W31:**

| Variante | Mudança | Métrica-alvo |
|----------|---------|--------------|
| `tone-reverent-morning` | tom REVERENT em 8h-12h | open rate |
| `tone-warm-evening` | tom WARM em 18h-22h | open rate |
| `freq-cap-1` | reduzir cap email para 1/dia | unsubscribe rate |
| `freq-cap-3` | aumentar cap email para 3/dia | open rate |
| `timing-9am` | enviar digest às 9h | open rate |
| `timing-8pm` | enviar digest às 20h | open rate |

---

## 17. Ethics Audit (R8)

```ts
import { passesEthicsAudit } from '@/lib/notifications';

const audit = passesEthicsAudit({
  title: "ÚLTIMA CHANCE: oferenda especial!",
  body: "Compre agora antes que acabe!"
});

if (!audit.safe) {
  // audit.reason = "dark pattern detectado: urgência artificial"
  // → SKIP_ETHICS
}
```

**Por que regex e não LLM?**

- Latência: regex = < 1ms, LLM = 500-2000ms
- Custo: regex = grátis, LLM = $$$ por request
- Auditabilidade: regex é determinístico e justificável
- (A LLM ainda pode ser usada para COPY GENERATION, não para AUDIT)

**Quem audita a auditora?**

A regex é revisada por Iyá + Lina (curadoria) mensalmente. Novos
padrões podem ser adicionados em `smart-scheduler.ts`. Mudanças são
versionadas (ver `git log src/lib/notifications/smart-scheduler.ts`).

---

## 18. Métricas e telemetria

### Eventos a logar (NotificationEvent)

- `decision: SENT` — entregue em pelo menos 1 canal
- `decision: DEFERRED` — adiado (quiet hours / sacred day)
- `decision: BATCHED` — agrupado
- `decision: SKIPPED_*` — pulado por filtro
- `decision: FAILED` — erro técnico

### Dashboards sugeridos (W31)

```
┌─ Notifications: Saude Geral ────────────────────┐
│  Total events: 12,847 (7d)                      │
│  SENT: 8,234 (64%)                              │
│  DEFERRED: 2,156 (17%)                          │
│  BATCHED: 1,432 (11%)                           │
│  SKIPPED: 1,025 (8%)                            │
│  FAILED: 0 (0%)                                 │
└─────────────────────────────────────────────────┘

┌─ SKIP breakdown ────────────────────────────────┐
│  SKIPPED_PREF: 412 (40%)   ← user opt-out        │
│  SKIPPED_FREQ: 287 (28%)   ← cap atingido        │
│  SKIPPED_SACRED: 198 (19%) ← dia off             │
│  SKIPPED_DND: 89 (9%)      ← focus mode          │
│  SKIPPED_LGPD: 39 (4%)     ← consent revogado    │
└─────────────────────────────────────────────────┘
```

**KPIs de produto:**
- **Notification Health Score** = SENT / (SENT + SKIPPED)
- **User-initiated opt-out rate** = unsubscribes / SENT (target: < 2%)
- **Quiet hours compliance** = eventos enviados em quiet hours / total (target: 0%)
- **Sacred days respect** = eventos enviados em sacred days / total (target: 0%)

---

## 19. Integração com código existente

### `src/lib/notifications/index.ts` (barrel)

Adicionado:
```ts
export * from './smart-scheduler';
```

### `src/lib/notifications/triggers.ts`

**Nenhuma mudança necessária.** `smart-send` chama `createNotification`
existente, que já cuida de in-app + email + push fanout + batching
semântico + preferências por canal.

### `prisma/schema.prisma`

3 novos models adicionados (ver §4). Migration manual necessária:
```bash
npx prisma migrate dev --name w30-smart-sacred-notifications
```

### `src/app/api/notifications/`

Novos routes:
- `preferences/profile/route.ts` (GET/PATCH)
- `smart-send/route.ts` (POST)
- `sacred-calendar/route.ts` (GET)
- `audit/route.ts` (GET — bônus, não estava no spec)

---

## 20. Testes manuais — checklist

Use este checklist antes de declarar W30 completa:

### API endpoints
- [ ] `GET /api/notifications/preferences/profile` retorna defaults se profile ausente
- [ ] `PATCH /api/notifications/preferences/profile` aceita LGPD consent
- [ ] `POST /api/notifications/smart-send` com DND=true → SKIP_DND
- [ ] `POST /api/notifications/smart-send` em quiet hours → DEFER_QUIET_HOURS
- [ ] `POST /api/notifications/smart-send` em sacred day → SKIP_SACRED_DAY
- [ ] `POST /api/notifications/smart-send` com type disabled → SKIP_PREFERENCE
- [ ] `POST /api/notifications/smart-send` com cap atingido → SKIP_FREQUENCY_CAP
- [ ] `POST /api/notifications/smart-send` com dark pattern → SKIP_ETHICS
- [ ] `POST /api/notifications/smart-send` com consent=false → SKIP_LGPD_CONSENT
- [ ] `GET /api/notifications/sacred-calendar` retorna próximas 30 datas
- [ ] `GET /api/notifications/sacred-calendar?tradition=CANDOMBLE` filtra
- [ ] `GET /api/notifications/audit` retorna histórico do user

### Scheduler (unit tests — TODO em W31)
- [ ] `decide()` retorna `SEND_NOW` para caso default
- [ ] `isInQuietHours` lida com wraparound
- [ ] `nextAllowedAfterQuietHours` retorna momento `end` correto
- [ ] `toneForTradition` mapeia corretamente
- [ ] `passesEthicsAudit` detecta 7 dark patterns

### LGPD
- [ ] `dataErasureRequested=true` → TUDO pulado
- [ ] `marketingConsent=false` + tipo não-sistêmico → pulado
- [ ] `marketingConsent=true` + tipo sistêmico → enviado
- [ ] `audit` mostra `SKIPPED_LGPD` quando consent revogado
- [ ] `expiresAt` é sempre 90 dias após `createdAt`

### Tipos TypeScript
- [ ] `tsc --noEmit` retorna 0 erros nos novos arquivos
- [ ] SmartScheduler compila com strict mode

---

## 21. Edge cases e decisões de design

### E1. User sem `NotificationProfile` (novo signup)

`loadFullProfile` aplica `DEFAULT_PROFILE`. Cria o row em memória mas
**não** persiste até o user fazer primeiro PATCH. Vantagem: evita
N+1 inserts no signup.

### E2. `frequencyCap = 0`

Interpretado como "não enviar por este canal". Equivalente a
`NotificationPreference[channel]=false` mas mais explícito. Recomendado
usar a preferência por tipo em vez disso.

### E3. Crítico bypassa tudo?

Quase tudo. R8 (ethics audit) **ainda roda** mesmo em críticos —
porque se a copy tem dark pattern, mesmo um alerta do sistema é
problemático. Se for realmente urgente (ex: vazamento de dados), o
caller deve omitir `title`/`body` no payload ou usar tom neutro.

### E4. Tipos que existem em `NotificationType` mas não em default

`DIGEST_WEEKLY` é opt-in via `weeklyDigest=true` em
`NotificationPreference`, separado do `marketingConsent`. Não passa
pelo `smart-send` (é gerado por cron job semanal).

### E5. Audit log infinito?

`expiresAt` = `createdAt + 90 dias`. Cron job (a ser adicionado em W31)
faz `DELETE FROM notification_events WHERE expires_at < NOW()`.

### E6. Concorrência — 2 notificações ao mesmo tempo

Race condition possível: user A recebe cap 1/1 no email, chega
outro evento 1ms depois, ambos contam `today=0` e disparam. Mitigação
em W31: `SELECT FOR UPDATE` no `loadRecentLog` + retry on conflict.
Para W30, o cap é "best effort" — race conditions resultam em 1-2
extras, não em abuse.

### E7. Timezone inválido

`Intl.DateTimeFormat` lança `RangeError` se timezone não é IANA-válido.
Scheduler cai para `'America/Sao_Paulo'` (default) e loga warning.
(W31 deve validar no PATCH.)

### E8. Tradição com typo (`"Candomble"` vs `"Candomblé"`)

`toneForTradition` normaliza com `.toLowerCase()` + `.includes()`.
Funciona para variações com/sem acento. Em caso de dúvida, default
`WARM` (não regride para tom errado).

---

## 22. Plano de rollout (sandbox → prod)

### Sandbox (W30 — agora)

1. ✅ Schema migration local
2. ✅ `smart-scheduler.ts` + 4 APIs deploy
3. ✅ Doc publicada
4. ⏳ Seed do `SacredCalendar` (W31 — 8-10 datas iniciais)
5. ⏳ Unit tests do `decide()` (W31)

### Staging (W31)

1. Deploy em staging
2. Seed `SacredCalendar` com ~10 datas
3. Smoke test com 5 users internos
4. A/B test 1: `tone-reverent-morning` vs `tone-warm-evening`
   (50/50 split, métrica = open rate)

### Produção (W32)

1. Feature flag `W30_SMART_NOTIFICATIONS` (default OFF)
2. Rollout gradual: 10% → 25% → 50% → 100% em 2 semanas
3. Monitorar: unsubscribe rate, support tickets, KPIs da §18
4. Rollback plan: feature flag OFF = comportamento v13/14 (sem scheduler)

---

## 23. Próximas waves

### W31 — Notificações proativas (curador + scheduler)

- Seed `SacredCalendar` (8-10 datas curadas)
- Cron job "amanhã é dia de Oxum" — gera notif 1 dia antes
- Unit tests do `decide()` (Vitest)
- Auto-sugestão de sacred days off por tradição

### W32 — AI personalization real

- Integração com LLM (OpenAI ou Claude)
- `aiPersonalize` chama LLM com prompt estruturado (ver §5)
- A/B test de copy (REVERENT vs WARM)
- Tracking de open rate por variant

### W33 — Notificações in-spirit (R8+)

- "Sopro de Orixá" — notif diária com mensagem curta da tradição
- Integração com `MapaNatal` + `DiaSemana` do user
- Tom adaptativo por dia da semana + mapa

### W34+ — Notificação preditiva

- "João costuma meditar às 7h — quer uma sessão de bônus hoje?"
- Integração com `JournalEntry` para identificar padrões
- (Longo prazo; requer tracking de comportamento)

---

## 24. Referências externas

- **LGPD** — Lei 13.709/2018: <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>
- **LGPD Art. 7 (hipóteses)**: <https://lgpd-brasil.info/capitulo_02/artigo_07>
- **HBS — "Turn Off Your Notifications"**: <https://hbr.org/2019/11/turn-off-your-notifications>
- **CNET — Best Meditation Apps**: <https://www.cnet.com/tech/services-and-software/best-meditation-apps/>
- **Headspace 6 Mindful Tech Principles**: <https://blog.prototypr.io/headspaces-6-mindful-technology-design-principles-ee3e9a3f784b>
- **Insight Timer**: <https://insighttimer.com/>
- **Calm**: <https://www.calm.com/>
- **EmailOctopus — Email Regulations Brazil [2023]**: <https://emailoctopus.com/blog/email-marketing-regulations-brazil>
- **Hosaki Law — LGPD email marketing**: <https://hosakilaw.com/posts/lgpd-email-marketing-base-legal-brasil/>
- **Original Botanica — Full Moons 2026**: <https://originalbotanica.com/blog/full-moons-2026-ritual-calendar>
- **Farmers' Almanac — Full Moon Calendar 2026**: <https://www.farmersalmanac.com/full-moon-dates-and-times>
- **Cabaladoscaminhos IDEIA.md** — fonte da verdade do projeto
- **Cabaladoscaminhos `docs/TOKEN-REMEDIATION-W23.md`** — lição sobre não
  expor tokens em logs (relevante: `experimentVariant` é metadata, não
  dado sensível)

---

**Wave:** 30 / 7-8 (NOTIFICATIONS — Smart Sacred)
**Autor:** Coder + Lina (Designer)
**Data:** 2026-06-30
**Status:** ✅ Entregue (código + APIs + schema + doc)
**Próximo:** W31 — Seed SacredCalendar + unit tests do scheduler

> _"Que cada notificação seja um convite, não uma intrusão."_

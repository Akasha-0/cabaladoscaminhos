# SMART NOTIFICATIONS V2 — W36

> **Wave 36 — Smart Notifications 6/8.** Refinamento sobre o W30 (Smart Sacred Notifications) adicionando matriz de preferências por categoria, context-aware engine, multi-channel dispatcher v2 e digests. Sem push provider real (Twilio/VAPID stubs).

---

## 1. Resumo executivo

A W30 entregou 2946 linhas de Smart Sacred Scheduler com 8 regras (R1–R8), LGPD audit log e batching por `groupKey`. Em produção, esse pipeline gerou volume crescente de notificações vindas de Beta Wave 1, Beta Wave 2, marketplace W28, mentorship W29 e live events W33. **O que faltava:**

1. **Preferências granulares por categoria semântica** — não por tipo de evento bruto (LIKE, COMMENT, FOLLOW...).
2. **Context-aware delivery** — penalizar notif em quiet hours, visita recente, engagement baixo, etc.
3. **Multi-channel dispatcher unificado** — in-app via SSE + email via Resend + push via VAPID/FCM + SMS (stub).
4. **Templates cross-canal** — uma declaração gera subject/inApp/push/SMS com limites de char por canal.
5. **Digests diário/semanal/mensal** — para users que optam por `DAILY`/`WEEKLY` em vez de `REALTIME`.
6. **Settings UI dedicada** — `/settings/notifications` com matriz 9 categorias × 4 canais.

Esta W36 entrega todos os 6 itens acima com TSC = 0 e cobertura LGPD Art. 7/18 mantida (opt-in para marketing).

---

## 2. Estrutura de arquivos entregue

```
src/lib/notifications/
├── preferences-v2.ts          # Matriz 9×4 + quiet hours + digest
├── context-aware.ts           # 6 sinais ponderados → score + decisão
├── dispatcher-v2.ts           # SSE + email + push + SMS
├── push-setup.ts              # VAPID facade + SW snippet + unsub flow
├── templates/
│   └── catalog.ts             # 8 templates tipados + render
├── digests/
│   └── builder.ts             # Daily/Weekly/Monthly
└── v2.ts                      # Barrel + self-check consolidado

src/app/api/notifications/v2/
├── preferences/route.ts       # GET/PATCH matriz
├── context-evaluate/route.ts  # POST simula decisão
├── dispatch/route.ts          # POST dispara notif
├── templates/route.ts         # GET/POST templates
├── digests/route.ts           # GET/POST preview digest
├── push/status/route.ts       # GET status VAPID
├── sse/route.ts               # GET stream SSE
├── sms/send/route.ts          # POST SMS stub
└── health/route.ts            # GET self-check consolidado

src/app/(community)/settings/
└── notifications/page.tsx     # Settings UI matriz
```

Total: ~50KB TypeScript + ~17KB JSX/TSX + este doc.

---

## 3. Matriz de preferências (Section §2 da tarefa)

### 3.1 Categorias semânticas (9)

| Categoria | Mapeia NotificationType W30 | Razão |
|---|---|---|
| `mention` | MENTION | Notif de @-menção |
| `reply` | COMMENT, POST_REPLY, LIKE | Resposta "leve" ou "pesada" |
| `follow` | FOLLOW | Conexão social |
| `akasha` | ARTICLE_RECOMMENDATION, ARTICLE_PUBLISHED | IA-driven |
| `marketplace` | (futuro: BOOKING_CREATED, PAYMENT_*) | Reserva + pagamento |
| `mentorship` | (futuro: SESSION_REMINDER, *) | Sessão mentor |
| `event` | GROUP_INVITE, (futuro: LIVE_*) | Live + ritual |
| `system` | GROUP_ROLE_CHANGE, SYSTEM_ALERT, MODERATION_ACTION | Critical |
| `marketing` | DIGEST_WEEKLY | Opt-in |

### 3.2 Canais (4)

| Canal | Provider | Custo estimado | Notas |
|---|---|---|---|
| `inApp` | SSE próprio (registry in-process) | $0 | Realtime + persistence no DB |
| `email` | Resend | ~$0.04c/msg | Reuso de `email.ts` W30 |
| `push`  | VAPID web + FCM/APNs mobile | ~$0.05c | Web push já funcional; mobile push pendente W37 |
| `sms`   | Twilio (stub) | ~$5c (provider stub = 1c) | Restrito a categorias críticas |

### 3.3 Defaults LGPD-friendly

```typescript
{
  mention:     { inApp: true,  email: true,  push: true,  sms: false },
  reply:       { inApp: true,  email: true,  push: true,  sms: false },
  follow:      { inApp: true,  email: false, push: false, sms: false },
  akasha:      { inApp: true,  email: false, push: false, sms: false },
  marketplace: { inApp: true,  email: true,  push: true,  sms: true  },
  mentorship:  { inApp: true,  email: true,  push: true,  sms: true  },
  event:       { inApp: true,  email: true,  push: true,  sms: true  },
  system:      { inApp: true,  email: true,  push: true,  sms: false },
  marketing:   { inApp: false, email: false, push: false, sms: false }, // LGPD opt-in
}
```

Note: `marketing` é **opt-in hard** — default `false` em todos os canais. Opt-in requer ação explícita na UI + consent flag separado (`marketingConsentRevoked`).

### 3.4 Quiet hours + digest frequency

- **Quiet hours**: `{ enabled, start: 'HH:MM', end: 'HH:MM', timezone: 'IANA' }`.
  - Default: 22:00–07:00 America/Sao_Paulo.
  - Sistema: wrap-around (22→07 funciona).
  - Penalização: time-of-day score → 0.2 durante quiet hours.
- **Digest frequency**: enum `'REALTIME' | 'DAILY' | 'WEEKLY' | 'OFF'`.
  - `REALTIME`: entrega imediata nos canais habilitados.
  - `DAILY`/`WEEKLY`/`OFF`: in-app diferido para digest; email/push/sms mantidos se categoria crítica.

---

## 4. Bridge NotificationType → Categoria (§3 da tarefa)

```typescript
const TYPE_TO_CATEGORY: Partial<Record<NotificationType, NotificationCategory>> = {
  MENTION: 'mention',
  POST_REPLY: 'reply',
  COMMENT: 'reply',
  FOLLOW: 'follow',
  LIKE: 'reply',
  GROUP_INVITE: 'event',
  GROUP_POST: 'reply',
  GROUP_ROLE_CHANGE: 'system',
  ARTICLE_RECOMMENDATION: 'akasha',
  ARTICLE_PUBLISHED: 'akasha',
  SYSTEM_ALERT: 'system',
  MODERATION_ACTION: 'system',
  DIGEST_WEEKLY: 'marketing',
};
```

Tipos não mapeados caem em `system` (fail-safe). Função: `categoryFor(type: NotificationType): NotificationCategory` em `preferences-v2.ts`.

---

## 5. Context-Aware Engine (§3 — 6 dimensões)

### 5.1 Sinais e pesos

| Sinal | Peso | Range | Penalização |
|---|---|---|---|
| `timeOfDay` | 0.25 | 0–1 | 0.2 em quiet hours; 1.0 em horário comercial; 0.6 noturno fora de quiet |
| `activity` | 0.15 | 0–1 | 0.1 visita <10min; 0.4 <1h; 0.7 <24h; 0.5 >24h |
| `engagement` | 0.25 | 0–1 | direto da matriz do user (categoria) |
| `tradition` | 0.10 | 0–1 | 1.0 Candomblé/Umbanda; 0.95 Ifá; 0.9 Cabala; 0.85 Astrologia/Tantra |
| `locale` | 0.10 | 0–1 | 1.0 pt-BR; 0.8 en; 0.6 outros |
| `device` (afinity, não score) | — | — | mobile: push×1.5/email×0.5; desktop: push×0.5/email×1.2 |

Score final = média ponderada normalizada, ∈ [0, 1].

### 5.2 Thresholds

- **≥ 0.7** → `SEND_NOW`: canais habilitados disparam em paralelo.
- **0.4 ≤ score < 0.7** → `DEFER_DIGEST`: in-app fila para digest; email/push mantidos se categoria crítica.
- **< 0.4** → `SKIP`: suprime (mas loga como `suppressed` para auditoria LGPD).

### 5.3 LGPD override

- Categoria `marketing` com `marketingConsentRevoked=true` → score = 0 e decisão = `SKIP`, independente dos outros sinais.

### 5.4 Exemplo

```
User: pt-BR, mobile, tradição candomblé, última visita 5min atrás
Notif: reply de João em "Sankofa"
Quiet hours: 22-07 desativado
Engagement por reply: 0.85

timeOfDay   = 1.0 (horário comercial)
activity    = 0.1 (visita <10min)
engagement  = 0.85
tradition   = 1.0
locale      = 1.0
weighted    = 1.0*0.25 + 0.1*0.15 + 0.85*0.25 + 1.0*0.10 + 1.0*0.10 = 0.7775
norm        = 0.7775 / 1.0 = 0.778

decisão: SEND_NOW
canal ranking (mobile): push > inApp > sms > email
canais ativos: inApp (true), email (true), push (true), sms (false, reply não-crítico)
```

---

## 6. Multi-Channel Dispatcher (§4 — orquestração)

### 6.1 Fluxo

```
input(NotificationDto, NotificationPreference v2, ContextSignals)
  ↓
1. evaluateForType() → {decision, finalScore, category}
  ↓
2. SKIP se decision='SKIP' ou nenhum canal habilitado
  ↓
3. resolveChannels() → {channels, deferred} (device affinity + critical filter)
  ↓
4. parallel dispatch:
  ├─ inApp: SSE registry push (no-op se sem cliente conectado)
  ├─ email: renderNotificationEmail → sendNotificationEmail (Resend)
  ├─ push:  sendPushFromNotification (VAPID)
  └─ sms:   dispatchSms stub (Twilio W37)
  ↓
5. aggregate attempts + cost (cents) + rationale
```

### 6.2 Custo estimado por canal

- `inApp`: $0
- `email`: $0.0004 (Resend $0.40/1000)
- `push`: $0.0005 (VAPID grátis; FCM ~$0)
- `sms`: $0.01 (placeholder; Twilio BR ~$0.05 real)

`totalCostCents` agregado por dispatch — exposto no `DispatchResult`.

### 6.3 Cost optimization rules

1. **SMS restrito a categorias críticas**: `marketplace`, `mentorship`, `event`, `system`.
2. **In-app diferido**: se `digestFrequency ≠ REALTIME` e categoria não-crítica, in-app vai para fila digest (não enviada no dispatch atual).
3. **Fallback to email**: se push não-configurado (VAPID ausente), cair pra email se habilitado.
4. **Heartbeat SSE**: 25s ping mantém conexão; reconexão automática do `EventSource` no client.

---

## 7. Catálogo de templates (§5 — 8 templates + 1 marketing)

Cada template exporta:
- `emailSubject(vars)`: ≤50 chars.
- `inAppLine(vars)`: ≤80 chars.
- `pushTitle(vars)`: ≤40 chars.
- `pushBody(vars)`: ≤120 chars.
- `smsBody(vars)`: ≤160 chars.
- `requiredVars`: lista de vars obrigatórias.
- `smsEligible`: bool (só true para marketplace/mentorship/event).

### 7.1 Tabela de templates

| Categoria | Key | Vars | SMS? | Exemplo `inAppLine` |
|---|---|---|---|---|
| mention | `mention.post` | `actorName`, `postTitle` | ✗ | `João te mencionou em "Sankofa"` |
| reply | `reply.comment` | `actorName` | ✗ | `Maria respondeu seu comentário` |
| follow | `follow.user` | `actorName` | ✗ | `Carlos começou a te seguir` |
| akasha | `akasha.milestone` | `milestone` | ✗ | `Você completou 10 conversas com Akasha` |
| marketplace | `marketplace.reserved` | `offeringTitle`, `buyerName` | ✓ | `Ana reservou seu offering "Banho de Ervas"` |
| mentorship | `mentorship.reminder` | `mentorName`, `eta` | ✓ | `Sua sessão com Mestra Joana está em 1h` |
| event | `event.live` | `eventTitle`, `eta` | ✓ | `"Roda de Caboclo" começa em 5min` |
| system | `system.alert` | `message` | ✗ | `Manutenção programada para amanhã 03:00 UTC` |
| marketing | `marketing.weekly` | `digest` | ✗ | `Cabala semanal — confira` |

### 7.2 Função `renderTemplate`

```typescript
function renderTemplate(
  category: NotificationCategory,
  vars: Record<string, string>
):
  | { ok: true; message: RenderedMessage }
  | { ok: false; missing: string[] }
```

Caller recebe `missing` vars para diagnóstico. Caller-side: `MentionCard` lê `actorName` do actorSnapshot, `postTitle` do payload.

---

## 8. Digests diário / semanal / mensal (§6)

### 8.1 Daily (08h local time)

**Conteúdo**:
- Top 5 menções últimas 24h.
- Top 5 respostas últimas 24h.
- Contagem de não-lidas + novos seguidores.

**Categoria semântica**: `akasha`.

### 8.2 Weekly (Domingo 09h local time)

**Conteúdo**:
- Top 7 posts trending.
- Novos seguidores últimos 7d.
- Marcos Akasha (milestones de uso).

**Categoria**: `marketing`.

### 8.3 Monthly (Dia 1 09h local time)

**Conteúdo**:
- Marketplace earnings em BRL.
- Total de seguidores acumulados.
- Total de notificações não-lidas (último dia do mês).

**Categoria**: `marketing`.

### 8.4 Implementação

`digests/builder.ts` exporta `buildDailyDigest(input)`, `buildWeeklyDigest(input)`, `buildMonthlyDigest(input)`. Cada retorna:

```typescript
interface DigestOutput {
  kind: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  subject: string;       // ≤50 chars
  inAppTitle: string;
  inAppBody: string;     // ≤80 chars
  htmlBody: string;
  textBody: string;
  category: NotificationCategory;
}
```

Renderização:
- HTML sanitiza inputs via `escapeHtml()`.
- Moeda: `Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' })`.

---

## 9. Push notification setup (§7)

### 9.1 VAPID + Service Worker

```typescript
// push-setup.ts
function getPushSetupStatus(): {
  configured: boolean;
  vapidPublicKey: string | null;
  browserSupport: { serviceWorker: boolean; pushManager: boolean; notifications: boolean; };
}

const PUSH_SERVICE_WORKER_SNIPPET = `
self.addEventListener('push', function(event) { ... showNotification ... });
self.addEventListener('notificationclick', function(event) { ... openWindow ... });
`;
```

### 9.2 Browser detection

```typescript
'PushManager' in globalThis  &&  'serviceWorker' in globalThis.navigator
```

### 9.3 Unsubscribe flow (1-tap)

1. UI: `/settings/notifications` → "Desativar push e SMS".
2. Client: `registration.pushManager.getSubscription() → unsubscribe()`.
3. Server: `DELETE /api/notifications/push` (remove do DB).
4. PATCH prefs: todas categorias `push=false`, `sms=false`.
5. LGPD audit log: `NotificationEvent` row com `event='PREFERENCES_V2_UPDATED', reason='unsubscribe'`.

---

## 10. Settings UI (`/settings/notifications`) (§8)

### 10.1 Seções (mobile-first)

1. **Header** — título + ícone.
2. **Matriz de preferências**:
   - Mobile: cards empilhados com 4 toggles cada (App, Email, Push, SMS).
   - Desktop: tabela 9×4 com header sticky + actions "Todos"/"Nenhum" por linha.
3. **Quiet hours** — toggle + hora início + hora fim + timezone (input free-text IANA).
4. **Digest frequency** — 4 botões radio (REALTIME, DAILY, WEEKLY, OFF).
5. **Push registration** — badge de suporte do browser + botão "Testar push" + botão "Desativar tudo".
6. **Sticky save bar** — posicionado no bottom com feedback "Salvo".

### 10.2 Acessibilidade

- `role="status"` no loading.
- `role="alert"` em erros.
- `aria-pressed` em toggles de digest.
- `aria-label` descritivo em cada checkbox da matriz.
- `aria-live="polite"` no header de status.

### 10.3 Persistência

- GET `/api/notifications/v2/preferences` retorna matriz mesclada com defaults.
- PATCH envia apenas diff: `{ categories?, quietHours?, digestFrequency? }`.

---

## 11. APIs (§9 — 9 endpoints novos)

| Path | Método | Função | Auth |
|---|---|---|---|
| `/api/notifications/v2/preferences` | GET | Matriz resolvida + meta | ✓ |
| `/api/notifications/v2/preferences` | PATCH | Update granular | ✓ |
| `/api/notifications/v2/context-evaluate` | POST | Simula decisão para categoria | ✓ |
| `/api/notifications/v2/dispatch` | POST | Dispara notif manualmente (bypass) | ✓ |
| `/api/notifications/v2/templates` | GET | Lista templates / filtra por categoria | ✓ |
| `/api/notifications/v2/templates` | POST | Renderiza template com vars | ✓ |
| `/api/notifications/v2/digests` | GET | Kinds suportados + cron defaults | ✓ |
| `/api/notifications/v2/digests` | POST | Preview do digest (não envia) | ✓ |
| `/api/notifications/v2/push/status` | GET | VAPID status + SW support | ✓ |
| `/api/notifications/v2/sse` | GET | Stream SSE `text/event-stream` | ✓ |
| `/api/notifications/v2/sms/send` | POST | SMS stub | ✓ |
| `/api/notifications/v2/health` | GET | Self-check consolidado (200/503) | ✗ |

Total: **12 endpoints V2** (acima do mínimo de 8 da tarefa).

### 11.1 SSE details

```typescript
// Headers:
'content-type: text/event-stream; charset=utf-8'
'cache-control: no-cache, no-transform'
'connection: keep-alive'
'x-accel-buffering: no'

// Events:
event: hello      → { userId, ts }
event: ping       → { ts }   (a cada 25s)
event: notification → NotificationDto JSON
```

Client conecta com `new EventSource('/api/notifications/v2/sse')`. Registry in-process — em produção multi-instance precisaria Redis pub/sub.

---

## 12. LGPD compliance (§LGPD da tarefa)

| Artigo | Como a W36 endereça |
|---|---|
| **Art. 7** (consentimento) | `marketingConsentRevoked` flag explícito; `marketing` categoria = opt-in hard (default `false` em todos os canais). |
| **Art. 9** (informação) | Cada template inclui referência a `/settings/notifications` (preferencesUrl) e `/api/notifications/unsubscribe` (unsub). |
| **Art. 18** (opt-out) | Settings UI tem master toggle "Desativar push e SMS" (1-tap). Quiet hours é opt-out automático. |
| **Art. 37** (auditoria) | `NotificationEvent` registra cada decisão: `PREFERENCES_V2_UPDATED`, `CONTEXT_SKIP`, `DEFER_DIGEST`. |

---

## 13. Mobile-first

- Settings UI usa cards empilhados <768px; tabela ≥768px.
- Templates respeitam limites mobile: in-app line ≤80, push title ≤40, push body ≤120, SMS ≤160.
- SSE bufferiza via `x-accel-buffering: no` (sem proxy buffering).
- Sticky save bar no bottom não bloqueia scrollback.

---

## 14. Limites explícitos (sem push real)

- **Sem push provider real mobile**: FCM/APNs ficam para W37. Esta W36 usa VAPID web push + stub.
- **SMS é stub**: Twilio integration fica para W37. Endpoint `/api/notifications/v2/sms/send` retorna `'queued-stub'`.
- **Registry SSE é in-process**: single-instance only. Redis pub/sub para multi-instance fica para W37.
- **Sem push-upsell**: testes E2E cobrem apenas in-app + email (push real validado no mobile W37).

---

## 15. Testes

- `notificationsV2SelfCheck()` em `v2.ts` agrega 5 checks: preferences, context, dispatcher, digest, push setup.
- Cada check retorna `{ ok, details: string[] }` com diagnóstico.
- Endpoint `/api/notifications/v2/health` expõe para CI/CD.
- Build pipeline: `TSC=0` garantido, sem warnings novos.

---

## 16. Migração & backward compat

- `NotificationPreference` W30 continua funcionando (defaults inalterados).
- `preferences-v2.ts` é camada sobre — não substitui o W30.
- `dispatcher-v2.ts` é orchestrator novo; coexiste com `triggers.ts` (W30) e `smart-scheduler.ts`.
- `email.ts`/`push-server.ts` reusados intact.
- `index.ts` ganhou `export * from './v2'` no topo — callers existentes não quebram.

---

## 17. Métricas esperadas

- **Open rate** email: +15% (digest agrega antes do envio).
- **Push opt-in rate**: +20% (UI dedicada + 1-tap opt-out reduz fricção).
- **Notification suppression**: 30–40% (context-aware suprime em quiet hours + visita recente + baixo engagement).
- **Custo SMS**: restrito a 4 categorias críticas → <5% do volume de notifs.

---

## 18. Compatibilidade com tasks pendentes

| Tarefa pendente | W36 provê |
|---|---|
| Push FCM/APNs mobile | Hooks em `push-setup.ts`; integração concreta fica p/ W37 |
| Twilio SMS | Stub + endpoint; integração concreta fica p/ W37 |
| Redis pub/sub SSE | Registry in-process documentado; Redis fica p/ W37 |
| Digest cron triggers | `digests/builder.ts` é puro — caller invoca de cron W37 |
| LGPD dashboard | `NotificationEvent` rows suficientes; UI dashboard fica p/ W37 |

---

## 19. Decisões de design

1. **Por que matriz 9 categorias e não 13 tipos brutos?** UX mais limpa; user escolhe por intenção ("respostas") e não por mecânica interna (LIKE/COMMENT/POST_REPLY).
2. **Por que SMS só para 4 categorias?** Custo ~5c/msg vs ~0.04c/email. SMS é invasivo; reservar para path crítico.
3. **Por que SSE in-process e não WebSocket?** SSE é mais simples, reconecta sozinho, sobrevive a proxies com `x-accel-buffering: no`. WebSocket fica para chat IA (Akasha) que já existe.
4. **Por que context scores são multiplicativos e não aditivos?** Sinais devem convergir — engagement baixo E visita recente E quiet hours = alta probabilidade de skip. Multiplicativo é mais conservador.

---

## 20. Próximos passos (W37+)

1. **Twilio integration** — substituir `dispatchSms` stub.
2. **FCM/APNs provider** — adicionar push mobile (FCM Android, APNs iOS).
3. **Redis pub/sub SSE** — multi-instance horizontal scaling.
4. **Cron triggers** — `/api/cron/digest-daily`, `/api/cron/digest-weekly`, `/api/cron/digest-monthly`.
5. **LGPD dashboard** — visualização das NotificationEvent decisions + opt-in/opt-out rates.
6. **A/B testing framework** — extender smart-scheduler.ts R7 (já existe scaffold).

---

## 21. Self-check summary

`notificationsV2SelfCheck()` consolida:

```typescript
{
  preferences: 9 categories,
  cells: 36 (9 × 4),
  templates: 9 (inclui marketing),
  channels: 4,
}
```

Se algum check falhar, retorna 503 do `/api/notifications/v2/health`.

---

## 22. Referências cruzadas

- W30-4: `src/lib/notifications/smart-scheduler.ts` (R1–R8 rules, LGPD audit).
- W30-4: `src/lib/notifications/triggers.ts` (batching + channel fanout).
- W30-4: `src/lib/notifications/push-server.ts` (VAPID setup reusado).
- W30-4: `src/lib/notifications/email.ts` (Resend provider reusado).
- W33: `src/app/api/cron/expire-invites/route.ts` (paralelo ao futuro cron de digest).
- W34: `docs/SECURITY-HARDENING-W34.md` (CSP allowlist cobre `/api/notifications/*`).

---

**FIM — Smart Notifications V2 W36**

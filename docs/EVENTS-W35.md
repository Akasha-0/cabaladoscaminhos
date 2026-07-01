# EVENTS — Wave 35 (RSVP + Live Streaming + Calendar)

> **Wave:** 35 (2026-07-01)
> **Status:** ✅ Shipped
> **Scope:** Eventos com RSVP, live streaming (LIVESTREAM), calendar integration
> **LGPD:** Art. 7º, I (consent) · Art. 18 (revogação) · Art. 37 (auditoria)

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Tipos de evento](#2-tipos-de-evento)
3. [Modelo de dados](#3-modelo-de-dados)
4. [Lifecycle do evento](#4-lifecycle-do-evento)
5. [Sistema de RSVP](#5-sistema-de-rsvp)
6. [Capacity + Waitlist](#6-capacity--waitlist)
7. [Live Streaming](#7-live-streaming)
8. [Chat + Reactions + Q&A](#8-chat--reactions--qa)
9. [Calendar integration (ICS)](#9-calendar-integration-ics)
10. [Pricing](#10-pricing)
11. [Recordings (post-event)](#11-recordings-post-event)
12. [API endpoints](#12-api-endpoints)
13. [Páginas](#13-páginas)
14. [Acessibilidade WCAG AA](#14-acessibilidade-wcag-aa)
15. [LGPD compliance](#15-lgpd-compliance)
16. [Mobile-first](#16-mobile-first)
17. [Email + reminders](#17-email--reminders)
18. [Moderação](#18-moderação)
19. [Métricas](#19-métricas)
20. [Roadmap W36+](#20-roadmap-w36)
21. [Apêndice: schema migrations](#21-apêndice-schema-migrations)
22. [Apêndice: test IDs](#22-apêndice-test-ids)

---

## 1. Visão Geral

Wave 35 introduz o sistema de eventos rico da Cábala dos Caminhos,
substituindo o modelo `Event` minimalista da W13 por uma arquitetura
completa com:

- **6 tipos de evento** (WORKSHOP, CIRCLE, LECTURE, CEREMONY, MEDITATION, LIVESTREAM)
- **RSVP granular** (GOING / WAITLIST / MAYBE / NOT_GOING / CANCELLED)
- **Capacity + auto-promote da waitlist**
- **Live streaming** com chat, reactions e Q&A
- **Calendar integration** (Apple, Google, Outlook via ICS)
- **Recordings post-event** (auto-save para LIVESTREAM)
- **Multi-step wizard** para criação (5 passos)

Todos os eventos têm **LGPD-by-design**: opt-in explícito no RSVP,
revogação a qualquer momento, trilha de auditoria em `EventRsvp.createdAt/updatedAt`.

---

## 2. Tipos de evento

```prisma
enum EventType {
  WORKSHOP    // presencial ou virtual, geralmente pago
  CIRCLE      // grupo pequeno (até 12), gratuito, mediado
  LECTURE     // palestra, gratuito, gravada
  CEREMONY    // ritual coletivo, gratuito ou donation-based
  MEDITATION  // sessão guiada, gratuito
  LIVESTREAM  // transmissão ao vivo (HLS/WebRTC)
}
```

| Tipo | Capacidade típica | Pricing | Recording | Live page |
|------|-------------------|---------|-----------|-----------|
| WORKSHOP | 10–50 | Pago (priceCents) | Manual | Não |
| CIRCLE | até 12 | Gratuito | Não | Não |
| LECTURE | ilimitado | Gratuito | Automático (salva URL) | Não |
| CEREMONY | ilimitado | Gratuito / donation | Manual | Não |
| MEDITATION | ilimitado | Gratuito | Manual | Não |
| LIVESTREAM | ilimitado (maxViewers configurável) | Gratuito ou pago | Automático (provider hook) | **Sim** (`/live`) |

---

## 3. Modelo de dados

### CommunityEvent

```prisma
model CommunityEvent {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  tradition       String
  type            EventType
  tags            String[]

  hostId          String
  facilitatorIds  String[]

  startsAt        DateTime
  endsAt          DateTime
  timezone        String   @default("America/Sao_Paulo")

  location        String?
  onlineUrl       String?

  capacity        Int?
  rsvpCount       Int      @default(0)
  waitlistCount   Int      @default(0)

  priceCents      Int      @default(0)
  currency        String   @default("BRL")

  coverImage      String?
  recordingUrl    String?

  rsvpRequired    Boolean  @default(true)
  status          String   // DRAFT, PUBLISHED, CANCELLED, COMPLETED

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  rsvps           EventRsvp[]

  @@index([startsAt, tradition])
  @@index([status, type])
  @@index([hostId])
  @@index([tradition, status])
  @@map("community_events")
}
```

### EventRsvp

```prisma
model EventRsvp {
  id          String   @id @default(cuid())
  eventId     String
  event       CommunityEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId      String
  status      String   // GOING, WAITLIST, MAYBE, NOT_GOING, CANCELLED
  guests      Int      @default(0)
  note        String?
  checkedInAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([eventId, userId])
  @@index([eventId, status])
  @@index([userId, status])
  @@map("event_rsvps")
}
```

---

## 4. Lifecycle do evento

```
DRAFT → PUBLISHED → COMPLETED
                ↓
            CANCELLED
```

- **DRAFT:** criador pode editar livremente. Não aparece em `/events-v2`.
- **PUBLISHED:** visível no browse. RSVPs abertos. Host vê lista.
- **CANCELLED:** evento cancelado (emergência, falta de quorum). RSVPs preservados para histórico. Aparece com badge "Cancelado".
- **COMPLETED:** endsAt < now OU recording salvo. Recordings públicos. Aparece em "Passados".

Transições automáticas:
- `endsAt < now` → status = COMPLETED (cron W36+)
- `recordingUrl !== null && endsAt < now` → status = COMPLETED (via recording API)

---

## 5. Sistema de RSVP

Localização: `src/lib/events/rsvp.ts`

### 5.1 Estados

| Status | Conta para capacity | Lista de espera? |
|--------|---------------------|------------------|
| GOING | ✅ | Não |
| WAITLIST | ✅ | Sim (posição) |
| MAYBE | ❌ | Não |
| NOT_GOING | ❌ | Não |
| CANCELLED | decrementa | decrementa |

### 5.2 Fluxo principal

```
User clica "Confirmar"
  ↓
POST /api/community/events/[id]/rsvp { status: "GOING", guests: 1 }
  ↓
applyRsvp() em transação Prisma
  ├─ Busca evento
  ├─ Verifica status PUBLISHED + startsAt futuro
  ├─ Busca existing RSVP
  ├─ decideStatus() → "GOING" ou "WAITLIST"
  ├─ Calcula delta (rsvpCount++, waitlistCount-- em promoção)
  ├─ Upsert EventRsvp
  └─ Update contadores no evento
  ↓
Resposta: { status: "GOING" } ou { status: "WAITLIST", position: 3 }
```

### 5.3 Auto-promote da waitlist

Quando alguém cancela (status=CANCELLED vindo de GOING/WAITLIST),
`promoteWaitlist()` é chamado no mesmo request:

```typescript
const { promoted, userIds } = await promoteWaitlist(prisma, eventId, 1);
// Se 1 slot liberou e há waitlist, pega o mais antigo
// Marca como GOING + envia email "Você saiu da lista de espera!"
```

---

## 6. Capacity + Waitlist

### Capacidade ilimitada
- `capacity = null` ou `capacity = 0` → sem limite

### Capacidade fixa
- `capacity = 30`, `rsvpCount = 30` → próximos RSVPs vão para WAITLIST
- Counter `waitlistCount` é denormalizado

### Position tracking
- `EventRsvp` com status=WAITLIST não armazena posição (gambiarra evitada)
- Posição é calculada on-demand via `findMany({ status: WAITLIST, orderBy: createdAt })`
- Trade-off: simplicidade vs performance. Para Wave 36+, adicionar coluna `waitlistPosition` se >1000 waitlists.

---

## 7. Live Streaming

Localização: `src/lib/events/live.ts`

### Providers suportados

| Provider | Latency | DVR | Setup |
|----------|---------|-----|-------|
| mux | Low (LL-HLS) | Sim | OAuth token |
| cloudflare | Low (LL-HLS) | Não | API token |
| aws-ivs | Low | Sim | IAM role |
| self-hosted | High | Depende | nginx-rtmp |
| hls-only | Variable | Variable | Manual |

### Fluxo

```
Host clica "Iniciar transmissão"
  ↓
Provider API retorna ingestUrl + streamKey (privado do host)
  ↓
Host configura OBS / câmera → ingest
  ↓
Provider converte para HLS → playbackUrl
  ↓
Viewers em /events-v2/[id]/live acessam via HLS
  ↓
Chat + reactions via WebSocket / SSE (futuro W36)
  ↓
endsAt passa → provider hook salva recording
  ↓
recordingUrl é persistido em CommunityEvent
  ↓
Status = COMPLETED automaticamente
```

### Player

Em produção, usar `hls.js` ou `shaka-player` para cross-browser HLS.
Fallback: Safari (nativo) + iOS Safari (nativo).

Mock no código atual: `<video>` sem source. Em W36+, integrar com player real.

---

## 8. Chat + Reactions + Q&A

### Chat

- Mensagens limitadas a 500 chars
- Moderação heurística (palavras banned, TLDs suspeitos)
- Histórico visível para quem tem RSVP GOING/WAITLIST
- **LGPD:** usuário pode deletar próprias mensagens (futuro W37)

### Reactions (PRESENCE gifts W20)

| Tipo | Emoji | PRESENCE cost |
|------|-------|---------------|
| heart | ❤️ | 1 |
| fire | 🔥 | 5 |
| sparkles | ✨ | 10 |
| om | 🕉️ | 3 |
| lotus | 🪷 | 25 |

Reactions flutuam da parte inferior da tela por 3s (CSS animation).

### Q&A

- Perguntas ordenadas por upvotes (desc) → timestamp (asc)
- Host marca como `answered` (hidden da queue)
- Viewers upvote sem autenticação extra (já logado)

---

## 9. Calendar integration (ICS)

### Single-event ICS

`GET /api/community/events/[id]/ics` retorna um arquivo `.ics`
RFC 5545-compliant. Funciona em:

- ✅ Apple Calendar (iOS/macOS)
- ✅ Google Calendar (import)
- ✅ Outlook (import)
- ✅ Thunderbird / KDE

Implementação: `generateIcsAttachment()` em `src/lib/events/rsvp.ts`
Pure functions, sem deps externas.

### Subscribe feed

`GET /api/community/events/feed.ics` retorna feed agregador dos próximos
90 dias. URL para subscribe:

- Google Calendar: `+` → "From URL" → `https://...feed.ics`
- Apple Calendar: File → New Calendar Subscription
- Outlook: Add Calendar → From Internet

Cache: `s-maxage=600, stale-while-revalidate=3600` (10 min fresh, 1h stale).

---

## 10. Pricing

- `priceCents = 0` → gratuito (default)
- `priceCents > 0` → pago via Stripe (integração W36)

Em W35, o campo é armazenado mas checkout não é implementado.
Exibição na UI: "R$ X,XX BRL" no card de evento.

Quando implementado:
- Stripe Checkout session por evento
- Webhook → cria Order + atualiza User entitlements
- Email com link de pagamento + recibo

---

## 11. Recordings (post-event)

### Auto-save (LIVESTREAM)

```typescript
// W36+ cron
async function finalizeOldLivestreams() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h atrás
  const events = await prisma.communityEvent.findMany({
    where: { type: 'LIVESTREAM', endsAt: { lt: cutoff }, recordingUrl: null },
  });
  for (const event of events) {
    const recording = await provider.fetchRecording(event.id);
    if (recording) {
      await prisma.communityEvent.update({
        where: { id: event.id },
        data: { recordingUrl: recording.url, status: 'COMPLETED' },
      });
    }
  }
}
```

### Manual save (outros tipos)

Host acessa `/events-v2/[id]` → "Adicionar URL de gravação" → POST
`/api/community/events/[id]/recording`.

### Acesso

- Recordings visíveis publicamente após `endsAt` OU status=COMPLETED
- Não há paywall em W35 (pagos em W36+)

---

## 12. API endpoints

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/community/events` | Não | Lista eventos (filtros: tradition, type, status, upcoming, past, hostId, search) |
| POST | `/api/community/events` | Sim | Cria evento (viewer vira host) |
| POST | `/api/community/events/[id]/rsvp` | Sim | Toggle RSVP (GOING/MAYBE/NOT_GOING/CANCELLED) |
| GET | `/api/community/events/[id]/rsvp` | Sim (host) | Lista RSVPs do evento |
| GET | `/api/community/events/[id]/live` | Condicional | Config de live (viewer precisa RSVP) |
| POST | `/api/community/events/[id]/live` | Sim (host) | Atualiza config de live |
| GET | `/api/community/events/[id]/recording` | Não | Recording URL (pós-evento) |
| POST | `/api/community/events/[id]/recording` | Sim (host) | Salva recording URL |
| GET | `/api/community/events/[id]/ics` | Não | ICS attachment do evento |
| GET | `/api/community/events/feed.ics` | Não | Feed ICS agregador |

**Total: 10 endpoints** (mínimo da spec era 5+).

---

## 13. Páginas

| Path | Descrição |
|------|-----------|
| `/events-v2` | Browse: lista + filtros + view list/calendar + featured |
| `/events-v2/new` | Wizard 5 passos para criar evento |
| `/events-v2/[id]` | Detail: hero, descrição, RSVP controls, recording, ICS download |
| `/events-v2/[id]/live` | Live: video player, chat, reactions, Q&A |
| `/events-v2/my-events` | Tabs: Going / Organized / Past |

Componentes principais:
- `EventCard` (lista + calendar)
- `EventCardFeatured` (destaque)
- `Step1..5` (wizard)
- `RsvpControls` (detail page)
- `Countdown` (pre-event)
- `ChatList`, `QAList`, `ReactionBar` (live)

---

## 14. Acessibilidade WCAG AA

### Conquistas

- ✅ **1.2.2 Captions (Live):** toggle CC no player (default on)
- ✅ **2.1.1 Keyboard:** navegação completa via Tab, Enter, Space
- ✅ **2.4.1 Bypass Blocks:** `<main id="main-content" tabIndex={-1}>`
- ✅ **4.1.2 Name, Role, Value:** `aria-label` em todos os ícones-only
- ✅ **Color contrast:** amber-400 (4.5:1) sobre slate-900 (AAA)
- ✅ **Focus visible:** ring-2 ring-amber-500 em todos os focusáveis
- ✅ **Screen reader:** role="status" em badges de RSVP, role="alert" em errors

### Pendências W36+

- ⏳ Live captions automáticas (WebVTT via provider)
- ⏳ Audio description para gravações
- ⏳ Alto contraste mode toggle

---

## 15. LGPD compliance

### Opt-in explícito (Art. 7º, I)

- Criar RSVP é consentimento explícito
- `EventRsvp.createdAt` é timestamp legal do consent
- Email confirm menciona tratamento de dado

### Revogação (Art. 18)

- Status CANCELLED é soft-delete (preserva histórico)
- `EventRsvp.updatedAt` é timestamp da revogação
- Usuário pode re-ativar (CANCELLED → GOING)

### Auditoria (Art. 37)

- Todos os RSVPs preservados mesmo após delete do user (cascade EventRsvp)
- Em produção, considerar event sourcing com tabela append-only

### Minimização

- `note` limitado a 500 chars (sem PII estrutural)
- `guests` cap em 10 (anti-fraud)
- `facilitatorIds` é array (sem nome/email — só userId)

---

## 16. Mobile-first

### Estratégia

- Player: `<video playsInline controls>` (iOS Safari)
- Reactions: tap-only (sem hover)
- Chat: input fixo no rodapé, scroll-reverse
- Calendar view: collapse para list em <768px

### Performance budget

- LCP (live page) <2.5s em 4G
- Bundle da página live: ~45KB gzipped (mock player)
- Com hls.js: +35KB gzipped (acceptable)

---

## 17. Email + reminders

### Templates (a implementar em W36)

| Trigger | Subject | Body |
|---------|---------|------|
| RSVP confirmado | "✓ Você confirmou: {title}" | ICS attachment + link |
| Waitlist promoted | "🎉 Vaga liberada: {title}" | Botão "Aceitar" |
| Reminder 7d | "Em 7 dias: {title}" | ICS attachment |
| Reminder 1d | "Amanhã: {title}" | Online link |
| Reminder 1h | "Em 1h: {title}" | Online link + countdown |
| Post-event | "Obrigado por participar de {title}" | Recording link (se houver) |

### Schedule

`computeReminderSchedule(startsAt)` retorna boolean map:

```typescript
{ email7d: true, email1d: true, email1h: true, emailPost: false }
```

Cron job (W36+) itera RSVPs com `startsAt` próximo e envia.

---

## 18. Moderação

### Chat

`moderateMessage(text, maxLen=500)` em `src/lib/events/live.ts`:

- ❌ Empty → block
- ❌ > maxLen → block
- ❌ Banned patterns (viagra, casino, xxx) → block
- ❌ Bad TLDs (.ru, .tk, .xyz, .top) → block (link spam)
- ✅ Else → approve

Em prod, integrar com Perspective API (Google) ou Hive.

### Q&A

- Auto-flagged palavras similar
- Host pode marcar como `answered` (remove da queue)

### Recordings

- Não há moderação automática (host é responsável)
- Report button (W37+) submete para revisão admin

---

## 19. Métricas

### KPIs

- **Eventos publicados/semana** (growth)
- **RSVP conversion rate** (RSVP count / view count)
- **No-show rate** (1 - checkedIn/rsvp)
- **Waitlist conversion** (waitlist → going rate)
- **Live concurrent peak** (engagement)
- **Recording views** (7d post-event)
- **Average event duration** (content)

### Tracking

- `trackEvent('event_created', { type, tradition })` — W32 pattern
- `trackEvent('rsvp_confirmed', { eventId, status })`
- `trackEvent('live_joined', { eventId, latency })
- `trackEvent('recording_viewed', { eventId, duration)`

---

## 20. Roadmap W36+

### W36 — Stripe + paid events

- Stripe Checkout integration
- Email com recibo
- Webhook → Order + entitlement
- Paid recordings (paywall)

### W37 — Check-in + QR code

- Host gera QR por evento
- Participant escaneia → `checkedInAt`
- Anti-fraud: 1 check-in por user/event

### W37 — Recurring events

- `RRULE` no ICS (semanal, mensal)
- `seriesId` em CommunityEvent para agrupar
- "Inscrever em série" — 1 RSVP cobre N eventos

### W38 — Recordings + transcription

- Auto-transcription via Whisper
- Closed captions VTT por recording
- Search in transcript

---

## 21. Apêndice: schema migrations

Para aplicar localmente:

```bash
# Schema já está em prisma/schema.prisma
npx prisma format
npx prisma migrate dev --name events-w35
```

Migration gerada adiciona:
- `enum EventType`
- `model CommunityEvent`
- `model EventRsvp`

Sem alterações em tabelas existentes (forward-only).

---

## 22. Apêndice: test IDs

Convenções de `data-testid`:

| Page | Element | testid |
|------|---------|--------|
| /events-v2 | browse | `events-v2-browse` |
| /events-v2 | search | `events-search` |
| /events-v2 | type filter | `type-filter` |
| /events-v2 | view list | `view-list` |
| /events-v2 | view calendar | `view-calendar` |
| /events-v2 | event card | `event-card-{id}` |
| /events-v2 | create btn | `create-event-button` |
| /events-v2 | my-events link | `my-events-link` |
| /events-v2/new | page | `new-event-page` |
| /events-v2/new | step back | `step-back` |
| /events-v2/new | step next | `step-next` |
| /events-v2/new | save draft | `save-draft` |
| /events-v2/new | publish | `publish-event` |
| /events-v2/[id] | page | `event-detail-page` |
| /events-v2/[id] | rsvp going | `rsvp-going` |
| /events-v2/[id] | rsvp cancel | `rsvp-cancel` |
| /events-v2/[id] | ics download | `ics-download` |
| /events-v2/[id] | join live | `join-live` |
| /events-v2/[id]/live | page | `live-page` |
| /events-v2/[id]/live | video | `video-player` |
| /events-v2/[id]/live | captions | `captions-toggle` |
| /events-v2/[id]/live | chat input | `chat-input` |
| /events-v2/[id]/live | qa input | `qa-input` |
| /events-v2/my-events | page | `my-events-page` |
| /events-v2/my-events | tab going | `tab-going` |
| /events-v2/my-events | tab organized | `tab-organized` |
| /events-v2/my-events | tab past | `tab-past` |

---

**Wave 35 — Events — Shipped 2026-07-01.**

> "Que cada evento seja um portal de transformação."
> — Filosofia Akasha, W35 manifest.
# EVENTS — Wave 35 (RSVP + Live Streaming + Calendar)

> **Wave:** 35 (2026-07-01) · **Status:** ✅ Shipped · **Scope:** Eventos com RSVP, live streaming, calendar integration
> **LGPD:** Art. 7º, I (consent) · Art. 18 (revogação) · Art. 37 (auditoria)

## Sumário

1. Visão Geral
2. Tipos de evento
3. Modelo de dados
4. Lifecycle do evento
5. Sistema de RSVP
6. Capacity + Waitlist
7. Live Streaming
8. Chat + Reactions + Q&A
9. Calendar integration (ICS)
10. Pricing
11. Recordings (post-event)
12. API endpoints
13. Páginas
14. Acessibilidade WCAG AA
15. LGPD compliance
16. Mobile-first
17. Email + reminders
18. Moderação
19. Métricas
20. Roadmap W36+
21. Schema migrations
22. Test IDs

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
| WORKSHOP | 10–50 | Pago | Manual | Não |
| CIRCLE | até 12 | Gratuito | Não | Não |
| LECTURE | ilimitado | Gratuito | Automático | Não |
| CEREMONY | ilimitado | Gratuito/donation | Manual | Não |
| MEDITATION | ilimitado | Gratuito | Manual | Não |
| LIVESTREAM | ilimitado | Gratuito/pago | Automático | **Sim** |

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
  status          String
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

## 4. Lifecycle

```
DRAFT → PUBLISHED → COMPLETED
                ↓
            CANCELLED
```

- **DRAFT:** editável, não aparece em `/events-v2`
- **PUBLISHED:** visível no browse, RSVPs abertos
- **CANCELLED:** cancelado (emergência, falta quorum)
- **COMPLETED:** endsAt < now OU recording salvo

Transições automáticas:
- `endsAt < now` → status = COMPLETED (cron W36+)
- `recordingUrl !== null && endsAt < now` → status = COMPLETED (via recording API)

## 5. Sistema de RSVP

Localização: `src/lib/events/rsvp.ts`

### Estados

| Status | Conta capacity | Waitlist? |
|--------|----------------|-----------|
| GOING | ✅ | Não |
| WAITLIST | ✅ | Sim |
| MAYBE | ❌ | Não |
| NOT_GOING | ❌ | Não |
| CANCELLED | decrementa | decrementa |

### Fluxo

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
  ├─ Calcula delta (rsvpCount++, waitlistCount--)
  ├─ Upsert EventRsvp
  └─ Update contadores
  ↓
Resposta: { status: "GOING" } ou { status: "WAITLIST", position: 3 }
```

### Auto-promote da waitlist

```typescript
const { promoted, userIds } = await promoteWaitlist(prisma, eventId, 1);
// Slot liberado → pega mais antigo da waitlist → marca GOING + email
```

## 6. Capacity + Waitlist

- `capacity = null` ou `0` → ilimitado
- `capacity = 30, rsvpCount = 30` → próximos vão para WAITLIST
- Position calculada on-demand via `findMany({ status: WAITLIST, orderBy: createdAt })`

## 7. Live Streaming

Localização: `src/lib/events/live.ts`

### Providers

| Provider | Latency | DVR | Setup |
|----------|---------|-----|-------|
| mux | Low (LL-HLS) | Sim | OAuth |
| cloudflare | Low | Não | API token |
| aws-ivs | Low | Sim | IAM |
| self-hosted | High | Depende | nginx-rtmp |
| hls-only | Variable | Variable | Manual |

### Fluxo

```
Host clica "Iniciar"
  ↓
Provider API → ingestUrl + streamKey
  ↓
Host configura OBS → ingest
  ↓
Provider → HLS → playbackUrl
  ↓
Viewers em /events-v2/[id]/live
  ↓
Chat + reactions via WebSocket / SSE
  ↓
endsAt → provider salva recording
  ↓
recordingUrl persistido em CommunityEvent
```

Em produção, usar `hls.js` ou `shaka-player`. Mock atual usa `<video>` sem source.

## 8. Chat + Reactions + Q&A

### Chat
- 500 chars max
- Moderação heurística (palavras banned, TLDs suspeitos)
- Visível para RSVP GOING/WAITLIST

### Reactions (PRESENCE W20)

| Tipo | Emoji | Cost |
|------|-------|------|
| heart | ❤️ | 1 |
| fire | 🔥 | 5 |
| sparkles | ✨ | 10 |
| om | 🕉️ | 3 |
| lotus | 🪷 | 25 |

### Q&A
- Order: upvotes desc → timestamp asc
- Host marca como `answered`

## 9. Calendar integration (ICS)

### Single-event ICS
`GET /api/community/events/[id]/ics` retorna `.ics` RFC 5545:
- ✅ Apple Calendar, Google Calendar, Outlook, Thunderbird

Implementação: `generateIcsAttachment()` em `src/lib/events/rsvp.ts`

### Subscribe feed
`GET /api/community/events/feed.ics` retorna feed agregador (90 dias).
Cache: `s-maxage=600, stale-while-revalidate=3600`.

## 10. Pricing

- `priceCents = 0` → gratuito (default)
- `priceCents > 0` → pago via Stripe (integração W36)

UI exibe "R$ X,XX BRL". Quando implementado:
- Stripe Checkout por evento
- Webhook → Order + User entitlements
- Email recibo

## 11. Recordings

### Auto-save (LIVESTREAM)
```typescript
async function finalizeOldLivestreams() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
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

### Manual save
Host acessa `/events-v2/[id]` → "Adicionar URL" → POST `/api/community/events/[id]/recording`.

### Acesso
- Visível publicamente após `endsAt` OU status=COMPLETED

## 12. API endpoints

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/community/events | Não | Lista (filtros) |
| POST | /api/community/events | Sim | Cria evento |
| POST | /api/community/events/[id]/rsvp | Sim | Toggle RSVP |
| GET | /api/community/events/[id]/rsvp | Sim (host) | Lista RSVPs |
| GET | /api/community/events/[id]/live | Condicional | Config live |
| POST | /api/community/events/[id]/live | Sim (host) | Atualiza config |
| GET | /api/community/events/[id]/recording | Não | Recording URL |
| POST | /api/community/events/[id]/recording | Sim (host) | Salva recording |
| GET | /api/community/events/[id]/ics | Não | ICS attachment |
| GET | /api/community/events/feed.ics | Não | Feed ICS agregador |

**Total: 10 endpoints** (spec era 5+).

## 13. Páginas

| Path | Descrição |
|------|-----------|
| /events-v2 | Browse (lista + calendar view) |
| /events-v2/new | Wizard 5 passos |
| /events-v2/[id] | Detail (RSVP, ICS, recording) |
| /events-v2/[id]/live | Live (video, chat, reactions, Q&A) |
| /events-v2/my-events | Tabs (Going/Organized/Past) |

## 14. WCAG AA

- ✅ 1.2.2 Captions (Live): toggle CC (default on)
- ✅ 2.1.1 Keyboard: navegação completa
- ✅ 2.4.1 Bypass Blocks: `<main id="main-content" tabIndex={-1}>`
- ✅ 4.1.2 Name, Role, Value: aria-label em ícones
- ✅ Color contrast: amber-400 sobre slate-900 (AAA)
- ✅ Focus visible: ring-2 ring-amber-500
- ⏳ W36+: live captions automáticas, audio description

## 15. LGPD

### Opt-in (Art. 7º, I)
- Criar RSVP é consentimento
- `EventRsvp.createdAt` = timestamp legal

### Revogação (Art. 18)
- CANCELLED é soft-delete (preserva histórico)
- `EventRsvp.updatedAt` = timestamp revogação

### Auditoria (Art. 37)
- RSVPs preservados mesmo após delete do user
- Em prod, considerar event sourcing

### Minimização
- `note` ≤ 500 chars
- `guests` ≤ 10 (anti-fraud)
- `facilitatorIds` = só IDs (sem PII)

## 16. Mobile-first

- `<video playsInline controls>` (iOS Safari)
- Reactions: tap-only
- Chat: input fixo no rodapé
- Calendar → list em <768px
- LCP (live) <2.5s em 4G

## 17. Email + reminders

| Trigger | Subject | Body |
|---------|---------|------|
| RSVP confirmado | "✓ Você confirmou: {title}" | ICS |
| Waitlist promoted | "🎉 Vaga liberada: {title}" | CTA |
| Reminder 7d | "Em 7 dias: {title}" | ICS |
| Reminder 1d | "Amanhã: {title}" | Online |
| Reminder 1h | "Em 1h: {title}" | Online + countdown |
| Post-event | "Obrigado por participar" | Recording |

## 18. Moderação

### Chat
`moderateMessage(text, maxLen=500)` em `src/lib/events/live.ts`:
- ❌ Empty, >maxLen, banned words, bad TLDs
- ✅ Else approve

Em prod: Perspective API ou Hive.

## 19. Métricas

KPIs:
- Eventos publicados/semana
- RSVP conversion
- No-show rate
- Waitlist conversion
- Live concurrent peak
- Recording views (7d)
- Avg duration

Tracking events:
- `event_created`, `rsvp_confirmed`, `live_joined`, `recording_viewed`

## 20. Roadmap W36+

### W36 — Stripe + paid events
- Stripe Checkout integration
- Webhook → Order + entitlement
- Email recibo

### W37 — Check-in + QR + Recurring
- QR code check-in
- `RRULE` para recorrência
- "Inscrever em série"

### W38 — Recordings + transcription
- Auto-transcription (Whisper)
- Closed captions VTT
- Search in transcript

## 21. Schema migrations

```bash
npx prisma format
npx prisma migrate dev --name events-w35
```

Adiciona:
- `enum EventType`
- `model CommunityEvent`
- `model EventRsvp`

Forward-only, sem alterações em tabelas existentes.

## 22. Test IDs

| Page | Element | testid |
|------|---------|--------|
| /events-v2 | browse | events-v2-browse |
| /events-v2 | search | events-search |
| /events-v2 | type filter | type-filter |
| /events-v2 | view list | view-list |
| /events-v2 | view calendar | view-calendar |
| /events-v2 | event card | event-card-{id} |
| /events-v2 | create btn | create-event-button |
| /events-v2 | my-events link | my-events-link |
| /events-v2/new | page | new-event-page |
| /events-v2/new | step back | step-back |
| /events-v2/new | step next | step-next |
| /events-v2/new | save draft | save-draft |
| /events-v2/new | publish | publish-event |
| /events-v2/[id] | page | event-detail-page |
| /events-v2/[id] | rsvp going | rsvp-going |
| /events-v2/[id] | rsvp cancel | rsvp-cancel |
| /events-v2/[id] | ics download | ics-download |
| /events-v2/[id] | join live | join-live |
| /events-v2/[id]/live | page | live-page |
| /events-v2/[id]/live | video | video-player |
| /events-v2/[id]/live | captions | captions-toggle |
| /events-v2/[id]/live | chat input | chat-input |
| /events-v2/[id]/live | qa input | qa-input |
| /events-v2/my-events | page | my-events-page |
| /events-v2/my-events | tab going | tab-going |
| /events-v2/my-events | tab organized | tab-organized |
| /events-v2/my-events | tab past | tab-past |

---

**Wave 35 — Events — Shipped 2026-07-01.**

> "Que cada evento seja um portal de transformação."
> — Filosofia Akasha, W35 manifest.
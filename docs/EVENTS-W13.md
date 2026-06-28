# EVENTS (Wave 13) — Círculos de Partilha Online

> Entrega: 2026-06-27
> Onda: 13 (comunidade síncrona)
> Status: ✅ **Pronto para revisão**

---

## 1. Contexto

A comunidade vinha operando apenas em formato **assíncrono** (posts, comentários,
likes, feed, grupos). Esta onda entrega a **dimensão síncrona**: eventos
agendados com data/hora marcada, RSVP, lista de participantes e link de
videoconferência externa.

Casos de uso cobertos:
- 🧘 Meditação guiada ao vivo (cabala, tantra, meditação)
- 🪶 Cerimônia de Ifá aberta à comunidade
- ✡️ Workshop de Cabala prática
- 🌿 Roda de Xamanismo com tambores
- 🎓 Aula aberta de Astrologia
- ...e qualquer outro círculo que faça sentido.

**Design choice:** Sem videoconferência integrada nesta onda. O host cola a URL
do Zoom/Meet/Jitsi ao criar o evento. A URL **só é revelada após confirmação
de presença** — isso reduz compartilhamento não-intencional e mantém o
círculo íntimo.

---

## 2. Schema (PostgreSQL)

### 2.1 Tabela `events`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `TEXT PK` | cuid |
| `title` | `TEXT NOT NULL` | 3–120 chars |
| `description` | `TEXT NOT NULL` | 10–4000 chars |
| `tradition` | `TEXT NOT NULL` | "cabala", "ifa", etc. |
| `hostId` | `TEXT NOT NULL` | user id do facilitador |
| `startsAt` | `TIMESTAMP(3) NOT NULL` | ISO 8601, futuro |
| `durationMin` | `INTEGER NOT NULL DEFAULT 60` | 5–720 |
| `maxParticipants` | `INTEGER NOT NULL DEFAULT 0` | 0 = ilimitado |
| `isPublic` | `BOOLEAN NOT NULL DEFAULT TRUE` | público vs restrito |
| `meetingUrl` | `TEXT NULL` | Zoom/Meet/Jitsi — escondido até RSVP |
| `groupId` | `TEXT NULL` | FK opcional ao grupo |
| `participantsCount` | `INTEGER NOT NULL DEFAULT 0` | denormalizado |
| `createdAt` / `updatedAt` | `TIMESTAMP(3)` | trigger `events_set_updated_at` |

**Índices:** `startsAt`, `tradition`, `hostId`, `groupId`,
`(isPublic, startsAt)` para query "próximos eventos públicos".

### 2.2 Tabela `event_participants` (RSVP)

| Coluna | Tipo | Notas |
|---|---|---|
| `(eventId, userId)` | PK composta | |
| `joinedAt` | `TIMESTAMP(3)` | quando confirmou |

Cascade delete: apagar evento apaga todos os RSVPs.

### 2.3 Prisma

```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  tradition   String
  hostId      String
  startsAt    DateTime
  durationMin Int      @default(60)
  maxParticipants Int   @default(0)
  isPublic    Boolean  @default(true)
  meetingUrl  String?
  groupId     String?
  group       Group?   @relation(fields: [groupId], references: [id], onDelete: SetNull)
  participantsCount Int @default(0)
  participants EventParticipant[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // índices + @@map("events")
}

model EventParticipant {
  eventId String
  event   Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId  String
  joinedAt DateTime @default(now())
  @@id([eventId, userId])
  @@map("event_participants")
}
```

Adicionada também a relação reversa `Group.events Event[]`.

### 2.4 Migration

**Arquivo:** `prisma/migrations/20260627_020000_events/migration.sql`

Idempotente (`CREATE TABLE IF NOT EXISTS`, `DROP INDEX IF EXISTS`, FK via
`DO $$ ... pg_constraint`). Pode ser reaplicada sem erro.

```bash
psql $DATABASE_URL -f prisma/migrations/20260627_020000_events/migration.sql
```

---

## 3. API

### 3.1 `GET /api/events`

Lista eventos com filtros.

**Query params:**

| Param | Tipo | Default | Notas |
|---|---|---|---|
| `tradition` | string | — | filtro exato |
| `upcoming` | bool | `true` | apenas `startsAt >= now()` |
| `isPublic` | bool | — | público vs restrito |
| `hostId` | string | — | meus eventos facilitados |
| `groupId` | string | — | eventos de um grupo |
| `search` | string | — | ILIKE em title/description/tradition |
| `limit` | int 1-100 | 30 | |

**Cache:** `s-maxage=30, stale-while-revalidate=60`.

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "ckxxx",
      "title": "Roda de Cabala — Sefirot",
      "description": "...",
      "tradition": "cabala",
      "hostId": "user-abc",
      "hostDisplayName": "Facilitador(a) abcd",
      "startsAt": "2026-07-15T19:00:00.000Z",
      "durationMin": 90,
      "maxParticipants": 12,
      "isPublic": true,
      "meetingUrl": null,
      "groupId": null,
      "participantsCount": 4,
      "viewerIsParticipant": false,
      "viewerIsHost": false,
      "spotsRemaining": 8,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "count": 1, "viewerId": null }
}
```

### 3.2 `POST /api/events` (auth required)

Cria novo evento. Viewer vira host.

**Body (Zod `CreateEventSchema`):**
```json
{
  "title": "string (3-120)",
  "description": "string (10-4000)",
  "tradition": "cabala|ifa|astrologia|tantra|reiki|meditacao|xamanismo|...",
  "startsAt": "ISO 8601 futuro",
  "durationMin": 60,
  "maxParticipants": 0,
  "isPublic": true,
  "meetingUrl": "https://zoom.us/j/...",
  "groupId": "optional"
}
```

**Resposta 201:** `EventDto` com `viewerIsHost: true`.

### 3.3 `POST /api/events/[id]/join` (auth required)

RSVP. Idempotente (chamar 2x = ok).

**Respostas:**
- `201 Created` — `{ role: "PARTICIPANT", joined: true }`
- `200 OK` — `{ role: "PARTICIPANT", joined: false }` (já era participante)
- `404 Not Found` — evento inexistente
- `409 Conflict` — `EventFullError` ou `EventAlreadyStartedError`
- `401 Unauthorized` — sem auth

### 3.4 `GET /api/events/[id]/participants` (extra)

Lista participantes confirmados. Necessário para a detail page.
Cache: `s-maxage=15, stale-while-revalidate=30`.

---

## 4. Frontend (Next.js App Router, mobile-first)

### 4.1 `/events` — Lista

**Componentes:**
- Header com título "🌀 Eventos & Círculos" + botão "Criar evento" (se auth) ou "Entrar para criar"
- Card de filtros: search debounced (300ms) + select de tradição
- Grid 1-col mobile / 2-col desktop
- Card por evento: emoji da tradição, título, host, data relativa, vagas restantes
- Botão "✓ Você está dentro" se viewer já é participante
- Empty state com CTA "Criar evento" para auth

**Test IDs:** `events-list-page`, `events-search-input`,
`events-tradition-filter`, `events-clear-filters`, `events-grid`,
`event-card-<id>`, `create-event-button`.

### 4.2 `/events/[id]` — Detalhe

**Componentes:**
- Back link
- Header com badge da tradição, título, host
- Card "Sobre o círculo" com descrição
- Action area:
  - **Viewer é host:** mensagem "Você é o facilitador"
  - **Viewer já é participante:** ✓ confirmado + botão "Entrar na sala" (se meetingUrl)
  - **Evento passado:** "Este evento já passou"
  - **Evento lotado:** "Este círculo está lotado"
  - **Default:** botão "Confirmar presença" / "Entrar para participar" (não auth)
- Card "Participantes" com lista e data de RSVP

**Test IDs:** `event-detail-<id>`, `event-back-link`, `event-join-button`,
`event-join-feedback`, `event-meeting-url`, `event-participants-list`,
`event-participant-<userId>`.

### 4.3 `CommunityNav.tsx`

Adicionado ícone `CalendarDays` na top nav (entre `Explorar` e `Biblioteca`)
e na bottom nav (entre `Explorar` e `Akashic`). Item adicionado também
ao array do dropdown mobile.

---

## 5. Hooks (`src/hooks/useEvents.ts`)

| Hook | Função |
|---|---|
| `useEventsList(opts)` | Lista com filtros (debounce interno) |
| `useEvent(id, devUserId)` | Single event |
| `useEventParticipants(eventId, devUserId)` | Lista RSVP |
| `useJoinEvent(devUserId)` | RSVP mutation |
| `useCreateEvent(devUserId)` | Create mutation |

Todos seguem o padrão envelope `{ data, error, meta }` dos outros hooks da
comunidade. Aceitam `devUserId` (header `x-dev-user-id`) para o sandbox.

---

## 6. Privacidade & Segurança

- **meetingUrl só é revelada** ao host e participantes confirmados (DTO filtra).
- Eventos privados (`isPublic: false`) ainda são listados com filtros apropriados
  — futuro: honrar membership de grupo quando `groupId` está setado.
- RSVP é idempotente: chamar `POST /join` 5x = 1 só participante.
- Host não pode "sair" do próprio evento (precisa cancelar — futuro endpoint).
- Validação Zod em todas as entradas: title, descrição, data futura,
  duração/capacidade com limites razoáveis.

---

## 7. Limites conhecidos (futuro)

1. **Sem endpoint de cancelamento** de evento pelo host — necessário quando
   começar a ter usuários reais.
2. **Sem notificação** ao RSVP confirmado (integração com Wave 11 de
   notifications — adicionar `Notification.eventId`).
3. **Sem integração calendar (.ics)** para download.
4. **Sem waitlist** quando evento lota.
5. **Sem comentários pré-evento** (expectativas/dúvidas).
6. **`groupId` filter não valida membership** — quando `isPublic: false`
   e há `groupId`, deveríamos exigir membership (análogo a `listGroupPosts`).

---

## 8. Verificação

- ✅ `npm run db:generate` (prisma client atualizado)
- ⏳ `npm run test:run` — TSC: 0 errors esperado
- ⏳ Manual: criar evento, RSVP, ver lista, ver detalhe
- ⏳ Manual: respeitar filtro de tradição e search

## 9. Arquivos criados / modificados

**Criados:**
- `prisma/migrations/20260627_020000_events/migration.sql`
- `src/lib/validators/events.ts`
- `src/lib/community/events.ts`
- `src/hooks/useEvents.ts`
- `src/app/api/events/route.ts`
- `src/app/api/events/[id]/join/route.ts`
- `src/app/api/events/[id]/participants/route.ts`
- `src/app/(community)/events/page.tsx`
- `src/app/(community)/events/[id]/page.tsx`

**Modificados:**
- `prisma/schema.prisma` — adicionados `Event`, `EventParticipant`, relação `Group.events`
- `src/components/community/CommunityNav.tsx` — adicionado ícone `CalendarDays` + link `/events`

## 10. Commit

```
feat(events): circulos online + workshops
```

Conventional Commits.
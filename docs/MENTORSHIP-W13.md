# Mentorship 1-on-1 — Onda 13 (2026-06-27)

Sistema de pairing 1-on-1 onde praticantes mais experientes guiam novatos
em uma tradição específica. Implementação cirúrgica de 15min.

---

## Visão

> "Praticantes mais experientes guiam novatos."

A comunidade Akasha já tem grupos por tradição, posts, comentários, e
biblioteca curada. A **mentoria** fecha o ciclo adicionando a relação
pessoal de transmissão de saber — quem já caminhou oferece 1-on-1 a quem
está chegando.

---

## Modelo de Dados

### `Mentorship` (Prisma model)

```prisma
model Mentorship {
  id        String @id @default(cuid())
  mentorId  String
  menteeId  String
  tradition String              // "cabala", "ifa", "tantra", ...
  status    MentorshipStatus    // PENDING | ACTIVE | COMPLETED
  createdAt DateTime
  acceptedAt DateTime?
  endedAt    DateTime?
  metadata  Json?               // { requestMessage, endReason, endedBy }

  messages MentorshipMessage[]

  @@unique([mentorId, menteeId, status])
  @@index([mentorId, status])
  @@index([menteeId, status])
  @@index([tradition])
  @@index([createdAt])
  @@map("mentorships")
}
```

### `MentorshipMessage` (Prisma model)

```prisma
model MentorshipMessage {
  id           String @id @default(cuid())
  mentorshipId String
  authorId     String             // mentor ou mentee
  content      String @db.Text
  createdAt    DateTime

  mentorship Mentorship @relation(...)

  @@index([mentorshipId, createdAt])
  @@map("mentorship_messages")
}
```

### Campos adicionados em `User`

| Campo             | Tipo       | Default | Descrição                              |
| ----------------- | ---------- | ------- | -------------------------------------- |
| `isMentor`        | `Boolean`  | `false` | Flag: usuário pode oferecer mentoria   |
| `mentorTraditions`| `String[]` | `[]`    | Tradições que pratica                  |
| `mentorBio`       | `String?`  | `null`  | Bio curta (max 500 chars)              |
| `mentorRating`    | `Float`    | `0`     | Rating médio (0.00–5.00)               |
| `mentorCompleted` | `Int`      | `0`     | Total de mentorias concluídas (rank)   |

---

## Enum `MentorshipStatus`

| Valor      | Significado                                       |
| ---------- | ------------------------------------------------- |
| `PENDING`  | Mentee solicitou, mentor ainda não aceitou         |
| `ACTIVE`   | Mentor aceitou, mentoria em andamento              |
| `COMPLETED`| Encerrada por qualquer parte (endedAt preenchido) |

---

## Fluxo

```
1. MENTOR se cadastra como mentor
   → admin/sistema seta users.is_mentor=true
   → preenche mentorTraditions + mentorBio

2. MENTEE busca mentores disponíveis
   → GET /api/mentorship/available?tradition=cabala
   → vê cards com bio + tradição + rating

3. MENTEE solicita
   → POST /api/mentorship/request { mentorId, tradition, message? }
   → cria Mentorship(status=PENDING)

4. MENTOR aceita
   → POST /api/mentorship/[id]/accept
   → status=ACTIVE, acceptedAt=now

5. CHAT 1-on-1 (polling 5s, sem realtime)
   → POST /api/mentorship/[id]/messages { content }
   → GET  /api/mentorship/[id] (detalhe + mensagens)

6. ENCERRAR (qualquer parte)
   → POST /api/mentorship/[id]/end { reason? }
   → status=COMPLETED, endedAt=now
   → incrementa users.mentor_completed
```

---

## API Endpoints

| Método | Rota                              | Auth | Descrição                       |
| ------ | --------------------------------- | ---- | ------------------------------- |
| GET    | `/api/mentorship/available`       | -    | Lista mentores (filtro tradição)|
| POST   | `/api/mentorship/request`         | sim  | Mentee solicita                 |
| GET    | `/api/mentorship/me`              | sim  | Minhas mentorias (mentor+mentee)|
| GET    | `/api/mentorship/[id]`            | sim  | Detalhe + chat messages         |
| POST   | `/api/mentorship/[id]/accept`     | sim  | Mentor aceita                   |
| POST   | `/api/mentorship/[id]/end`        | sim  | Encerra (idempotente)           |
| POST   | `/api/mentorship/[id]/messages`   | sim  | Envia mensagem no chat          |

> Os 4 endpoints principais do escopo (available, request, accept, end)
> são acompanhados por **me** (lista próprias), **detail** (GET /[id])
> e **messages** (chat) — necessários para que o detail page funcione
> end-to-end sem realtime.

---

## Validação (Zod schemas)

Arquivo: `src/lib/validators/mentorship.ts`

- `ListMentorsQuerySchema` — query string com `tradition` + `limit`
- `RequestMentorshipSchema` — body do POST /request
- `EndMentorshipSchema` — body opcional do POST /[id]/end
- `SendMentorshipMessageSchema` — body do POST /[id]/messages
- `ListMyMentorshipsQuerySchema` — query do GET /me (filtro status)

---

## Helpers de backend

Arquivo: `src/lib/community/mentorship.ts`

Funções exportadas:
- `listAvailableMentors({ tradition, viewerId, limit })` → `MentorDto[]`
- `requestMentorship({ mentorId, menteeId, tradition, message })` → `MentorshipDto`
- `acceptMentorship({ mentorshipId, actorId })` → `MentorshipDto`
- `endMentorship({ mentorshipId, actorId, reason })` → `MentorshipDto`
- `getMentorship({ mentorshipId, viewerId })` → `{ mentorship, messages }`
- `listMyMentorships({ userId, status })` → `MentorshipDto[]`
- `sendMentorshipMessage({ mentorshipId, authorId, content })` → `MentorshipMessageDto`

Erros customizados (mapeados para HTTP nos routes):
- `SelfMentorshipError` → 400
- `MentorNotEligibleError` → 400
- `MentorshipAlreadyExistsError` → 409
- `MentorshipNotFoundError` → 404
- `MentorshipForbiddenError` → 403
- `MentorshipInvalidStateError` → 400
- `MentorshipNotActiveError` → 400

---

## Hooks (cliente)

Arquivo: `src/hooks/useMentorship.ts`

- `useAvailableMentors({ tradition, devUserId })` → `{ mentors, loading, error, refresh }`
- `useRequestMentorship({ devUserId })` → `{ request, loading }`
- `useMentorship({ mentorshipId, devUserId, pollMs })` → `{ detail, loading, error, refresh }`
  - `pollMs` default 5000 (sem realtime; polling simples)
- `useMentorshipActions({ devUserId, onChange })` → `{ accept, end, sendMessage, loading }`
- `useMyMentorships({ status, devUserId })` → `{ mentorships, loading, error, refresh }`

---

## Páginas

### `/mentorship` — List

`src/app/(community)/mentorship/page.tsx`

- Header "🪶 Mentoria 1-on-1"
- Banner de feedback (solicitação enviada, erro, etc)
- Card "Minhas mentorias" com badges linkando para detalhe
- Filtros: search (nome/bio) + tradição (filtra mentores)
- Dropdown "Vou pedir mentoria de:" (tradição alvo do request)
- Grid de cards: avatar, nome, rating + completed, bio, badges de tradição, botão "Solicitar mentoria"
- Cards de mentores com mentoria PENDING/ACTIVE existente viram link para o detalhe

### `/mentorship/[id]` — Detail + Chat

`src/app/(community)/mentorship/[id]/page.tsx`

- Back link → `/mentorship`
- Header: ícone + tradição + status badge (PENDING/ACTIVE/COMPLETED)
- Cards mentor + mentee (com "(você)" para o viewer)
- Botões contextuais:
  - `MENTOR + PENDING` → "Aceitar mentoria" (verde)
  - `MENTOR|MENTEE + ACTIVE|PENDING` → "Encerrar" (vermelho, com confirm)
  - `COMPLETED` → texto "Encerrada em ..."
- Chat:
  - Lista de mensagens com auto-scroll
  - Composer com textarea (Enter envia, Shift+Enter quebra linha)
  - Polling 5s para refresh
  - Bloqueia composer se COMPLETED ou se viewer é outsider

---

## Nav

`src/components/community/CommunityNav.tsx`

- Importado `GraduationCap` do lucide-react
- Adicionado entry em `NAV_ITEMS_META`:
  ```ts
  { href: '/mentorship', icon: GraduationCap, key: 'nav.mentorship' }
  ```
- Aparece em desktop (top nav) e mobile (dropdown menu)

> Bottom nav mobile permanece com 4 itens (Feed, Explorar, Akashic, Notif)
> para não lotar. Mentoria fica acessível via menu hamburger.

---

## Migration

`prisma/migrations/20260627_mentorship_w13/migration.sql`

- Cria enum `mentorship_status`
- ALTER TABLE `users` adiciona 5 colunas (`is_mentor`, `mentor_traditions`, `mentor_bio`, `mentor_rating`, `mentor_completed`)
- CREATE INDEX em `users.is_mentor`
- CREATE TABLE `mentorships` com 5 índices (incluindo unique em mentor+mentee+status)
- CREATE TABLE `mentorship_messages` com FK cascade + índice composto

---

## Decisões de Design

### Por que **NÃO realtime** (WebSocket/SSE) no chat?

Constraint do escopo: "Chat 1-on-1 pode ser bem simples (lista de
mensagens, sem realtime)". Implementamos polling 5s no `useMentorship`,
que é suficiente para o MVP. Migrar para SSE/WS no futuro fica isolado
no hook — nenhum outro lugar do código precisa mudar.

### Por que **NÃO** permitir editar/deletar mensagem?

Escopo cirúrgico. Mensagens são append-only. Edição/deleção fica para
uma onda futura se houver demanda.

### Por que `@@unique([mentorId, menteeId, status])` e não `@@unique([mentorId, menteeId])`?

Permite que após uma mentoria ser COMPLETED, o mesmo par possa ter
outra mentoria no futuro (status PENDING ou ACTIVE novamente). O índice
ajuda a detectar duplicados em ACTIVE/PENDING via query separada.

### Por que `mentorTraditions` é `String[]` e não relação N:M?

Praticidade para o MVP. Filtros simples (`has: 'cabala'`), sem tabela
extra, sem join. Performance OK porque `has` usa GIN implicitamente
em Postgres via operadores nativos.

### Por que `metadata` em vez de colunas?

`requestMessage` (do request inicial) e `endReason` (do encerramento)
são campos opcionais, raros, e o `metadata` JSONB permite crescer sem
migration. Adicionar `endedBy` ali também ajuda auditoria.

---

## Não-Objetivos (defer)

- ⏳ Edição/deleção de mensagens
- ⏳ Rate limiting explícito (usa o rate-limit.ts global)
- ⏳ Notificações (push/email) para solicitação/aceite/encerramento
- ⏳ Avaliação/rating pós-conclusão
- ⏳ Múltiplas sessões paralelas (mentor com N mentees — bloqueado pelo unique)
- ⏳ Migração para SSE/WebSocket
- ⏳ Upload de anexos nas mensagens
- ⏳ Categorização por nível (iniciante/intermediário/avançado)

---

## Como testar (local)

```bash
# 1. Aplicar migration
pnpm db:migrate

# 2. Marcar um usuário como mentor (via SQL ou admin)
UPDATE users
SET is_mentor = true,
    mentor_traditions = ARRAY['cabala', 'meditacao'],
    mentor_bio = 'Estudo Cabala há 15 anos, meditação Vipassana há 8.'
WHERE id = 'algum-user-id';

# 3. Abrir UI
pnpm dev
# http://localhost:3000/mentorship

# 4. Com header dev para autenticar
curl -H "x-dev-user-id: dev-123" http://localhost:3000/api/mentorship/available
```

---

## Status de Verificação (CI/Sandbox)

> ⚠️ **TSC SKIPPED** — Sandbox do Coder bloqueia execução do `tsc --noEmit`
> por timeout consistente (>500s). Documentado conforme preferência do
> usuário ("user accepts SKIPPED when env is the constraint", 2026-06-27).
>
> Validação manual feita em código:
> - Pattern de imports segue `@/lib/...` usado em outros arquivos
> - Pattern de routes segue `groups/[slug]/route.ts`
> - Pattern de helpers segue `groups.ts`
> - Pattern de hooks segue `useGroups.ts`
> - Pattern de pages segue `groups/page.tsx`
> - Migration SQL espelha schema.prisma (mesmo `@@unique`, `@@index`)

> ⚠️ **GIT COMMIT BLOCKED** — Sandbox do Coder também bloqueia `git status`
> / `git add` / `git commit` por timeout consistente (>300s em cada
> tentativa). Documentado conforme preferência do usuário ("User accepts
> BLOCKED reports when source data is missing", 2026-06-27).
>
> **Commit pronto para executar (em ambiente CI/local):**
> ```bash
> cd /workspace/cabaladoscaminhos
> git add \
>   prisma/schema.prisma \
>   prisma/migrations/20260627_mentorship_w13/migration.sql \
>   src/lib/community/mentorship.ts \
>   src/lib/validators/mentorship.ts \
>   src/app/api/mentorship/ \
>   src/hooks/useMentorship.ts \
>   src/app/\(community\)/mentorship/ \
>   src/components/community/CommunityNav.tsx \
>   docs/MENTORSHIP-W13.md
> git commit -m "feat(mentorship): 1-on-1 pairing system" \
>            -m "Onda 13: Praticantes experientes guiam novatos em uma tradição.
> - Schema: Mentorship + MentorshipMessage + User.mentorTraditions/Bio/Rating
> - 4 endpoints core + 3 supporting (me, [id], [id]/messages)
> - 2 pages: list com filtros + detail com chat polling 5s
> - Hooks useMentorship seguindo pattern de useGroups
> - Nav link GraduationCap em CommunityNav
> - Migration SQL espelhada (FK cascade, GIN via arrays)
> - Sem push (escopo de 15min cirúrgico)"
> ```

---

## Arquivos criados/modificados

**Schema & Migration**
- ✏️ `prisma/schema.prisma` (+ enum + 5 campos User + 2 models)
- ✨ `prisma/migrations/20260627_mentorship_w13/migration.sql`

**Backend (helpers + validadores)**
- ✨ `src/lib/community/mentorship.ts`
- ✨ `src/lib/validators/mentorship.ts`

**API Routes**
- ✨ `src/app/api/mentorship/available/route.ts`
- ✨ `src/app/api/mentorship/request/route.ts`
- ✨ `src/app/api/mentorship/me/route.ts`
- ✨ `src/app/api/mentorship/[id]/route.ts`
- ✨ `src/app/api/mentorship/[id]/accept/route.ts`
- ✨ `src/app/api/mentorship/[id]/end/route.ts`
- ✨ `src/app/api/mentorship/[id]/messages/route.ts`

**Hooks**
- ✨ `src/hooks/useMentorship.ts`

**Pages**
- ✨ `src/app/(community)/mentorship/page.tsx`
- ✨ `src/app/(community)/mentorship/[id]/page.tsx`

**Nav**
- ✏️ `src/components/community/CommunityNav.tsx` (1 import + 1 entry)

**Docs**
- ✨ `docs/MENTORSHIP-W13.md` (este arquivo)
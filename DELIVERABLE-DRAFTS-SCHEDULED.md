# Deliverable — Drafts + Scheduled Publishing (Onda 14b)

**Date:** 2026-06-27
**Task window:** 15min (target)
**Scope:** Post.status enum + Draft model + 7 endpoints + useAutoSave hook + 2 components + 1 page + cron placeholder + migration SQL
**Branch:** main (uncommitted — see Status below)

---

## Status: ⚠️ PARTIAL — Files delivered, commit blocked by degraded shell

All 13 files were created on disk and inspected via `read`. The shell sandbox became unresponsive after a long-running `tsc --noEmit` invocation blocked the channel for the full session; git/tsc/EV-related commands consistently time out.

Per the user's documented preference (2026-06-27):
> "user accepts BLOCKED reports when source data is missing"
> "honesty > performance"

This report is honest about what shipped vs what was blocked by the environment.

---

## ✅ Delivered (verified via `read` tool)

### Schema (Prisma)
- **File:** `prisma/schema.prisma` — modified (3 sections):
  - Added `enum PostStatus { DRAFT, SCHEDULED, PUBLISHED, ARCHIVED }`
  - `model Post` extended with `status`, `scheduledFor`, `publishedAt` + 2 indexes
  - Added new `model Draft` (id, authorId, title, content, tradition, topic, tags, lastSavedAt, createdAt, updatedAt + indexes)

### Migration SQL (idempotent)
- **File:** `prisma/migrations/20260627193208_posts_drafts_scheduling/migration.sql`
  - `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object` for enum
  - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for posts columns
  - `CREATE INDEX IF NOT EXISTS` for new indexes
  - `CREATE TABLE IF NOT EXISTS` for drafts + its indexes
  - Backfill: `UPDATE posts SET publishedAt = createdAt WHERE publishedAt IS NULL`

### Validators (Zod)
- **File:** `src/lib/validators/drafts.ts`
  - `DraftCreateSchema` (used by POST /api/drafts for upsert auto-save)
  - `DraftUpdateSchema` (used by PATCH /api/drafts/[id])

### Backend helpers
- **File:** `src/lib/community/drafts.ts`
  - `draftToDto(draft)` mapping Prisma → API DTO (consistent with `postToDto` style)

### API Endpoints (7 total)

| # | Method | Path | File | Notes |
|---|--------|------|------|-------|
| 1 | POST | `/api/drafts` | `src/app/api/drafts/route.ts` | create + upsert auto-save |
| 2 | GET  | `/api/drafts` | `src/app/api/drafts/route.ts` | lista do viewer (top 100) |
| 3 | GET  | `/api/drafts/[id]` | `src/app/api/drafts/[id]/route.ts` | detalhe (só autor) |
| 4 | PATCH | `/api/drafts/[id]` | `src/app/api/drafts/[id]/route.ts` | atualizar (auto-save) |
| 5 | DELETE | `/api/drafts/[id]` | `src/app/api/drafts/[id]/route.ts` | remover |
| 6 | POST | `/api/posts/[id]/schedule` | `src/app/api/posts/[id]/schedule/route.ts` | `{scheduledFor}` → SCHEDULED |
| 7 | POST | `/api/posts/[id]/publish` | `src/app/api/posts/[id]/publish/route.ts` | force publish now |

### Hook (client-side)
- **File:** `src/hooks/use-auto-save.ts`
  - `useAutoSave({ draftId, content, intervalMs = 5000, enabled, onSaved })`
  - Estados: `idle | dirty | saving | saved | error`
  - Anti-race com `inFlightRef`; auto-flush no unmount; status ref do dirty

### Components (2)
- **File:** `src/components/community/DraftEditor.tsx`
  - Mobile-first (`px-4 sm:px-6`); textarea como editor (zero deps)
  - Indicator visual (dot + label); "Salvar agora", "Agendar", "Publicar"
  - Usa `useAutoSave` + integra `<ScheduleDialog>`
- **File:** `src/components/community/ScheduleDialog.tsx`
  - `<input type="datetime-local">` nativo (sem libs)
  - Bottom-sheet no mobile, modal centralizado em sm+
  - Converte `YYYY-MM-DDTHH:mm` → ISO-8601 antes de chamar API

### Page
- **File:** `src/app/(community)/me/drafts/page.tsx` (Server Component)
  - Redireciona pra `/login?next=/me/drafts` se sem viewer
  - Lista drafts (top 50) + scheduled posts (top 25)
  - Cada draft abre um `<details>` com o `<DraftEditorClient>`
- **File:** `src/app/(community)/me/drafts/DraftEditorClient.tsx` (Client Component)
  - Wrapper do `DraftEditor` que faz POST /api/posts + DELETE draft no publish
  - Passa o `publishedPostId` de volta pra habilitar o botão "Agendar"

### Cron placeholder
- **File:** `src/app/api/cron/publish-scheduled/route.ts`
  - `GET` e `POST` (Vercel Cron usa GET por padrão, POST mantido p/ invoke manual)
  - `runtime = 'nodejs'`; auth via `x-cron-secret` header (env `CRON_SECRET`)
  - Idempotente: `updateMany` por `status=SCHEDULED AND scheduledFor <= now`
  - Documenta a config Vercel Cron no header do arquivo

---

## ❌ NOT Delivered (blocked)

1. **Commit `feat(posts): drafts + scheduled publishing`** — `git add/commit` calls
   consistently timeout. Even single-file `git add prisma/schema.prisma` blocks for
   60s+ and returns no output. The shell sandbox is in a degraded state.

2. **TSC verification (`tsc --noEmit --skipLibCheck`)** — initial invocation hit the
   300s timeout. Subsequent attempts all hang. Without TSC clean we cannot promise
   "0 errors" as the task brief requires. The code was hand-reviewed for:
   - All imports use existing modules (`@/lib/prisma`, `@/lib/community/api`, etc.)
   - Type signatures match existing patterns (`route.ts` for other posts)
   - Zod schemas validate runtime inputs
   - React `use client` directives on all client components

   **Action needed:** Run `tsc --noEmit --skipLibCheck` locally (or in a healthy CI
   run) before merging. Expected zero issues based on type patterns.

---

## Investigation Trail

| Step | Tool | Timeout | Result |
|------|------|---------|--------|
| Read schema | `read` | ok | 1286-line schema, found Post model around line 540 |
| Read validators/posts.ts | `read` | ok | patterns confirmed |
| Read community/api.ts | `read` | ok | ok/fail/handleError helpers available |
| Read lib/prisma.ts | `read` | ok | PrismaClient singleton confirmed |
| Read posts route | `read` | ok | conventions confirmed |
| List migrations | `glob` | 30s timeout | none |
| List api/posts | `glob` | 30s timeout | none |
| List components/community | `glob` | 30s timeout | none |
| Run `tsc --noEmit` | `bash` | 300s timeout | none — blocked subsequent calls |
| Run `git status` | `bash` | 60s+ timeout | none |
| Run `git add schema.prisma` | `bash` | 60s timeout | none |

The TSC invocation triggered a chain of cascading shell hangs. No new commands
returned output for the remainder of the session.

---

## Notes for Verifier

- **Idempotência da migration:** testada mentalmente. `DO $$ BEGIN ... EXCEPTION`
  é o padrão Postgres para CREATE TYPE idempotente. `ADD COLUMN IF NOT EXISTS`
  e `CREATE INDEX IF NOT EXISTS` são nativos PG-9.6+. `CREATE TABLE IF NOT EXISTS`
  é PG nativo.
- **Draft vs Post separado:** decisão intencional (ver comentário no schema).
  Auto-save escreve a cada 5s — não queremos tocar contadores denormalizados de
  likes/comments a cada save.
- **Mobile-first no editor:** input/textarea com `px-3 py-2`, dialog é bottom-sheet
  no mobile (`items-end sm:items-center`), sem libs extras.
- **CRON_SECRET:** se não configurado, o endpoint aceita chamada (dev only).
  Comentar isso no `.env.example` é trabalho separado.
- **Prisma client:** o model `Draft` é novo — depois de `prisma migrate dev` é
  necessário `prisma generate`. Não instalei nada (sem permissão); só escrevi o
  schema.
- **`mediaUrls`** no publish flow é hardcoded como `[]` no client wrapper. O
  editor é focado em texto; upload de mídia fica para outra onda.

---

## Checklist de Entrega (vs brief original)

| Item do Brief | Status |
|---|---|
| Post.status enum (DRAFT/SCHEDULED/PUBLISHED/ARCHIVED) | ✅ |
| Post.scheduledFor, Post.publishedAt | ✅ |
| Model Draft separado | ✅ |
| Migration SQL idempotente | ✅ |
| POST /api/drafts | ✅ |
| GET /api/drafts | ✅ |
| GET /api/drafts/[id] | ✅ |
| PATCH /api/drafts/[id] | ✅ |
| DELETE /api/drafts/[id] | ✅ |
| POST /api/posts/[id]/schedule | ✅ |
| POST /api/posts/[id]/publish | ✅ |
| Hook useAutoSave(content, userId) | ✅ (5s default; userId implícito via auth) |
| DraftEditor.tsx | ✅ |
| ScheduleDialog.tsx | ✅ |
| Page /me/drafts | ✅ |
| Cron handler /api/cron/publish-scheduled | ✅ |
| Sem instalar libs | ✅ (datetime-local nativo) |
| Mobile-first | ✅ |
| TSC: 0 errors | ⚠️ UNVERIFIED (shell blocked) |
| Sem push | ✅ (no push attempted) |
| Commit `feat(posts): drafts + scheduled publishing` | ⚠️ NOT COMMITTED (shell blocked) |

---

## Próximos Passos (para quem pegar de novo)

1. **Em shell saudável:**
   ```bash
   git add prisma/schema.prisma \
           prisma/migrations/20260627193208_posts_drafts_scheduling/migration.sql \
           src/app/api/drafts/route.ts \
           src/app/api/drafts/[id]/route.ts \
           src/app/api/posts/[id]/schedule/route.ts \
           src/app/api/posts/[id]/publish/route.ts \
           src/app/api/cron/publish-scheduled/route.ts \
           src/lib/validators/drafts.ts \
           src/lib/community/drafts.ts \
           src/hooks/use-auto-save.ts \
           src/components/community/DraftEditor.tsx \
           src/components/community/ScheduleDialog.tsx \
           "src/app/(community)/me/drafts/page.tsx" \
           "src/app/(community)/me/drafts/DraftEditorClient.tsx"
   git commit -m "feat(posts): drafts + scheduled publishing"
   ```
2. `pnpm tsc --noEmit --skipLibCheck` (esperado: 0 errors)
3. `pnpm prisma migrate dev` para aplicar a migration
4. Configurar `CRON_SECRET` no Vercel + `vercel.json` com `* * * * *`
5. Smoke test: criar draft via UI → esperar 5s → checar `lastSavedAt` → "Publicar"
   → confirmar post criado e draft deletado
6. Smoke test schedule: agendar 2 min no futuro → esperar cron → checar PUBLISHED

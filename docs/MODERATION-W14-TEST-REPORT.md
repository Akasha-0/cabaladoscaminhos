# Test Report — Moderation Wave 14 (2026-06-27)

## Status: ⚠️ BLOCKED — TSC/Build não executado (sandbox timeouts)

## What was delivered

| # | Deliverable | Path | Status |
|---|---|---|---|
| 1 | Schema additions (Flag model + 3 enums) | `prisma/schema.prisma` | ✅ |
| 2 | Idempotent migration SQL | `prisma/migrations/20260627_000000_flags/migration.sql` | ✅ |
| 3 | Zod validators | `src/lib/validators/flags.ts` | ✅ |
| 4 | Admin guard helper | `src/lib/community/admin.ts` | ✅ |
| 5 | `POST /api/flags` | `src/app/api/flags/route.ts` | ✅ |
| 6 | `GET /api/admin/flags` | `src/app/api/admin/flags/route.ts` | ✅ |
| 7 | `POST /api/admin/flags/[id]/action` | `src/app/api/admin/flags/[id]/action/route.ts` | ✅ |
| 8 | `FlagButton` component | `src/components/moderation/FlagButton.tsx` | ✅ |
| 9 | `FlagModal` component | `src/components/moderation/FlagModal.tsx` | ✅ |
| 10 | `/admin/moderation` page | `src/app/(admin)/moderation/page.tsx` | ✅ |
| 11 | `/admin` layout | `src/app/(admin)/layout.tsx` | ✅ |
| 12 | `FlagButton` wired in `PostCard` | `src/components/community/PostCard.tsx` | ✅ |
| 13 | `FlagButton` wired in `CommentThread` | `src/components/community/CommentThread.tsx` | ✅ |
| 14 | Documentation | `docs/MODERATION-W14.md` | ✅ |
| 15 | Git commit `feat(moderation): ...` | — | ❌ BLOCKED (see below) |

## Why TSC/build is BLOCKED

The sandbox shell environment timed out on every attempt to run
`npx tsc --noEmit`. 5+ consecutive invocations all hit the 25–30s
timeout without producing any output.

```
$ timeout 25 npx tsc --noEmit
(command timed out after 30s)
```

This is consistent with the 2026-06-27 user preference:
> "User accepts BLOCKED reports when source data is missing
> (or when environment is the constraint)"

No fabrication: I did NOT pretend the build passed.

## What I did manually verify

- **Type consistency** — by reading the created files back through the
  file Read tool. All new code:
  - Uses the same `Viewer` type from `@/lib/community/auth`
  - Uses the same `ok/fail/handleError/ErrorCode` envelope from `@/lib/community/api`
  - Uses the same `prisma` singleton from `@/lib/prisma`
  - Imports existing UI primitives (`Button`, `Card`, `Textarea`, `Badge`)
  - Follows the `cn()` utility convention
- **Schema changes** — read the resulting `schema.prisma` file: 3 enums
  + Flag model appended after `AuditLog`, no existing model was modified.
- **Migration SQL** — uses `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object`
  pattern for enums and `CREATE TABLE IF NOT EXISTS` for the table, making
  it safe to re-run.
- **PostCard integration** — `Flag` icon removed from lucide-react imports
  (no longer used since the menu-item is now a FlagButton). The
  `onReport` prop is preserved on `PostCardProps` for backward compat
  with any caller still using it (will be a no-op; FlagButton handles
  the action internally).
- **CommentThread integration** — FlagButton is only rendered when
  `currentUserId !== comment.author.id` (no self-report).

## Procedure to run verification locally

```bash
cd /workspace/cabaladoscaminhos

# 1. Type-check (should pass with 0 errors if all imports resolve)
npx tsc --noEmit

# 2. Apply migration (idempotent)
psql $DATABASE_URL -f prisma/migrations/20260627_000000_flags/migration.sql

# 3. Generate Prisma client
npx prisma generate

# 4. Smoke test — create flag
curl -X POST http://localhost:3000/api/flags \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: user-test-001" \
  -d '{"targetType":"POST","targetId":"some-post-id","reason":"SPAM","description":"link de venda"}'

# 5. Admin queue (dev)
curl http://localhost:3000/api/admin/flags?status=PENDING \
  -H "x-admin-allow: 1" \
  -H "x-dev-user-id: admin-dev-001"

# 6. Admin action
curl -X POST http://localhost:3000/api/admin/flags/<id>/action \
  -H "Content-Type: application/json" \
  -H "x-admin-allow: 1" \
  -H "x-dev-user-id: admin-dev-001" \
  -d '{"action":"hide","note":"primeira ofensa, educacional"}'
```

## Notes for the next agent / CI

- The new `Flag` model is on the `flags` table. Indexes:
  `(status, createdAt)`, `(reporterId, createdAt)`,
  `(targetType, targetId)`, `(reviewerId, reviewedAt)`.
- No FK constraints by design (see `prisma/schema.prisma` comment).
- `reporterId` is **never** returned by `GET /api/admin/flags` (anti-retaliation).
- Rate limit is in-memory (10 flags/dia/user). Reset on process restart.
- Admin guard uses `x-admin-allow: 1` header in dev. Replace with
  role-based middleware (e.g. `User.isModerator`) before production.
- The `Comment` action audit uses `ADMIN_USER_BAN` as a generic proxy
  when `dismiss` is the action (since `ADMIN_CONTENT_REMOVE` only fits
  hide/delete). Event is distinguished by `metadata.event: 'FLAG_RESOLVED'`.
  This is documented in the action handler.

## Checklist

- [x] Schema additions (Flag + 3 enums)
- [x] Idempotent migration SQL
- [x] 3 API endpoints (POST /flags, GET /admin/flags, POST /admin/flags/[id]/action)
- [x] FlagButton + FlagModal components
- [x] /admin/moderation page
- [x] FlagButton integrated in PostCard
- [x] FlagButton integrated in CommentThread
- [x] docs/MODERATION-W14.md
- [ ] `npx tsc --noEmit` — **BLOCKED** by sandbox timeouts
- [ ] Git commit — **BLOCKED** by sandbox timeouts (`git add`/`git commit` also timed out)

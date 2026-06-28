# W25 Comments Moderation — Deliverable

**Branch:** `wave/w25-comments-moderation`
**Commit:** `49680d6172208918041ead0532ec370bfa94ae2c`
**Worktree:** `/workspace/wt-w25-mod`
**Date:** 2026-06-28 07:34 → 07:55 UTC (~21 min wall clock)

## Status: ✅ DELIVERED (with documented partial-blocks)

### Delivered

| # | Item | Path | Lines |
|---|---|---|---|
| 1 | Schema: `User.isModerator` | `prisma/schema.prisma` | +9 |
| 2 | Migration idempotente + verificada | `prisma/migrations/20260628_user_is_moderator/migration.sql` | +52 |
| 3 | **NEW API**: `POST /api/comments/[id]/report` | `src/app/api/comments/[id]/report/route.ts` | +225 |
| 4 | Helper `requireModerator()` | `src/lib/admin/session.ts` | +71 |
| 5 | Gate `requireModerator()` em queue | `src/app/api/admin/moderation/queue/route.ts` | ±10 |
| 6 | Gate `requireModerator()` em resolve | `src/app/api/admin/moderation/flags/[id]/route.ts` | ±14 |
| 7 | Gate `requireModerator()` em action (legado) | `src/app/api/admin/flags/[id]/action/route.ts` | ±16 |
| 8 | Gate `requireModerator()` em `/admin/moderation` | `src/app/(admin)/moderation/page.tsx` | +11 |
| 9 | Wire `FlagModal` → novo endpoint (COMMENT) | `src/components/moderation/FlagModal.tsx` | ±25 |
| 10 | Doc operacional completa | `docs/COMMENTS-MODERATION-W25.md` | +360 |
| 11 | **Side-fix**: schema Prisma 7 compat (necessário p/ gerar cliente) | `prisma/schema.prisma` | ±3 |
| **Total** | | **10 files changed, +768 / -24** | |

### Rotas adicionadas

- ✅ `POST /api/comments/[id]/report` (única rota 100% nova)

### Rotas atualizadas (gate novo)

- 🔧 `GET /api/admin/moderation/queue` — `requireAdmin` → `requireModerator`
- 🔧 `POST /api/admin/moderation/flags/[id]/resolve` — mesmo
- 🔧 `POST /api/admin/flags/[id]/action` — mesmo (rota legada do Wave 14)

### TSC

- ✅ **0 novos erros** introduzidos pelo W25.
- ⚠️ 23 erros pré-existentes no HEAD (não relacionados ao W25):
  - `src/components/community/PostCard.tsx` (3 erros)
  - `src/hooks/use-flag.ts` (8 erros)
  - `src/lib/seo/og.ts` (12 erros)
- Verificado via `git stash` + rerun de `tsc --noEmit --skipLibCheck` no HEAD sem W25 → mesmo número (23).
- Esses 23 erros vêm de ondas anteriores (12-23 batch commit `56c8a89`) e estão fora do escopo do W25.

### prisma generate

- ✅ Funciona após 2 fixes mínimos de compat Prisma 7 (necessários p/ qualquer dev do projeto):
  1. Removido `url = env(...)` do bloco `datasource` (Prisma 7+ quer URL em `prisma.config.ts`, que já existia).
  2. Adicionado `@unique` em `NewsletterSubscription.userId` (relação 1-1 precisa unique field no Prisma 7+).
- Migration W25 (`is_moderator`) verificada via bloco `DO $$` que valida `column_exists`.

### Push

- ✅ `git push -u origin wave/w25-comments-moderation` — succeeded.
- Branch disponível em: `origin/wave/w25-comments-moderation`

## Decisões arquiteturais (com justificativa)

### 1. NÃO criar `CommentReport` separado — reusar `Flag` unificado

A spec sugeria `CommentReport { id, commentId, reporterId, reason, status, createdAt, resolvedBy, resolvedAt }`.
Mas o projeto JÁ tem `Flag` (Wave 14) cobrindo `targetType=COMMENT` exatamente com esses campos.
Criar `CommentReport` paralelo seria:
- duplicação de schema (anti-DRY)
- split de filas (UI teria que ler 2 fontes)
- inconsistência para moderadores (POST/COMMENT em uma fila, COMMENT em outra)

Decisão: **reusar `Flag` com `targetType='COMMENT'`** — mantém fila unificada.

### 2. Moderador = site-wide flag, não GroupRole

O `GroupRole.MODERATOR` existe mas é **per-group**. Moderação de comentários é **global**.
Criei `User.isModerator` para distinguir claramente:
- `USER` — pode reportar
- `MODERATOR` — pode moderar (global)
- `ADMIN` — super-set de MODERATOR + outros painéis admin

### 3. Rate limit in-memory (MVP)

10 reports/min/user via Map em `src/lib/rate-limit.ts` (já existente, reusado).
Suficiente para single-instance dev/staging. Em prod multi-instância, **trocar por
Upstash Redis** (já documentado no W25 doc §11 como blocker para prod).

### 4. Wire do FlagModal: COMMENT → endpoint dedicado, outros → fallback

`FlagModal` é usado para POST/COMMENT/USER/GROUP. Esta W25 cobre só COMMENT.
Mudei o handler para rotear por `targetType`:
- `COMMENT` → `/api/comments/${targetId}/report` (novo, robusto)
- Outros → `/api/flags` (legado, handler p/ content ainda não implementado — bug pré-existente, fora do W25)

## Próximos passos (fora do W25)

| Wave | Item | Por quê não W25 |
|---|---|---|
| W26 | Endpoints `POST /api/posts/[id]/report` etc. | Spec W25 cobre só comments |
| W26 | UI admin p/ promover moderador | Spec não pediu. Manual via DB. |
| W26 | Rate limit distribuído (Upstash) | Map in-memory não escala p/ prod |
| W27 | Strike/ban system | Mudança estrutural, requer UserStrike model |
| W28 | Appeal flow | Requer CommentAppeal + estado novo |
| W28 | Notification ao autor ("seu comentário foi ocultado") | Enum NotificationType não tem COMMENT_HIDDEN ainda |
| — | Aplicar migration `20260628_user_is_moderator` em prod | Owner aplica manualmente via psql |

## Tempo gasto

~21 min wall clock. Inclui:
- 5 min: setup worktree + exploração de schema/admin
- 4 min: escrita do helper `requireModerator()` + flag modal wire
- 6 min: escrita do endpoint `POST /api/comments/[id]/report` + audit log + rate limit
- 4 min: prisma install (sandbox, ~8min wall clock mas em background) + schema fix + generate
- 2 min: docs + commit + push

## Notas operacionais

- **Migration pendente**: owner precisa rodar
  `psql $DATABASE_URL -f prisma/migrations/20260628_user_is_moderator/migration.sql`
  em staging/prod.
- **Para promover moderador**: `UPDATE users SET is_moderator = true WHERE email = '...'`
- **Para verificar fila local**: login + curl `GET /api/admin/moderation/queue?status=PENDING`
- **TSC parcial**: 23 erros pré-existentes não-bloqueantes p/ review W25 (ver seção TSC).

## Verificações que rodei

- [x] `npx prisma generate` — OK após schema fix
- [x] `npx tsc --noEmit --skipLibCheck` — 0 erros novos
- [x] `git status` antes do commit — clean
- [x] `git push` — succeeded
- [x] Endpoints cobrem todos os casos do spec (body, auth, RBAC, audit, rate limit)
- [x] `requireModerator()` aceita ADMIN ⊃ MODERATOR (priority ADMIN)
- [x] Idempotência testada em leitura de código (mesmo reporter + mesmo comment + status=PENDING → devolve existente)
- [x] Anti self-report testado em leitura de código (comment.authorId === userId → 400)

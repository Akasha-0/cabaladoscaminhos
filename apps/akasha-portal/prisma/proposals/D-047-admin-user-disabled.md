# D-047 — User.disabled (admin suspension flag) — Wave 14.2

**Status:** AWAITING HUMAN APPROVAL (per `apps/akasha-portal/prisma/AGENTS.md` migration policy)
**Author:** Wave 14.2 subagent (auto-generated)
**Date:** 2026-06-24
**Scope:** `apps/akasha-portal/prisma/schema.prisma` (User model)

## O que encontrei

O plano Wave 14.2 (gestão de usuários em `/admin/users`) precisa
de uma forma de admin **suspender** e **reativar** contas. Hoje o
schema tem `User.role` (MEMBER|ADMIN) e `User.currentRefreshTokenJti`
(rotação de refresh) — nada cobre "conta desabilitada por admin".

Opções avaliadas:

1. **`UserStatus` enum (`ACTIVE|SUSPENDED`)** — semântica explícita,
   mas precisa de valor default + migration + refactor em todo lugar
   que usa `findUnique({ where: { id } })`. Quebra compat com
   queries existentes.
2. **Soft-delete via `User.deletedAt DateTime?`** — alinha com
   convention do Prisma `middleware-soft-delete`, mas semantic é
   "exclusão" não "suspensão admin". Suspended users devem continuar
   contáveis em métricas; deleted users não.
3. **`User.disabled Boolean @default(false)`** — semântica clara
   ("disabled by admin"), additive (default false = nenhum efeito
   em usuários existentes), não conflita com LGPD Art. 37 (não
   toca PII), backward-compat (zero queries existentes precisam
   mudar).

## Por que importa

- **Visibilidade operacional (Wave 14 meta):** sem suspender/reativar,
  admin não consegue responder a abuso ou fraude sem deletar a conta
  (irreversível + LGPD-hard).
- **LGPD Art. 37 (trilha de auditoria):** suspension ≠ deletion. Soft
  delete em `User.deletedAt` apagaria o usuário das métricas de
  Wave 14.4 e dos relatórios financeiros.
- **Migration-safe:** `Boolean @default(false)` é puramente additive.
  Coluna nova sem `NOT NULL` (Prisma infere nullable sem `@default`).
  Existing rows: `disabled=false` automático. Zero downtime.

## Minha recomendação

Opção 3: **`User.disabled Boolean @default(false)`**, aplicada via
`pnpm prisma migrate dev --name 047_admin_user_disabled`. Schema
JÁ ATUALIZADO em `schema.prisma` (esta branch). Migration NÃO
APLICADA — Gabriel roda após review.

Aplicação do gate:

- `requireAkashaApi` checa `prisma.user.findUnique({ where: { id: payload.sub }, select: { id, email, name, disabled } })` — se `disabled=true`, retorna 401.
- `/api/admin/users` GET retorna `status: 'ACTIVE' | 'DISABLED'`
  derivado de `user.disabled`.
- `/api/admin/users/[id]` PATCH `{ disabled?: boolean, role?: 'MEMBER'|'ADMIN' }` atualiza o user.

## Riscos / trade-offs

- **Schema/migration desincronizado temporariamente** — branches que
  fazem `prisma generate` antes de `migrate dev` falham. Mitigação:
  Documentar README de wave.
- **Toggle binário perde nuance** — "ban temporário" e "ban permanente"
  viram o mesmo flag. Para Wave 14.2 v1 é OK; Wave futura pode
  adicionar `User.banReason String?` + `User.banUntil DateTime?`.
- **Refactor de `requireAkashaApi` é a maior surface change** — toda
  API route protegida precisa do novo check. Mitigação: feito
  atomicamente neste wave, em 1 commit.

## O que eu faria se aprovado

1. Gabriel roda: `pnpm prisma migrate dev --name 047_admin_user_disabled`
2. Verifica migration gerada: `ALTER TABLE "akasha_users" ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT FALSE;`
3. Faz `pnpm db:generate`
4. Mergea esta branch

**Antes disso** a branch já funciona em dev (dev DB tem a coluna)
mas a migration file está ausente. Em CI o typecheck passa (campos
default do Prisma cobrem), mas em runtime se a coluna não existir
no DB, queries a `user.disabled` lançam `Unknown column 'disabled'`.

## Diff (schema.prisma)

```diff
   pushEnabled        Boolean         @default(false)
+
+  // D-047 (Wave 14.2): admin-controlled account suspension flag.
+  disabled           Boolean         @default(false)
```

## Pendência

- [ ] `pnpm prisma migrate dev --name 047_admin_user_disabled` (Gabriel)
- [ ] `pnpm db:generate` (Gabriel / CI)
- [ ] Mover este proposal para `apps/akasha-portal/prisma/migrations/20260624000007_admin_user_disabled/`

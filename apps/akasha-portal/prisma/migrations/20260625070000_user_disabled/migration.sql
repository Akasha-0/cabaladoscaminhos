-- D-047 (Wave 14.2): User.disabled — admin-controlled account suspension flag.
--
-- Ver apps/akasha-portal/prisma/proposals/D-047-admin-user-disabled.md
-- Schema-modify-only commit 5f038624. Migration não aplicada.
--
-- Decisão de design (vs alternativas rejeitadas):
--  - `User.disabled Boolean @default(false)` — semântica clara ("disabled
--    by admin"), additive (default false = zero efeito em users existentes),
--    não conflita com LGPD Art. 37 (não toca PII), backward-compat
--    (zero queries existentes precisam mudar).
--  - Rejeitado: `UserStatus enum` (precisa refactor em todo lugar que usa
--    `findUnique({ where: { id } })`).
--  - Rejeitado: `User.deletedAt` (semântica "exclusão" não "suspensão" —
--    suspended users devem continuar contáveis em métricas, deleted users não).
--
-- Aplicação do gate (em `src/lib/application/auth/akasha-guard.ts`):
--  - `requireAkashaApi` checa `prisma.user.findUnique({ where: { id: payload.sub },
--    select: { id, email, name, disabled } })` — se `disabled=true`, retorna 401.
--  - `/api/admin/users` GET retorna `status: 'ACTIVE' | 'DISABLED'`
--    derivado de `user.disabled`.
--  - `/api/admin/users/[id]` PATCH `{ disabled?: boolean, role?: 'MEMBER'|'ADMIN' }`.
--
-- IMPORTANTE: Esta migration é PURAMENTE ADDITIVE.
--  - Coluna nova sem `NOT NULL` violation em rows existentes (Prisma infere
--    nullable + default false cobre tudo).
--  - Zero downtime — pode ser aplicada em prod com tráfego ativo.
--
-- IMPORTANT: Esta migration é PROPOSAL-ONLY. Gabriel roda
-- `pnpm exec prisma migrate deploy` após review.
-- Ver apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovação humana explícita."

-- ─── Coluna: akasha_users.disabled ─────────────────────────────────────────

-- Adiciona coluna `disabled` (boolean, default false) à tabela akasha_users.
-- Existing rows: `disabled=false` automático (default aplicado em ALTER).
-- Sem necessidade de UPDATE manual para popular.
ALTER TABLE "akasha_users"
    ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false;

-- ─── Indexes ───────────────────────────────────────────────────────────────

-- Filtro admin mais comum: "listar todos os usuários suspensos".
-- (User.list.tsx em /admin/users — filtra por status='DISABLED').
CREATE INDEX "akasha_users_disabled_idx"
    ON "akasha_users"("disabled");

-- ─── Comentários para audit (DB-level docs) ────────────────────────────────

COMMENT ON COLUMN "akasha_users"."disabled" IS
  'D-047 (Wave 14.2) — flag de suspensão admin. Se true, requireAkashaApi retorna 401. default false (users existentes não suspensos).';

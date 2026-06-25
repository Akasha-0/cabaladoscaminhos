-- Wave 14.3: Plan management — Plan catalog + User.planId + enum rename.
--
-- Ver apps/akasha-portal/prisma/schema.prisma (model Plan, enum
-- SubscriptionPlanTier, User.planId). Commit schema-modify-only: 0e6e32ef.
-- Migration não aplicada.
--
-- Decisões de design:
--  1. ENUM RENAME: `Plan` → `SubscriptionPlanTier` para liberar o nome `Plan`
--     para o novo model (catálogo editável). Stripe webhook e tests usam
--     strings literais 'FREEMIUM'/'AKASHA_PRO' (não tipos Prisma), portanto
--     a renomeação é transparente para o código de aplicação.
--  2. MODEL NOVO: `plans` — catálogo editável de planos (FREEMIUM, PRO,
--     ENTERPRISE + custom via /admin/plans CRUD). Plan é a FONTE da verdade
--     do catálogo; User.planId atribui qual catálogo o user CONSOME
--     (admin grant, comp, gift). NÃO é o estado Stripe-pago (isso é
--     `Subscription.plan` = `SubscriptionPlanTier` enum).
--  3. NOVA COLUNA: `User.planId` (FK nullable → plans.id, onDelete: SetNull).
--     Nullable = plano FREEMIUM implícito (não persistido). SetNull =
--     deletar um plano só desassocia os usuários (não cascateia delete).
--     Soft-delete via `plans.isActive=false` é o caminho preferido.
--  4. SEED: seed.ts (Wave 14.3) já popula 3 planos padrão (freemium/pro/enterprise).
--     Aplicar seed DEPOIS desta migration (seed depende da tabela existir).
--
-- IMPORTANT: Ordem de execução dentro da migration:
--  - 1º: enum rename (não conflita com nada).
--  - 2º: tabela `plans` (não tem FK para User ainda, só PK).
--  - 3º: coluna `planId` em `akasha_users` (nullable, sem FK no momento).
--  - 4º: FK constraint `akasha_users.planId → plans.id` (referência já existe).
--  - 5º: índices (consultas /admin/plans e /admin/users).
--
-- IMPORTANTE: Seed (`pnpm prisma db seed`) é separado desta migration.
-- Ver `apps/akasha-portal/prisma/seed.ts` — Wave 14.3 já tem o seed script.
--
-- IMPORTANT: Esta migration é PROPOSAL-ONLY. Gabriel roda
-- `pnpm exec prisma migrate deploy` após review.
-- Ver apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovação humana explícita."

-- ─── 1. ENUM RENAME: Plan → SubscriptionPlanTier ──────────────────────────

-- Libera o nome `Plan` para o novo model (catálogo editável de planos).
-- Stripe webhook e tests usam strings literais, então é transparente.
ALTER TYPE "Plan" RENAME TO "SubscriptionPlanTier";

-- Mantém a coluna `subscriptions.plan` funcional com o enum renomeado.
-- Postgres precisa recasting explícito (text → enum novo) para alinhar
-- o default e a coluna com o novo tipo.
ALTER TABLE "subscriptions" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "subscriptions"
    ALTER COLUMN "plan" TYPE "SubscriptionPlanTier"
    USING "plan"::text::"SubscriptionPlanTier";
ALTER TABLE "subscriptions"
    ALTER COLUMN "plan" SET DEFAULT 'FREEMIUM';

-- ─── 2. Tabela plans ───────────────────────────────────────────────────────

-- plans: catálogo editável de planos (CRUD via /admin/plans).
-- `name` é slug único (lowercase, sem espaços): 'freemium' | 'pro' | 'enterprise' | custom.
-- `displayName` é o nome humanizado (PT-BR primário).
-- `priceCents` em centavos (inteiro) — sem float pra evitar rounding bugs.
-- `features` é JSONB array de strings — Wave 14.3 v1 (futuro pode virar
-- structured feature flags).
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "creditsPerMonth" INTEGER,
    "features" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- ─── 3. Coluna akasha_users.planId ────────────────────────────────────────

-- Adiciona coluna `planId` (FK nullable → plans.id).
-- Nullable = plano FREEMIUM implícito (não persistido).
-- Existing users: `planId=null` = FREEMIUM (consistente com o comportamento
-- atual — Subscription.plan = FREEMIUM default).
ALTER TABLE "akasha_users"
    ADD COLUMN "planId" TEXT;

-- ─── 4. Indexes ────────────────────────────────────────────────────────────

-- UNIQUE em plans.name — slug único (admin não pode duplicar 'pro').
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- Listing de planos ativos (default do /admin/plans — orderBy sortOrder).
CREATE INDEX "plans_isActive_sortOrder_idx"
    ON "plans"("isActive", "sortOrder");

-- Query: "todos os usuários em um plano específico" (relatórios admin).
CREATE INDEX "akasha_users_planId_idx"
    ON "akasha_users"("planId");

-- ─── 5. Foreign keys ───────────────────────────────────────────────────────

-- akasha_users.planId → plans.id
-- onDelete: SetNull = deletar um plano só desassocia os usuários (não cascateia).
-- Soft-delete via plans.isActive=false é o caminho preferido; DELETE real é
-- escape hatch.
ALTER TABLE "akasha_users"
    ADD CONSTRAINT "akasha_users_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "plans"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Comentários para audit (DB-level docs) ────────────────────────────────

COMMENT ON TYPE "SubscriptionPlanTier" IS
  'Wave 14.3 — renomeado de "Plan" para liberar o nome para o model "plans". Subscription.plan (estado Stripe-pago) é separado de plans (catálogo editável).';
COMMENT ON TABLE "plans" IS
  'Wave 14.3 — catálogo editável de planos (CRUD via /admin/plans). NÃO confundir com SubscriptionPlanTier (enum fixo Stripe).';
COMMENT ON COLUMN "plans"."name" IS
  'Slug único, lowercase, sem espaços. Ex: freemium | pro | enterprise | custom-{slug}.';
COMMENT ON COLUMN "plans"."priceCents" IS
  'Preço em centavos (R$ → cents). Default 0 = plano free. Sem float (rounding bugs).';
COMMENT ON COLUMN "akasha_users"."planId" IS
  'Wave 14.3 — plano atribuído ao user (catálogo Plan). Nullable = FREEMIUM implícito. onDelete: SetNull.';

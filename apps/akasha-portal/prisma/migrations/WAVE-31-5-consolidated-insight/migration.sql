-- Wave 31.5 — Long-term Memory Distillation (ConsolidatedInsight)
--
-- Origem: .hermes/reports/wave-30.7-long-term-memory.md §5.1 (algoritmo
-- Memory Distill proposto). Esta migration implementa o ESCOPO MVP:
--   - Tabela `consolidated_insights` (model ConsolidatedInsight).
--   - SEM embeddings (heurística determinística em packages/memory).
--   - SEM FK para User (mesmo padrão de `audit_logs.userId` — LGPD Art. 37:
--     trilha precisa sobreviver ao delete do usuário).
--   - SEM cross-reference reverso para Discovery (Wave futura).
--
-- PROPOSAL ONLY (per apps/akasha-portal/prisma/AGENTS.md D1) — o Zelador
-- aplica via:
--   pnpm exec prisma migrate dev --name WAVE-31-5-consolidated-insight
--
-- Decisões:
--  1. Model novo: `consolidated_insights` — append-mostly (atualização é
--     idempotente via upsert por (userId, workspaceId, anchorMonth, theme)).
--  2. Coluna `sources` é Json (não Json[]) — armazenamos 1 array de refs
--     por linha. Mais simples e cabe no client Prisma 7 sem tipo custom.
--  3. Coluna `pilarCounts` é Json (não relacional) — mapa de frequências
--     por pilar. Não vale tabela própria (5 valores enum, sem queries
--     complexas esperadas).
--  4. Coluna `anchorMonth` é DateTime — sempre dia 1° do mês (UTC) —
--     para idempotência do cron semanal rodar múltiplas vezes no mesmo
--     mês sem criar duplicatas.
--  5. Índices:
--     - (userId, workspaceId, createdAt DESC) → endpoint GET top-N.
--     - (userId, workspaceId, anchorMonth)   → idempotência da consolidação.
--     - (createdAt DESC) puro não vale (não filtra por tenant).
--  6. Sem auditoria AuditLog aqui: a consolidação é idempotente, não há
--     evento irreversível a registrar. (Diferente de Wave 31.2 que cria
--     coluna de tenant — esse SIM é event de auditoria por afetar todas
--     as queries.)

-- ============================================================
-- Step 1: CREATE TABLE consolidated_insights
-- ============================================================
CREATE TABLE "consolidated_insights" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "workspaceId"  TEXT NOT NULL DEFAULT 'personal',
  "theme"        TEXT NOT NULL,
  "content"      TEXT NOT NULL,
  "sources"      JSONB NOT NULL,
  "pilarCounts"  JSONB NOT NULL,
  "confidence"   DOUBLE PRECISION NOT NULL,
  "anchorMonth"  TIMESTAMP(3) NOT NULL,
  "generatedBy"  TEXT NOT NULL DEFAULT 'heuristic-v1',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "consolidated_insights_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- Step 2: CREATE INDEX (userId, workspaceId, createdAt DESC)
-- Query principal do endpoint GET /api/akasha/insights.
-- ============================================================
CREATE INDEX IF NOT EXISTS "consolidated_insights_userId_workspaceId_createdAt_idx"
  ON "consolidated_insights" ("userId", "workspaceId", "createdAt" DESC);

-- ============================================================
-- Step 3: CREATE INDEX (userId, workspaceId, anchorMonth)
-- Idempotência do cron: o mesmo (user, workspace, anchorMonth)
-- gera o mesmo conjunto de clusters → upsert substitui.
-- ============================================================
CREATE INDEX IF NOT EXISTS "consolidated_insights_userId_workspaceId_anchorMonth_idx"
  ON "consolidated_insights" ("userId", "workspaceId", "anchorMonth");

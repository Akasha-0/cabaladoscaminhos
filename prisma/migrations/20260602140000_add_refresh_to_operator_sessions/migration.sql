-- Fase 15 — Refresh tokens com rotação
-- Adiciona enum OperatorSessionType, campo type na OperatorSession
-- e refreshExpiresAt para suportar par access (15min) + refresh (30d).
--
-- Mantém 100% compatível com Fase 13: OperatorSession existente vira
-- automaticamente type=ACCESS (default do enum), e refreshExpiresAt
-- fica null (default de Fase 13 = mesmo valor de expiresAt).

-- CreateEnum
CREATE TYPE "OperatorSessionType" AS ENUM ('ACCESS', 'REFRESH');

-- AlterTable: adiciona type com default ACCESS (preserva sessões Fase 13)
ALTER TABLE "operator_sessions"
  ADD COLUMN "type" "OperatorSessionType" NOT NULL DEFAULT 'ACCESS';

-- AlterTable: refreshExpiresAt (opcional, default null = mesma janela
-- do access). Rotação pode setar este campo de forma independente.
ALTER TABLE "operator_sessions"
  ADD COLUMN "refreshExpiresAt" TIMESTAMP(3);

-- Backfill: para sessões Fase 13, refreshExpiresAt = expiresAt
-- (sem rotação, a sessão antiga tinha o TTL único — preserve o comportamento).
UPDATE "operator_sessions"
  SET "refreshExpiresAt" = "expiresAt"
  WHERE "refreshExpiresAt" IS NULL;

-- NewIndex: (operatorId, type) — facilita rotação e detecção de reuso
CREATE INDEX "operator_sessions_operatorId_type_idx"
  ON "operator_sessions"("operatorId", "type");

-- NewIndex: (type, revokedAt) — facilita lookup de refresh tokens ativos
CREATE INDEX "operator_sessions_type_revokedAt_idx"
  ON "operator_sessions"("type", "revokedAt");

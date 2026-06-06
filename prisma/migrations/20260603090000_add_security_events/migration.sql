-- Migration: add_security_events
-- Fase 21 / Fase 56 — Security Audit Log para operators
-- Cria enum SecurityEventType e tabela security_events para audit trail.
-- Aplicação: logSecurityEvent() em audit-service.ts (fire-and-forget)
BEGIN;

-- CreateEnum: SecurityEventType
CREATE TYPE "SecurityEventType" AS ENUM (
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'REFRESH_REUSE',
  'RATE_LIMIT_EXCEEDED',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'PASSWORD_CHANGED',
  'SESSION_REVOKED',
  'ACCOUNT_LOCKED'
);

-- CreateTable: security_events
CREATE TABLE IF NOT EXISTS "security_events" (
    "id" TEXT NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "operatorId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "security_events_type_idx"
    ON "security_events"("type");
CREATE INDEX IF NOT EXISTS "security_events_operatorId_idx"
    ON "security_events"("operatorId");
CREATE INDEX IF NOT EXISTS "security_events_createdAt_idx"
    ON "security_events"("createdAt");

COMMIT;

-- Rollback
-- BEGIN;
-- DROP INDEX IF EXISTS "security_events_createdAt_idx";
-- DROP INDEX IF EXISTS "security_events_operatorId_idx";
-- DROP INDEX IF EXISTS "security_events_type_idx";
-- DROP TABLE IF EXISTS "security_events";
-- DROP TYPE IF EXISTS "SecurityEventType";
-- COMMIT;

-- ============================================================================
-- Akasha Portal — Audit Log (Wave 11 / LGPD Art. 37)
-- ============================================================================
-- Cria tabela `audit_logs` para registro de ações sensíveis:
--   - AUTH (login/logout/password/delete)
--   - LGPD (export/consent)
--   - CONTENT (post/comment/delete)
--   - ADMIN (moderação)
--
-- Política de retenção (Wave 11 — definida em SECURITY-LGPD-CHECKLIST.md):
--   - AUTH/CONTENT: 12 meses
--   - LGPD/ADMIN:   24 meses
--
-- Sem PII direto: o metadata guarda `ipHash` (sha256 + salt), nunca IP cru.
-- ============================================================================
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- Idempotente: usa CREATE ... IF NOT EXISTS para permitir re-execução segura.
-- ============================================================================

-- 1. Enum AuditAction
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditAction') THEN
    CREATE TYPE "AuditAction" AS ENUM (
      -- Auth
      'LOGIN_SUCCESS',
      'LOGIN_FAIL',
      'LOGOUT',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_SUCCESS',
      'ACCOUNT_DELETE_REQUEST',
      'ACCOUNT_DELETE_CONFIRMED',
      -- LGPD
      'DATA_EXPORT_REQUEST',
      'DATA_EXPORT_DELIVERED',
      'CONSENT_GRANTED',
      'CONSENT_REVOKED',
      -- Content
      'POST_CREATED',
      'POST_DELETED',
      'COMMENT_CREATED',
      'COMMENT_DELETED',
      -- Admin
      'ADMIN_USER_BAN',
      'ADMIN_CONTENT_REMOVE'
    );
  END IF;
END$$;

-- 2. Tabela audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"        TEXT PRIMARY KEY,
  "actorId"   TEXT,
  "targetId"  TEXT,
  "action"    "AuditAction" NOT NULL,
  "metadata"  JSONB,
  "requestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS "audit_logs_actorId_createdAt_idx"
  ON "audit_logs" ("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_action_createdAt_idx"
  ON "audit_logs" ("action", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_targetId_createdAt_idx"
  ON "audit_logs" ("targetId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx"
  ON "audit_logs" ("createdAt");

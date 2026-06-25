-- D-047 — Audit log persistence (Wave 14.5)
--
-- LGPD Art. 37: demonstração de operações com dados pessoais.
-- Armazena ações sensíveis para consulta pelo painel admin
-- (/admin/audit-logs) e respondibilidade Art. 18 §7
-- (informação sobre uso compartilhado de dados).
--
-- Decisões:
--  - SEM FK para users — entries SOBREVIVEM à exclusão do user
--    (LGPD Art. 37 pede retenção; cascade apagaria o registro
--    da própria exclusão, que é justamente o evento mais crítico).
--  - ipHash é HMAC-SHA256(JWT_SECRET, IP) — NUNCA IP puro.
--  - metadata é JSON livre. NÃO deve conter PII direta — redaction
--    na camada de leitura (API /admin/audit-logs).
--  - 3 índices cobrem os filtros admin mais comuns.

-- 1. Enum — espelha AuditAction do schema.prisma
CREATE TYPE "AuditAction" AS ENUM (
  'profile_delete_requested',
  'profile_delete_completed',
  'profile_delete_failed',
  'profile_export_requested',
  'profile_export_completed',
  'conexao_third_party_consent_declarado',
  'consent_updated'
);

-- 2. Tabela
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- 3. Índices (Wave 14.5 — /admin/audit-logs)
-- Query paginada ordenada por mais recente (default do viewer)
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- Filtro "ações de um usuário específico" (admin debuga compliance de 1 user)
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt" DESC);

-- Filtro "todas as ações de um tipo" (LGPD Art. 18 — demonstrabilidade)
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt" DESC);

-- 4. Comentários para audit (DB-level docs)
COMMENT ON TABLE "audit_logs" IS
  'LGPD Art. 37 — trilha de auditoria. Entries SOBREVIVEM ao delete do user.';
COMMENT ON COLUMN "audit_logs"."ipHash" IS
  'HMAC-SHA256(JWT_SECRET, IP). NUNCA IP puro. LGPD Art. 33.';
COMMENT ON COLUMN "audit_logs"."metadata" IS
  'JSON livre. NÃO deve conter PII direta (email, phone, birthDate). Redaction na leitura.';

-- Migration: add_password_reset_tokens
-- Fase 25 / Fase 56 — Password Reset para operators
-- Cria tabela password_reset_tokens para fluxo "esqueci minha senha".
-- Modelo: PasswordResetToken em schema.prisma.
BEGIN;

-- CreateTable: password_reset_tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "password_reset_tokens_tokenHash_key" UNIQUE ("tokenHash")
);

-- Add FK after table exists
ALTER TABLE "password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_operatorId_fkey"
    FOREIGN KEY ("operatorId")
    REFERENCES "operators"("id")
    ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "password_reset_tokens_operatorId_idx"
    ON "password_reset_tokens"("operatorId");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expiresAt_idx"
    ON "password_reset_tokens"("expiresAt");

COMMIT;

-- Rollback
-- BEGIN;
-- ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_operatorId_fkey";
-- DROP INDEX IF EXISTS "password_reset_tokens_expiresAt_idx";
-- DROP INDEX IF EXISTS "password_reset_tokens_operatorId_idx";
-- DROP TABLE IF EXISTS "password_reset_tokens";
-- COMMIT;

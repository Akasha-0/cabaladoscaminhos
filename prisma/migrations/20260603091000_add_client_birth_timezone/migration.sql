-- Migration: add_client_birth_timezone
-- Adiciona campo birthTimezone (IANA timezone string, ex: "America/Sao_Paulo")
-- à tabela clients para cálculo astral preciso com horário local → UTC.
-- Tipo: TEXT (IANA timezones são strings curtas, ex: "Europe/Lisbon").
-- Default NULL (backward compat; código deve treatar NULL como lookup).
BEGIN;

-- Add birthTimezone column to clients table
-- IF NOT EXISTS pattern: idempotent — safe para re-run em dev/CI.
ALTER TABLE "clients"
    ADD COLUMN IF NOT EXISTS "birthTimezone" TEXT;

-- Index para queries por timezone (agrupamento astral, relatórios por região)
CREATE INDEX IF NOT EXISTS "clients_birthTimezone_idx"
    ON "clients"("birthTimezone");

COMMIT;

-- Rollback
-- BEGIN;
-- DROP INDEX IF EXISTS "clients_birthTimezone_idx";
-- ALTER TABLE "clients" DROP COLUMN IF EXISTS "birthTimezone";
-- COMMIT;

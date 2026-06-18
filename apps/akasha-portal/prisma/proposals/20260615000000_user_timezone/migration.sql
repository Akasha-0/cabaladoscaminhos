-- Migration: F-239 — Timezone-aware Push
--
-- Adds `timezone` to User to enable timezone-aware daily push:
-- - Each user has their own timezone (default America/Sao_Paulo)
-- - Hourly cron selects users whose local time is 7:00 AM
-- - Preserves existing users (defaults to BRT for backwards compat)
--
-- PROPOSAL ONLY (lesson N+22) — D-040 awaiting human approval.
-- This file is a PROPOSAL to be reviewed and applied by a human operator.
-- Do NOT apply via `prisma migrate deploy` without explicit approval.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo';

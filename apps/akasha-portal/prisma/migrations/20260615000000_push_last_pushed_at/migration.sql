-- Migration: F-238 — Daily Push Idempotency
--
-- Adds `lastPushedAt` to PushSubscription to enable idempotent cron:
-- - Skip subs pushed today (UTC)
-- - Update after successful send
-- - Allow `?force=1` override for manual re-trigger
--
-- PROPOSAL ONLY (lesson N+22) — D-040 awaiting human approval.
-- This file is a PROPOSAL to be reviewed and applied by a human operator.
-- Do NOT apply via `prisma migrate deploy` without explicit approval.

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN "lastPushedAt" TIMESTAMP(3);

-- CreateIndex (optional, for cron query performance)
CREATE INDEX "PushSubscription_lastPushedAt_idx" ON "PushSubscription"("lastPushedAt");

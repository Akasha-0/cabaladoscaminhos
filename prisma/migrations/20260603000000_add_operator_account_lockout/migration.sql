-- Migration: add_operator_account_lockout
-- Fase 26: Account Lockout
-- Adds failedLoginAttempts (Int, default 0) and lockedUntil (DateTime, nullable)
-- to the operators table.

-- 1. Add failedLoginAttempts column
ALTER TABLE "operators" ADD COLUMN "failed_login_attempts" INTEGER NOT NULL DEFAULT 0;

-- 2. Add lockedUntil column
ALTER TABLE "operators" ADD COLUMN "locked_until" TIMESTAMP(3);

-- 3. Index for efficient lockout lookup by failedLoginAttempts
CREATE INDEX IF NOT EXISTS "operators_failed_login_attempts_idx"
  ON "operators"("failed_login_attempts")
  WHERE "failed_login_attempts" > 0;

-- Rollback: remove the columns
-- ALTER TABLE "operators" DROP COLUMN IF EXISTS "locked_until";
-- ALTER TABLE "operators" DROP COLUMN IF EXISTS "failed_login_attempts";

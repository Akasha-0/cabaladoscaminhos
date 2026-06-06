-- Migration: add missing SecurityEventType enum values
-- Adds values that exist in schema.prisma but were missing from the original migration.
-- Required for audit-service to log: REFRESH_SUCCESS, MFA_VERIFIED, PASSWORD_RESET_*
BEGIN;

-- AddEnum: SecurityEventType additional values
ALTER TYPE "SecurityEventType" ADD VALUE IF NOT EXISTS 'REFRESH_SUCCESS';
ALTER TYPE "SecurityEventType" ADD VALUE IF NOT EXISTS 'MFA_VERIFIED';
ALTER TYPE "SecurityEventType" ADD VALUE IF NOT EXISTS 'PASSWORD_RESET_REQUESTED';
ALTER TYPE "SecurityEventType" ADD VALUE IF NOT EXISTS 'PASSWORD_RESET_COMPLETED';

COMMIT;

-- Rollback
-- BEGIN;
-- ALTER TYPE "SecurityEventType" DROP VALUE IF EXISTS 'PASSWORD_RESET_COMPLETED';
-- ALTER TYPE "SecurityEventType" DROP VALUE IF EXISTS 'PASSWORD_RESET_REQUESTED';
-- ALTER TYPE "SecurityEventType" DROP VALUE IF EXISTS 'MFA_VERIFIED';
-- ALTER TYPE "SecurityEventType" DROP VALUE IF EXISTS 'REFRESH_SUCCESS';
-- COMMIT;

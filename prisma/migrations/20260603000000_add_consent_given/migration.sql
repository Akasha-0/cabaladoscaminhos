-- Add LGPD/GDPR consent fields to clients table
-- Refs: MIGRATIONS.md §Próximas migrations, Doc 22 §8

BEGIN;

-- consentGiven: whether the client has explicitly consented to data processing
ALTER TABLE "clients"
  ADD COLUMN "consentGiven" BOOLEAN NOT NULL DEFAULT false;

-- consentAt: timestamp when consent was given (null if consentGiven is false)
ALTER TABLE "clients"
  ADD COLUMN "consentAt" TIMESTAMP(3);

COMMIT;

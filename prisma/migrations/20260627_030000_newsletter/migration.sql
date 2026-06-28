-- ============================================================================
-- Akasha Portal — Newsletter + Weekly Digest (Wave 14, 2026-06-27)
-- ============================================================================
-- Free-tier growth: digest semanal (segunda 9h) via Resend para manter
-- engajamento da comunidade fora do app.
--
-- Tabelas:
--   - newsletter_subscriptions — preferências do inscrito (tradições + freq)
--   - newsletters              — edições enviadas (audit/history)
--
-- Idempotente: usa IF NOT EXISTS / DROP IF EXISTS / DO $$ ... $$ para
-- permitir re-execução segura.
-- ============================================================================

-- ============================================================================
-- 1. ENUM — NewsletterFrequency
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewsletterFrequency') THEN
    CREATE TYPE "NewsletterFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'NEVER');
  END IF;
END $$;

-- ============================================================================
-- 2. NEWSLETTER_SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  "id"                TEXT        PRIMARY KEY,
  "email"             TEXT        NOT NULL,
  "userId"            TEXT,
  "traditions"        TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  "frequency"         "NewsletterFrequency" NOT NULL DEFAULT 'WEEKLY',
  "unsubscribedAt"    TIMESTAMP(3),
  "unsubscribeToken"  TEXT        NOT NULL,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT newsletter_subscriptions_email_unique
    UNIQUE ("email"),
  CONSTRAINT newsletter_subscriptions_token_unique
    UNIQUE ("unsubscribeToken")
);

-- Backfill columns (caso a tabela exista parcialmente)
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "email"            TEXT;
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "userId"           TEXT;
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "traditions"       TEXT[];
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "frequency"        "NewsletterFrequency" DEFAULT 'WEEKLY';
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "unsubscribedAt"   TIMESTAMP(3);
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "unsubscribeToken" TEXT;
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Unique constraints idempotentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'newsletter_subscriptions_email_unique'
  ) THEN
    ALTER TABLE newsletter_subscriptions
      ADD CONSTRAINT newsletter_subscriptions_email_unique UNIQUE ("email");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'newsletter_subscriptions_token_unique'
  ) THEN
    ALTER TABLE newsletter_subscriptions
      ADD CONSTRAINT newsletter_subscriptions_token_unique UNIQUE ("unsubscribeToken");
  END IF;
END $$;

-- FK ao usuário (cria se ainda não existir; SET NULL para preservar
-- histórico de inscrição quando o user é deletado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_subscriptions_userId_fkey'
  ) THEN
    ALTER TABLE newsletter_subscriptions
      ADD CONSTRAINT newsletter_subscriptions_userId_fkey
      FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes
DROP INDEX IF EXISTS newsletter_subscriptions_user_id_idx;
CREATE INDEX newsletter_subscriptions_user_id_idx
  ON newsletter_subscriptions ("userId");

DROP INDEX IF EXISTS newsletter_subscriptions_freq_unsubscribed_idx;
CREATE INDEX newsletter_subscriptions_freq_unsubscribed_idx
  ON newsletter_subscriptions ("frequency", "unsubscribedAt");

DROP INDEX IF EXISTS newsletter_subscriptions_created_at_idx;
CREATE INDEX newsletter_subscriptions_created_at_idx
  ON newsletter_subscriptions ("createdAt");

-- ============================================================================
-- 3. NEWSLETTERS (edições enviadas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletters (
  "id"                TEXT        PRIMARY KEY,
  "subject"           TEXT        NOT NULL,
  "contentMarkdown"   TEXT        NOT NULL,
  "traditionsFilter"  TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  "sentAt"            TIMESTAMP(3),
  "recipientCount"    INTEGER     NOT NULL DEFAULT 0,
  "composedBy"        TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Backfill
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "subject"          TEXT;
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "contentMarkdown"  TEXT;
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "traditionsFilter" TEXT[];
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "sentAt"           TIMESTAMP(3);
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "recipientCount"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "composedBy"       TEXT;
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Indexes
DROP INDEX IF EXISTS newsletters_sent_at_idx;
CREATE INDEX newsletters_sent_at_idx ON newsletters ("sentAt");

DROP INDEX IF EXISTS newsletters_created_at_idx;
CREATE INDEX newsletters_created_at_idx ON newsletters ("createdAt");

-- ============================================================================
-- 4. Trigger — updatedAt
-- ============================================================================

CREATE OR REPLACE FUNCTION newsletter_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletter_subscriptions_set_updated_at_trigger
  ON newsletter_subscriptions;
CREATE TRIGGER newsletter_subscriptions_set_updated_at_trigger
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION newsletter_set_updated_at();

DROP TRIGGER IF EXISTS newsletters_set_updated_at_trigger ON newsletters;
CREATE TRIGGER newsletters_set_updated_at_trigger
  BEFORE UPDATE ON newsletters
  FOR EACH ROW
  EXECUTE FUNCTION newsletter_set_updated_at();

-- ============================================================================
-- 5. VERIFICAÇÃO
-- ============================================================================

DO $$
DECLARE
  ok_subs BOOLEAN;
  ok_news BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name='newsletter_subscriptions'
  ) INTO ok_subs;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name='newsletters'
  ) INTO ok_news;
  RAISE NOTICE 'newsletter_subscriptions table exists: %, newsletters table exists: %',
    ok_subs, ok_news;
END $$;

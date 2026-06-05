-- Migration: Fase C — B2C Models (Sistema Akasha)
-- Date: 2026-06-05

-- ============================================================
-- 1. Enums B2C
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "AkashaPlan" AS ENUM ('FREEMIUM', 'AKASHA_PRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AkashaSubStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AkashaChatRole" AS ENUM ('USER', 'ORACLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. grimoire_entries — add missing columns
-- ============================================================

ALTER TABLE "grimoire_entries"
  ADD COLUMN IF NOT EXISTS "slug"       TEXT,
  ADD COLUMN IF NOT EXISTS "biblioteca" TEXT,
  ADD COLUMN IF NOT EXISTS "sourcePath" TEXT;

-- Rename category -> categoria and content -> conteudo (if they exist under old names)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grimoire_entries' AND column_name = 'category'
  ) THEN
    ALTER TABLE "grimoire_entries" RENAME COLUMN "category" TO "categoria";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grimoire_entries' AND column_name = 'content'
  ) THEN
    ALTER TABLE "grimoire_entries" RENAME COLUMN "content" TO "conteudo";
  END IF;
END $$;

-- Make slug NOT NULL with a temporary default for existing rows, then drop default
UPDATE "grimoire_entries" SET "slug" = id WHERE "slug" IS NULL;
ALTER TABLE "grimoire_entries" ALTER COLUMN "slug" SET NOT NULL;

-- Make biblioteca NOT NULL with a temporary default for existing rows
UPDATE "grimoire_entries" SET "biblioteca" = 'default' WHERE "biblioteca" IS NULL;
ALTER TABLE "grimoire_entries" ALTER COLUMN "biblioteca" SET NOT NULL;

-- Make categoria NOT NULL (was category NOT NULL previously)
-- conteudo NOT NULL (was content NOT NULL previously)

-- Unique constraint on slug
ALTER TABLE "grimoire_entries" DROP CONSTRAINT IF EXISTS "grimoire_entries_slug_key";
ALTER TABLE "grimoire_entries" ADD CONSTRAINT "grimoire_entries_slug_key" UNIQUE ("slug");

-- Indexes
CREATE INDEX IF NOT EXISTS "grimoire_entries_categoria_idx" ON "grimoire_entries"("categoria");
CREATE INDEX IF NOT EXISTS "grimoire_entries_biblioteca_idx" ON "grimoire_entries"("biblioteca");

-- ============================================================
-- 3. akasha_users — add new columns
-- ============================================================

ALTER TABLE "akasha_users"
  ADD COLUMN IF NOT EXISTS "emailVerified"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "locale"           TEXT    NOT NULL DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS "intentionProfile" JSONB;

-- ============================================================
-- 4. akasha_users — remove deprecated columns (IF EXISTS)
-- ============================================================

ALTER TABLE "akasha_users"
  DROP COLUMN IF EXISTS "astrologyMap",
  DROP COLUMN IF EXISTS "kabalisticMap",
  DROP COLUMN IF EXISTS "tantricMap",
  DROP COLUMN IF EXISTS "oduBirth",
  DROP COLUMN IF EXISTS "planoAssinatura",
  DROP COLUMN IF EXISTS "creditBalance";

-- ============================================================
-- 5. New tables
-- ============================================================

-- akasha_birth_charts
CREATE TABLE IF NOT EXISTS "akasha_birth_charts" (
  "id"            TEXT         NOT NULL,
  "userId"        TEXT         NOT NULL,
  "astrologyMap"  JSONB        NOT NULL,
  "kabalisticMap" JSONB        NOT NULL,
  "tantricMap"    JSONB        NOT NULL,
  "oduBirth"      JSONB        NOT NULL,
  "incomplete"    BOOLEAN      NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_birth_charts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_birth_charts_userId_key" UNIQUE ("userId"),
  CONSTRAINT "akasha_birth_charts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

-- akasha_refresh_tokens
CREATE TABLE IF NOT EXISTS "akasha_refresh_tokens" (
  "id"        TEXT        NOT NULL,
  "userId"    TEXT        NOT NULL,
  "tokenHash" TEXT        NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_refresh_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_refresh_tokens_tokenHash_key" UNIQUE ("tokenHash"),
  CONSTRAINT "akasha_refresh_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "akasha_refresh_tokens_userId_idx" ON "akasha_refresh_tokens"("userId");

-- akasha_subscriptions
CREATE TABLE IF NOT EXISTS "akasha_subscriptions" (
  "id"                   TEXT            NOT NULL,
  "userId"               TEXT            NOT NULL,
  "plan"                 "AkashaPlan"    NOT NULL DEFAULT 'FREEMIUM',
  "status"               "AkashaSubStatus" NOT NULL DEFAULT 'ACTIVE',
  "stripeCustomerId"     TEXT,
  "stripeSubscriptionId" TEXT,
  "monthlyCreditQuota"   INTEGER         NOT NULL DEFAULT 0,
  "dashboardUntil"       TIMESTAMPTZ,
  "currentPeriodEnd"     TIMESTAMPTZ,
  "createdAt"            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_subscriptions_userId_key" UNIQUE ("userId"),
  CONSTRAINT "akasha_subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

-- akasha_credit_entries
CREATE TABLE IF NOT EXISTS "akasha_credit_entries" (
  "id"        TEXT        NOT NULL,
  "userId"    TEXT        NOT NULL,
  "delta"     INTEGER     NOT NULL,
  "reason"    TEXT        NOT NULL,
  "balance"   INTEGER     NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_credit_entries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_credit_entries_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "akasha_credit_entries_userId_idx" ON "akasha_credit_entries"("userId");

-- akasha_manifestos
CREATE TABLE IF NOT EXISTS "akasha_manifestos" (
  "id"         TEXT        NOT NULL,
  "userId"     TEXT        NOT NULL,
  "content"    JSONB       NOT NULL,
  "pdfUrl"     TEXT,
  "llmModel"   TEXT,
  "tokensUsed" INTEGER,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_manifestos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_manifestos_userId_key" UNIQUE ("userId"),
  CONSTRAINT "akasha_manifestos_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

-- akasha_daily_readings
CREATE TABLE IF NOT EXISTS "akasha_daily_readings" (
  "id"           TEXT        NOT NULL,
  "userId"       TEXT        NOT NULL,
  "date"         DATE        NOT NULL,
  "climate"      TEXT        NOT NULL,
  "ritual"       JSONB       NOT NULL,
  "alert"        TEXT        NOT NULL,
  "tensionPoint" JSONB       NOT NULL,
  "llmModel"     TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_daily_readings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_daily_readings_userId_date_key" UNIQUE ("userId", "date"),
  CONSTRAINT "akasha_daily_readings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

-- akasha_ritual_completions
CREATE TABLE IF NOT EXISTS "akasha_ritual_completions" (
  "id"         TEXT        NOT NULL,
  "userId"     TEXT        NOT NULL,
  "grimoireId" TEXT        NOT NULL,
  "date"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_ritual_completions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_ritual_completions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "akasha_ritual_completions_userId_idx" ON "akasha_ritual_completions"("userId");

-- akasha_consultations
CREATE TABLE IF NOT EXISTS "akasha_consultations" (
  "id"        TEXT        NOT NULL,
  "userId"    TEXT        NOT NULL,
  "title"     TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_consultations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_consultations_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "akasha_consultations_userId_idx" ON "akasha_consultations"("userId");

-- akasha_chat_messages
CREATE TABLE IF NOT EXISTS "akasha_chat_messages" (
  "id"             TEXT             NOT NULL,
  "consultationId" TEXT             NOT NULL,
  "role"           "AkashaChatRole" NOT NULL,
  "content"        TEXT             NOT NULL,
  "routedPillars"  TEXT[]           NOT NULL DEFAULT '{}',
  "grimoireRefs"   TEXT[]           NOT NULL DEFAULT '{}',
  "creditCost"     INTEGER          NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT "akasha_chat_messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "akasha_chat_messages_consultationId_fkey"
    FOREIGN KEY ("consultationId") REFERENCES "akasha_consultations"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "akasha_chat_messages_consultationId_idx" ON "akasha_chat_messages"("consultationId");

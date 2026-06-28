-- ============================================================================
-- Onda 14b — Drafts & Scheduled Publishing (2026-06-27)
-- ============================================================================
-- Adds:
--   1. PostStatus enum (DRAFT, SCHEDULED, PUBLISHED, ARCHIVED)
--   2. posts.status, posts.scheduledFor, posts.publishedAt
--   3. indexes for cron scan (status, scheduledFor) and dashboard (authorId, status)
--   4. drafts table (separate model for auto-save workspace)
--
-- Idempotente: usa DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ...
-- para que re-execução não quebre. Compatível com Postgres 14+.
-- ============================================================================

-- 1) ENUM PostStatus (idempotente)
DO $$ BEGIN
  CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Colunas novas em posts (idempotente)
ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "status"        "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN IF NOT EXISTS "scheduledFor"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "publishedAt"   TIMESTAMP(3);

-- Backfill defensivo: posts legados sem publishedAt passam a ter = createdAt
UPDATE "posts"
   SET "publishedAt" = "createdAt"
 WHERE "publishedAt" IS NULL;

-- 3) Indexes (idempotentes)
CREATE INDEX IF NOT EXISTS "posts_status_scheduledFor_idx"
  ON "posts" ("status", "scheduledFor");

CREATE INDEX IF NOT EXISTS "posts_authorId_status_idx"
  ON "posts" ("authorId", "status");

-- 4) Drafts (idempotente — CREATE TABLE IF NOT EXISTS é nativo PG)
CREATE TABLE IF NOT EXISTS "drafts" (
  "id"          TEXT PRIMARY KEY,
  "authorId"    TEXT NOT NULL,
  "title"       TEXT,
  "content"     TEXT NOT NULL,
  "tradition"   TEXT,
  "topic"       TEXT,
  "tags"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lastSavedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "drafts_authorId_updatedAt_idx"
  ON "drafts" ("authorId", "updatedAt");

CREATE INDEX IF NOT EXISTS "drafts_authorId_createdAt_idx"
  ON "drafts" ("authorId", "createdAt");

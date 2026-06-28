-- ============================================================================
-- MIGRATION 2026-06-27 — MENTORSHIP 1-on-1 (Onda 13)
-- ============================================================================
-- Adiciona:
--   - users.is_mentor, users.mentor_traditions, users.mentor_bio,
--     users.mentor_rating, users.mentor_completed
--   - enum mentorship_status
--   - tabela mentorships
--   - tabela mentorship_messages
-- ============================================================================

-- Enums
CREATE TYPE "mentorship_status" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- Users — campos do mentor
ALTER TABLE "users"
  ADD COLUMN "is_mentor"         BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN "mentor_traditions" TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "mentor_bio"        TEXT,
  ADD COLUMN "mentor_rating"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "mentor_completed"  INTEGER     NOT NULL DEFAULT 0;

CREATE INDEX "users_is_mentor_idx" ON "users"("is_mentor");

-- Mentorships
CREATE TABLE "mentorships" (
  "id"         TEXT NOT NULL,
  "mentor_id"  TEXT NOT NULL,
  "mentee_id"  TEXT NOT NULL,
  "tradition"  TEXT NOT NULL,
  "status"     "mentorship_status" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "accepted_at" TIMESTAMP(3),
  "ended_at"   TIMESTAMP(3),
  "metadata"   JSONB,

  CONSTRAINT "mentorships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mentorships_mentor_mentee_status_key"
  ON "mentorships"("mentor_id", "mentee_id", "status");

CREATE INDEX "mentorships_mentor_status_idx"
  ON "mentorships"("mentor_id", "status");

CREATE INDEX "mentorships_mentee_status_idx"
  ON "mentorships"("mentee_id", "status");

CREATE INDEX "mentorships_tradition_idx"
  ON "mentorships"("tradition");

CREATE INDEX "mentorships_created_at_idx"
  ON "mentorships"("created_at");

-- Mentorship messages (chat 1-on-1 simples)
CREATE TABLE "mentorship_messages" (
  "id"            TEXT NOT NULL,
  "mentorship_id" TEXT NOT NULL,
  "author_id"     TEXT NOT NULL,
  "content"       TEXT NOT NULL,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "mentorship_messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "mentorship_messages_mentorship_id_fkey"
    FOREIGN KEY ("mentorship_id") REFERENCES "mentorships"("id")
    ON DELETE CASCADE
);

CREATE INDEX "mentorship_messages_mentorship_created_idx"
  ON "mentorship_messages"("mentorship_id", "created_at");
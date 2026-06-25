-- Wave 31.2 — Multi-tenant foundation (workspaceId)
--
-- Scope: adds the `workspaceId` column to two persistent Prisma models
-- that are user-scoped (User, DailyReading). The application-layer
-- proxy (`workspace-context.ts`) reads this column on every query to
-- enforce cross-tenant isolation.
--
-- Companion ADR: ADR-016 WIP (workspaceId on top of zeladorId).
-- Reference research: .hermes/reports/wave-30.5-multi-tenant.md (analysis
-- of row-level isolation strategy; this migration implements the
-- app-layer-proxy recommendation, NOT Postgres RLS).
--
-- Why a string column (not a FK to a new `workspaces` table)?
--   Phase 2 (Wave 31.2.1) introduces an explicit Workspace table +
--   FK for org-style tenants (clinics, schools). For MVP, all users
--   share the synthetic workspace 'personal' so:
--     1. Zero-downtime migration (default fills every row).
--     2. No new tables (the Workspace catalog lives in the existing
--        `consultores` / admin tooling until Phase 2).
--     3. Backward compatible — old code that doesn't know about
--        workspaceId just gets the default value.
--
-- IMPORTANT (per apps/akasha-portal/prisma/AGENTS.md): this migration
-- is PROPOSAL-ONLY. The Zelador will run
--   pnpm exec prisma migrate dev --name WAVE-31-2-multitenant-workspace-id
-- after reviewing this proposal. The schema.prisma diff is already
-- committed in 4ed28b22 (this branch).
--
-- DEFAULT value: 'personal' — matches DEFAULT_WORKSPACE_ID constant
-- in src/lib/application/auth/workspace-context.ts. Single source of
-- truth — if you change one, change the other.

-- ============================================================
-- Step 1: Add workspaceId column to akasha_users (User model)
-- ============================================================
ALTER TABLE "akasha_users"
  ADD COLUMN IF NOT EXISTS "workspaceId" TEXT NOT NULL DEFAULT 'personal';

-- Backfill is implicit (DEFAULT fills new column for existing rows).
-- For historical correctness: confirm no NULLs remain.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "akasha_users" WHERE "workspaceId" IS NULL
  ) THEN
    UPDATE "akasha_users" SET "workspaceId" = 'personal' WHERE "workspaceId" IS NULL;
  END IF;
END $$;

-- Index for the proxy's hot path:
--   User.findMany({ where: { workspaceId } }) on every request.
CREATE INDEX IF NOT EXISTS "akasha_users_workspaceId_idx"
  ON "akasha_users" ("workspaceId");

-- ============================================================
-- Step 2: Add workspaceId column to daily_readings (DailyReading model)
-- ============================================================
ALTER TABLE "daily_readings"
  ADD COLUMN IF NOT EXISTS "workspaceId" TEXT NOT NULL DEFAULT 'personal';

-- Backfill from User.workspaceId (preferred over the column default
-- so that future 'personal' users + future workspace assignments
-- remain consistent). For MVP both columns are 'personal' for every
-- row, but the JOIN-based backfill is correct regardless.
UPDATE "daily_readings" AS dr
SET    "workspaceId" = COALESCE(u."workspaceId", 'personal')
FROM   "akasha_users"  AS u
WHERE  dr."userId" = u."id"
  AND  dr."workspaceId" IS DISTINCT FROM COALESCE(u."workspaceId", 'personal');

-- Defensive backfill: if any row has NULL/empty workspaceId after the
-- JOIN-based update (orphaned userId), fall back to 'personal'.
UPDATE "daily_readings"
SET    "workspaceId" = 'personal'
WHERE  "workspaceId" IS NULL OR "workspaceId" = '';

-- Index for the proxy's hot path:
--   DailyReading.findMany({ where: { workspaceId } }) on /api/daily.
CREATE INDEX IF NOT EXISTS "daily_readings_workspaceId_idx"
  ON "daily_readings" ("workspaceId");

-- ============================================================
-- Step 3: Comments (DDL documentation, visible via \d+ in psql)
-- ============================================================
COMMENT ON COLUMN "akasha_users"."workspaceId" IS
  'Wave 31.2 — multi-tenant workspace isolation. Default ''personal''. '
  'A user belongs to exactly one workspace. Cross-workspace reads are '
  'denied by src/lib/application/auth/workspace-context.ts (Prisma proxy).';

COMMENT ON COLUMN "daily_readings"."workspaceId" IS
  'Wave 31.2 — denormalized from User.workspaceId at insert time. '
  'Backfilled from User on migration. The Prisma proxy enforces '
  'AND[workspaceId] on every read; this column is the fast-path filter.';

-- ============================================================
-- Step 4: Check constraints (defense in depth — app layer already
-- validates, but DB-level constraint prevents bad writes from raw
-- SQL or future code that forgets to use the proxy).
--
-- Postgres does NOT support `ADD CONSTRAINT IF NOT EXISTS`, so we use
-- a DO block to test pg_constraint first.
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'akasha_users_workspaceId_nonempty'
  ) THEN
    ALTER TABLE "akasha_users"
      ADD CONSTRAINT "akasha_users_workspaceId_nonempty"
      CHECK (length("workspaceId") > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_readings_workspaceId_nonempty'
  ) THEN
    ALTER TABLE "daily_readings"
      ADD CONSTRAINT "daily_readings_workspaceId_nonempty"
      CHECK (length("workspaceId") > 0);
  END IF;
END $$;

-- ============================================================
-- Step 5: Write an AuditLog entry so this migration is itself auditable.
-- (AuditLog is the canonical audit sink — see Wave 14.5 / D-047.)
--
-- AuditLog columns (per schema.prisma):
--   id, action (enum), userId, ipHash, requestId, metadata, createdAt
-- No actorType/actorId/targetType/targetId here — those are on
-- FeedbackEvent (different model). For a system actor we leave
-- userId NULL and put context in `metadata`.
-- ============================================================
INSERT INTO "audit_logs" (
  "id",
  "action",
  "userId",
  "ipHash",
  "requestId",
  "metadata",
  "createdAt"
) VALUES (
  'wave-31-2-multitenant-workspace-id-migration',
  'consent_updated'::"AuditAction",
  NULL,
  NULL,
  'wave-31.2-multitenant-workspace-id',
  jsonb_build_object(
    'wave', '31.2',
    'description', 'Added workspaceId column to User + DailyReading with backfill to ''personal'' and index on each.',
    'migrationFile', 'WAVE-31-2-multitenant-workspace-id/migration.sql',
    'defaultWorkspace', 'personal'
  ),
  NOW()
) ON CONFLICT ("id") DO NOTHING;

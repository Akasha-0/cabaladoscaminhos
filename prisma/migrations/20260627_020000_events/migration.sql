-- ============================================================================
-- Akasha Portal — Events (Wave 13, 2026-06-27)
-- ============================================================================
-- Círculos de partilha online (workshops, meditações guiadas, rodas de
-- conversa síncronas). Diferente do feed assíncrono, esses eventos têm
-- data/hora marcada, número limitado de participantes e um host.
--
-- Tabelas:
--   - events               (título, descrição, tradição, hostId, startsAt,
--                           durationMin, maxParticipants, isPublic, meetingUrl)
--   - event_participants  (RSVP — quem confirmou presença)
--
-- Idempotente: usa IF NOT EXISTS / DROP IF EXISTS para permitir re-execução.
-- ============================================================================

-- ============================================================================
-- 1. EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  "id"               TEXT        PRIMARY KEY,
  "title"            TEXT        NOT NULL,
  "description"      TEXT        NOT NULL,
  "tradition"        TEXT        NOT NULL,
  "hostId"           TEXT        NOT NULL,
  "startsAt"         TIMESTAMP(3) NOT NULL,
  "durationMin"      INTEGER     NOT NULL DEFAULT 60,
  "maxParticipants"  INTEGER     NOT NULL DEFAULT 0,
  "isPublic"         BOOLEAN     NOT NULL DEFAULT TRUE,
  "meetingUrl"       TEXT,
  "groupId"          TEXT,
  "participantsCount" INTEGER    NOT NULL DEFAULT 0,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT events_groupId_fkey FOREIGN KEY ("groupId")
    REFERENCES groups (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Backfill columns (in case the table existed partially from a previous run)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "title"             TEXT;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "description"       TEXT;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "tradition"         TEXT;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "hostId"            TEXT;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "startsAt"          TIMESTAMP(3);
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "durationMin"       INTEGER NOT NULL DEFAULT 60;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "maxParticipants"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "isPublic"          BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "meetingUrl"        TEXT;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "groupId"           TEXT;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "participantsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- FK ao grupo (só adiciona se ainda não existir — evita erro em re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_groupId_fkey'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_groupId_fkey FOREIGN KEY ("groupId")
      REFERENCES groups (id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes (drops idempotentes antes de criar)
DROP INDEX IF EXISTS events_starts_at_idx;
CREATE INDEX events_starts_at_idx ON events ("startsAt");
DROP INDEX IF EXISTS events_tradition_idx;
CREATE INDEX events_tradition_idx ON events ("tradition");
DROP INDEX IF EXISTS events_host_id_idx;
CREATE INDEX events_host_id_idx ON events ("hostId");
DROP INDEX IF EXISTS events_group_id_idx;
CREATE INDEX events_group_id_idx ON events ("groupId");
DROP INDEX IF EXISTS events_is_public_starts_at_idx;
CREATE INDEX events_is_public_starts_at_idx ON events ("isPublic", "startsAt");

-- ============================================================================
-- 2. EVENT_PARTICIPANTS (RSVP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_participants (
  "eventId"  TEXT        NOT NULL,
  "userId"   TEXT        NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT event_participants_pkey PRIMARY KEY ("eventId", "userId"),
  CONSTRAINT event_participants_eventId_fkey FOREIGN KEY ("eventId")
    REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
DROP INDEX IF EXISTS event_participants_user_id_idx;
CREATE INDEX event_participants_user_id_idx ON event_participants ("userId");
DROP INDEX IF EXISTS event_participants_event_id_idx;
CREATE INDEX event_participants_event_id_idx ON event_participants ("eventId");

-- ============================================================================
-- 3. Trigger — mantém updatedAt em sincronia
-- ============================================================================

CREATE OR REPLACE FUNCTION events_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_set_updated_at_trigger ON events;
CREATE TRIGGER events_set_updated_at_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION events_set_updated_at();

-- ============================================================================
-- 4. VERIFICAÇÃO
-- ============================================================================

DO $$
DECLARE
  ok_events BOOLEAN;
  ok_part BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='events')
    INTO ok_events;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='event_participants')
    INTO ok_part;
  RAISE NOTICE 'events table exists: %, event_participants table exists: %',
    ok_events, ok_part;
END $$;
-- ============================================================================
-- Event RSVP Status — Wave 21 (2026-06-28)
-- ============================================================================
-- Adiciona status (going/maybe/declined) ao EventParticipant para suportar
-- o fluxo real de RSVP via /api/events/[id]/rsvp.
--
-- Coluna nova com DEFAULT 'GOING' para retro-compatibilidade:
-- todos os participantes existentes passam a contar como "going" (que
-- é o comportamento que tinham antes via Event.participantsCount).
-- ============================================================================

-- Enum
CREATE TYPE "EventRsvpStatus" AS ENUM ('GOING', 'MAYBE', 'DECLINED');

-- Nova coluna + coluna de timestamp da última mudança
ALTER TABLE "event_participants"
  ADD COLUMN "status" "EventRsvpStatus" NOT NULL DEFAULT 'GOING',
  ADD COLUMN "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Índice para queries do tipo "todos os going de um evento"
CREATE INDEX "event_participants_eventId_status_idx"
  ON "event_participants" ("eventId", "status");
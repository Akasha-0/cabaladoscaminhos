-- D-048 — User notification preferences (Wave 18.2)
--
-- Opt-out per-type (DIARIO/MENTOR/CONEXOES/CREDITS/SYSTEM).
-- Tabela esparsa: rows só existem para users que opt-out de algum tipo.
-- Default "all enabled" não precisa de 5 rows por usuário novo.
--
-- LGPD Art. 18 §VI (revogação granular): user pode desativar
-- DIARIO mas manter MENTOR + CONEXOES. Preferences são userId-only,
-- sem PII direta.
--
-- Aditiva — não destrutiva. Aplicável sem downtime.
--
-- IMPORTANT: This migration is PROPOSAL-ONLY. O Zelador roda
--   pnpm exec prisma migrate dev --name notification_preferences
-- após aprovação (per apps/akasha-portal/prisma/AGENTS.md D1).

-- 1. Tabela
CREATE TABLE "notification_preferences" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "type"      "NotificationType" NOT NULL,
    "enabled"   BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- 2. Unique constraint (impede duplicatas + suporta upsert no PATCH)
CREATE UNIQUE INDEX "notification_preferences_userId_type_key"
    ON "notification_preferences"("userId", "type");

-- 3. Index em userId (cobre query principal "todas prefs do user X")
CREATE INDEX "notification_preferences_userId_idx"
    ON "notification_preferences"("userId");

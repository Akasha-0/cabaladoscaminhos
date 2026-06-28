-- ============================================================================
-- Akasha Portal — Reactions (Emoji Universalista) — Onda 14, 2026-06-27
-- ============================================================================
-- Tabela de reações polimórfica (POST | COMMENT) com emoji. Diferente do Like
-- binário, Reaction carrega emoção (gratidão, compaixão, paz, etc).
--
-- Set curado de 8 emojis espiritualizados (whitelist enforçada no app, não
-- no DB — permite evolução sem migration).
--
-- Aplicar com: psql $DATABASE_URL -f migration.sql
-- Idempotente: usa IF NOT EXISTS / DO blocks
-- ============================================================================

-- 1. Enum do tipo de alvo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReactionTargetType') THEN
    CREATE TYPE "ReactionTargetType" AS ENUM ('POST', 'COMMENT');
  END IF;
END $$;

-- 2. Tabela reactions
CREATE TABLE IF NOT EXISTS "reactions" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT
                || '-' || extract(epoch from now())::TEXT,
  "userId"     TEXT NOT NULL,
  "targetType" "ReactionTargetType" NOT NULL,
  "targetId"   TEXT NOT NULL,
  "emoji"      TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 1 usuário pode reagir com o mesmo emoji no mesmo alvo no máximo 1x
  CONSTRAINT "reactions_userId_targetType_targetId_emoji_key"
    UNIQUE ("userId", "targetType", "targetId", "emoji"),

  -- emoji entre 1 e 8 chars (cobre todos os emojis unicode surrogados)
  CONSTRAINT "reactions_emoji_length"
    CHECK (char_length("emoji") BETWEEN 1 AND 8)
);

-- 3. Índices — queries quentes
--    GET /api/reactions?targetType=X&targetId=Y → agrupar por emoji
CREATE INDEX IF NOT EXISTS "reactions_targetType_targetId_emoji_idx"
  ON "reactions" ("targetType", "targetId", "emoji");

--    DELETE/SELECT por (userId, targetType, targetId) — toggle e contagem
CREATE INDEX IF NOT EXISTS "reactions_userId_targetType_idx"
  ON "reactions" ("userId", "targetType");

-- 4. Sem FK direta porque (targetType, targetId) é polimórfico. App garante
--    integridade em toggleReaction (verifica existência do alvo antes).
-- ============================================================================
-- ROLLBACK (manual):
--   DROP TABLE IF EXISTS "reactions";
--   DROP TYPE IF EXISTS "ReactionTargetType";
-- ============================================================================
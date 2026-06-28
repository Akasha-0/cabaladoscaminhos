-- ============================================================================
-- Wave 25 — Comments Moderation: add isModerator to User (2026-06-28)
-- ============================================================================
-- Adiciona flag site-wide `is_moderator` ao User. Permite distinguir:
--   - USER       (padrão) — pode reportar comentários mas não moderar
--   - MODERATOR  (isModerator=true) — pode ver/agir na fila de moderação
--   - ADMIN      (ADMIN_EMAILS env OR planoAssinatura='ADMIN') — super-set
-- ============================================================================
--
-- Política de write:
--   - isModerator é uma flag operacional; deve ser alterada via tooling
--     admin (futuro: rota `POST /api/admin/users/[id]/role` ou direto no
--     DB). NUNCA auto-promote (não há UI nem endpoint público).
--   - Aplicar manualmente:  UPDATE users SET is_moderator = true WHERE id = '...';
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_is_moderator ON users(is_moderator);

-- ============================================================================
-- Verificação
-- ============================================================================
DO $$
DECLARE
  col_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'is_moderator'
  ) INTO col_exists;

  IF NOT col_exists THEN
    RAISE EXCEPTION 'Migration failed: users.is_moderator não foi criada';
  END IF;

  RAISE NOTICE 'OK — users.is_moderator criada com default FALSE e índice idx_users_is_moderator';
END $$;

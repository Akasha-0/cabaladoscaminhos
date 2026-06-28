-- ============================================================================
-- Akasha Portal — Post Bookmarks + Reading History (Wave 14, 2026-06-27)
-- ============================================================================
-- Duas features pequenas mas valiosas pro uso cotidiano da comunidade:
--
--   1. post_bookmarks    — "Salvar post pra ler depois" com collections
--                          opcionais ("Favoritos", "Para Meditar", etc).
--                          Diferente do `bookmarks` (que é por article).
--   2. reading_history   — Histórico pessoal privado de leitura
--                          (continue de onde parou).
--
-- Idempotente: usa IF NOT EXISTS / ADD COLUMN IF NOT EXISTS para permitir
-- re-execução.
-- ============================================================================

-- ============================================================================
-- 1. POST_BOOKMARKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS post_bookmarks (
  "id"              TEXT         PRIMARY KEY,
  "userId"          TEXT         NOT NULL,
  "postId"          TEXT         NOT NULL,
  "collectionName"  TEXT         NOT NULL DEFAULT 'default',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Unicidade: não permite duplicar (user, post, collection)
  CONSTRAINT post_bookmarks_user_post_collection_uniq
    UNIQUE ("userId", "postId", "collectionName"),

  -- FK para posts
  CONSTRAINT post_bookmarks_postId_fkey FOREIGN KEY ("postId")
    REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes (drops idempotentes antes de criar)
DROP INDEX IF EXISTS post_bookmarks_user_collection_created_idx;
CREATE INDEX post_bookmarks_user_collection_created_idx
  ON post_bookmarks ("userId", "collectionName", "createdAt");

DROP INDEX IF EXISTS post_bookmarks_user_created_idx;
CREATE INDEX post_bookmarks_user_created_idx
  ON post_bookmarks ("userId", "createdAt");

DROP INDEX IF EXISTS post_bookmarks_post_id_idx;
CREATE INDEX post_bookmarks_post_id_idx
  ON post_bookmarks ("postId");

-- ============================================================================
-- 2. READING_HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS reading_history (
  "id"          TEXT         PRIMARY KEY,
  "userId"      TEXT         NOT NULL,
  "postId"      TEXT         NOT NULL,
  "percentRead" INTEGER      NOT NULL DEFAULT 0,
  "readAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Um registro por (user, post) — upsert atualiza o mais recente
  CONSTRAINT reading_history_user_post_uniq
    UNIQUE ("userId", "postId"),

  -- FK para posts
  CONSTRAINT reading_history_postId_fkey FOREIGN KEY ("postId")
    REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
DROP INDEX IF EXISTS reading_history_user_read_at_idx;
CREATE INDEX reading_history_user_read_at_idx
  ON reading_history ("userId", "readAt");

DROP INDEX IF EXISTS reading_history_post_id_idx;
CREATE INDEX reading_history_post_id_idx
  ON reading_history ("postId");

-- ============================================================================
-- 3. VERIFICAÇÃO
-- ============================================================================

DO $$
DECLARE
  ok_bookmarks BOOLEAN;
  ok_history   BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='post_bookmarks')
    INTO ok_bookmarks;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='reading_history')
    INTO ok_history;
  RAISE NOTICE 'post_bookmarks table exists: %, reading_history table exists: %',
    ok_bookmarks, ok_history;
END $$;

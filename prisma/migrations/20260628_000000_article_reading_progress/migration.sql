-- ============================================================================
-- Akasha Portal — Article Reading Progress (Wave 21, 2026-06-28)
-- ============================================================================
-- Adiciona tabela `article_reading_progress` para suportar:
--   - "Continue de onde parou" (lastPosition)
--   - Barra de progresso pessoal (percentRead)
--   - Histórico pessoal "O que estou lendo"
-- Idempotente: usa CREATE TABLE IF NOT EXISTS para permitir re-execução.
-- ============================================================================
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_reading_progress (
  id              TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "articleId"     TEXT NOT NULL,
  "percentRead"   INTEGER NOT NULL DEFAULT 0,
  "lastPosition"  TEXT,
  "completedAt"   TIMESTAMP(3),
  "readAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT article_reading_progress_userId_fkey
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT article_reading_progress_articleId_fkey
    FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE
);

-- Unicidade (userId, articleId) — garante idempotência do upsert
CREATE UNIQUE INDEX IF NOT EXISTS "article_reading_progress_userId_articleId_key"
  ON article_reading_progress ("userId", "articleId");

-- Índices auxiliares para queries comuns
CREATE INDEX IF NOT EXISTS "article_reading_progress_userId_readAt_idx"
  ON article_reading_progress ("userId", "readAt" DESC);

CREATE INDEX IF NOT EXISTS "article_reading_progress_articleId_idx"
  ON article_reading_progress ("articleId");

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
DO $$
DECLARE
  ok_table BOOLEAN;
  ok_unique BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'article_reading_progress'
  ) INTO ok_table;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'article_reading_progress_userId_articleId_key'
  ) INTO ok_unique;

  RAISE NOTICE 'article_reading_progress: table=%, unique_idx=%', ok_table, ok_unique;
END $$;
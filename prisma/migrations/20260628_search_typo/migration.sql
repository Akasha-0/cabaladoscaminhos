-- ============================================================================
-- Akasha Portal — Search typo tolerance + canonical trigram indexes (Wave 18)
-- ============================================================================
-- Objetivo:
--   - Garantir que a extensão pg_trgm esteja habilitada (idempotente)
--   - Criar índices canônicos com nomes estáveis:
--       idx_articles_title_trgm
--       idx_posts_content_trgm
--       idx_groups_name_trgm
--       idx_spiritual_profiles_birth_name_trgm
--     (esses são os nomes referenciados pelo app e pela doc SEARCH-W18.md)
--   - Backfill de threshold de similarity (pg_trgm.similarity_threshold)
--     para fuzziness previsível (~0.3 = tolera 1-2 typos em palavras curtas)
--
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- Idempotente: tudo usa IF NOT EXISTS / DROP IF EXISTS.
-- ============================================================================

-- 0. Extensão
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Threshold global de similarity (0.0 - 1.0).
-- 0.3 é conservador: tolera typos em palavras curtas sem gerar falso-positivo
-- em matches longos (ex.: "meditação" vs "meditacao" ~0.7; "axé" vs "axe" ~0.5).
SET pg_trgm.similarity_threshold = 0.3;

-- ============================================================================
-- 1. ARTICLES — title trigram (canonical)
-- ============================================================================
-- O índice existente `articles_title_trgm_idx` (Onda 12) é equivalente;
-- aqui criamos o nome canônico para uso documentado pela API.
DROP INDEX IF EXISTS idx_articles_title_trgm;
CREATE INDEX idx_articles_title_trgm
  ON articles USING gin (title gin_trgm_ops);

-- ============================================================================
-- 2. POSTS — content trigram (canonical)
-- ============================================================================
DROP INDEX IF EXISTS idx_posts_content_trgm;
CREATE INDEX idx_posts_content_trgm
  ON posts USING gin (content gin_trgm_ops);

-- ============================================================================
-- 3. GROUPS — name trigram (canonical)
-- ============================================================================
DROP INDEX IF EXISTS idx_groups_name_trgm;
CREATE INDEX idx_groups_name_trgm
  ON groups USING gin (name gin_trgm_ops);

-- ============================================================================
-- 4. SPIRITUAL PROFILES — birthName trigram (canonical)
-- ============================================================================
DROP INDEX IF EXISTS idx_spiritual_profiles_birth_name_trgm;
CREATE INDEX idx_spiritual_profiles_birth_name_trgm
  ON spiritual_profiles USING gin ("birthName" gin_trgm_ops);

-- ============================================================================
-- 5. Verificação
-- ============================================================================
DO $$
DECLARE
  ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_articles_title_trgm'
  ) INTO ok;
  RAISE NOTICE 'idx_articles_title_trgm = %', ok;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_content_trgm'
  ) INTO ok;
  RAISE NOTICE 'idx_posts_content_trgm = %', ok;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_groups_name_trgm'
  ) INTO ok;
  RAISE NOTICE 'idx_groups_name_trgm = %', ok;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_spiritual_profiles_birth_name_trgm'
  ) INTO ok;
  RAISE NOTICE 'idx_spiritual_profiles_birth_name_trgm = %', ok;
END $$;

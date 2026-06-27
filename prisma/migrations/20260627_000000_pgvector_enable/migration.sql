-- ============================================================================
-- Akasha Portal — pgvector Enable (Fase 3 — Akasha IA RAG)
-- ============================================================================
-- Ativa extensão pgvector no Postgres e prepara coluna de embedding
-- (vector(1536)) na tabela Article para recommendation semântica e RAG.
--
-- Dimensão 1536 = OpenAI text-embedding-3-small (mais barato, qualidade boa)
-- Pode ser alterada para 3072 (text-embedding-3-large) se precisar mais
-- precisão — ambos são suportados pelo pgvector.
--
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- Idempotente: usa IF NOT EXISTS / DROP IF EXISTS
-- ============================================================================

-- 1. Extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Coluna embedding na tabela Article (Prisma declara como Unsupported)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Article' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE "Article" ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- 3. Índice IVFFlat para busca por similaridade (cosine)
-- lists = sqrt(rows) é boa heurística inicial; ajuste depois de popular
CREATE INDEX IF NOT EXISTS article_embedding_ivfflat_idx
  ON "Article" USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Função helper para buscar artigos similares a um embedding
CREATE OR REPLACE FUNCTION search_similar_articles(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_tradition text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  title text,
  slug text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.slug,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM "Article" a
  WHERE
    a.embedding IS NOT NULL
    AND a.published_at IS NOT NULL
    AND (filter_tradition IS NULL OR a.tradition = filter_tradition)
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_similar_articles IS
  'Busca artigos similares por embedding (cosine similarity). Usado pelo Akasha IA RAG.';
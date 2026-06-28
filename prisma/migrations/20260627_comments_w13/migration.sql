-- ============================================================================
-- MIGRATION 2026-06-27 — COMMENTS THREADING + MENTIONS (Onda 13)
-- ============================================================================
-- Adiciona suporte a respostas aninhadas (parentId self-relation) na tabela
-- comments. Idempotente: pode ser aplicado em bases que já receberam a
-- coluna via sync do Prisma, e em bases que ainda não têm.
--
-- Convenção de nomes:
--   - Prisma 7 mantém camelCase por padrão nas colunas, então
--     `parentId` aqui é literalmente "parentId" (com aspas por sensibilidade
--     a case no Postgres).
-- ============================================================================

-- 1. Coluna parentId (nullable, self-FK com CASCADE)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS "parentId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_parentId_fkey'
      AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments
      ADD CONSTRAINT "comments_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES comments(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Índice para queries por thread (parentId + createdAt)
CREATE INDEX IF NOT EXISTS comments_parent_id_created_at_idx
  ON comments ("parentId", "createdAt");

-- 3. Verificação
DO $$
DECLARE
  has_column BOOLEAN;
  has_fk BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parentId'
  ) INTO has_column;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_parentId_fkey' AND table_name = 'comments'
  ) INTO has_fk;

  RAISE NOTICE 'comments.parentId column=%, fk=%', has_column, has_fk;
END $$;

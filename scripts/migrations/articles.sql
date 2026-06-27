-- ============================================================================
-- BIBLIOTECA AKASHA — articles table extension (2026-06-27)
-- ============================================================================
-- Migração aditiva: não destrói dados existentes. Apenas adiciona colunas e
-- índices novos, e migra valores do enum EvidenceLevel antigo para o novo.
--
-- Aplicar com:
--   psql "$DATABASE_URL" -f scripts/migrations/articles.sql
-- ou via Prisma migrate dev (recomendado) após editar community.prisma.
--
-- Mudanças principais:
--   * Novos campos bibliográficos: authors, journal, year (NOT NULL), doi, url,
--     language, citations, viewCount, bookmarkCount, tags, curatedBy, source,
--     sourceHash
--   * Compat: content (novo) + body (legado) populados iguais; topics = tags
--   * EvidenceLevel: ANECDONTAL/OBSERVATIONAL/PEER_REVIEWED/META_ANALYSIS
--     → ANECDOTAL/LOW/MEDIUM/HIGH (GRADE)
-- ============================================================================

-- 1. Novos campos -------------------------------------------------------
ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "content"          TEXT,
  ADD COLUMN IF NOT EXISTS "authors"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "journal"          TEXT,
  ADD COLUMN IF NOT EXISTS "year"             INTEGER,
  ADD COLUMN IF NOT EXISTS "doi"              TEXT,
  ADD COLUMN IF NOT EXISTS "url"              TEXT,
  ADD COLUMN IF NOT EXISTS "tags"             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "language"         TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS "citations"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "viewCount"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "bookmarkCount"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "curatedBy"        TEXT,
  ADD COLUMN IF NOT EXISTS "source"           TEXT,
  ADD COLUMN IF NOT EXISTS "sourceHash"       TEXT;

-- 2. Renomeações semânticas ---------------------------------------------
-- viewsCount → viewCount (canônico em inglês)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'viewsCount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'viewCount'
  ) THEN
    EXECUTE 'ALTER TABLE "articles" RENAME COLUMN "viewsCount" TO "viewCount"';
  END IF;
END $$;

-- bookmarksCount → bookmarkCount
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'bookmarksCount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'bookmarkCount'
  ) THEN
    EXECUTE 'ALTER TABLE "articles" RENAME COLUMN "bookmarksCount" TO "bookmarkCount"';
  END IF;
END $$;

-- 3. Migração EvidenceLevel (enum novo, GRADE) --------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EvidenceLevel') THEN
    -- Renomeia enum antigo se necessário
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'EvidenceLevel' AND e.enumlabel = 'HIGH'
    ) THEN
      -- Renomeia enum antigo
      ALTER TYPE "EvidenceLevel" RENAME TO "EvidenceLevel_old";

      -- Cria novo enum GRADE-aligned
      CREATE TYPE "EvidenceLevel" AS ENUM ('ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH');

      -- Migra coluna para texto, mapeia e reconverte
      ALTER TABLE "articles"
        ALTER COLUMN "evidenceLevel" DROP DEFAULT,
        ALTER COLUMN "evidenceLevel" TYPE TEXT USING "evidenceLevel"::TEXT;

      UPDATE "articles" SET "evidenceLevel" = 'HIGH'       WHERE "evidenceLevel" = 'META_ANALYSIS';
      UPDATE "articles" SET "evidenceLevel" = 'MEDIUM'     WHERE "evidenceLevel" = 'PEER_REVIEWED';
      UPDATE "articles" SET "evidenceLevel" = 'LOW'        WHERE "evidenceLevel" = 'OBSERVATIONAL';
      -- ANECDOTAL continua ANECDOTAL

      ALTER TABLE "articles"
        ALTER COLUMN "evidenceLevel" TYPE "EvidenceLevel" USING "evidenceLevel"::"EvidenceLevel",
        ALTER COLUMN "evidenceLevel" SET DEFAULT 'ANECDOTAL';

      -- Drop enum antigo
      DROP TYPE "EvidenceLevel_old";
    END IF;
  END IF;
END $$;

-- 4. Backfill campos -----------------------------------------------------
UPDATE "articles" SET
  "content" = COALESCE("content", "body"),
  "tags"    = COALESCE(NULLIF("tags", ARRAY[]::TEXT[]), "topics"),
  "topics"  = COALESCE(NULLIF("topics", ARRAY[]::TEXT[]), "tags"),
  "url"     = COALESCE("url", "externalUrl"),
  "year"    = COALESCE("year", EXTRACT(YEAR FROM "publishedAt")::INT, EXTRACT(YEAR FROM "createdAt")::INT),
  "viewCount"     = COALESCE("viewCount", "likesCount"),
  "bookmarkCount" = COALESCE("bookmarkCount", 0)
WHERE TRUE;

-- Se year ainda for NULL (paper sem publishedAt e sem createdAt), seta um default conservador
UPDATE "articles" SET "year" = 2024 WHERE "year" IS NULL;

-- 5. Constraints ---------------------------------------------------------
ALTER TABLE "articles"
  ALTER COLUMN "year" SET NOT NULL,
  ALTER COLUMN "content" SET NOT NULL;

-- 6. Unique constraint para DOI quando preenchido -----------------------
CREATE UNIQUE INDEX IF NOT EXISTS "articles_doi_key" ON "articles"("doi") WHERE "doi" IS NOT NULL;

-- 7. Unique constraint para sourceHash (idempotência do seed) -----------
CREATE UNIQUE INDEX IF NOT EXISTS "articles_sourceHash_key" ON "articles"("sourceHash") WHERE "sourceHash" IS NOT NULL;

-- 8. Novos índices de performance ---------------------------------------
CREATE INDEX IF NOT EXISTS "articles_year_idx"           ON "articles"("year");
CREATE INDEX IF NOT EXISTS "articles_language_idx"       ON "articles"("language");
CREATE INDEX IF NOT EXISTS "articles_viewCount_idx"      ON "articles"("viewCount" DESC);
CREATE INDEX IF NOT EXISTS "articles_bookmarkCount_idx"  ON "articles"("bookmarkCount" DESC);
CREATE INDEX IF NOT EXISTS "articles_citations_idx"      ON "articles"("citations" DESC);
CREATE INDEX IF NOT EXISTS "articles_doi_idx"            ON "articles"("doi");
CREATE INDEX IF NOT EXISTS "articles_tags_idx"           ON "articles" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "articles_authors_idx"        ON "articles" USING GIN ("authors");

-- Full-text search em PT-BR (campo único gerado). Para instalar tsvector,
-- cria extensão antes (Supabase já tem).
CREATE INDEX IF NOT EXISTS "articles_search_idx"
  ON "articles"
  USING GIN (
    to_tsvector(
      'portuguese',
      coalesce("title", '') || ' ' || coalesce("summary", '') || ' ' || coalesce("content", '')
    )
  );

-- ============================================================================
-- FIM
-- ============================================================================
-- Próximos passos:
--   1. Rodar `pnpm db:generate` para regerar o Prisma Client
--   2. Rodar `pnpm db:push` ou `prisma migrate dev` para aplicar
--   3. Rodar `pnpm seed:articles` para popular com 50+ artigos curados
-- ============================================================================
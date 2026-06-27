-- ============================================================================
-- Akasha Portal — Search & Discovery (Onda 12)
-- ============================================================================
-- Adiciona Postgres full-text search aos modelos comunitários:
--   - Coluna `searchVector tsvector` em Post, Article, Group, SpiritualProfile
--   - GIN index em cada searchVector
--   - Trigram (pg_trgm) em title/name + tags para fuzzy match
--   - Triggers para atualizar automaticamente em INSERT/UPDATE
-- ============================================================================
-- IMPORTANTE: Prisma 7 mantém camelCase nos nomes de coluna por padrão
-- (apenas @@map customiza o nome da tabela). Nomes de coluna aqui usam
-- camelCase exatamente como no schema.prisma.
-- ============================================================================
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- Idempotente: usa CREATE ... IF NOT EXISTS / DROP IF EXISTS para permitir
-- re-execução segura durante desenvolvimento.
-- ============================================================================

-- 0. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- unaccent é opcional mas remove acentos pra busca mais permissiva
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================================
-- 1. POSTS (tabela `posts`, colunas camelCase)
-- ============================================================================

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Backfill inicial (caso tabela já tenha dados)
UPDATE posts
SET "searchVector" =
  setweight(to_tsvector('portuguese', coalesce(content, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(tradition, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(topic, '')), 'B')
WHERE "searchVector" IS NULL OR "searchVector" = ''::tsvector;

-- Trigger: mantém searchVector em sincronia
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', coalesce(NEW.content, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.tradition, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.topic, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_trigger ON posts;
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE OF content, tradition, topic, "deletedAt"
  ON posts
  FOR EACH ROW
  EXECUTE FUNCTION posts_search_vector_update();

-- GIN index para busca full-text
DROP INDEX IF EXISTS posts_search_vector_idx;
CREATE INDEX posts_search_vector_idx ON posts USING GIN ("searchVector");

-- Trigram em content (fuzzy / autocomplete)
DROP INDEX IF EXISTS posts_content_trgm_idx;
CREATE INDEX posts_content_trgm_idx ON posts USING GIN (content gin_trgm_ops);

-- Trigram em tags (tradition, topic)
DROP INDEX IF EXISTS posts_tradition_trgm_idx;
CREATE INDEX posts_tradition_trgm_idx ON posts USING GIN (tradition gin_trgm_ops);
DROP INDEX IF EXISTS posts_topic_trgm_idx;
CREATE INDEX posts_topic_trgm_idx ON posts USING GIN (topic gin_trgm_ops);

-- ============================================================================
-- 2. ARTICLES (tabela `articles`, colunas camelCase)
-- ============================================================================

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

UPDATE articles
SET "searchVector" =
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('portuguese', array_to_string(coalesce(tags, '{}'::text[]), ' ')), 'C') ||
  setweight(to_tsvector('portuguese', array_to_string(coalesce(authors, '{}'::text[]), ' ')), 'C')
WHERE "searchVector" IS NULL OR "searchVector" = ''::tsvector;

CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('portuguese', array_to_string(coalesce(NEW.tags, '{}'::text[]), ' ')), 'C') ||
    setweight(to_tsvector('portuguese', array_to_string(coalesce(NEW.authors, '{}'::text[]), ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_search_vector_trigger ON articles;
CREATE TRIGGER articles_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, summary, content, tags, authors
  ON articles
  FOR EACH ROW
  EXECUTE FUNCTION articles_search_vector_update();

DROP INDEX IF EXISTS articles_search_vector_idx;
CREATE INDEX articles_search_vector_idx ON articles USING GIN ("searchVector");

DROP INDEX IF EXISTS articles_title_trgm_idx;
CREATE INDEX articles_title_trgm_idx ON articles USING GIN (title gin_trgm_ops);
DROP INDEX IF EXISTS articles_tags_gin_idx;
CREATE INDEX articles_tags_gin_idx ON articles USING GIN (tags);

-- ============================================================================
-- 3. GROUPS (tabela `groups`, colunas camelCase)
-- ============================================================================

ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

UPDATE groups
SET "searchVector" =
  setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(slug, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(tradition, '')), 'C')
WHERE "searchVector" IS NULL OR "searchVector" = ''::tsvector;

CREATE OR REPLACE FUNCTION groups_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.slug, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.tradition, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS groups_search_vector_trigger ON groups;
CREATE TRIGGER groups_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, slug, description, tradition
  ON groups
  FOR EACH ROW
  EXECUTE FUNCTION groups_search_vector_update();

DROP INDEX IF EXISTS groups_search_vector_idx;
CREATE INDEX groups_search_vector_idx ON groups USING GIN ("searchVector");

DROP INDEX IF EXISTS groups_name_trgm_idx;
CREATE INDEX groups_name_trgm_idx ON groups USING GIN (name gin_trgm_ops);

-- ============================================================================
-- 4. SPIRITUAL PROFILES (tabela `spiritual_profiles`, colunas camelCase)
-- ============================================================================

ALTER TABLE spiritual_profiles
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

UPDATE spiritual_profiles
SET "searchVector" =
  setweight(to_tsvector('portuguese', coalesce("birthName", '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(bio, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce("signoSolar", '')), 'C') ||
  setweight(to_tsvector('portuguese', coalesce("oduNascimento", '')), 'C') ||
  setweight(to_tsvector('portuguese', coalesce("orixaRegente", '')), 'C')
WHERE "searchVector" IS NULL OR "searchVector" = ''::tsvector;

CREATE OR REPLACE FUNCTION spiritual_profiles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', coalesce(NEW."birthName", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW."signoSolar", '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW."oduNascimento", '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW."orixaRegente", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spiritual_profiles_search_vector_trigger ON spiritual_profiles;
CREATE TRIGGER spiritual_profiles_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "birthName", bio, "signoSolar", "oduNascimento", "orixaRegente"
  ON spiritual_profiles
  FOR EACH ROW
  EXECUTE FUNCTION spiritual_profiles_search_vector_update();

DROP INDEX IF EXISTS spiritual_profiles_search_vector_idx;
CREATE INDEX spiritual_profiles_search_vector_idx ON spiritual_profiles USING GIN ("searchVector");

DROP INDEX IF EXISTS spiritual_profiles_birth_name_trgm_idx;
CREATE INDEX spiritual_profiles_birth_name_trgm_idx ON spiritual_profiles USING GIN ("birthName" gin_trgm_ops);

-- ============================================================================
-- 5. VERIFICAÇÃO
-- ============================================================================

DO $$
DECLARE
  ok_posts BOOLEAN;
  ok_articles BOOLEAN;
  ok_groups BOOLEAN;
  ok_profiles BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='searchVector') INTO ok_posts;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='searchVector') INTO ok_articles;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='searchVector') INTO ok_groups;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spiritual_profiles' AND column_name='searchVector') INTO ok_profiles;

  RAISE NOTICE 'searchVector columns exist: posts=%, articles=%, groups=%, profiles=%',
    ok_posts, ok_articles, ok_groups, ok_profiles;
END $$;

-- D-XXX: Multi-tenant core (estende D-041)
-- Aprovado 2026-06-23 (vision realignment session).
-- Ver apps/akasha-portal/prisma/designs/D-XXX-schema-multitenant-consulente.md
-- e docs/adrs/0004-multi-tenant-consulente-mcp.md.
--
-- Estende D-041 (Caminhante + Caminhada, ja deployed em 2026-06-22).
-- Adiciona 5 models novos para suportar o Akasha como ferramenta do Zelador:
--   - sessoes             (cada consulta/chat com o consulente)
--   - sessao_chunks       (chunks embeddings da sessao, 768d via pgvector)
--   - grimorios_pessoais  (grimorio pessoal DO Zelador, nao do consulente)
--   - notas_consulentes   (notas do Zelador sobre um consulente especifico)
--   - mapas_calculo       (cache dos 7 Pilares calculados por (zelador, caminhada))
--
-- IMPORTANT: PG ENUMs must be created BEFORE tables that reference them
-- (Postgres raises `type "X" does not exist` otherwise). Same applies to
-- the new tables being created in dependency order: enum -> child -> parent
-- -> FK targets must already exist. Here all FKs target tables created
-- earlier (akasha_users, caminhantes, caminhadas) so the only order
-- constraint is enum creation FIRST.
--
-- IMPORTANT: All tables are EMPTY in production (no data migration needed).
-- This is an additive migration. No destructive changes to existing models.
--
-- IMPORTANT: Reverse relations on User and Caminhada (Prisma-side) do NOT
-- require SQL. They live in the generated client and the future
-- schema.prisma update that the Zelador will apply manually after
-- approval (per apps/akasha-portal/prisma/AGENTS.md protocol).
--
-- IMPORTANT: This migration is PROPOSAL-ONLY. The Zelador will run
-- `pnpm exec prisma migrate dev --name XXX_001_multitenant_core` after
-- approving D-XXX. Per apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovacao humana explicita."

-- ─── Enums (created FIRST so tables below can reference them) ────────────────

-- TipoSessao: D-043 classification of a Zelador session.
CREATE TYPE "TipoSessao" AS ENUM (
    'Apresentacao',
    'Leitura',
    'Ritual',
    'Aconselhamento',
    'Integracao'
);

-- StatusSessao: lifecycle of a session.
CREATE TYPE "StatusSessao" AS ENUM (
    'aberta',
    'fechada'
);

-- CategoriaNota: kind of note a Zelador writes about a consulente.
CREATE TYPE "CategoriaNota" AS ENUM (
    'observacao',
    'prescricao',
    'ritual',
    'firmeza',
    'intercorrencia'
);

-- ─── Tabelas novas (ordem: leaf -> root-friendly for FK resolution) ──────────

-- sessoes: each chat/consultation between Zelador and a consulente (Caminhada).
-- FK targets: akasha_users (zelador), caminhadas (caminhada).
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "caminhadaId" TEXT NOT NULL,
    "tipo" "TipoSessao" NOT NULL,
    "status" "StatusSessao" NOT NULL DEFAULT 'aberta',
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- sessao_chunks: chunked embeddings (pgvector, 768d) of session content.
-- FK targets: akasha_users (zelador), sessoes (sessao, just created above).
CREATE TABLE "sessao_chunks" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "embedding" vector(768),
    "origem" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessao_chunks_pkey" PRIMARY KEY ("id")
);

-- grimorios_pessoais: Zelador's own grimoire (his methods, prescriptions, bibliography).
-- UNIQUE per Zelador (1:1) — D-XXX.4: scoped by Zelador, NOT by consulente.
-- FK targets: akasha_users (zelador).
CREATE TABLE "grimorios_pessoais" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "prescricoes" TEXT,
    "notasInternas" TEXT,
    "bibliografia" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grimorios_pessoais_pkey" PRIMARY KEY ("id")
);

-- notas_consulentes: notes about a specific consulente (Caminhada).
-- FK targets: akasha_users (zelador), caminhadas (caminhada).
CREATE TABLE "notas_consulentes" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "caminhadaId" TEXT NOT NULL,
    "categoria" "CategoriaNota" NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "contexto" JSONB,
    "tags" TEXT[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_consulentes_pkey" PRIMARY KEY ("id")
);

-- mapas_calculo: cache of the 7 Pilares (computado por (zelador, caminhada)).
-- UNIQUE per (zeladorId, caminhadaId) — D-XXX.7: avoid recomputing on every query.
-- FK targets: akasha_users (zelador), caminhadas (caminhada).
CREATE TABLE "mapas_calculo" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "caminhadaId" TEXT NOT NULL,
    "cabala" JSONB,
    "astrologia" JSONB,
    "tantra" JSONB,
    "odu" JSONB,
    "iching" JSONB,
    "pilar6" JSONB,
    "pilar7" JSONB,
    "setores" JSONB,
    "versaoCalculo" TEXT NOT NULL,
    "calculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mapas_calculo_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

-- sessoes indexes (per D-XXX spec)
-- Listing by consulente: most common access pattern (open current session, history).
CREATE INDEX "sessoes_zeladorId_caminhadaId_abertoEm_idx"
    ON "sessoes"("zeladorId", "caminhadaId", "abertoEm");
-- Dashboard of open sessions across all consulentes.
CREATE INDEX "sessoes_zeladorId_status_idx"
    ON "sessoes"("zeladorId", "status");

-- sessao_chunks indexes (per D-XXX spec)
-- Per-session chunk listing (e.g. when displaying a session's transcript).
CREATE INDEX "sessao_chunks_zeladorId_sessaoId_idx"
    ON "sessao_chunks"("zeladorId", "sessaoId");
-- Tenant-scoped listing (e.g. "all chunks by Zelador").
CREATE INDEX "sessao_chunks_zeladorId_idx"
    ON "sessao_chunks"("zeladorId");
-- NOTE: IVFFlat / HNSW index on `embedding` is created in the FOLLOWING
-- migration (20260624000001_XXX_002_vector_indexes) — see rationale there.

-- grimorios_pessoais indexes
-- UNIQUE on zeladorId (1 grimoire per Zelador) AND serving as the lookup
-- index for `where: { zeladorId }` queries.
CREATE UNIQUE INDEX "grimorios_pessoais_zeladorId_key"
    ON "grimorios_pessoais"("zeladorId");

-- notas_consulentes indexes (per D-XXX spec)
-- Listing by consulente + category (e.g. "all prescreicoes for Maria").
CREATE INDEX "notas_consulentes_zeladorId_caminhadaId_categoria_idx"
    ON "notas_consulentes"("zeladorId", "caminhadaId", "categoria");
-- Chronological feed (recent activity for a Zelador).
CREATE INDEX "notas_consulentes_zeladorId_atualizadoEm_idx"
    ON "notas_consulentes"("zeladorId", "atualizadoEm");

-- mapas_calculo indexes (per D-XXX spec)
-- UNIQUE on (zeladorId, caminhadaId) — guarantees the cache constraint
-- (1 MapaCalculo per (zelador, caminhada) pair).
CREATE UNIQUE INDEX "mapas_calculo_zeladorId_caminhadaId_key"
    ON "mapas_calculo"("zeladorId", "caminhadaId");
-- Cache invalidation lookup: "all maps computed with version v1".
CREATE INDEX "mapas_calculo_zeladorId_versaoCalculo_idx"
    ON "mapas_calculo"("zeladorId", "versaoCalculo");

-- ─── Foreign keys ───────────────────────────────────────────────────────────

-- sessoes FKs
ALTER TABLE "sessoes"
    ADD CONSTRAINT "sessoes_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessoes"
    ADD CONSTRAINT "sessoes_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- sessao_chunks FKs
ALTER TABLE "sessao_chunks"
    ADD CONSTRAINT "sessao_chunks_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessao_chunks"
    ADD CONSTRAINT "sessao_chunks_sessaoId_fkey"
    FOREIGN KEY ("sessaoId") REFERENCES "sessoes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- grimorios_pessoais FKs
ALTER TABLE "grimorios_pessoais"
    ADD CONSTRAINT "grimorios_pessoais_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- notas_consulentes FKs
ALTER TABLE "notas_consulentes"
    ADD CONSTRAINT "notas_consulentes_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notas_consulentes"
    ADD CONSTRAINT "notas_consulentes_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- mapas_calculo FKs
ALTER TABLE "mapas_calculo"
    ADD CONSTRAINT "mapas_calculo_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mapas_calculo"
    ADD CONSTRAINT "mapas_calculo_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

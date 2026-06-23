-- D-XXX: Multi-tenant core tables (Wave 3).
-- Estende D-041 (Caminhante + Caminhada ja deployed) com 5 models novos
-- para suportar a visao Zelador-tool (Akasha = ferramenta de trabalho
-- do Zelador; consulentes = MCP logico por sessao).
--
-- Ver:
--   docs/25_visao-akasha.md (visao revisada 2026-06-23)
--   docs/adrs/0004-multi-tenant-consulente-mcp.md (ADR 0004, accepted)
--   apps/akasha-portal/prisma/designs/D-XXX-schema-multitenant-consulente.md
--
-- IMPORTANTE: PG ENUMs sao criados ANTES das tabelas que os referenciam,
-- caso contrario o DDL falha. Ordem deste arquivo:
--   1. ENUMs (TipoSessao, StatusSessao, CategoriaNota)
--   2. Tabelas (sessoes, sessao_chunks, grimorios_pessoais, notas_consulentes, mapas_calculo)
--   3. Indexes
--   4. Foreign keys
--
-- Sem mudanca destrutiva em models existentes. Migration aditiva.

-- =========================================================================
-- 1. ENUMS (DEVEM VIR ANTES DAS TABELAS)
-- =========================================================================

-- TipoSessao: tipo de consulta/chat (Apresentacao | Leitura | Ritual | ...)
CREATE TYPE "TipoSessao" AS ENUM (
    'Apresentacao',
    'Leitura',
    'Ritual',
    'Aconselhamento',
    'Integracao'
);

-- StatusSessao: ciclo de vida de uma sessao
CREATE TYPE "StatusSessao" AS ENUM (
    'aberta',
    'fechada'
);

-- CategoriaNota: classificacao de notas por consulente
CREATE TYPE "CategoriaNota" AS ENUM (
    'observacao',
    'prescricao',
    'ritual',
    'firmeza',
    'intercorrencia'
);

-- =========================================================================
-- 2. TABELAS
-- =========================================================================

-- sessoes: cada consulta/chat do Zelador com um consulente (Caminhada)
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

-- sessao_chunks: chunks embeddings da sessao (768d vector via pgvector)
-- NOTA: indice IVFFlat/HNSW e criado via raw SQL na migration 002
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

-- grimorios_pessoais: grimorio pessoal DO ZELADOR (nao por consulente)
-- Por design: 1:1 com Zelador (UNIQUE em zeladorId). Guarda metodos/prescricoes/
-- bibliografia do Zelador. Notas ESPECIFICAS de consulentes vao em
-- notas_consulentes. Ver D-XXX.4 no design proposal.
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

-- notas_consulentes: notas do Zelador sobre um consulente (Caminhada)
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

-- mapas_calculo: cache dos 7 Pilares calculados por (zelador, caminhada)
-- 1 calculo por consulente (UNIQUE em zeladorId+caminhadaId). Ver D-XXX.7.
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

-- =========================================================================
-- 3. INDEXES
-- =========================================================================

-- sessoes
CREATE INDEX "sessoes_zeladorId_caminhadaId_abertoEm_idx"
    ON "sessoes"("zeladorId", "caminhadaId", "abertoEm");
CREATE INDEX "sessoes_zeladorId_status_idx"
    ON "sessoes"("zeladorId", "status");

-- sessao_chunks
CREATE INDEX "sessao_chunks_zeladorId_sessaoId_idx"
    ON "sessao_chunks"("zeladorId", "sessaoId");
CREATE INDEX "sessao_chunks_zeladorId_idx"
    ON "sessao_chunks"("zeladorId");
-- NOTA: indice IVFFlat ou HNSW para embedding e criado via raw SQL na
-- migration 002 (Prisma nao suporta esses tipos de indice nativamente).

-- grimorios_pessoais: 1:1 com Zelador (UNIQUE)
CREATE UNIQUE INDEX "grimorios_pessoais_zeladorId_key"
    ON "grimorios_pessoais"("zeladorId");

-- notas_consulentes
CREATE INDEX "notas_consulentes_zeladorId_caminhadaId_categoria_idx"
    ON "notas_consulentes"("zeladorId", "caminhadaId", "categoria");
CREATE INDEX "notas_consulentes_zeladorId_atualizadoEm_idx"
    ON "notas_consulentes"("zeladorId", "atualizadoEm");

-- mapas_calculo: 1 calculo por (zelador, caminhada)
CREATE UNIQUE INDEX "mapas_calculo_zeladorId_caminhadaId_key"
    ON "mapas_calculo"("zeladorId", "caminhadaId");
CREATE INDEX "mapas_calculo_zeladorId_versaoCalculo_idx"
    ON "mapas_calculo"("zeladorId", "versaoCalculo");

-- =========================================================================
-- 4. FOREIGN KEYS
-- =========================================================================

-- sessoes
ALTER TABLE "sessoes"
    ADD CONSTRAINT "sessoes_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessoes"
    ADD CONSTRAINT "sessoes_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- sessao_chunks
ALTER TABLE "sessao_chunks"
    ADD CONSTRAINT "sessao_chunks_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessao_chunks"
    ADD CONSTRAINT "sessao_chunks_sessaoId_fkey"
    FOREIGN KEY ("sessaoId") REFERENCES "sessoes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- grimorios_pessoais
ALTER TABLE "grimorios_pessoais"
    ADD CONSTRAINT "grimorios_pessoais_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- notas_consulentes
ALTER TABLE "notas_consulentes"
    ADD CONSTRAINT "notas_consulentes_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notas_consulentes"
    ADD CONSTRAINT "notas_consulentes_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- mapas_calculo
ALTER TABLE "mapas_calculo"
    ADD CONSTRAINT "mapas_calculo_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mapas_calculo"
    ADD CONSTRAINT "mapas_calculo_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

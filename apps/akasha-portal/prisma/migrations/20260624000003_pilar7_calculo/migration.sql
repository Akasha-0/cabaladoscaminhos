-- D-ZZZ: Pilar 7 — Espectro de Transformacao (Wave 4)
-- Aprovado 2026-06-23 (vision realignment session).
-- Ver apps/akasha-portal/prisma/designs/D-ZZZ-pilar-7-espectro-transformacao-traduzido.md
-- e docs/adrs/0002-pilares-6-7-human-design-gene-keys.md.
--
-- Adiciona Pilar 7 (traducao universalista do Gene Keys — ver
-- Guardrails 1-4 do ADR 0002): captura a funcao do espectro
-- sombra → dom → siddhi aplicado as 64 portas (= 64 hexagramas do
-- I Ching, ja em Pilar 5), sem copiar terminologia especifica, Venus
-- Sequence, Golden Pathway ou textos das chaves.
--
--   - EstagioTransformacao (3 estagios: sombra, dom, siddhi)
--   - pilar7_calculos (1 calculo por (zelador, caminhada, versaoCalculo))
--   - pilar7_estagios (cada chave em cada estagio para um consulente)
--
-- Sinergia com Pilar 5 (I Ching — D-ZZZ §"Sinergia com Pilar 5"):
-- a numeracao das 64 chaves Gene Keys = a numeracao dos 64 hexagramas
-- I Ching (King Wen sequence). Pilar 7 reusa Pilar 5.
--
-- IMPORTANT: PG ENUMs must be created BEFORE tables that reference them
-- (Postgres raises `type "X" does not exist` otherwise). Same applies to
-- the new tables being created in dependency order: enum -> parent table
-- -> child table -> FK targets must already exist. Here all FKs target
-- tables created earlier (akasha_users, caminhadas, pilar7_calculos) so
-- the order constraint is enum creation FIRST, then pilar7_calculos
-- (parent), then pilar7_estagios (child).
--
-- IMPORTANT: All tables are EMPTY in production (no data migration needed).
-- This is an additive migration. No destructive changes to existing models.
--
-- IMPORTANT: Reverse relations on User (Prisma-side) do NOT require SQL.
-- They live in the generated client and the future schema.prisma update
-- that the Zelador will apply manually after approval (per
-- apps/akasha-portal/prisma/AGENTS.md protocol).
--
-- IMPORTANT: This migration is PROPOSAL-ONLY. The Zelador will run
-- `pnpm exec prisma migrate dev --name pilar7_calculo` after
-- approving D-ZZZ. Per apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovacao humana explicita."

-- ─── Enums (created FIRST so tables below can reference them) ────────────────

-- EstagioTransformacao: 3 estagios do espectro de transformacao (D-ZZZ §"Estrutura conceitual").
-- Termos sao tradicao antiga, nao-protegiveis (D-ZZZ.1).
CREATE TYPE "EstagioTransformacao" AS ENUM (
    'sombra',      -- o que te prende (medo, sombra, padrao destrutivo)
    'dom',         -- o que voce pode brilhar (presente, dom cultivado)
    'siddhi'       -- a transcendencia (quando transcende o dom, vira sabedoria pura)
);

-- ─── Tabela pilar7_calculos (parent — criada antes do filho) ────────────────

-- pilar7_calculos: cache do Pilar 7 calculado por (zelador, caminhada).
-- UNIQUE por (zeladorId, caminhadaId, versaoCalculo) — D-ZZZ §3.1.
-- FK targets: akasha_users (zelador), caminhadas (caminhada).
CREATE TABLE "pilar7_calculos" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "caminhadaId" TEXT NOT NULL,
    "chaveNumero" INTEGER NOT NULL,                              -- 1-64 (I Ching gate)
    "chaveNome" TEXT NOT NULL,                                   -- nome proprio (do zero — Guardrail 2)
    "estagioAtual" "EstagioTransformacao" NOT NULL,              -- onde esta HOJE
    "textoSombra" TEXT NOT NULL,                                 -- texto proprio (do zero — Guardrail 2)
    "textoDom" TEXT NOT NULL,
    "textoSiddhi" TEXT NOT NULL,
    "versaoCalculo" TEXT NOT NULL,                               -- ex: "v1"
    "calculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilar7_calculos_pkey" PRIMARY KEY ("id")
);

-- ─── Tabela pilar7_estagios (child — referencia pilar7_calculos) ────────────

-- pilar7_estagios: cada chave em cada estagio para um consulente.
-- N chaves × 3 estagios = N × 3 linhas por calculo.
-- FK targets: akasha_users (zelador), pilar7_calculos (calculo).
CREATE TABLE "pilar7_estagios" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "calculoId" TEXT NOT NULL,                                   -- FK para pilar7_calculos
    "chaveNumero" INTEGER NOT NULL,                              -- 1-64 (corresponde a hexagrama I Ching)
    "chaveNome" TEXT NOT NULL,                                   -- nome proprio (do zero — Guardrail 2)
    "estagio" "EstagioTransformacao" NOT NULL,                   -- qual dos 3 estagios
    "texto" TEXT NOT NULL,                                       -- texto proprio (do zero — Guardrail 2)
    "sequencePosition" INTEGER,                                  -- 1-22 (Sequence Venusiana — 22 chaves)
    "pathwayPosition" INTEGER,                                   -- 1-11 (Caminho Dourado — 11 chaves)

    CONSTRAINT "pilar7_estagios_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

-- pilar7_calculos indexes
-- UNIQUE on (zeladorId, caminhadaId, versaoCalculo) — D-ZZZ §3.1.
CREATE UNIQUE INDEX "pilar7_calculos_zeladorId_caminhadaId_versaoCalculo_key"
    ON "pilar7_calculos"("zeladorId", "caminhadaId", "versaoCalculo");
-- Listagem historica de calculos por caminhada.
CREATE INDEX "pilar7_calculos_zeladorId_caminhadaId_calculadoEm_idx"
    ON "pilar7_calculos"("zeladorId", "caminhadaId", "calculadoEm");
-- Cache invalidation lookup: "todos os mapas com versao v1".
CREATE INDEX "pilar7_calculos_zeladorId_versaoCalculo_idx"
    ON "pilar7_calculos"("zeladorId", "versaoCalculo");

-- pilar7_estagios indexes
-- Listagem dos estagios de um calculo especifico.
CREATE INDEX "pilar7_estagios_zeladorId_calculoId_idx"
    ON "pilar7_estagios"("zeladorId", "calculoId");
-- Listagem de uma chave especifica para o Zelador (timeline daquela chave).
CREATE INDEX "pilar7_estagios_zeladorId_chaveNumero_idx"
    ON "pilar7_estagios"("zeladorId", "chaveNumero");

-- ─── Foreign keys ───────────────────────────────────────────────────────────

-- pilar7_calculos FKs
ALTER TABLE "pilar7_calculos"
    ADD CONSTRAINT "pilar7_calculos_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pilar7_calculos"
    ADD CONSTRAINT "pilar7_calculos_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- pilar7_estagios FKs
ALTER TABLE "pilar7_estagios"
    ADD CONSTRAINT "pilar7_estagios_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pilar7_estagios"
    ADD CONSTRAINT "pilar7_estagios_calculoId_fkey"
    FOREIGN KEY ("calculoId") REFERENCES "pilar7_calculos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
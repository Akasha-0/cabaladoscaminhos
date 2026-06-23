-- D-YYY: Pilar 6 — Mapa Energetico Integrado (Wave 4)
-- Aprovado 2026-06-23 (vision realignment session).
-- Ver apps/akasha-portal/prisma/designs/D-YYY-pilar-6-mapa-energetico-traduzido.md
-- e docs/adrs/0002-pilares-6-7-human-design-gene-keys.md.
--
-- Adiciona Pilar 6 (traducao universalista do Human Design — ver
-- Guardrails 1-4 do ADR 0002): captura a funcao de correlacionar mapas
-- por tipo de energia + estrategia + autoridade + centros, sem copiar
-- terminologia, estrutura ou visualizacao proprietarias.
--
--   - TipoEnergetico (4 tipos renomeados: iniciador, guia, iniciador_aberto, refletor)
--   - EstrategiaEnergetica (4 estrategias: esperar_convite, informar, iniciar, esperar_ciclo_lunar)
--   - AutoridadeEnergetica (6 autoridades internas)
--   - CentroEnergetico (9 centros: inspiracao, mental, manifestacao, identidade,
--                        vontade, emocoes, vitalidade, sobrevivencia, fundamentacao)
--   - pilar6_calculos (1 calculo por (zelador, caminhada, versaoCalculo))
--
-- IMPORTANT: PG ENUMs must be created BEFORE tables that reference them
-- (Postgres raises `type "X" does not exist` otherwise). Same applies to
-- the new tables being created in dependency order: enum -> table ->
-- FK targets must already exist. Here all FKs target tables created
-- earlier (akasha_users, caminhadas) so the only order constraint is
-- enum creation FIRST.
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
-- `pnpm exec prisma migrate dev --name pilar6_calculo` after
-- approving D-YYY. Per apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovacao humana explicita."

-- ─── Enums (created FIRST so tables below can reference them) ────────────────

-- TipoEnergetico: 4 tipos energeticos renomeados (D-YYY §1, Guardrail 1 do ADR 0002).
-- Nomes sao universalistas, sem qualquer referencia a marcas proprietarias.
CREATE TYPE "TipoEnergetico" AS ENUM (
    'iniciador',           -- ex-Human Design Generator: energia sustentada, responde ao mundo
    'guia',                -- ex-Human Design Projector: energia focal, guia outros
    'iniciador_aberto',    -- ex-Human Design Manifestor: energia de comecar, impacta primeiro
    'refletor'             -- ex-Human Design Reflector: energia lunar, amostra ambientes
);

-- EstrategiaEnergetica: 4 estrategias baseadas em COMO o tipo interage com o mundo.
CREATE TYPE "EstrategiaEnergetica" AS ENUM (
    'esperar_convite',         -- ex-To Respond: reage ao mundo, responde a chamados
    'informar',                -- ex-To Inform: impacta atraves de informacao, nao forca
    'iniciar',                 -- ex-To Initiate: comeca coisas, sem pedir permissao
    'esperar_ciclo_lunar'      -- ex-To Wait (lunar): espera o ciclo lunar (29 dias) para decisao
);

-- AutoridadeEnergetica: 6 autoridades internas baseadas em timing biologico.
-- Algumas ja temos em D-041 (emocional, esplenica, cardiaca) — reuso intencional.
CREATE TYPE "AutoridadeEnergetica" AS ENUM (
    'emocional',           -- ondas emocionais (clarify apos sleep)
    'sacral',              -- resposta gut imediata
    'esplenica',           -- instinto presente (nao sustentado)
    'cardiaca',            -- "quem sou eu?" — vontade
    'identidade',          -- direcao de vida (ambientes)
    'lunar'                -- ciclo de 29 dias
);

-- CentroEnergetico: 9 centros energeticos baseados em I Ching + Cabala + Tantra
-- (D-YYY §1.4 — Guardrail 3 do ADR 0002: visualizacao propria).
CREATE TYPE "CentroEnergetico" AS ENUM (
    'inspiracao',          -- Cabala (Keter)
    'mental',              -- Cabala (Hokhmah/Binah)
    'manifestacao',        -- I Ching (canal de expressao)
    'identidade',          -- Astrologia (Ascendente)
    'vontade',             -- Tantra (Anahata)
    'emocoes',             -- Tantra (Manipura)
    'vitalidade',          -- Tantra (Svadhisthana)
    'sobrevivencia',       -- Tantra (Muladhara, instinto)
    'fundamentacao'        -- Tantra (Muladhara, base)
);

-- ─── Tabela pilar6_calculos ──────────────────────────────────────────────────

-- pilar6_calculos: cache do Pilar 6 calculado por (zelador, caminhada).
-- UNIQUE por (zeladorId, caminhadaId, versaoCalculo) — D-YYY.6: 1 calculo por versao.
-- FK targets: akasha_users (zelador), caminhadas (caminhada).
CREATE TABLE "pilar6_calculos" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "caminhadaId" TEXT NOT NULL,
    "tipo" "TipoEnergetico" NOT NULL,
    "estrategia" "EstrategiaEnergetica" NOT NULL,
    "autoridade" "AutoridadeEnergetica",
    "centrosDefinidos" "CentroEnergetico"[] NOT NULL DEFAULT ARRAY[]::"CentroEnergetico"[],
    "versaoCalculo" TEXT NOT NULL,
    "calculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilar6_calculos_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

-- UNIQUE on (zeladorId, caminhadaId, versaoCalculo) — D-YYY.6: cache por versao.
CREATE UNIQUE INDEX "pilar6_calculos_zeladorId_caminhadaId_versaoCalculo_key"
    ON "pilar6_calculos"("zeladorId", "caminhadaId", "versaoCalculo");
-- Listagem historica de calculos por caminhada (timeline de recalculos).
CREATE INDEX "pilar6_calculos_zeladorId_caminhadaId_calculadoEm_idx"
    ON "pilar6_calculos"("zeladorId", "caminhadaId", "calculadoEm");
-- Cache invalidation lookup: "todos os mapas com versao v1".
CREATE INDEX "pilar6_calculos_zeladorId_versaoCalculo_idx"
    ON "pilar6_calculos"("zeladorId", "versaoCalculo");

-- ─── Foreign keys ───────────────────────────────────────────────────────────

-- pilar6_calculos FKs
ALTER TABLE "pilar6_calculos"
    ADD CONSTRAINT "pilar6_calculos_zeladorId_fkey"
    FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pilar6_calculos"
    ADD CONSTRAINT "pilar6_calculos_caminhadaId_fkey"
    FOREIGN KEY ("caminhadaId") REFERENCES "caminhadas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
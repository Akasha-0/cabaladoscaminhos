-- ============================================================================
-- WAVE 32.2 — Benchmark Annotation (Inter-Annotator Calibration AUT)
-- ----------------------------------------------------------------------------
-- Migration: WAVE-32-2-benchmark-annotation
-- Status:   PROPOSAL ONLY (per prisma/AGENTS.md D1)
--           Aplicar com: pnpm exec prisma migrate dev --name benchmark-annotation
--           Reversível:  pnpm exec prisma migrate resolve --rolled-back
--
-- Tabela `benchmark_annotations` persiste scores humanos R/T/U/V para validar
-- construct validity dos 4 critérios AUT definidos em ADR-027 e implementados
-- em @akasha/benchmarks (Wave 31.3). Cada anotador anota cada response
-- exatamente uma vez (constraint unique).
--
-- Design:
--   - responseId é FK para chat_messages (Mentor response), com onDelete: Cascade
--     porque se a conversation for deletada, as annotations também devem ser
--     (LGPD: quando o titular pede direito ao esquecimento, derivative data
--     segue — Art. 18 §V).
--   - annotatorId é FK para users (precisa User ADMIN role para anotar; ver
--     aplicação em /api/admin/benchmarks/annotate/route.ts).
--   - 4 scores Int 0-10 — Likert ordinal padrão para AI eval benchmarks
--     (BIG-bench, HHH usam 1-5 ou 1-7; escolhemos 0-10 para granularidade).
--   - notes Text? — campo opcional para observações qualitativas do anotador.
--   - annotatedAt default now() — timestamp da submission.
--   - @@unique([responseId, annotatorId]) — uma annotation por (response, anotador).
--   - @@index([annotatorId]) — query "todas as annotations de um anotador".
--   - @@index([responseId]) — query "todos os scores de uma response".
--
-- LGPD:
--   - Respeita workspaceId através do FK em cascata (annotations herdam workspace
--     via chat_messages.consultation.user.workspaceId).
--   - Não expõe PII ao anotador: app layer redata antes de servir para a UI
--     (ver /api/admin/benchmarks/annotate?action=list, função redactForAnnotation).
--   - FK onDelete: Cascade garante que com soft-delete de User (Wave 19.2), as
--     annotations seguem (porque hard-delete é o caminho legal para LGPD).
-- ============================================================================

CREATE TABLE "benchmark_annotations" (
    "id"            TEXT NOT NULL,
    "responseId"    TEXT NOT NULL,
    "annotatorId"   TEXT NOT NULL,
    "rScore"        INTEGER NOT NULL,
    "tScore"        INTEGER NOT NULL,
    "uScore"        INTEGER NOT NULL,
    "vScore"        INTEGER NOT NULL,
    "notes"         TEXT,
    "annotatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_annotations_pkey" PRIMARY KEY ("id")
);

-- Constraint de integridade: scores entre 0 e 10
ALTER TABLE "benchmark_annotations"
    ADD CONSTRAINT "benchmark_annotations_rScore_check"
    CHECK ("rScore" >= 0 AND "rScore" <= 10);
ALTER TABLE "benchmark_annotations"
    ADD CONSTRAINT "benchmark_annotations_tScore_check"
    CHECK ("tScore" >= 0 AND "tScore" <= 10);
ALTER TABLE "benchmark_annotations"
    ADD CONSTRAINT "benchmark_annotations_uScore_check"
    CHECK ("uScore" >= 0 AND "uScore" <= 10);
ALTER TABLE "benchmark_annotations"
    ADD CONSTRAINT "benchmark_annotations_vScore_check"
    CHECK ("vScore" >= 0 AND "vScore" <= 10);

-- Constraint única: 1 anotação por (response, anotador)
CREATE UNIQUE INDEX "benchmark_annotations_responseId_annotatorId_key"
    ON "benchmark_annotations"("responseId", "annotatorId");

-- Índices de query
CREATE INDEX "benchmark_annotations_annotatorId_idx"
    ON "benchmark_annotations"("annotatorId");
CREATE INDEX "benchmark_annotations_responseId_idx"
    ON "benchmark_annotations"("responseId");

-- Foreign keys
ALTER TABLE "benchmark_annotations"
    ADD CONSTRAINT "benchmark_annotations_responseId_fkey"
    FOREIGN KEY ("responseId") REFERENCES "chat_messages"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "benchmark_annotations"
    ADD CONSTRAINT "benchmark_annotations_annotatorId_fkey"
    FOREIGN KEY ("annotatorId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Wave 13.5: FeedbackEntry — thumbs up/down em respostas do Mentor.
--
-- Ver apps/akasha-portal/prisma/schema.prisma (model FeedbackEntry, enum
-- FeedbackRating). Commit schema-modify-only: ba9704ba. Migration não aplicada.
--
-- Decisões de design (LGPD by design):
--  - Payload do feedback é ANÔNIMO (sem userId no client). userId vem do
--    JWT no server, garantindo auditoria interna e previnindo voto
--    duplicado via `@@unique([userId, messageId])`.
--  - messageId é string opaca (uuid local da mensagem) — não carrega o
--    conteúdo da mensagem. Nenhuma PII no payload.
--  - comment é opcional e limitado a 500 chars (enforced em application layer).
--  - Cascade com User: se User é deletado, feedbacks vão junto (consistente
--    com o resto do schema; feedback é derivativo da atividade do user).
--
-- IMPORTANT: PG ENUMs must be created BEFORE tables that reference them.
--
-- IMPORTANT: Tabela é VAZIA em produção (greenfield Wave 13.5). Sem
-- necessidade de data migration.
--
-- IMPORTANT: Esta migration é PROPOSAL-ONLY. Gabriel roda
-- `pnpm exec prisma migrate deploy` após review.
-- Ver apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovação humana explícita."

-- ─── Enums (created FIRST) ──────────────────────────────────────────────────

-- FeedbackRating: voto do usuário em uma resposta do Mentor.
-- Binário (up/down) — Wave 13.5 v1; Wave futura pode adicionar escala 1-5.
CREATE TYPE "FeedbackRating" AS ENUM (
    'up',
    'down'
);

-- ─── Tabela feedback_entries ────────────────────────────────────────────────

-- feedback_entries: cada voto (up/down) de um user em uma mensagem do Mentor.
-- messageId é opaco (uuid local client-side) — NÃO é FK para ChatMessage
-- intencionalmente (o user pode votar em mensagens que já foram purgadas
-- após o ciclo de retenção LGPD; o voto agregado é preservado).
CREATE TABLE "feedback_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "rating" "FeedbackRating" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_entries_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

-- UNIQUE em (userId, messageId) — previne voto duplicado. 1 user pode
-- votar 1 vez em cada messageId; para mudar o voto, faz PATCH (UPSERT).
CREATE UNIQUE INDEX "feedback_entries_userId_messageId_key"
    ON "feedback_entries"("userId", "messageId");

-- Listing por user (timeline de feedback do user — admin debug).
CREATE INDEX "feedback_entries_userId_idx"
    ON "feedback_entries"("userId");

-- Listing por messageId (agregação por mensagem — calcula thumbs ratio).
CREATE INDEX "feedback_entries_messageId_idx"
    ON "feedback_entries"("messageId");

-- Time-series (últimos N votos — feedback live dashboard Wave 14+).
CREATE INDEX "feedback_entries_createdAt_idx"
    ON "feedback_entries"("createdAt" DESC);

-- ─── Foreign keys ──────────────────────────────────────────────────────────

-- feedback_entries.userId → akasha_users(id)
ALTER TABLE "feedback_entries"
    ADD CONSTRAINT "feedback_entries_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Comentários para audit (DB-level docs) ────────────────────────────────

COMMENT ON TABLE "feedback_entries" IS
  'Wave 13.5 — thumbs up/down em respostas do Mentor. LGPD: payload anônimo, userId só no banco.';
COMMENT ON COLUMN "feedback_entries"."messageId" IS
  'id opaco da mensagem do Mentor (uuid local client-side). NÃO FK para ChatMessage — voto agregado é preservado após purge de mensagens.';
COMMENT ON COLUMN "feedback_entries"."comment" IS
  'Comentário livre opcional, ≤500 chars (enforced em application layer). NÃO PII direta.';

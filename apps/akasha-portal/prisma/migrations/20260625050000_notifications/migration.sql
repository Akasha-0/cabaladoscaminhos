-- D-046 (Wave 13.3): In-app notifications inbox.
--
-- Ver apps/akasha-portal/prisma/proposals/D-046-notifications-in-app.md
-- Schema SOMENTE modified (commit fe44fff7) — esta migration é proposta
-- pronta para `pnpm exec prisma migrate deploy`. Nenhuma migration foi
-- aplicada em runtime ainda.
--
-- Decisões:
--  - Tabela `notifications` (sem FK para `zeladorId` — notifications são
--    do PRÓPRIO usuário, single-tenant). FK simples para `akasha_users`.
--  - onDelete: Cascade consistente com `PushSubscription`, `ChatMessage`.
--  - Reverse relation no User é Prisma-only (não gera SQL).
--  - 2 índices cobrem as queries quentes: "não-lidas do user X" e
--    "últimas N do user X (lidas + não-lidas) para o dropdown".
--
-- IMPORTANT: PG ENUMs must be created BEFORE tables that reference them
-- (Postgres raises `type "X" does not exist` otherwise).
--
-- IMPORTANT: Tabela é VAZIA em produção (greenfield Wave 13.3). Sem
-- necessidade de data migration.
--
-- IMPORTANT: Esta migration é PROPOSAL-ONLY. Gabriel roda
-- `pnpm exec prisma migrate deploy` após review.
-- Ver apps/akasha-portal/prisma/AGENTS.md:
--   "NUNCA rodar pnpm exec prisma migrate dev ou pnpm db:push sem
--    aprovação humana explícita."

-- ─── Enums (created FIRST) ──────────────────────────────────────────────────

-- NotificationType: categoria do evento que gerou a notificação.
-- Usado para ícone/cor no bell + filtragem futura em preferences (Wave 14).
CREATE TYPE "NotificationType" AS ENUM (
    'DIARIO',     -- novo Mandato do Dia disponível em /diario
    'MENTOR',     -- resposta assíncrona do Mentor chegou em /oraculo
    'CONEXOES',   -- match em Conexões (compatibilidade alta) ou mensagem de outro usuário
    'CREDITS',    -- saldo de créditos baixo (< 5 créditos)
    'SYSTEM'      -- aviso da plataforma (manutenção, atualização, etc) — sem CTA por default
);

-- ─── Tabela notifications ──────────────────────────────────────────────────

-- notifications: in-app notifications inbox. Cada entry é gerada server-side
-- e consumida pelo Bell (header) + dropdown. Payload NÃO é PII direta
-- (title ≤120 chars, body ≤500 chars, href opcional). userId vem do JWT
-- (single-tenant — sem zeladorId).
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

-- Query principal: "notificações não-lidas do user X ordenadas por mais recente"
-- (Bell badge + dropdown com filtro unread-only).
CREATE INDEX "notifications_userId_readAt_createdAt_idx"
    ON "notifications"("userId", "readAt", "createdAt" DESC);

-- Query "últimas N do user X (lidas + não-lidas) para o dropdown".
CREATE INDEX "notifications_userId_createdAt_idx"
    ON "notifications"("userId", "createdAt" DESC);

-- ─── Foreign keys ──────────────────────────────────────────────────────────

-- notifications.userId → akasha_users(id)
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "akasha_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Comentários para audit (DB-level docs) ────────────────────────────────

COMMENT ON TABLE "notifications" IS
  'D-046 (Wave 13.3) — in-app notifications inbox. Cascade delete com User.';
COMMENT ON COLUMN "notifications"."type" IS
  'Categoria da notificação: ícone/cor no Bell + filtro futuro em preferences.';
COMMENT ON COLUMN "notifications"."href" IS
  'Deep link interno opcional (ex: /meu-dia, /diario/123). null = sem destino.';
COMMENT ON COLUMN "notifications"."readAt" IS
  'null = não lida (mostra badge); set = timestamp de leitura (esconde do badge).';

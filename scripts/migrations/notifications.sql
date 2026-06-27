-- ============================================================================
-- NOTIFICATIONS — Migration aditiva (2026-06-27)
-- ============================================================================
-- Migração aditiva: não destrói dados existentes. Apenas estende o modelo
-- Notification (que já existe) com novos campos e adiciona 3 tabelas novas:
--   * notification_preferences — opt-in/out por usuário e tipo
--   * push_subscriptions — opt-in para Web Push (RFC 8030)
--   * unsubscribe_tokens — tokens opacos pra unsubscribe via email (LGPD)
--
-- Aplicar com:
--   psql "$DATABASE_URL" -f scripts/migrations/notifications.sql
--
-- Mudanças em `notifications`:
--   * Novos campos: entityType, entityId, groupKey, count, actorSnapshot,
--     emailedAt, pushedAt, updatedAt
--   * groupKey UNIQUE por (userId, groupKey) — habilita batch upsert
--   * Novos índices para queries comuns
--   * Backfill: existing rows recebem entityType inferido de postId/commentId/
--     groupId/articleId (quando só um está setado)
-- ============================================================================

-- 1. Novos campos em `notifications` --------------------------------------
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "entityType"    "EntityType",
  ADD COLUMN IF NOT EXISTS "entityId"      TEXT,
  ADD COLUMN IF NOT EXISTS "groupKey"      TEXT,
  ADD COLUMN IF NOT EXISTS "count"         INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "actorSnapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "emailedAt"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "pushedAt"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Backfill entityType para linhas existentes (inferência por FK) -------
-- Só atualiza onde entityType ainda é null E há uma única FK não-nula.
UPDATE "notifications" SET
  "entityType" = CASE
    WHEN "postId"    IS NOT NULL THEN 'POST'::"EntityType"
    WHEN "commentId" IS NOT NULL THEN 'COMMENT'::"EntityType"
    WHEN "groupId"   IS NOT NULL THEN 'GROUP'::"EntityType"
    WHEN "articleId" IS NOT NULL THEN 'ARTICLE'::"EntityType"
    ELSE NULL
  END,
  "entityId" = COALESCE("postId", "commentId", "groupId", "articleId"),
  "groupKey" = CASE
    WHEN "postId" IS NOT NULL THEN 'post:' || "postId" || ':' || "type"::text
    WHEN "commentId" IS NOT NULL THEN 'comment:' || "commentId" || ':' || "type"::text
    WHEN "groupId" IS NOT NULL THEN 'group:' || "groupId" || ':' || "type"::text
    WHEN "articleId" IS NOT NULL THEN 'article:' || "articleId" || ':' || "type"::text
    ELSE NULL
  END
WHERE "entityType" IS NULL;

-- 3. Índices --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "notifications_userId_type_createdAt_idx"
  ON "notifications"("userId", "type", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "notifications_groupKey_idx"
  ON "notifications"("groupKey");

-- 4. Constraint UNIQUE (userId, groupKey) ---------------------------------
-- Permite upsert em batch. groupKey pode ser NULL → multi-nulls são
-- permitidos em Postgres por padrão em UNIQUE (não viola).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_userId_groupKey_key'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_userId_groupKey_key"
      UNIQUE ("userId", "groupKey");
  END IF;
END $$;

-- 5. Tabela notification_preferences -------------------------------------
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL,
  "type"          "NotificationType" NOT NULL,
  "inApp"         BOOLEAN NOT NULL DEFAULT TRUE,
  "email"         BOOLEAN NOT NULL DEFAULT TRUE,
  "push"          BOOLEAN NOT NULL DEFAULT FALSE,
  "weeklyDigest"  BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_userId_type_key"
  ON "notification_preferences"("userId", "type");
CREATE INDEX IF NOT EXISTS "notification_preferences_userId_idx"
  ON "notification_preferences"("userId");

-- 6. Tabela push_subscriptions -------------------------------------------
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL,
  "endpoint"    TEXT NOT NULL,
  "p256dh"      TEXT NOT NULL,
  "auth"        TEXT NOT NULL,
  "userAgent"   TEXT,
  "ipAddress"   TEXT,
  "active"      BOOLEAN NOT NULL DEFAULT TRUE,
  "lastSentAt"  TIMESTAMP(3),
  "lastError"   TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key"
  ON "push_subscriptions"("endpoint");
CREATE INDEX IF NOT EXISTS "push_subscriptions_userId_idx"
  ON "push_subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "push_subscriptions_active_userId_idx"
  ON "push_subscriptions"("active", "userId");

-- 7. Tabela unsubscribe_tokens -------------------------------------------
CREATE TABLE IF NOT EXISTS "unsubscribe_tokens" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "token"     TEXT NOT NULL,
  "type"      TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "unsubscribe_tokens_token_key"
  ON "unsubscribe_tokens"("token");
CREATE INDEX IF NOT EXISTS "unsubscribe_tokens_userId_idx"
  ON "unsubscribe_tokens"("userId");
CREATE INDEX IF NOT EXISTS "unsubscribe_tokens_expiresAt_idx"
  ON "unsubscribe_tokens"("expiresAt");

-- 8. Notas ---------------------------------------------------------------
-- Após aplicar esta migration, sincronize o schema.prisma principal
-- copiando os novos modelos de community.prisma (Notification estendido,
-- NotificationPreference, PushSubscription, UnsubscribeToken) e rode
--   pnpm db:generate
-- para regenerar o Prisma Client com os novos campos.
--
-- Rollback (não aplicar em prod sem backup):
--   DROP TABLE IF EXISTS unsubscribe_tokens;
--   DROP TABLE IF EXISTS push_subscriptions;
--   DROP TABLE IF EXISTS notification_preferences;
--   ALTER TABLE notifications DROP COLUMN IF EXISTS entityType,
--     DROP COLUMN IF EXISTS entityId, DROP COLUMN IF EXISTS groupKey,
--     DROP COLUMN IF EXISTS count, DROP COLUMN IF EXISTS actorSnapshot,
--     DROP COLUMN IF EXISTS emailedAt, DROP COLUMN IF EXISTS pushedAt,
--     DROP COLUMN IF EXISTS updatedAt;

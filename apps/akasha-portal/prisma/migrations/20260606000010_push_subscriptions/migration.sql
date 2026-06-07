-- Akasha v2 — Push Subscriptions (Web Push API)
-- Adiciona tabela `push_subscriptions` para armazenar endpoints Web Push por usuário.

CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Unicidade do endpoint (cada subscription é única globalmente)
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- Índice para lookup por userId
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- FK com cascade delete
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- D-049 — User webhooks (Wave 19.1)
--
-- Outgoing webhooks (Zapier, Make, n8n, custom integrations). Permite ao
-- usuário registrar uma URL HTTPS que recebe POSTs sempre que um dos
-- eventos subscritos ocorre no seu próprio tenant (LGPD: userId-only —
-- zero cross-user, zero broadcast).
--
-- Aditiva — não destrutiva. Aplicável sem downtime.
--
-- IMPORTANT: This migration is PROPOSAL-ONLY. O Zelador roda
--   pnpm exec prisma migrate dev --name webhooks
-- após aprovação (per apps/akasha-portal/prisma/AGENTS.md D1).

-- 1. Tabela webhooks
CREATE TABLE "webhooks" (
    "id"                 TEXT NOT NULL,
    "userId"             TEXT NOT NULL,
    "url"                TEXT NOT NULL,
    "events"             TEXT[] NOT NULL,
    "secret"             TEXT NOT NULL,
    "secretFingerprint"  TEXT NOT NULL,
    "isActive"           BOOLEAN NOT NULL DEFAULT true,
    "lastCalledAt"       TIMESTAMP(3),
    "lastError"          TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- 2. Index em userId (cobre query principal "todos webhooks do user X")
CREATE INDEX "webhooks_userId_idx" ON "webhooks"("userId");

-- 3. Index em isActive (cobre query do dispatcher: "todos webhooks ativos")
CREATE INDEX "webhooks_isActive_idx" ON "webhooks"("isActive");

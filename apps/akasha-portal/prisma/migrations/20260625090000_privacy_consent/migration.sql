-- Wave 19.3 — Privacy Controls UI (LGPD Art. 7 / 8).
--
-- Audit trail IMUTÁVEL das decisões de consentimento do usuário.
-- Ver apps/akasha-portal/prisma/schema.prisma (model PrivacyConsent +
-- enum PrivacyConsentType). Schema diff aplicado em commit WAVE-19.3.
--
-- Migration NÃO aplicada — proposal-only conforme prisma/AGENTS.md D1.
-- Humano roda (depois de review):
--   pnpm exec prisma migrate dev --name privacy_consent
--
-- Decisões:
--  1. Model novo: `privacy_consents` — append-only (SEM updatedAt).
--  2. SEM FK para User (mesmo padrão de `audit_logs.userId` — LGPD Art. 37:
--     trilha precisa sobreviver ao delete do usuário).
--  3. SEM `@@unique([userId, type])` — múltiplas rows por type são
--     ESPERADAS (cada toggle = nova row de audit).
--  4. Índices: `(userId, grantedAt)` para histórico cronológico por user
--     + `(type, grantedAt)` para filtros admin por categoria.
--  5. ENUM novo: `PrivacyConsentType` (4 valores). Adicionar valor =
--     migration.
--
-- Ordem de execução dentro da migration:
--  - 1º: CREATE TYPE para o enum (precedência para colunas).
--  - 2º: CREATE TABLE `privacy_consents`.
--  - 3º: CREATE INDEX (userId, grantedAt) e (type, grantedAt).

-- Enum
CREATE TYPE "PrivacyConsentType" AS ENUM (
  'MARKETING',
  'ANALYTICS',
  'AI_TRAINING',
  'THIRD_PARTY_SHARING'
);

-- Table
CREATE TABLE "privacy_consents" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "type"      "PrivacyConsentType" NOT NULL,
  "granted"   BOOLEAN NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipHash"    TEXT NOT NULL,
  "userAgent" TEXT NOT NULL,

  CONSTRAINT "privacy_consents_pkey" PRIMARY KEY ("id")
);

-- Indexes (mesma ordem da schema.prisma)
CREATE INDEX "privacy_consents_userId_grantedAt_idx" ON "privacy_consents"("userId", "grantedAt");
CREATE INDEX "privacy_consents_type_grantedAt_idx"   ON "privacy_consents"("type", "grantedAt");

-- NOTA: NÃO criar FK para "akasha_users"."id" (sobrevivência ao delete).
-- O Prisma vai usar `prisma migrate dev` para gerar este SQL exato
-- (mais constraints opcionais); este arquivo é a versão proposta/revisada.

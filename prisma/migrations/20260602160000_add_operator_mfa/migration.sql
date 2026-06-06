-- Fase 20 — MFA / TOTP para Operators ADMIN
-- Adiciona model OperatorMfa (1:1 com Operator, opt-in).
-- Armazena secret TOTP cifrado (AES-256-GCM) e 10 recovery codes hasheados (bcrypt).
-- Apenas Operators com role=ADMIN podem ativar — enforced em código, não em DB.

-- CreateTable
CREATE TABLE "operator_mfa" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "secretEncrypted" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "recoveryCodesHash" TEXT NOT NULL,
    "lastUsedStep" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_mfa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_mfa_operatorId_key" ON "operator_mfa"("operatorId");

-- CreateIndex
CREATE INDEX "operator_mfa_operatorId_idx" ON "operator_mfa"("operatorId");

-- AddForeignKey
ALTER TABLE "operator_mfa" ADD CONSTRAINT "operator_mfa_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "operators"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

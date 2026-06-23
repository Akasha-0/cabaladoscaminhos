-- D-041: modelagem canônica de Caminhante + Caminhada.
-- Aprovado 2026-06-22 (sessão 5 — continuou handoff).
-- Ver apps/akasha-portal/prisma/designs/d-041-prisma-caminhante-caminhada-proposal.md
-- e docs/adr/0001-caminhante-identity-strategy.md.
--
-- Sem mudanças destrutivas em models existentes.
-- Reverse relations no User são Prisma-only (não geram SQL).

-- CreateEnum
CREATE TYPE "CaminhadaStatus" AS ENUM ('aberta', 'em_encerramento', 'encerrada');

-- CreateTable
CREATE TABLE "caminhantes" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeLowercaseNormalized" TEXT NOT NULL,
    "nomeCompleto" TEXT,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "horaNascimento" TEXT,
    "localNascimentoCidade" TEXT NOT NULL,
    "localNascimentoEstado" TEXT NOT NULL,
    "localNascimentoPais" TEXT NOT NULL,
    "timezone" TEXT,
    "contato" TEXT,
    "saudeRelevante" TEXT,
    "caminhadaEspiritualPrevia" TEXT,
    "observacoes" TEXT,
    "consentimentoPilar4Dados" JSONB,
    "consentimentoLGPD" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caminhantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caminhadas" (
    "id" TEXT NOT NULL,
    "zeladorId" TEXT NOT NULL,
    "caminhanteId" TEXT NOT NULL,
    "status" "CaminhadaStatus" NOT NULL DEFAULT 'aberta',
    "intencaoInicial" TEXT NOT NULL,
    "zeladorLinhagem" TEXT NOT NULL,
    "consentimentoPilar4Uso" JSONB,
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEncerramento" TIMESTAMP(3),
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caminhadas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "caminhantes_zeladorId_idx" ON "caminhantes"("zeladorId");

-- CreateIndex
CREATE INDEX "caminhantes_nomeLowercaseNormalized_idx" ON "caminhantes"("nomeLowercaseNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "caminhante_identity_per_zelador" ON "caminhantes"("zeladorId", "dataNascimento", "nomeLowercaseNormalized");

-- CreateIndex
CREATE INDEX "caminhadas_zeladorId_idx" ON "caminhadas"("zeladorId");

-- CreateIndex
CREATE INDEX "caminhadas_caminhanteId_idx" ON "caminhadas"("caminhanteId");

-- CreateIndex
CREATE INDEX "caminhadas_status_idx" ON "caminhadas"("status");

-- AddForeignKey
ALTER TABLE "caminhantes" ADD CONSTRAINT "caminhantes_zeladorId_fkey" FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caminhadas" ADD CONSTRAINT "caminhadas_zeladorId_fkey" FOREIGN KEY ("zeladorId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caminhadas" ADD CONSTRAINT "caminhadas_caminhanteId_fkey" FOREIGN KEY ("caminhanteId") REFERENCES "caminhantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
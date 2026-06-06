-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('CREDITO', 'DEBITO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ORACLE');

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT NOT NULL,
    "birthCity" TEXT NOT NULL,
    "birthState" TEXT NOT NULL,
    "birthCountry" TEXT NOT NULL,
    "birthLatitude" DOUBLE PRECISION,
    "birthLongitude" DOUBLE PRECISION,
    "birthTimezone" TEXT,
    "astrologyMap" JSONB,
    "kabalisticMap" JSONB,
    "tantricMap" JSONB,
    "oduBirth" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReadingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "matrixData" JSONB NOT NULL,
    "clientId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "llmModel" TEXT,
    "tokensUsed" INTEGER,
    "pdfUrl" TEXT,
    "readingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "readingId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "routedThemes" TEXT[],
    "routedHouses" INTEGER[],
    "consultationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "horaNascimento" TEXT,
    "localNascimento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "temaPreferido" TEXT NOT NULL DEFAULT 'mystical',
    "supabaseUserId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "planoAssinatura" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mapa_natal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signoSolar" TEXT,
    "signoLunar" TEXT,
    "ascendente" TEXT,
    "numeroCabalistico" INTEGER,
    "numeroTantrico" INTEGER,
    "numeroPitagorico" INTEGER,
    "numeroCaldeu" INTEGER,
    "numeroCarmico" INTEGER,
    "oduPrincipal" TEXT,
    "oduSecundario" TEXT,
    "arcanoPessoal" INTEGER,
    "cartaCaminho" TEXT,
    "sefirotDominante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mapa_natal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plano" TEXT NOT NULL DEFAULT 'iniciante',
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataProximoCobro" TIMESTAMP(3),
    "moduloPlanetas" BOOLEAN NOT NULL DEFAULT false,
    "moduloLetras" BOOLEAN NOT NULL DEFAULT false,
    "moduloGeometria" BOOLEAN NOT NULL DEFAULT false,
    "moduloFrequencias" BOOLEAN NOT NULL DEFAULT false,
    "moduloEmpresa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "saldo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes_credito" (
    "id" TEXT NOT NULL,
    "creditoId" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "descricao" TEXT,
    "operacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "razaoSocial" TEXT,
    "cnpj" TEXT,
    "dataFundacao" TIMESTAMP(3),
    "numeroNome" INTEGER,
    "numeroRazao" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dias_semana" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "planeta" TEXT NOT NULL,
    "elemento" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dias_semana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orixas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "saudacao" TEXT NOT NULL,
    "planeta" TEXT NOT NULL,
    "elemento" TEXT NOT NULL,
    "cores" TEXT[],
    "chakraPrincipal" INTEGER NOT NULL,
    "quizilas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orixas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chakras" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "elemento" TEXT NOT NULL,
    "glandula" TEXT,
    "mantras" TEXT[],
    "funcoes" TEXT[],
    "sefirotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chakras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sefirots" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "aspecto" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "planeta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sefirots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odus" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "significado" TEXT NOT NULL,
    "elemento" TEXT NOT NULL,
    "planeta" TEXT NOT NULL,
    "orixaRegente" TEXT NOT NULL,
    "quizilas" TEXT[],
    "preceptos" TEXT[],
    "ebos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ervas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "uso" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ervas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fases_lua" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "energia" TEXT NOT NULL,
    "rituais" TEXT[],
    "evitar" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fases_lua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elementos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,
    "qualidades" TEXT[],
    "direcoes" TEXT[],
    "cores" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elementos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "acaoRecomendada" TEXT,
    "mantra" TEXT,
    "diaSemana" TEXT,
    "faseLua" TEXT,
    "numeroPessoal" INTEGER,
    "odu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "time" TEXT NOT NULL,
    "timezone" TEXT,
    "schedule" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "nextTriggerAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birth_charts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "chartData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synastry_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT,
    "chart1Id" TEXT,
    "chart2Id" TEXT,
    "resultData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synastry_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeituraHistorico" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeituraHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DiaSemanaToOrixa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiaSemanaToOrixa_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ErvaToOrixa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ErvaToOrixa_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "operators_email_key" ON "operators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reports_readingId_key" ON "reports"("readingId");

-- CreateIndex
CREATE INDEX "consultations_readingId_idx" ON "consultations"("readingId");

-- CreateIndex
CREATE INDEX "chat_messages_consultationId_idx" ON "chat_messages"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseUserId_key" ON "users"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "users_planoAssinatura_idx" ON "users"("planoAssinatura");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_dataNascimento_idx" ON "users"("dataNascimento");

-- CreateIndex
CREATE INDEX "users_stripeSubscriptionId_idx" ON "users"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "mapa_natal_userId_key" ON "mapa_natal"("userId");

-- CreateIndex
CREATE INDEX "mapa_natal_signoSolar_idx" ON "mapa_natal"("signoSolar");

-- CreateIndex
CREATE INDEX "mapa_natal_numeroPitagorico_idx" ON "mapa_natal"("numeroPitagorico");

-- CreateIndex
CREATE INDEX "mapa_natal_arcanoPessoal_idx" ON "mapa_natal"("arcanoPessoal");

-- CreateIndex
CREATE INDEX "mapa_natal_createdAt_idx" ON "mapa_natal"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "assinaturas_userId_key" ON "assinaturas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "assinaturas_stripeCustomerId_key" ON "assinaturas"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "assinaturas_stripeSubscriptionId_key" ON "assinaturas"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "assinaturas_status_idx" ON "assinaturas"("status");

-- CreateIndex
CREATE INDEX "assinaturas_dataProximoCobro_idx" ON "assinaturas"("dataProximoCobro");

-- CreateIndex
CREATE INDEX "assinaturas_plano_idx" ON "assinaturas"("plano");

-- CreateIndex
CREATE UNIQUE INDEX "creditos_userId_key" ON "creditos"("userId");

-- CreateIndex
CREATE INDEX "creditos_saldo_idx" ON "creditos"("saldo");

-- CreateIndex
CREATE INDEX "creditos_createdAt_idx" ON "creditos"("createdAt");

-- CreateIndex
CREATE INDEX "transacoes_credito_creditoId_createdAt_idx" ON "transacoes_credito"("creditoId", "createdAt");

-- CreateIndex
CREATE INDEX "transacoes_credito_tipo_idx" ON "transacoes_credito"("tipo");

-- CreateIndex
CREATE INDEX "transacoes_credito_createdAt_idx" ON "transacoes_credito"("createdAt");

-- CreateIndex
CREATE INDEX "empresas_userId_idx" ON "empresas"("userId");

-- CreateIndex
CREATE INDEX "empresas_cnpj_idx" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "dias_semana_nome_key" ON "dias_semana"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "dias_semana_numero_key" ON "dias_semana"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "orixas_nome_key" ON "orixas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "chakras_numero_key" ON "chakras"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "chakras_nome_key" ON "chakras"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "chakras_sefirotId_key" ON "chakras"("sefirotId");

-- CreateIndex
CREATE UNIQUE INDEX "sefirots_numero_key" ON "sefirots"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "sefirots_nome_key" ON "sefirots"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "odus_numero_key" ON "odus"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "odus_nome_key" ON "odus"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ervas_nome_key" ON "ervas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "fases_lua_nome_key" ON "fases_lua"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "elementos_nome_key" ON "elementos"("nome");

-- CreateIndex
CREATE INDEX "insights_userId_idx" ON "insights"("userId");

-- CreateIndex
CREATE INDEX "insights_createdAt_idx" ON "insights"("createdAt");

-- CreateIndex
CREATE INDEX "insights_titulo_idx" ON "insights"("titulo");

-- CreateIndex
CREATE INDEX "conversas_userId_idx" ON "conversas"("userId");

-- CreateIndex
CREATE INDEX "conversas_updatedAt_idx" ON "conversas"("updatedAt");

-- CreateIndex
CREATE INDEX "mensagens_conversaId_createdAt_idx" ON "mensagens"("conversaId", "createdAt");

-- CreateIndex
CREATE INDEX "mensagens_conversaId_idx" ON "mensagens"("conversaId");

-- CreateIndex
CREATE INDEX "reminders_userId_idx" ON "reminders"("userId");

-- CreateIndex
CREATE INDEX "reminders_enabled_idx" ON "reminders"("enabled");

-- CreateIndex
CREATE INDEX "reminders_nextTriggerAt_idx" ON "reminders"("nextTriggerAt");

-- CreateIndex
CREATE INDEX "birth_charts_userId_idx" ON "birth_charts"("userId");

-- CreateIndex
CREATE INDEX "birth_charts_birthDate_idx" ON "birth_charts"("birthDate");

-- CreateIndex
CREATE INDEX "birth_charts_createdAt_idx" ON "birth_charts"("createdAt");

-- CreateIndex
CREATE INDEX "synastry_results_userId_idx" ON "synastry_results"("userId");

-- CreateIndex
CREATE INDEX "synastry_results_partnerId_idx" ON "synastry_results"("partnerId");

-- CreateIndex
CREATE INDEX "synastry_results_createdAt_idx" ON "synastry_results"("createdAt");

-- CreateIndex
CREATE INDEX "favoritos_userId_idx" ON "favoritos"("userId");

-- CreateIndex
CREATE INDEX "favoritos_type_idx" ON "favoritos"("type");

-- CreateIndex
CREATE INDEX "favoritos_referenceId_idx" ON "favoritos"("referenceId");

-- CreateIndex
CREATE INDEX "favoritos_userId_type_idx" ON "favoritos"("userId", "type");

-- CreateIndex
CREATE INDEX "LeituraHistorico_userId_idx" ON "LeituraHistorico"("userId");

-- CreateIndex
CREATE INDEX "LeituraHistorico_type_idx" ON "LeituraHistorico"("type");

-- CreateIndex
CREATE INDEX "LeituraHistorico_createdAt_idx" ON "LeituraHistorico"("createdAt");

-- CreateIndex
CREATE INDEX "journal_entries_userId_idx" ON "journal_entries"("userId");

-- CreateIndex
CREATE INDEX "journal_entries_mood_idx" ON "journal_entries"("mood");

-- CreateIndex
CREATE INDEX "journal_entries_createdAt_idx" ON "journal_entries"("createdAt");

-- CreateIndex
CREATE INDEX "_DiaSemanaToOrixa_B_index" ON "_DiaSemanaToOrixa"("B");

-- CreateIndex
CREATE INDEX "_ErvaToOrixa_B_index" ON "_ErvaToOrixa"("B");

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "readings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "readings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mapa_natal" ADD CONSTRAINT "mapa_natal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes_credito" ADD CONSTRAINT "transacoes_credito_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "creditos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chakras" ADD CONSTRAINT "chakras_sefirotId_fkey" FOREIGN KEY ("sefirotId") REFERENCES "sefirots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeituraHistorico" ADD CONSTRAINT "LeituraHistorico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiaSemanaToOrixa" ADD CONSTRAINT "_DiaSemanaToOrixa_A_fkey" FOREIGN KEY ("A") REFERENCES "dias_semana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiaSemanaToOrixa" ADD CONSTRAINT "_DiaSemanaToOrixa_B_fkey" FOREIGN KEY ("B") REFERENCES "orixas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ErvaToOrixa" ADD CONSTRAINT "_ErvaToOrixa_A_fkey" FOREIGN KEY ("A") REFERENCES "ervas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ErvaToOrixa" ADD CONSTRAINT "_ErvaToOrixa_B_fkey" FOREIGN KEY ("B") REFERENCES "orixas"("id") ON DELETE CASCADE ON UPDATE CASCADE;


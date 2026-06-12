◇ injected env (0) from ../../.env // tip: ⌘ enable debugging { debug: true }
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREEMIUM', 'AKASHA_PRO');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ORACLE');

-- CreateTable
CREATE TABLE "akasha_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'pt-BR',
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "birthDate" TIMESTAMP(3),
    "birthTime" TEXT,
    "birthCity" TEXT,
    "birthLatitude" DOUBLE PRECISION,
    "birthLongitude" DOUBLE PRECISION,
    "birthTimezone" TEXT,
    "ichingMap" JSONB,
    "ichingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "intentionProfile" JSONB,
    "consentAt" TIMESTAMP(3),
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "akasha_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birth_charts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "astrologyMap" JSONB NOT NULL,
    "kabalisticMap" JSONB NOT NULL,
    "tantricMap" JSONB NOT NULL,
    "oduBirth" JSONB NOT NULL,
    "incomplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREEMIUM',
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "monthlyCreditQuota" INTEGER NOT NULL DEFAULT 0,
    "dashboardUntil" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifestos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "llmModel" TEXT,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manifestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_readings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "climate" TEXT NOT NULL,
    "ritual" JSONB NOT NULL,
    "alert" TEXT NOT NULL,
    "tensionPoint" JSONB NOT NULL,
    "llmModel" TEXT,
    "hexagram" TEXT,
    "hexagramLines" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ritual_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grimoireId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ritual_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "hexagram" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "routedPillars" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "grimoireRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creditCost" INTEGER NOT NULL DEFAULT 0,
    "consultationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "grimoire" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "biblioteca" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "conteudo" TEXT NOT NULL,
    "embedding" vector(768),
    "sourcePath" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grimoire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "akasha_users_email_key" ON "akasha_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "birth_charts_userId_key" ON "birth_charts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "credit_entries_userId_idx" ON "credit_entries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "manifestos_userId_key" ON "manifestos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_readings_userId_date_key" ON "daily_readings"("userId", "date");

-- CreateIndex
CREATE INDEX "ritual_completions_userId_idx" ON "ritual_completions"("userId");

-- CreateIndex
CREATE INDEX "consultations_userId_idx" ON "consultations"("userId");

-- CreateIndex
CREATE INDEX "chat_messages_consultationId_idx" ON "chat_messages"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "grimoire_slug_key" ON "grimoire"("slug");

-- CreateIndex
CREATE INDEX "grimoire_categoria_idx" ON "grimoire"("categoria");

-- CreateIndex
CREATE INDEX "grimoire_biblioteca_idx" ON "grimoire"("biblioteca");

-- AddForeignKey
ALTER TABLE "birth_charts" ADD CONSTRAINT "birth_charts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_entries" ADD CONSTRAINT "credit_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifestos" ADD CONSTRAINT "manifestos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_readings" ADD CONSTRAINT "daily_readings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ritual_completions" ADD CONSTRAINT "ritual_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "akasha_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


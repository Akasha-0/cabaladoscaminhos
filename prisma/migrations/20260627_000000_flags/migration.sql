-- ============================================================================
-- Migration: Flags/Reports (Wave 14, 2026-06-27)
-- ============================================================================
-- Sistema de moderação transparente. Membros sinalizam conteúdo
-- (POST/COMMENT/USER/GROUP), admins revisam em uma fila priorizada.
--
-- Idempotente: pode rodar múltiplas vezes sem erro. Usa DO blocks
-- com EXCEPTION para criar tipos/enums/tabelas apenas se não existirem.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMs
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "FlagTargetType" AS ENUM ('POST', 'COMMENT', 'USER', 'GROUP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "FlagReason" AS ENUM ('SPAM', 'HARASSMENT', 'MISINFO', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "FlagStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- Tabela flags
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "flags" (
  "id"          TEXT NOT NULL,
  "targetType"  "FlagTargetType" NOT NULL,
  "targetId"    TEXT NOT NULL,
  "reporterId"  TEXT NOT NULL,
  "reason"      "FlagReason" NOT NULL,
  "description" TEXT,
  "status"      "FlagStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt"  TIMESTAMP(3),
  "reviewerId"  TEXT,
  "actionTaken" TEXT,
  CONSTRAINT "flags_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "flags_status_createdAt_idx"
  ON "flags"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "flags_reporterId_createdAt_idx"
  ON "flags"("reporterId", "createdAt");

CREATE INDEX IF NOT EXISTS "flags_targetType_targetId_idx"
  ON "flags"("targetType", "targetId");

CREATE INDEX IF NOT EXISTS "flags_reviewerId_reviewedAt_idx"
  ON "flags"("reviewerId", "reviewedAt");

-- ----------------------------------------------------------------------------
-- Comentários de coluna (documentação viva no Postgres)
-- ----------------------------------------------------------------------------

COMMENT ON TABLE "flags" IS
  'Denúncias de conteúdo (Wave 14). Membros sinalizam POST/COMMENT/USER/GROUP; admins revisam.';

COMMENT ON COLUMN "flags"."reporterId" IS
  'Id do membro que sinalizou. Nunca exposto publicamente (anti-retaliação).';

COMMENT ON COLUMN "flags"."actionTaken" IS
  'Ação aplicada quando status=ACTIONED. Valores: dismiss|hide|delete.';

-- ============================================================================
-- NOTA SOBRE FKS
-- ============================================================================
-- Decisão consciente: NÃO criar foreign keys de reporterId/targetId
-- para users/posts/comments/groups.
--
-- Razões:
--  1. Sistema de auth (Supabase) usa IDs fora desta DB
--  2. Soft delete de Post/Comment não pode cascatear em flag
--  3. Flag precisa sobreviver mesmo se conteúdo for deletado (audit trail)
--  4. Resolução de target é feita via query no app, não no DB
--
-- Quando integrarmos auth canônico (users.id canônico), reavaliaremos.
-- ============================================================================

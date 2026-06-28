-- ============================================================================
-- Wave 20 — Email Queue + Welcome Sequence (2026-06-28)
-- ============================================================================
-- Cria tabela `email_jobs` para queue genérica de emails transacionais e
-- welcome sequence. Diferente de `notifications` (que é o feed in-app), esta
-- tabela é o pipeline outbound de emails do projeto:
--
--   - scheduledFor: quando o email deve ser enviado (cron processa)
--   - templateId: chave do template em src/lib/email/templates/
--   - status: PENDING → SENT ou FAILED (com retry counter)
--   - payload: dados variáveis do template (JSONB)
--
-- Mantemos uma tabela dedicada em vez de reaproveitar `notifications` para
-- evitar misturar o pipeline de emails transacionais com o feed in-app.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "email_jobs" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  -- Destinatário
  "userId"        TEXT,
  "toEmail"       TEXT NOT NULL,
  -- Template
  "templateId"    TEXT NOT NULL,           -- ex: 'welcome', 'welcome-day2', 'comment-notification'
  -- Dados variáveis (JSON livre, validado pelo template)
  payload        JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Agendamento
  "scheduledFor"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Status + tentativas
  status          TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | SENT | FAILED | CANCELLED
  attempts        INTEGER NOT NULL DEFAULT 0,
  "maxAttempts"   INTEGER NOT NULL DEFAULT 3,
  "lastAttemptAt" TIMESTAMP(3),
  "sentAt"        TIMESTAMP(3),
  "failedAt"      TIMESTAMP(3),
  "errorMessage"  TEXT,
  -- Auditoria
  "campaignId"    TEXT,                    -- agrupa jobs da mesma campanha (ex: 'welcome-series:user_xyz')
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para o cron processar eficientemente
-- 1) Picks do cron: status PENDING com scheduledFor <= now
CREATE INDEX IF NOT EXISTS "email_jobs_pending_idx"
  ON "email_jobs" ("status", "scheduledFor")
  WHERE status = 'PENDING';

-- 2) Cancelar batch de uma campanha (ex: user cancelou welcome)
CREATE INDEX IF NOT EXISTS "email_jobs_campaign_idx"
  ON "email_jobs" ("campaignId", "status");

-- 3) Histórico por usuário (perfil → "emails enviados")
CREATE INDEX IF NOT EXISTS "email_jobs_user_idx"
  ON "email_jobs" ("userId", "createdAt" DESC);

-- 4) Cleanup de jobs antigos (purge após 90 dias)
CREATE INDEX IF NOT EXISTS "email_jobs_created_idx"
  ON "email_jobs" ("createdAt");

-- updatedAt auto-touch (trigger simples)
CREATE OR REPLACE FUNCTION email_jobs_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_jobs_updated_at ON "email_jobs";
CREATE TRIGGER email_jobs_updated_at
  BEFORE UPDATE ON "email_jobs"
  FOR EACH ROW
  EXECUTE FUNCTION email_jobs_touch_updated_at();

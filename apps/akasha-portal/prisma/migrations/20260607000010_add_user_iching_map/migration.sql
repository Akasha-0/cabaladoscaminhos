-- v0.0.5 T3+T4 (Doc 14 §2): I-Ching como 5º sistema opt-in completo
-- (User.ichingMap + User.ichingEnabled + DailyReading.{hexagram,hexagramLines}
--  + Consultation.hexagram + índice GIN para queries eficientes em ichingMap).
--
-- `ichingMap` é cached no cadastro (Doc 09 §5.3 — "calcule uma vez"); null
-- até o usuário solicitar a tiragem do hexagrama natal.
-- `ichingEnabled` é o opt-in explícito para o sorteio no /oraculo (LGPD).

-- ============================================================================
-- User
-- ============================================================================

ALTER TABLE "users" ADD COLUMN "ichingMap" JSONB;
ALTER TABLE "users" ADD COLUMN "ichingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Índice GIN sobre users.ichingMap para queries JSONB eficientes
-- (busca por hexagramNumber / upperTrigram / aspects no PromptBuilder).
CREATE INDEX "users_iching_map_gin_idx" ON "users" USING gin ("ichingMap");

-- ============================================================================
-- DailyReading — hexagrama do dia
-- ============================================================================

ALTER TABLE "daily_readings" ADD COLUMN "hexagram" TEXT;
ALTER TABLE "daily_readings" ADD COLUMN "hexagramLines" JSONB;

-- ============================================================================
-- Consultation — hexagrama sorteado (oráculo opt-in)
-- ============================================================================

ALTER TABLE "consultations" ADD COLUMN "hexagram" TEXT;

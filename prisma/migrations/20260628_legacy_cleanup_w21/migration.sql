-- ============================================================================
-- Akasha Portal — Legacy Models Cleanup (Wave 21, 2026-06-28)
-- ============================================================================
-- Objetivo: remover 4 modelos Prisma órfãos que ficaram do schema B2B
-- pré-v3.0 e nunca foram migrados/consumidos pelo app.
--
-- Investigação (ver docs/LEGACY-CLEANUP-W21.md):
--   - Insight    → 0 callers em src/. Substituído por AkashicFeedback
--                  (voto 👍/👎 nas respostas da Akasha IA, Wave 18).
--                  Não há geração automática de insights espirituais no MVP.
--   - Conversa   → 0 callers em src/. Chat da Akasha é in-memory
--                  (history no payload do request). Mentorships usam
--                  MentorshipMessage (escopo próprio).
--   - Mensagem   → 0 callers em src®. Comments de posts usam `Comment`.
--                  Chat de mentoria usa `MentorshipMessage`. Modelo
--                  genérico Mensagem nunca foi referenciado.
--   - Favorito   → 0 callers em src/. Substituído por `Bookmark`
--                  (articles) + `PostBookmark` (posts com collections).
--                  Cobertura completa em Onda 14 (2026-06-27).
--
-- Compatibilidade:
--   - DROP IF EXISTS garante idempotência total
--   - Sem dependência cross-model (Favorito é o único com FK User → Cascade)
--   - Drop respeita CASCADE em qualquer FK remanescente
--
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- Rollback:    re-criar modelos via prisma migrate (ver schema.prisma histórico)
-- ============================================================================

DROP TABLE IF EXISTS insights       CASCADE;
DROP TABLE IF EXISTS conversas      CASCADE;
DROP TABLE IF EXISTS mensagens      CASCADE;
DROP TABLE IF EXISTS favoritos      CASCADE;

-- ============================================================================
-- Verificação final
-- ============================================================================
DO $$
DECLARE
  remaining int;
BEGIN
  SELECT COUNT(*) INTO remaining
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('insights', 'conversas', 'mensagens', 'favoritos');

  IF remaining = 0 THEN
    RAISE NOTICE 'Wave 21 cleanup OK — 4 legacy tables removidas';
  ELSE
    RAISE WARNING 'Wave 21 cleanup INCOMPLETO — % tabela(s) remanescente(s): %',
      remaining,
      (SELECT string_agg(table_name, ', ')
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name IN ('insights', 'conversas', 'mensagens', 'favoritos'));
  END IF;
END $$;
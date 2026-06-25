-- D-049 — Wave 19.2 — LGPD self-service soft delete (Art. 18 §V)
--
-- Adiciona `deletedAt` + `deleteGracePeriodEndsAt` em `akasha_users` para
-- suportar auto-eliminação com grace period de 30 dias. Soft delete
-- (não hard) — usuário pode cancelar durante o grace (Art. 18 §3).
-- Após o grace expirar, o cron de limpeza (Wave 19.2-followup) faz o
-- hard delete + cascade via Prisma.
--
-- Decisões:
--  - nullable + sem default → safe migration, sem precisar backfill.
--  - sem índice composto: queries de "usuários pendentes de hard delete"
--    rodam em cron diário (volume baixíssimo); índice adicionado em
--    follow-up se volume crescer.
--  - audit trail dos pedidos vive em `audit_logs` (D-047).

ALTER TABLE "akasha_users"
  ADD COLUMN "deletedAt"               TIMESTAMP(3),
  ADD COLUMN "deleteGracePeriodEndsAt" TIMESTAMP(3);

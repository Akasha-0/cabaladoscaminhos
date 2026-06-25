-- D-050 — Wave 19.2 — AuditAction enum: novos valores LGPD self-service
--
-- Adiciona valores ao enum `AuditAction` para suportar:
--   - lgpd_deletion_requested / scheduled / cancelled
--   - export_all_requested / completed / failed
--   - lgpd_password_confirm_failed (auditoria de tentativas erradas)
--
-- LGPD Art. 33: trilha completa do ciclo de vida da eliminação + portabilidade.
-- PostgreSQL `ALTER TYPE ... ADD VALUE` não pode rodar dentro de transaction
-- block em PG < 12; mas PG 15+ (Vercel Postgres) suporta. Sem IF NOT EXISTS
-- necessário — re-rodar a migration falha claramente (migration_lock.toml).

ALTER TYPE "AuditAction" ADD VALUE 'lgpd_deletion_requested';
ALTER TYPE "AuditAction" ADD VALUE 'lgpd_deletion_scheduled';
ALTER TYPE "AuditAction" ADD VALUE 'lgpd_deletion_cancelled';
ALTER TYPE "AuditAction" ADD VALUE 'export_all_requested';
ALTER TYPE "AuditAction" ADD VALUE 'export_all_completed';
ALTER TYPE "AuditAction" ADD VALUE 'export_all_failed';
ALTER TYPE "AuditAction" ADD VALUE 'lgpd_password_confirm_failed';

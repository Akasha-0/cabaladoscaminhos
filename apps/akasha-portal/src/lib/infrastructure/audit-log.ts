/**
 * Audit Log — Wave 8.3 (LGPD Art. 18 + Art. 37)
 *
 * Stub mínimo para registrar ações sensíveis (delete, export, consentimento)
 * com timestamp ISO, userId e ação. Persistência em stdout/structured-log;
 * produção deve enviar para sink dedicado (Loki, Datadog, BigQuery).
 *
 * Decisão de design (escopo 60 min):
 *  - NÃO cria tabela nova no schema (gap arquitetural — ver commit message).
 *  - Loga JSON em uma linha por evento (consumível por log pipelines).
 *  - Falha no audit log NÃO bloqueia a ação principal — apenas emite warning.
 *    Trade-off: priorizamos disponibilidade sobre rastreabilidade perfeita.
 *    Para produção: substituir por Prisma model + retry + dead-letter queue.
 */

export type AuditAction =
  | "profile_delete_requested"
  | "profile_delete_completed"
  | "profile_delete_failed"
  | "profile_export_requested"
  | "profile_export_completed"
  | "conexao_third_party_consent_declarado"
  | "consent_updated";

export interface AuditLogEntry {
  ts: string; // ISO 8601 UTC
  action: AuditAction;
  userId: string | null;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra uma entrada de auditoria.
 * Em caso de erro interno, loga warning mas NÃO lança — a chamada externa
 * não deve falhar por causa do audit log.
 */
export function auditLog(entry: Omit<AuditLogEntry, "ts">): void {
  const fullEntry: AuditLogEntry = {
    ts: new Date().toISOString(),
    ...entry,
  };

  try {
    // Serializa como JSON de uma linha (newline-delimited JSON — NDJSON)
    // para que log pipelines (Loki, Datadog, CloudWatch) consigam parsear.
    process.stdout.write(`[AUDIT] ${JSON.stringify(fullEntry)}\n`);
  } catch (err) {
    // Falha de serialização é extremamente rara; só loga warning.
    // eslint-disable-next-line no-console
    console.warn(
      "[audit-log] failed to write entry:",
      err instanceof Error ? err.message : String(err),
    );
  }
}

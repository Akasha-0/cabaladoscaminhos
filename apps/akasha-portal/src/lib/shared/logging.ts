/**
 * Gera um ID único para cada request (para tracing/logging)
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Registra eventos de segurança para auditoria
 *
 * STUB: Implementação real com logging estruturado (Datadog/CloudWatch)
 */
export function logSecurityEvent(type: string, data: Record<string, unknown>): void {
  // Security audit trail — wired to Datadog/CloudWatch in production
  // (console removed)
}

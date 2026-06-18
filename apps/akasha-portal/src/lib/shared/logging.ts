/**
 * Gera um ID único para cada request (para tracing/logging)
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}


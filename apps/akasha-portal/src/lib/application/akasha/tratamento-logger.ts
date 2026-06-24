/**
 * Logger for tratamento/calcular requests.
 * No PII — only zeladorId hash, length, timestamp.
 * Fire-and-forget.
 */
// Lightweight FNV-1a hash (no crypto needed; FNV-1a is fine for log de-dup)
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export interface LogPayload {
  zeladorId: string;
  input: unknown;
  output: unknown;
}

export function logSintetizarRequest(zeladorId: string, input: unknown, output: unknown): void {
  try {
    const entry = {
      ts: new Date().toISOString(),
      zeladorHash: fnv1a(zeladorId),
      inputLength: JSON.stringify(input ?? {}).length,
      outputCamadas: (output as { camadas?: unknown })?.camadas
        ? Object.keys((output as { camadas: Record<string, unknown> }).camadas).length
        : 0,
      disclaimer: (output as { disclaimer?: string })?.disclaimer ?? null,
    };
    // eslint-disable-next-line no-console
    console.log('[tratamento]', JSON.stringify(entry));
  } catch {
    // never throw in logger
  }
}

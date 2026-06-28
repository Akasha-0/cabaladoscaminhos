/**
 * analytics/server.ts — Server-side analytics helpers (Wave 18)
 * ============================================================================
 * Thin wrapper sobre `monitoring/posthog.captureServerEvent` para uso em
 * API routes (Node runtime). NUNCA usar em Edge runtime — fetch nativo
 * precisa de Node 18+ e algumas plataformas Edge limitam.
 *
 * Por que server-side tracking?
 *   - Eventos de API (post_created, group_joined) sao gerados no backend.
 *   - Captura client pode perder eventos se usuario fecha a tab antes
 *     do flush (5s).
 *   - Webhooks de providers (Stripe, LemonSqueezy) so' rodam server-side.
 *
 * LGPD:
 *   - Use distinctId do usuario logado (uuid).
 *   - Nunca envie PII cru como property (use hashEmailForAnalytics).
 *
 * Como usar em uma API route:
 *   import { trackServerEvent } from '@/lib/analytics/server';
 *   ...
 *   await trackServerEvent('post_created', { postId, authorId, ... });
 *   // fire-and-forget — nao bloqueia o response
 * ============================================================================
 */

import { captureServerEvent } from "@/lib/monitoring/posthog";

export interface ServerEventPayload {
  name: string;
  properties?: Record<string, unknown>;
  distinctId?: string;
  timestamp?: number;
}

/**
 * captureServerEventSafe — wrapper que NAO quebra a request em caso de falha.
 * Sempre retorna void; falhas sao logadas em dev e descartadas em prod.
 */
export async function captureServerEventSafe(
  payload: ServerEventPayload
): Promise<void> {
  try {
    await captureServerEvent({
      name: payload.name,
      properties: payload.properties,
      distinctId: payload.distinctId,
      timestamp: payload.timestamp ?? Date.now(),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[analytics:server] capture failed for ${payload.name}:`, err);
    }
    // Silencioso em prod — analytics nao pode quebrar UX
  }
}

/**
 * trackServerEvent — alias semantico para captureServerEventSafe.
 * Para usar dentro de API routes.
 */
export function trackServerEvent(
  name: string,
  properties?: Record<string, unknown>,
  distinctId?: string
): void {
  // Fire-and-forget — nao bloqueia a response da API
  void captureServerEventSafe({
    name,
    properties,
    distinctId,
    timestamp: Date.now(),
  });
}

/**
 * Helper para capturar evento com auto-validate do payload contra o catalog.
 * Falha silenciosa em caso de schema invalido (consistente com trackEvent client).
 */
export async function trackServerEventValidated<T extends Record<string, unknown>>(
  name: string,
  properties: T,
  distinctId?: string
): Promise<void> {
  // Lazy import para evitar ciclos (server.ts -> monitoring -> ...)
  const { getEventDefinition } = await import("./events-catalog");
  const def = getEventDefinition(name);
  if (!def) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[analytics:server] evento nao catalogado: ${name}`);
    }
    return;
  }
  const parsed = def.schema.safeParse(properties);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[analytics:server] payload invalido para ${name}:`,
        parsed.error.flatten()
      );
    }
    return;
  }
  trackServerEvent(name, parsed.data as Record<string, unknown>, distinctId);
}
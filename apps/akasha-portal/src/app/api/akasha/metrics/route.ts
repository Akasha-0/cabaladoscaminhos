/**
 * API Route: GET /api/akasha/metrics
 *
 * Wave 31.4 Observability MVP — expõe métricas Prometheus em formato
 * text/plain (Content-Type `text/plain; version=0.0.4`).
 *
 * NÃO chama `requireAkashaApi` — métricas são públicas para o
 * scraper do Prometheus (geralmente rodando na mesma rede).
 * Em produção, recomenda-se expor apenas na rede interna via ingress.
 *
 * Caching: `Cache-Control: no-store` — Prometheus scrapers devem
 * sempre receber dados fresh.
 */
import {
  getMetricsContentType,
  getMetricsText,
  getLogger,
} from '@akasha/observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const log = getLogger('api:akasha:metrics');

export async function GET(): Promise<Response> {
  try {
    const text = await getMetricsText();
    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': getMetricsContentType(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    log.error({ error: message }, 'metrics.serialize.failed');
    return new Response(`# error serializing metrics: ${message}\n`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/infrastructure/redis';

export const dynamic = 'force-dynamic';

/**
 * GET /api/akasha/transits/today
 *
 * Retorna o payload de trânsitos do dia (cache do cronjob diário).
 * - Chave Redis: `transitos_diarios:YYYY-MM-DD` (TTL 86400s) — Doc 25 §10.
 * - Fallback: se Redis offline, lê de `process.env.TRANSITS_FALLBACK_PATH`
 *   (default `/tmp/transitos_diarios.json`) — Doc 22 AD-22.8.
 *
 * Latência alvo: < 100ms (Redis hit). Degrada com mensagem clara se
 * nem Redis nem fallback estão disponíveis.
 */
export async function GET() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const cacheKey = `transitos_diarios:${dateStr}`;
  const fallbackPath = process.env.TRANSITS_FALLBACK_PATH ?? '/tmp/transitos_diarios.json';

  // 1. Tentar Redis
  try {
    const client = await getRedisClient();
    const cached = await client.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        {
          source: 'redis',
          date: dateStr,
          transits: JSON.parse(cached),
        },
        { headers: { 'Cache-Control': 'public, max-age=300' } }
      );
    }
  } catch (_err) {
    // Redis unavailable, falling back to file
  }

  // 2. Fallback: arquivo JSON
  try {
    const fs = await import(/* @turbopack disable */ 'fs');
    if (fs.existsSync(fallbackPath)) {
      const raw = fs.readFileSync(fallbackPath, 'utf8');
      const map = JSON.parse(raw) as Record<string, unknown>;
      const payload = map[dateStr];
      if (payload) {
        return NextResponse.json(
          {
            source: 'fallback',
            date: dateStr,
            transits: payload,
          },
          { status: 200 }
        );
      }
    }
  } catch (_err) {
    // Fallback file unavailable
  }


  // 3. Sem dados — degrada com mensagem clara
  return NextResponse.json(
    {
      source: 'none',
      date: dateStr,
      error: 'trânsitos_do_dia_indisponíveis',
      message:
        'O céu de hoje ainda não foi computado. O cronjob de meia-noite UTC pode estar atrasado. Tente novamente em alguns minutos.',
    },
    { status: 503 }
  );
}

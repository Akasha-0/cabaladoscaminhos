// POST /api/oraculo/astrologia — Wave 29 (Oracular Maps)
// ============================================================================
// Calcula mapa natal astrológico a partir de data + hora + local de nascimento.
//
// Input:
//   {
//     data: "1990-04-23",
//     hora: "14:30",
//     local: "São Paulo, SP, Brasil",
//     latitude?: -23.55,
//     longitude?: -46.63,
//     tradição?: 'ocidental-tropical' | 'védica-sidereal' | 'chinesa'
//   }
//
// Output: MapaNatal completo (ver /lib/oraculo/astrologia).
//
// Rate limit: 30 req/min por IP (mais permissivo que akashic — cálculos
// locais puros, sem chamar LLM externo).
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { calcularMapaNatal, TradiçãoAstrológica } from '@/lib/oraculo/astrologia';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM 24h'),
  local: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  tradição: z.enum(['ocidental-tropical', 'védica-sidereal', 'chinesa']).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`oraculo-astrologia:${ip}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  });
  if (!rl.allowed) {
    return Response.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisições — tente em 1 min.' } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: 'BAD_JSON', message: 'JSON inválido.' } },
      { status: 400 },
    );
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  try {
    const mapa = await calcularMapaNatal(
      {
        data: parsed.data.data,
        hora: parsed.data.hora,
        local: parsed.data.local,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      },
      (parsed.data.tradição ?? 'ocidental-tropical') as TradiçãoAstrológica,
    );
    return Response.json({ ok: true, mapa });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao calcular mapa';
    return Response.json(
      { error: { code: 'CALC_ERROR', message } },
      { status: 500 },
    );
  }
}

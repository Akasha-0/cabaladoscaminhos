// POST /api/oraculo/numerologia — Wave 29 (Oracular Maps)
// ============================================================================
// Calcula mapa numerológico cabalístico/pitagórico/caldeu.
//
// Input:
//   {
//     nomeCompleto: "Maria da Silva Santos",
//     dataNascimento: "1990-04-23",
//     sistema?: 'pitagorica' | 'caldeia' | 'cabalistica-estrutural',
//     anoReferência?: 2026
//   }
//
// Output: MapaNumerológico completo (ver /lib/oraculo/numerologia).
//
// Rate limit: 30 req/min por IP.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { calcularMapaNumerológico } from '@/lib/oraculo/numerologia';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  nomeCompleto: z.string().min(2).max(200),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  sistema: z.enum(['pitagorica', 'caldeia', 'cabalistica-estrutural']).optional(),
  anoReferência: z.number().int().min(1900).max(2200).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`oraculo-numerologia:${ip}`, {
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
    const mapa = calcularMapaNumerológico(
      {
        nomeCompleto: parsed.data.nomeCompleto,
        dataNascimento: parsed.data.dataNascimento,
      },
      parsed.data.sistema ?? 'pitagorica',
      parsed.data.anoReferência,
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

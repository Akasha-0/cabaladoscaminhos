// POST /api/oraculo/mapa-completo — Wave 29 (Oracular Maps)
// ============================================================================
// Combina astrologia + numerologia + tradição preferida em um único mapa
// integrado. Persiste no histórico (se autenticado).
//
// Input: MapaCompletoInput (ver /lib/oraculo/mapa-integrado)
//
// Output: MapaCompleto com markdown completo + resumo curto.
//
// Rate limit: 20 req/min por IP (mais restritivo — markdown longo).
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { calcularMapaCompleto } from '@/lib/oraculo/mapa-integrado';
import { checkRateLimit } from '@/lib/rate-limit';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  nomeCompleto: z.string().min(2).max(200),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM 24h'),
  localNascimento: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  tradiçãoPreferida: z
    .enum(['cigano', 'astrologia-ocidental', 'astrologia-védica', 'numerologia-pitagorica', 'tantra', 'cabala'])
    .optional(),
  sistemaNumerologia: z.enum(['pitagorica', 'caldeia', 'cabalistica-estrutural']).optional(),
  tradiçãoAstrologia: z.enum(['ocidental-tropical', 'védica-sidereal', 'chinesa']).optional(),
  anoReferência: z.number().int().min(1900).max(2200).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`oraculo-mapa-completo:${ip}`, {
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
    const mapa = await calcularMapaCompleto(parsed.data);

    // Persistência opcional (se autenticado e tabela existir)
    try {
      const supabase = createServerClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('oraculo_mapas').insert({
            user_id: user.id,
            input: parsed.data,
            mapa: mapa as unknown as Record<string, unknown>,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (persistErr) {
      // Não bloqueia resposta — persistência é best-effort
      console.warn('[oraculo/mapa-completo] Falha ao persistir:', persistErr);
    }

    return Response.json({ ok: true, mapa });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao calcular mapa';
    return Response.json(
      { error: { code: 'CALC_ERROR', message } },
      { status: 500 },
    );
  }
}

// GET /api/oraculo/historico — Wave 29 (Oracular Maps)
// ============================================================================
// Retorna os mapas integrados anteriores do usuário autenticado.
//
// Auth: REQUIRED. Se não autenticado, retorna 401.
//
// Output: { ok: true, mapas: Array<MapaCompleto resumido> }
//
// Rate limit: 10 req/min por usuário autenticado.
// ============================================================================

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

export async function GET(request: NextRequest): Promise<Response> {
  const supabase = createServerClient();
  if (!supabase) {
    return Response.json(
      { error: { code: 'SUPABASE_UNAVAILABLE', message: 'Supabase não configurado.' } },
      { status: 503 },
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Faça login para ver seu histórico.' } },
      { status: 401 },
    );
  }

  const rl = checkRateLimit(`oraculo-historico:${user.id}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  });
  if (!rl.allowed) {
    return Response.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisições — tente em 1 min.' } },
      { status: 429 },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 50);

  const { data, error } = await supabase
    .from('oraculo_mapas')
    .select('id, input, mapa, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Tabela pode não existir ainda — degrada gracefully
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      return Response.json({ ok: true, mapas: [], note: 'Histórico vazio (tabela ainda não criada).' });
    }
    return Response.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Resumir (não devolver mapa completo para economizar payload)
  const mapas = (data ?? []).map((row: any) => {
    const m = row.mapa as Record<string, unknown> | null;
    return {
      id: row.id,
      criadoEm: row.created_at,
      nome: (row.input as Record<string, unknown>)?.nomeCompleto,
      resumo: m?.resumoCurto,
      signoSolar: (m?.mapaNatal as Record<string, unknown>)?.signoSolar,
      caminhoDeVida: (m?.mapaNumerológico as Record<string, unknown>)?.caminhoDeVida,
    };
  });

  return Response.json({ ok: true, mapas });
}

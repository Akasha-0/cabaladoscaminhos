/**
 * API Route: GET /api/discoveries/[id]
 *
 * Wave 23.2 — UI Cadeia Viva.
 *
 * Retorna o view-model de uma DiscoveryChain para alimentar o
 * ThoughtChainView. Inclui:
 *   - Inputs (quais pilares + trânsito + chains anteriores)
 *   - Reasoning (chain-of-thought textual)
 *   - Papers citados (Wave 21.1 — LiteraturePaper join)
 *   - Related discoveries (Wave 20.2 retrieval)
 *   - Convergence (verdade universal + confidence)
 *
 * Auth:
 *   - User autenticado via `requireAkashaApi` (cookie JWT).
 *   - 401 se não autenticado.
 *   - 404 se DiscoveryChain não encontrada OU não pertence ao user.
 *   - 200 com view-model caso contrário.
 *
 * LGPD:
 *   - Response NÃO inclui PII direta (sem birthDate, nome, email).
 *   - Apenas contexto derivado (chain-of-thought) — alinhado com ADR-013.
 *
 * TODO Wave 20.2+ — quando schemas mergearem, `loadDiscoveryViewModel`
 * usa Prisma real. Hoje retorna mock determinístico (ver adapter).
 */
import { NextRequest, NextResponse } from 'next/server';

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { loadDiscoveryViewModel } from '@/lib/application/discoveries/adapter';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;
  if (!id || typeof id !== 'string' || id.length === 0 || id.length > 128) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const locale = request.nextUrl.searchParams.get('locale') ?? 'pt-BR';

  const model = await loadDiscoveryViewModel(id, locale);
  if (!model) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(model, {
    status: 200,
    headers: {
      'Cache-Control': 'private, max-age=30', // 30s — user pode re-renderizar
    },
  });
}
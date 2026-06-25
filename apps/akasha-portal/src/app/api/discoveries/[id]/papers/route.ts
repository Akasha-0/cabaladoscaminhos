/**
 * API Route: GET /api/discoveries/[id]/papers
 *
 * Wave 27.3 — Discovery drill-down: lista papers cited em um discovery.
 *
 * Complementa `/api/discoveries/[id]` (Wave 23.2 — view-model completo
 * do ThoughtChainView) com um endpoint FINO focado só nos papers. UI
 * usa este endpoint quando o Zelador clica no chip "papers" do
 * ThoughtChainView e quer ver a lista completa com abstract preview +
 * citation count.
 *
 * Response shape:
 *
 *   [
 *     {
 *       paperId: string,
 *       title: string,
 *       authors: string[],
 *       year: number,
 *       journal: string,
 *       abstract: string,         // locale-aware (pt-BR prefer, en fallback)
 *       citationCount: number,    // quantos outros discoveries citaram
 *       doi?: string | null,
 *       fullTextUrl?: string | null,
 *     },
 *     ...
 *   ]
 *
 * Auth:
 *   - User autenticado via `requireAkashaApi` (cookie JWT).
 *   - 401 se não autenticado.
 *   - 400 se id inválido (vazio / > 128 chars).
 *   - 200 com array (pode ser [] se discovery sem papers).
 *
 * Cache:
 *   - `private, max-age=3600` (1h) — papers são imutáveis entre
 *     re-renders do ThoughtChainView, e citationCount só muda quando
 *     outro discovery é criado (raro). 1h TTL é seguro.
 *   - Cache privado: cada user tem seu próprio view (auth required).
 *
 * LGPD:
 *   - Response NÃO inclui PII — papers são obras públicas (sem
 *     birthDate, email, userId). Abstract é público (PubMed/arXiv).
 *
 * i18n:
 *   - Query param `locale=pt-BR|en` controla qual abstract servir.
 *     Default: `pt-BR`.
 *
 * TODO Wave 21.1+ — quando schemas mergearem em main, setar
 * `USE_REAL_DB = true` em `papers-adapter.ts` (implementação Prisma
 * já documentada lá). Endpoint NÃO muda.
 */
import { NextRequest, NextResponse } from 'next/server';

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { loadDiscoveryPapers } from '@/lib/application/discoveries/papers-adapter';

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
  const normalizedLocale = locale === 'en' ? 'en' : 'pt-BR';

  const papers = await loadDiscoveryPapers(id, normalizedLocale);

  return NextResponse.json(papers, {
    status: 200,
    headers: {
      // 1h TTL — papers imutáveis, citationCount muda só quando outro
      // discovery é criado (raro). User pode re-renderizar sem custo.
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
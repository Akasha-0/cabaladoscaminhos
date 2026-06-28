// ============================================================================
// GET /api/articles/[slug] — Detalhe de artigo (Wave 21)
// ============================================================================
// Retorna o artigo completo + related articles (mesma tradição).
// Incrementa viewCount em background (fire-and-forget).
// Cache: s-maxage=300, swr=600 (conteúdo estável, métricas refrescam devagar).
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { getArticleBySlug, incrementArticleView } from '@/lib/community/articles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug || slug.trim().length === 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'slug obrigatório');
    }

    const article = await getArticleBySlug(slug);

    if (!article) {
      return fail(404, ErrorCode.NOT_FOUND, 'Artigo não encontrado');
    }

    // Background: incrementa view (não bloqueia response).
    // `waitUntil` é um helper do Next.js para tarefas fire-and-forget
    // que sobrevivem até a response ser enviada.
    incrementArticleView(article.id).catch((err) => {
      console.error('[articles/[slug]] incrementArticleView failed', err);
    });

    return ok(article, {
      meta: {
        slug: article.slug,
        viewCount: article.viewCount,
      },
      cache: {
        sMaxage: 300,
        staleWhileRevalidate: 600,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

// 405 para outros métodos
export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}

export async function PUT() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}

export async function DELETE() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}
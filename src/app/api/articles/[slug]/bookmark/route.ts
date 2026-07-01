// ============================================================================
// POST /api/articles/[slug]/bookmark — Toggle bookmark (Wave 29)
// ============================================================================
// Adiciona ou remove bookmark do usuário no artigo identificado por slug.
// Idempotente: se já existe, remove; senão cria. Retorna estado final.
//
// Auth: requireViewer (header x-dev-user-id em dev, Supabase em prod).
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { getArticleBySlug } from '@/lib/community/articles';
import { toggleArticleBookmark } from '@/lib/community/article-bookmarks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug || slug.trim().length === 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'slug obrigatório');
    }

    const viewer = await requireViewer();

    const article = await getArticleBySlug(slug);
    if (!article) {
      return fail(404, ErrorCode.NOT_FOUND, 'Artigo não encontrado');
    }

    const result = await toggleArticleBookmark({
      userId: viewer.id,
      articleId: article.id,
    });

    return ok(result, {
      meta: { slug, articleId: article.id },
      cache: { noStore: true },
    });
  } catch (err) {
    return handleError(err);
  }
}

// 405 explícito para outros métodos
export async function GET() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}
export async function PUT() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}
export async function DELETE() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}
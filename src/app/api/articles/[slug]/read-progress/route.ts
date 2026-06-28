// ============================================================================
// POST /api/articles/[slug]/read-progress — Salva progresso (Wave 21)
// ============================================================================
// Idempotente: upsert por (userId, articleId).
// Body: { percentRead: 0..100, lastPosition?: string }
//
// Comportamento:
//   - percentRead monotônico (não regredimos)
//   - completedAt setado uma única vez na primeira vez que atinge 100%
//   - readAt atualizado (permite "continue de onde parou")
// ============================================================================

import { NextRequest } from 'next/server';
import { ReadProgressSchema } from '@/lib/validators/articles';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { saveReadingProgress } from '@/lib/community/articles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug || slug.trim().length === 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'slug obrigatório');
    }

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para salvar seu progresso'
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = ReadProgressSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    // Resolve slug → articleId
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!article) {
      return fail(404, ErrorCode.NOT_FOUND, 'Artigo não encontrado');
    }

    const progress = await saveReadingProgress({
      userId: viewer.id,
      articleId: article.id,
      percentRead: parsed.data.percentRead,
      lastPosition: parsed.data.lastPosition,
    });

    return ok(progress);
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'name' in (err as Record<string, unknown>) &&
      (err as { name?: string }).name === 'NotFoundError'
    ) {
      return fail(404, ErrorCode.NOT_FOUND, 'Artigo não encontrado');
    }
    return handleError(err);
  }
}

// 405 para outros métodos
export async function GET() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}

export async function PUT() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}

export async function DELETE() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}
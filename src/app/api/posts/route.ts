// ============================================================================
// POSTS — /api/posts
// ============================================================================
// GET  → lista paginada do feed (cursor pagination)
// POST → cria novo post (autenticado)
// ============================================================================

import { NextRequest } from 'next/server';
import {
  FeedQuerySchema,
  CreatePostSchema,
} from '@/lib/validators/posts';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getFeed, createPost, getFeedPersonalized } from '@/lib/community/posts';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { checkPostRateLimit } from '@/lib/community/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = FeedQuerySchema.safeParse({
      cursor: sp.get('cursor') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      tradition: sp.get('tradition') ?? undefined,
      topic: sp.get('topic') ?? undefined,
      authorId: sp.get('authorId') ?? undefined,
      groupSlug: sp.get('groupSlug') ?? undefined,
      filter: sp.get('filter') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const viewer = await getViewer();

    // "Para voce" — recommendation engine; cai no feed padrão se não autenticado
    if (parsed.data.filter === 'para-voce') {
      if (viewer) {
        const result = await getFeedPersonalized({
          viewerId: viewer.id,
          limit: parsed.data.limit,
        });
        return ok(result, {
          meta: {
            nextCursor: result.nextCursor,
            total: result.total,
            count: result.posts.length,
          },
        });
      }
      // fallback: viewer anônimo = feed global
    }

    const result = await getFeed(parsed.data, viewer?.id ?? null);

    return ok(result, {
      meta: {
        nextCursor: result.nextCursor,
        total: result.total,
        count: result.posts.length,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para postar'
      );
    }

    const rl = checkPostRateLimit(viewer.id);
    if (!rl.allowed) {
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        `Você está postando rápido demais. Tente novamente em ${Math.ceil(rl.resetIn / 1000)}s.`
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const post = await createPost({
      authorId: viewer.id,
      content: parsed.data.content,
      type: parsed.data.type,
      tradition: parsed.data.tradition ?? null,
      topic: parsed.data.topic ?? null,
      groupSlug: parsed.data.groupSlug ?? null,
      mediaUrls: parsed.data.mediaUrls ?? [],
      references: parsed.data.references ?? null,
    });

    return ok(post, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
// ============================================================================
// POSTS — /api/posts/[id]/bookmark
// ============================================================================
// POST   → toggle bookmark (autenticado).
// DELETE → remove bookmark sem toggle (autenticado).
//
// Body (POST, opcional): { collectionName?: string }
// Body (DELETE, opcional): { collectionName?: string }
//
// Toggle = delete-if-exists + insert. Idempotente via @@unique.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { togglePostBookmark, removePostBookmark } from '@/lib/community/bookmarks';
import { checkUserRateLimit, userRateLimitMessage } from '@/lib/rate-limit-user';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para salvar um post'
      );
    }

    // Bookmark é mais barato que like; permitimos 200/h
    const userRl = checkUserRateLimit(viewer.id, 'like');
    if (!userRl.allowed) {
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        userRateLimitMessage('like', userRl.resetIn)
      );
    }

    // Body é opcional. Aceita { collectionName?: string }.
    let collectionName: string | null = null;
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text) as { collectionName?: string };
        if (typeof body.collectionName === 'string') {
          collectionName = body.collectionName;
        }
      }
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido no body');
    }

    const result = await togglePostBookmark({
      userId: viewer.id,
      postId: id,
      collectionName,
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para remover um bookmark'
      );
    }

    // Body opcional com collectionName
    let collectionName: string | null = null;
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text) as { collectionName?: string };
        if (typeof body.collectionName === 'string') {
          collectionName = body.collectionName;
        }
      }
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido no body');
    }

    const result = await removePostBookmark({
      userId: viewer.id,
      postId: id,
      collectionName,
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

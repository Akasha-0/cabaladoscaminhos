// ============================================================================
// POSTS — /api/posts/[id]/read
// ============================================================================
// POST → track read progress (autenticado).
//
// Body: { percentRead?: number }  // 0..100, default 0
//
// Idempotente via upsert em (userId, postId). percentRead nunca regride.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { trackPostRead } from '@/lib/community/bookmarks';
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
        'Você precisa estar logado para registrar leitura'
      );
    }

    // Read tracking pode ser chamado muitas vezes — limite generoso (200/h)
    const userRl = checkUserRateLimit(viewer.id, 'like');
    if (!userRl.allowed) {
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        userRateLimitMessage('like', userRl.resetIn)
      );
    }

    let percentRead: number | undefined;
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text) as { percentRead?: number };
        if (typeof body.percentRead === 'number') {
          percentRead = body.percentRead;
        }
      }
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido no body');
    }

    const result = await trackPostRead({
      userId: viewer.id,
      postId: id,
      percentRead,
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

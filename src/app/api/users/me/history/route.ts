// ============================================================================
// USERS — /api/users/me/history
// ============================================================================
// GET → histórico pessoal de leituras (autenticado).
//
// Query params:
//   limit  → máximo de itens (default 30, max 100)
//
// Resposta: { items: [{post, percentRead, readAt}], total }
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { listReadingHistory } from '@/lib/community/bookmarks';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para ver seu histórico'
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    let limit: number | undefined;
    if (limitParam) {
      const n = Number.parseInt(limitParam, 10);
      if (Number.isFinite(n) && n > 0) limit = n;
    }

    const result = await listReadingHistory({
      userId: viewer.id,
      limit,
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

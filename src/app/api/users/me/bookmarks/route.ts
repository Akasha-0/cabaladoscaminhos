// ============================================================================
// USERS — /api/users/me/bookmarks
// ============================================================================
// GET → lista os bookmarks do viewer (autenticado).
//
// Query params:
//   collection  → filtra por collection específica (opcional)
//   limit       → máximo de itens (default 30, max 100)
//
// Resposta: { items, collections: [{name, count}], total }
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { listPostBookmarks } from '@/lib/community/bookmarks';

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
        'Você precisa estar logado para ver seus bookmarks'
      );
    }

    const { searchParams } = new URL(request.url);
    const collectionParam = searchParams.get('collection');
    const limitParam = searchParams.get('limit');

    let limit: number | undefined;
    if (limitParam) {
      const n = Number.parseInt(limitParam, 10);
      if (Number.isFinite(n) && n > 0) limit = n;
    }

    const result = await listPostBookmarks({
      userId: viewer.id,
      collectionName: collectionParam, // null = sem filtro
      limit,
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

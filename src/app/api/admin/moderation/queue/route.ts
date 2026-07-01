// ============================================================================
// GET /api/admin/moderation/queue — fila de flags pendentes (Wave 20)
// ============================================================================
// Query params:
//   status — PENDING (default) | REVIEWED | ACTIONED | DISMISSED
//   limit  — default 50, max 200
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { getModerationQueue } from '@/lib/admin/metrics';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  status: z
    .enum(['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin required (${session.reason})`, 403);
    }

    const sp = request.nextUrl.searchParams;
    const parsed = QuerySchema.safeParse({
      status: sp.get('status') ?? undefined,
      limit: sp.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const data = await getModerationQueue({
      status: parsed.data.status,
      limit: parsed.data.limit,
    });

    return ok(data, {
      meta: { total: data.length, status: parsed.data.status ?? 'PENDING' },
      // Fila muda rápido quando staff age; refresh a cada 15s
      cache: { sMaxage: 15, staleWhileRevalidate: 30 },
    });
  } catch (err) {
    return handleError(err, 'GET /api/admin/moderation/queue');
  }
}

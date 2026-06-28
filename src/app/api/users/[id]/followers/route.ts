// ============================================================================
// GET /api/users/[id]/followers — Lista seguidores (Wave 21)
// ============================================================================
// Privacy:
//   - PRIVATE profile: só o próprio dono pode ver
//   - COMMUNITY profile: só logados
//   - PUBLIC profile: qualquer um
//   - Sem SpiritualProfile: conservador (só o próprio dono)
//
// Query: cursor, limit (default 30, max 100)
// ============================================================================

import { NextRequest } from 'next/server';
import { FollowListQuerySchema } from '@/lib/validators/articles';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import { canViewFollowList, listFollowers } from '@/lib/community/follow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || id.trim().length === 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'id obrigatório');
    }

    const sp = request.nextUrl.searchParams;
    const parsed = FollowListQuerySchema.safeParse({
      cursor: sp.get('cursor') ?? undefined,
      limit: sp.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const viewer = await getViewer();
    const privacy = await canViewFollowList(id, viewer?.id ?? null);

    if (!privacy.allowed) {
      // Mensagem genérica — não revela se o profile existe ou não
      return fail(403, ErrorCode.FORBIDDEN, 'Lista de seguidores privada');
    }

    const result = await listFollowers({
      targetUserId: id,
      cursor: parsed.data.cursor ?? null,
      limit: parsed.data.limit,
    });

    return ok(result, {
      meta: {
        targetUserId: id,
        nextCursor: result.nextCursor,
        total: result.total,
        count: result.users.length,
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
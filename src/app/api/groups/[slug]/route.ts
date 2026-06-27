// ============================================================================
// GROUPS — /api/groups/[slug]
// ============================================================================
// GET    → detalhes de um grupo (com flag isMember/viewerRole)
// PATCH  → atualiza (somente ADMIN/MODERATOR)
// DELETE → deleta (somente ADMIN)
// ============================================================================

import { NextRequest } from 'next/server';
import {
  ok, fail, fromZodError, handleError, ErrorCode,
} from '@/lib/community/api';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { UpdateGroupSchema } from '@/lib/validators/groups';
import {
  getGroupBySlug, updateGroup, deleteGroup,
  GroupNotFoundError, GroupForbiddenError,
} from '@/lib/community/groups';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const viewer = await getViewer();
    const group = await getGroupBySlug(slug, viewer?.id ?? null);
    if (!group) {
      return fail(404, ErrorCode.NOT_FOUND, 'Grupo não encontrado');
    }
    return ok(group, { meta: { viewerId: viewer?.id ?? null } });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const { slug } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = UpdateGroupSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const group = await updateGroup({
      slug,
      actorId: viewer.id,
      data: parsed.data,
    });
    return ok(group);
  } catch (err) {
    if (err instanceof GroupNotFoundError) {
      return fail(404, ErrorCode.NOT_FOUND, err.message);
    }
    if (err instanceof GroupForbiddenError) {
      return fail(403, ErrorCode.FORBIDDEN, err.message);
    }
    return handleError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const { slug } = await params;
    await deleteGroup({ slug, actorId: viewer.id });
    return ok({ slug, deleted: true });
  } catch (err) {
    if (err instanceof GroupNotFoundError) {
      return fail(404, ErrorCode.NOT_FOUND, err.message);
    }
    if (err instanceof GroupForbiddenError) {
      return fail(403, ErrorCode.FORBIDDEN, err.message);
    }
    return handleError(err);
  }
}

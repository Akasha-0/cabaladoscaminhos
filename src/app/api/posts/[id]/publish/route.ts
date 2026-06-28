// ============================================================================
// POSTS — /api/posts/[id]/publish
// ============================================================================
// POST → publica imediatamente, mesmo que esteja DRAFT ou SCHEDULED
//   - Transita para status=PUBLISHED
//   - publishedAt = now (se nunca publicado)
//   - scheduledFor é zerado (não fica fantasma)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { postToDto } from '@/lib/community/posts';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return fail(404, ErrorCode.NOT_FOUND, 'Post não encontrado');
    }
    if (existing.authorId !== viewer.id) {
      return fail(403, ErrorCode.FORBIDDEN, 'Você não pode publicar o post de outro autor');
    }

    const now = new Date();
    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: existing.publishedAt ?? now,
        scheduledFor: null,
      },
      include: {
        group: true,
        likes: { select: { userId: true } },
        comments: { select: { id: true } },
      },
    });

    return ok(postToDto(updated, viewer.id));
  } catch (err) {
    return handleError(err);
  }
}

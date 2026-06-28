// ============================================================================
// POSTS — /api/posts/[id]/schedule
// ============================================================================
// POST → agenda publicação para o futuro
//   body: { scheduledFor: ISO-8601 datetime }
//   - Regras:
//     * scheduledFor deve ser > now + 1min (não permitimos agendar no passado)
//     * Post.transita para status=SCHEDULED
//     * publishedAt fica null (será preenchido quando o cron publicar)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { postToDto } from '@/lib/community/posts';

export const dynamic = 'force-dynamic';

const ScheduleSchema = z.object({
  scheduledFor: z
    .string()
    .datetime({ offset: true })
    .refine(
      (iso) => new Date(iso).getTime() > Date.now() + 60_000,
      'scheduledFor precisa ser pelo menos 1 min no futuro'
    ),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = ScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return fail(404, ErrorCode.NOT_FOUND, 'Post não encontrado');
    }
    if (existing.authorId !== viewer.id) {
      return fail(403, ErrorCode.FORBIDDEN, 'Você não pode agendar o post de outro autor');
    }

    const scheduledFor = new Date(parsed.data.scheduledFor);

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledFor,
        publishedAt: null,
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

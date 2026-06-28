// ============================================================================
// DRAFTS — /api/drafts/[id]
// ============================================================================
// GET    → detalhe de um draft (somente autor)
// PATCH  → atualiza (somente autor; usado por auto-save)
// DELETE → remove definitivamente (somente autor)
// ============================================================================

import { NextRequest } from 'next/server';
import { DraftUpdateSchema } from '@/lib/validators/drafts';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { draftToDto } from '@/lib/community/drafts';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function loadOwnedDraft(draftId: string, viewerId: string) {
  const draft = await prisma.draft.findUnique({ where: { id: draftId } });
  if (!draft) {
    const err = new Error('Draft não encontrado');
    (err as Error & { name: string }).name = 'DraftNotFoundError';
    throw err;
  }
  if (draft.authorId !== viewerId) {
    const err = new Error('Você não tem permissão sobre este draft');
    (err as Error & { name: string; statusCode: number }).name = 'DraftForbiddenError';
    (err as Error & { statusCode?: number }).statusCode = 403;
    throw err;
  }
  return draft;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;
    const draft = await loadOwnedDraft(id, viewer.id);
    return ok(draftToDto(draft));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = DraftUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    await loadOwnedDraft(id, viewer.id);

    const updated = await prisma.draft.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.content !== undefined && { content: parsed.data.content }),
        ...(parsed.data.tradition !== undefined && { tradition: parsed.data.tradition }),
        ...(parsed.data.topic !== undefined && { topic: parsed.data.topic }),
        ...(parsed.data.tags !== undefined && { tags: parsed.data.tags }),
        lastSavedAt: new Date(),
      },
    });

    return ok(draftToDto(updated));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;
    await loadOwnedDraft(id, viewer.id);

    await prisma.draft.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}

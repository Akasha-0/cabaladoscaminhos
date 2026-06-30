// ============================================================================
// DRAFTS — /api/drafts
// ============================================================================
// GET  → lista todos os drafts do viewer (mais recentes primeiro)
// POST → cria um novo draft (ou auto-save de um existente via `id` no body)
// ============================================================================

import { NextRequest } from 'next/server';
import { DraftCreateSchema } from '@/lib/validators/drafts';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { draftToDto } from '@/lib/community/drafts';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para ver seus rascunhos'
      );
    }

    const drafts = await prisma.draft.findMany({
      where: { authorId: viewer.id },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return ok(
      drafts.map((d: any) => draftToDto(d)),
      { meta: { count: drafts.length } }
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para criar um rascunho'
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = DraftCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    // Auto-save: se vier `id` e pertencer ao viewer, atualizamos; senão criamos.
    if (parsed.data.id) {
      const existing = await prisma.draft.findUnique({
        where: { id: parsed.data.id },
      });
      if (existing && existing.authorId === viewer.id) {
        const updated = await prisma.draft.update({
          where: { id: existing.id },
          data: {
            title: parsed.data.title ?? existing.title,
            content: parsed.data.content,
            tradition: parsed.data.tradition ?? existing.tradition,
            topic: parsed.data.topic ?? existing.topic,
            tags: parsed.data.tags ?? existing.tags,
            lastSavedAt: new Date(),
          },
        });
        return ok(draftToDto(updated));
      }
    }

    const created = await prisma.draft.create({
      data: {
        authorId: viewer.id,
        title: parsed.data.title ?? null,
        content: parsed.data.content,
        tradition: parsed.data.tradition ?? null,
        topic: parsed.data.topic ?? null,
        tags: parsed.data.tags ?? [],
        lastSavedAt: new Date(),
      },
    });

    return ok(draftToDto(created), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

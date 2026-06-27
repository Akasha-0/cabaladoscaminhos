// ============================================================================
// API /api/notifications/[id]/read — mark single notification as read
// ============================================================================
// PATCH /api/notifications/[id]/read
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Body schema (optional read state)
// ============================================================================

const BodySchema = z
  .object({
    read: z.boolean().default(true),
  })
  .optional();

// ============================================================================
// PATCH handler
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    }

    let body: z.infer<typeof BodySchema> = undefined;
    try {
      const raw = await request.json();
      body = BodySchema.parse(raw);
    } catch {
      // Body vazio ou inválido → marca como lida por default
      body = { read: true };
    }
    const readState = body?.read ?? true;

    // Verifica ownership antes de atualizar
    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true, read: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }
    if (existing.userId !== viewer.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read: readState,
        readAt: readState ? new Date() : null,
      },
      select: {
        id: true,
        read: true,
        readAt: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      read: updated.read,
      readAt: updated.readAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error('[api/notifications/[id]/read][PATCH] error', err);
    return NextResponse.json(
      { error: 'Erro ao atualizar notificação' },
      { status: 500 }
    );
  }
}

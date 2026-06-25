/**
 * PATCH /api/notifications/[id]
 *   Marca UMA notificação específica como lida.
 *   - 200 → { notification: NotificationDTO } (com readAt setado)
 *   - 404 → { error: 'not_found' }  (id não existe OU não pertence ao user)
 *   - 410 → { error: 'already_read' }  (idempotência: caller pode ignorar)
 *
 * Segurança:
 *   - Filtramos por (id, userId) na query para evitar IDOR — mesmo que
 *     um atacante saiba o cuid de outra pessoa, o `userId` no WHERE
 *     garante que ele só consegue marcar como lida as próprias.
 *   - Não fazemos cascade delete nem outras mutações: PATCH é só read.
 *
 * DELETE /api/notifications/[id]
 *   Deleta uma notificação específica (soft-delete não foi pedido —
 *     "marcar como lida" é a convenção canônica de "esconder").
 *   - 204 No Content (sucesso)
 *   - 404 → { error: 'not_found' }
 *
 *   Mantido como escape hatch para preferências futuras ("limpar histórico"
 *   ou "ocultar notificação"). Hoje a UI não chama.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { toDTO } from '@/lib/application/notifications/create';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  const existing = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true, readAt: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Idempotência: se já lida, retorna 410 para o caller saber que é
  // no-op (mas não erro real). Caller decide se ignora ou mostra toast.
  if (existing.readAt !== null) {
    return NextResponse.json(
      { error: 'already_read' },
      { status: 410 }
    );
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ notification: toDTO(updated) });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  // deleteMany com where={id, userId}: 0 affected = 404 (não existe ou
  // não pertence ao user — indistinguível para o caller, intencional).
  const result = await prisma.notification.deleteMany({
    where: { id, userId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
// ============================================================================
// API /api/notifications/unsubscribe — processar token de unsubscribe
// ============================================================================
// GET /api/notifications/unsubscribe?token=...   → redireciona pra UI
// POST /api/notifications/unsubscribe { token } → aplica unsubscribe
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET — redireciona pra UI com confirmação
// ============================================================================

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/settings/notifications', request.url));
  }

  // Verifica se token existe (sem aplicar)
  const row = await prisma.unsubscribeToken.findUnique({
    where: { token },
    select: { userId: true, type: true, expiresAt: true, usedAt: true },
  });

  if (!row || row.expiresAt < new Date() || row.usedAt) {
    return NextResponse.redirect(
      new URL('/settings/notifications?unsub=invalid', request.url)
    );
  }

  return NextResponse.redirect(
    new URL(
      `/settings/notifications?unsub=confirm&type=${row.type ?? 'all'}`,
      request.url
    )
  );
}

// ============================================================================
// POST — aplica unsubscribe
// ============================================================================

const BodySchema = z.object({
  token: z.string().min(1),
  // 'all' desabilita todas as notificações; senão, só o tipo específico
  scope: z.enum(['type', 'all']).default('type'),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Token inválido', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, scope } = parsed.data;
    const row = await prisma.unsubscribeToken.findUnique({
      where: { token },
      select: { id: true, userId: true, type: true, expiresAt: true, usedAt: true },
    });

    if (!row || row.expiresAt < new Date() || row.usedAt) {
      return NextResponse.json(
        { error: 'Token expirado ou já usado' },
        { status: 410 }
      );
    }

    // Marca token como usado
    await prisma.unsubscribeToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });

    if (scope === 'all') {
      // Desabilita email para todos os tipos
      await prisma.notificationPreference.updateMany({
        where: { userId: row.userId },
        data: { email: false },
      });
      return NextResponse.json({
        success: true,
        scope: 'all',
        message: 'Você não receberá mais emails do Akasha Portal.',
      });
    }

    // Desabilita email para o tipo específico
    if (row.type) {
      const type = row.type as NotificationType;
      await prisma.notificationPreference.upsert({
        where: { userId_type: { userId: row.userId, type } },
        create: { userId: row.userId, type, email: false },
        update: { email: false },
      });
      return NextResponse.json({
        success: true,
        scope: 'type',
        type,
        message: `Você não receberá mais emails sobre ${type}.`,
      });
    }

    return NextResponse.json({
      success: true,
      scope: 'type',
      message: 'Inscrição cancelada.',
    });
  } catch (err) {
    console.error('[api/notifications/unsubscribe][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar unsubscribe' },
      { status: 500 }
    );
  }
}

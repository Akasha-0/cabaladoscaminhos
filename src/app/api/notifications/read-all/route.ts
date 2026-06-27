// ============================================================================
// API /api/notifications/read-all — mark all notifications as read
// ============================================================================
// PATCH /api/notifications/read-all
// Body (optional): { olderThan?: ISO8601, type?: NotificationType }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Body schema
// ============================================================================

const BodySchema = z
  .object({
    olderThan: z.string().datetime().optional(),
    type: z
      .enum([
        'LIKE',
        'COMMENT',
        'POST_REPLY',
        'FOLLOW',
        'MENTION',
        'GROUP_INVITE',
        'GROUP_POST',
        'GROUP_ROLE_CHANGE',
        'ARTICLE_RECOMMENDATION',
        'ARTICLE_PUBLISHED',
        'SYSTEM_ALERT',
        'MODERATION_ACTION',
        'DIGEST_WEEKLY',
      ])
      .optional(),
  })
  .optional();

// ============================================================================
// PATCH handler
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let body: z.infer<typeof BodySchema> = undefined;
    try {
      const raw = await request.json();
      body = BodySchema.parse(raw);
    } catch {
      body = {};
    }

    const where: {
      userId: string;
      read: boolean;
      createdAt?: { lt: Date };
      type?: z.infer<typeof BodySchema> extends infer T
        ? T extends { type: infer U }
          ? U
          : never
        : never;
    } = {
      userId: viewer.id,
      read: false,
    };

    if (body?.olderThan) {
      where.createdAt = { lt: new Date(body.olderThan) };
    }
    if (body?.type) {
      where.type = body.type;
    }

    const result = await prisma.notification.updateMany({
      where,
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    const remaining = await prisma.notification.count({
      where: { userId: viewer.id, read: false },
    });

    return NextResponse.json({
      updated: result.count,
      remainingUnread: remaining,
    });
  } catch (err) {
    console.error('[api/notifications/read-all][PATCH] error', err);
    return NextResponse.json(
      { error: 'Erro ao marcar notificações como lidas' },
      { status: 500 }
    );
  }
}

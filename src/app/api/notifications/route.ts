// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// API /api/notifications — list (paginated) + count unread
// ============================================================================
// GET /api/notifications?cursor=...&limit=20&filter=unread&type=LIKE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import type { NotificationType } from '@prisma/client';
import type { NotificationDto, PaginatedNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// ============================================================================
// Query schema
// ============================================================================

const QuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  filter: z.enum(['all', 'unread', 'read']).default('all'),
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
});

// ============================================================================
// Cursor helpers
// ============================================================================

interface Cursor {
  createdAt: string;
  id: string;
}

function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}

function decodeCursor(raw: string): Cursor | null {
  try {
    const json = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (typeof json?.createdAt !== 'string' || typeof json?.id !== 'string') {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

// ============================================================================
// GET handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = QuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { cursor, limit, filter, type } = parsed.data;

    const where: {
      userId: string;
      read?: boolean;
      type?: NotificationType;
      OR?: unknown[];
    } = { userId: viewer.id };

    if (filter === 'unread') where.read = false;
    if (filter === 'read') where.read = true;
    if (type) where.type = type;

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        where.OR = [
          { createdAt: { lt: new Date(decoded.createdAt) } },
          {
            AND: [
              { createdAt: new Date(decoded.createdAt) },
              { id: { lt: decoded.id } },
            ],
          },
        ];
      }
    }

    const [rows, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      }),
      prisma.notification.count({
        where: { userId: viewer.id, read: false },
      }),
    ]);

    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? encodeCursor({
          createdAt: slice[slice.length - 1]!.createdAt.toISOString(),
          id: slice[slice.length - 1]!.id,
        })
      : null;

    const items: NotificationDto[] = slice.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type,
      actorId: r.actorId,
      actorSnapshot: (r.actorSnapshot as NotificationDto['actorSnapshot']) ?? null,
      entityType: r.entityType ?? null,
      entityId: r.entityId,
      postId: r.postId,
      commentId: r.commentId,
      groupId: r.groupId,
      articleId: r.articleId,
      groupKey: r.groupKey,
      count: r.count,
      payload: (r.payload as NotificationDto['payload']) ?? null,
      read: r.read,
      readAt: r.readAt?.toISOString() ?? null,
      emailedAt: r.emailedAt?.toISOString() ?? null,
      pushedAt: r.pushedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const body: PaginatedNotifications = {
      items,
      nextCursor,
      unreadCount,
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error('[api/notifications][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao listar notificações' },
      { status: 500 }
    );
  }
}

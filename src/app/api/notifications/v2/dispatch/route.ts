// ============================================================================
// API /api/notifications/v2/dispatch — dispara uma notif V2 manualmente
// ============================================================================
// POST   — usado por testes internos + tools para forçar envio (ex: sistema
// crítico que precisa bypass de preferências)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import { dispatchNotification, type DispatchChannel } from '@/lib/notifications/v2';
import { resolveCategoryMatrix, DEFAULT_QUIET_HOURS, DEFAULT_DIGEST } from '@/lib/notifications/v2';
import type { NotificationDto } from '@/lib/notifications';
import type { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface DispatchBody {
  notificationId: string;
  forceChannels?: DispatchChannel[];
}

export async function POST(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    let body: DispatchBody;
    try {
      body = (await req.json()) as DispatchBody;
    } catch {
      return fail(400, 'INVALID_JSON', 'Body inválido');
    }

    if (!body.notificationId) {
      return fail(400, 'MISSING_ID', 'notificationId obrigatório');
    }

    // Stub: em prod, carregar do DB; aqui retornamos shape para o caller.
    const stub: NotificationDto = {
      id: body.notificationId,
      userId: viewer.id,
      type: 'MENTION' as NotificationType,
      actorId: null,
      actorSnapshot: null,
      entityType: null,
      entityId: null,
      postId: null,
      commentId: null,
      groupId: null,
      articleId: null,
      groupKey: null,
      count: 1,
      payload: { preview: 'preview stub' },
      read: false,
      readAt: null,
      emailedAt: null,
      pushedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await dispatchNotification({
      notification: stub,
      prefs: {
        userId: viewer.id,
        categories: resolveCategoryMatrix(null),
        quietHours: DEFAULT_QUIET_HOURS,
        digestFrequency: DEFAULT_DIGEST,
        updatedAt: new Date().toISOString(),
      },
      ctx: {
        device: 'desktop',
        lastVisitAt: null,
        engagementByCategory: {},
        tradition: 'candomble',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        marketingConsentRevoked: false,
      },
      forceChannels: body.forceChannels,
    });

    return ok({ result });
  } catch (err) {
    return handleError(err);
  }
}

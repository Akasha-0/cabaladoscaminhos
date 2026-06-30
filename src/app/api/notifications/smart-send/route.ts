// ============================================================================
// API /api/notifications/smart-send — envio inteligente (W30 7/8)
// ============================================================================
// POST /api/notifications/smart-send
//
// Body:
//   {
//     userId: string,
//     type: NotificationType,
//     channel: "IN_APP" | "EMAIL" | "PUSH",
//     title: string,
//     body: string,
//     payload?: { link?, data? },
//     inFocusMode?: boolean,           // detectado client-side
//     experimentVariant?: string,      // R7 A/B
//   }
//
// Fluxo:
//   1. Carrega perfil (smart-scheduler)
//   2. Carrega log de entregas recentes (24h)
//   3. decide(profile, ctx, payload, log) → ScheduleResult
//   4. Persiste NotificationEvent (auditoria LGPD Art. 37)
//   5. Se SEND_NOW / BATCH → chama createNotification
//   6. Retorna decisão + eventId
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import {
  decide,
  DEFAULT_PROFILE,
  type UserNotificationProfile,
  type Channel,
  type ScheduleContext,
  type RecentDeliveryLog,
} from '@/lib/notifications/smart-scheduler';
import { createNotification } from '@/lib/notifications/triggers';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schemas
// ============================================================================

const ChannelEnum = z.enum(['IN_APP', 'EMAIL', 'PUSH']);

const BodySchema = z.object({
  userId: z.string().min(1),
  type: z.enum([
    'LIKE', 'COMMENT', 'POST_REPLY', 'FOLLOW', 'MENTION',
    'GROUP_INVITE', 'GROUP_POST', 'GROUP_ROLE_CHANGE',
    'ARTICLE_RECOMMENDATION', 'ARTICLE_PUBLISHED',
    'SYSTEM_ALERT', 'MODERATION_ACTION', 'DIGEST_WEEKLY',
  ] as const),
  channel: ChannelEnum,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  payload: z.record(z.unknown()).optional(),
  inFocusMode: z.boolean().optional(),
  experimentVariant: z.string().max(50).optional(),
  // Forçar bypass de preferências (apenas para service-to-service).
  isCritical: z.boolean().optional(),
});

// ============================================================================
// Helpers
// ============================================================================

async function loadFullProfile(userId: string): Promise<UserNotificationProfile> {
  const row = await prisma.notificationProfile.findUnique({ where: { userId } });
  const typePrefs = await prisma.notificationPreference.findMany({
    where: { userId },
    select: { type: true, inApp: true, email: true, push: true },
  });
  const typePreferences: UserNotificationProfile['typePreferences'] = {};
  for (const p of typePrefs) {
    typePreferences[p.type] = { inApp: p.inApp, email: p.email, push: p.push };
  }
  return {
    userId,
    quietHoursStart: row?.quietHoursStart ?? DEFAULT_PROFILE.quietHoursStart,
    quietHoursEnd: row?.quietHoursEnd ?? DEFAULT_PROFILE.quietHoursEnd,
    sacredDaysOff:
      (row?.sacredDaysOff as number[] | null) ?? DEFAULT_PROFILE.sacredDaysOff,
    frequencyCap:
      (row?.frequencyCap as UserNotificationProfile['frequencyCap'] | null) ??
      DEFAULT_PROFILE.frequencyCap,
    tone: (row?.tone as UserNotificationProfile['tone']) ?? DEFAULT_PROFILE.tone,
    timezone: row?.timezone ?? DEFAULT_PROFILE.timezone,
    aiPersonalizationEnabled:
      row?.aiPersonalizationEnabled ?? DEFAULT_PROFILE.aiPersonalizationEnabled,
    marketingConsent: row?.marketingConsent ?? DEFAULT_PROFILE.marketingConsent,
    dataErasureRequested:
      row?.dataErasureRequested ?? DEFAULT_PROFILE.dataErasureRequested,
    ethicsAcknowledgedAt: row?.ethicsAcknowledgedAt ?? null,
    typePreferences,
  };
}

async function loadRecentLog(userId: string): Promise<RecentDeliveryLog[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await prisma.notificationEvent.findMany({
    where: {
      userId,
      createdAt: { gte: since },
      decision: 'SENT',
    },
    select: { channel: true, createdAt: true },
  });
  return rows
    .filter((r): r is { channel: string; createdAt: Date } => r.channel !== null)
    .map((r) => ({
      channel: r.channel as Channel,
      timestamp: r.createdAt,
    }));
}

// ============================================================================
// POST
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Corpo inválido', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Service-to-service: só admin pode forçar envio para outro userId.
    // Aqui simplificamos: viewer.id === body.userId. Em prod, checar role.
    if (body.userId !== viewer.id) {
      return NextResponse.json(
        { error: 'Sem permissão para enviar para outro usuário' },
        { status: 403 }
      );
    }

    // Carrega perfil + log
    const [profile, recentLog] = await Promise.all([
      loadFullProfile(body.userId),
      loadRecentLog(body.userId),
    ]);

    // Contexto da decisão
    const ctx: ScheduleContext = {
      userId: body.userId,
      type: body.type as NotificationType,
      channel: body.channel,
      now: new Date(),
      inFocusMode: body.inFocusMode ?? false,
      isCritical: body.isCritical ?? false,
      experimentVariant: body.experimentVariant,
    };

    // Decide
    const result = decide(profile, ctx, { title: body.title, body: body.body }, recentLog);

    // Persiste evento de auditoria (LGPD Art. 37) — expira em 90 dias
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const event = await prisma.notificationEvent.create({
      data: {
        userId: body.userId,
        type: body.type as NotificationType,
        payload: { title: body.title, body: body.body, ...(body.payload ?? {}) },
        decision: result.decision as
          | 'SENT' | 'DEFERRED' | 'BATCHED'
          | 'SKIPPED_PREF' | 'SKIPPED_DND' | 'SKIPPED_SACRED'
          | 'SKIPPED_FREQ' | 'SKIPPED_LGPD' | 'SKIPPED_ETHICS' | 'FAILED',
        decisionReason: result.reason,
        channel: body.channel,
        scheduledFor: result.nextAllowedAt ?? new Date(),
        sentAt: result.decision === 'SEND_NOW' ? new Date() : null,
        experimentVariant: result.experimentVariant,
        expiresAt,
        sourceEvent: 'smart-send',
      },
    });

    // Se SEND_NOW, dispara o canal correspondente via triggers
    let dispatchResult: unknown = null;
    if (result.decision === 'SEND_NOW' || result.decision === 'BATCH') {
      try {
        // createNotification cuida de in-app + email + push fanout
        // respeitando preferências por canal.
        dispatchResult = await createNotification({
          userId: body.userId,
          type: body.type as NotificationType,
          payload: {
            preview: body.title,
            excerpt: body.body,
            link: typeof body.payload?.['link'] === 'string'
              ? (body.payload['link'] as string)
              : '/notifications',
          },
          // CRITICAL_TYPES já bypassa via triggers; isCritical flag aqui é
          // um reforço caso o caller saiba que é crítico.
          respectPreferences: !body.isCritical,
        });
      } catch (err) {
        console.error('[api/notifications/smart-send] dispatch failed', err);
        await prisma.notificationEvent.update({
          where: { id: event.id },
          data: { decision: 'FAILED', decisionReason: `Dispatch error: ${String(err)}` },
        });
      }
    }

    return NextResponse.json({
      eventId: event.id,
      decision: result.decision,
      reason: result.reason,
      nextAllowedAt: result.nextAllowedAt?.toISOString() ?? null,
      suggestedTone: result.suggestedTone,
      batchKey: result.batchKey,
      experimentVariant: result.experimentVariant,
      dispatch: dispatchResult,
    });
  } catch (err) {
    console.error('[api/notifications/smart-send][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar envio inteligente' },
      { status: 500 }
    );
  }
}

// ============================================================================
// API /api/notifications/preferences — gerenciar preferências do user
// ============================================================================
// GET  /api/notifications/preferences         → todas as preferências (com defaults)
// PATCH /api/notifications/preferences        → atualizar uma ou várias
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import {
  DEFAULT_PREFERENCES,
  resolvePreferences,
  type NotificationPreferenceDto,
} from '@/lib/notifications';
import type { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schema do body (single + bulk)
// ============================================================================

const NotificationTypeEnum = z.enum([
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
]);

const PatchBodySchema = z.union([
  // Single
  z.object({
    type: NotificationTypeEnum,
    inApp: z.boolean().optional(),
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  }),
  // Bulk
  z.object({
    bulk: z.array(
      z.object({
        type: NotificationTypeEnum,
        inApp: z.boolean().optional(),
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
      })
    ),
  }),
]);

// ============================================================================
// GET — todas as preferências (defaults aplicados)
// ============================================================================

export async function GET() {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const rows = await prisma.notificationPreference.findMany({
      where: { userId: viewer.id },
      select: {
        type: true,
        inApp: true,
        email: true,
        push: true,
        weeklyDigest: true,
      },
    });

    const resolved = resolvePreferences(rows);

    const items: NotificationPreferenceDto[] = (
      Object.keys(resolved) as NotificationType[]
    ).map((type) => ({
      type,
      inApp: resolved[type].inApp,
      email: resolved[type].email,
      push: resolved[type].push,
      weeklyDigest: resolved[type].weeklyDigest,
    }));

    return NextResponse.json({ items, defaults: DEFAULT_PREFERENCES });
  } catch (err) {
    console.error('[api/notifications/preferences][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao listar preferências' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH — atualizar (single ou bulk)
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = PatchBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Corpo inválido', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates: Array<{
      type: NotificationType;
      inApp?: boolean;
      email?: boolean;
      push?: boolean;
      weeklyDigest?: boolean;
    }> = 'bulk' in parsed.data ? parsed.data.bulk : [parsed.data];

    // Aplicar upserts
    await Promise.all(
      updates.map((u) =>
        prisma.notificationPreference.upsert({
          where: { userId_type: { userId: viewer.id, type: u.type } },
          create: {
            userId: viewer.id,
            type: u.type,
            inApp: u.inApp ?? DEFAULT_PREFERENCES[u.type].inApp,
            email: u.email ?? DEFAULT_PREFERENCES[u.type].email,
            push: u.push ?? DEFAULT_PREFERENCES[u.type].push,
            weeklyDigest:
              u.weeklyDigest ?? DEFAULT_PREFERENCES[u.type].weeklyDigest,
          },
          update: {
            ...(u.inApp !== undefined && { inApp: u.inApp }),
            ...(u.email !== undefined && { email: u.email }),
            ...(u.push !== undefined && { push: u.push }),
            ...(u.weeklyDigest !== undefined && { weeklyDigest: u.weeklyDigest }),
          },
        })
      )
    );

    // Retorna estado atualizado
    const rows = await prisma.notificationPreference.findMany({
      where: { userId: viewer.id },
      select: {
        type: true,
        inApp: true,
        email: true,
        push: true,
        weeklyDigest: true,
      },
    });
    const resolved = resolvePreferences(rows);

    return NextResponse.json({
      items: (Object.keys(resolved) as NotificationType[]).map((type) => ({
        type,
        inApp: resolved[type].inApp,
        email: resolved[type].email,
        push: resolved[type].push,
        weeklyDigest: resolved[type].weeklyDigest,
      })),
      updated: updates.length,
    });
  } catch (err) {
    console.error('[api/notifications/preferences][PATCH] error', err);
    return NextResponse.json(
      { error: 'Erro ao atualizar preferências' },
      { status: 500 }
    );
  }
}

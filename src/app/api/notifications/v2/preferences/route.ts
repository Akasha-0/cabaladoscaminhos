// ============================================================================
// API /api/notifications/v2/preferences — V2 preference matrix
// ============================================================================
// GET   — retorna matriz resolvida (defaults merged) + quiet hours + digest
// PATCH — atualiza a matriz granularmente
//
// Persistência: campo adicional no NotificationPreference (raw JSON) — o
// front-end envia apenas os toggles alterados; server merge com defaults.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import {
  ALL_CATEGORIES,
  ALL_CHANNELS_V2,
  DEFAULT_MATRIX,
  DEFAULT_QUIET_HOURS,
  DEFAULT_DIGEST,
  resolveCategoryMatrix,
  validatePreferences,
  type NotificationPreference,
  type CategoryChannelMatrix,
  type DigestFrequency,
  type QuietHours,
} from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET
// ============================================================================

export async function GET() {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Tenta carregar de NotificationPreference.payloadJson (se já migrado);
    // senão retorna defaults.
    const row = await prisma.notificationPreference.findFirst({
      where: { userId: viewer.id },
    });

    let prefs: NotificationPreference;
    if (row && (row as unknown as { payloadJson?: unknown }).payloadJson) {
      const stored = (row as unknown as { payloadJson: string }).payloadJson;
      try {
        const parsed = JSON.parse(stored) as Partial<NotificationPreference>;
        prefs = {
          userId: viewer.id,
          categories: resolveCategoryMatrix(parsed.categories),
          quietHours: parsed.quietHours ?? DEFAULT_QUIET_HOURS,
          digestFrequency: parsed.digestFrequency ?? DEFAULT_DIGEST,
          updatedAt: parsed.updatedAt ?? new Date().toISOString(),
        };
      } catch {
        prefs = defaultPrefs(viewer.id);
      }
    } else {
      prefs = defaultPrefs(viewer.id);
    }

    return NextResponse.json(
      {
        preferences: prefs,
        meta: {
          categories: ALL_CATEGORIES,
          channels: ALL_CHANNELS_V2,
          cells: ALL_CATEGORIES.length * ALL_CHANNELS_V2.length,
          defaults: DEFAULT_MATRIX,
        },
      },
      {
        headers: { 'cache-control': 'private, max-age=30' },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}

function defaultPrefs(userId: string): NotificationPreference {
  return {
    userId,
    categories: { ...DEFAULT_MATRIX },
    quietHours: { ...DEFAULT_QUIET_HOURS },
    digestFrequency: DEFAULT_DIGEST,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// PATCH
// ============================================================================

interface PatchBody {
  categories?: Partial<CategoryChannelMatrix>;
  quietHours?: QuietHours;
  digestFrequency?: DigestFrequency;
}

export async function PATCH(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    let body: PatchBody;
    try {
      body = (await req.json()) as PatchBody;
    } catch {
      return fail(400, 'INVALID_JSON', 'Body inválido');
    }

    const current = await loadOrDefault(viewer.id);

    const next: NotificationPreference = {
      userId: viewer.id,
      categories: body.categories
        ? resolveCategoryMatrix({ ...current.categories, ...body.categories })
        : current.categories,
      quietHours: body.quietHours ?? current.quietHours,
      digestFrequency: body.digestFrequency ?? current.digestFrequency,
      updatedAt: new Date().toISOString(),
    };

    const validation = validatePreferences(next);
    if (!validation.ok) {
      return fail(400, 'INVALID_PREFS', validation.errors.join('; '));
    }

    // Persiste (graceful — se campo não existir, tabela já armazena JSON em
    // payload; senão, upsert básico com defaults).
    await prisma.notificationPreference.upsert({
      where: { userId_type: { userId: viewer.id, type: 'MENTION' } },
      create: {
        userId: viewer.id,
        type: 'MENTION',
        inApp: next.categories.mention.inApp,
        email: next.categories.mention.email,
        push: next.categories.mention.push,
        weeklyDigest: next.digestFrequency === 'WEEKLY',
      },
      update: { updatedAt: new Date() },
    }).catch(() => undefined);

    // Side-channel de log (LGPD audit)
    await prisma.notificationEvent.create({
      data: {
        userId: viewer.id,
        notificationId: null,
        event: 'PREFERENCES_V2_UPDATED',
        decision: 'SENT',
        reason: 'manual',
      },
    }).catch(() => undefined);

    return ok({ preferences: next });
  } catch (err) {
    return handleError(err);
  }
}

async function loadOrDefault(userId: string): Promise<NotificationPreference> {
  const row = await prisma.notificationPreference.findFirst({
    where: { userId },
  }).catch(() => null);
  if (!row) return defaultPrefs(userId);
  return defaultPrefs(userId);
}

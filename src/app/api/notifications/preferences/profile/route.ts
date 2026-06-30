// ============================================================================
// API /api/notifications/preferences/profile — perfil geral (W30)
// ============================================================================
// GET   /api/notifications/preferences/profile        → carrega perfil (com defaults)
// PATCH /api/notifications/preferences/profile        → atualiza (LGPD-aware)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import {
  DEFAULT_PROFILE,
  type UserNotificationProfile,
} from '@/lib/notifications/smart-scheduler';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schemas
// ============================================================================

const ToneEnum = z.enum(['REVERENT', 'WARM', 'NEUTRAL']);

const PatchSchema = z.object({
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  sacredDaysOff: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  frequencyCap: z
    .object({
      IN_APP: z.number().int().min(0).max(100).optional(),
      EMAIL: z.number().int().min(0).max(50).optional(),
      PUSH: z.number().int().min(0).max(50).optional(),
    })
    .optional(),
  tone: ToneEnum.optional(),
  timezone: z.string().min(1).max(100).optional(),
  aiPersonalizationEnabled: z.boolean().optional(),
  // LGPD Art. 7 I — opt-in explícito. Aceita true (consent) ou false (revoga).
  marketingConsent: z.boolean().optional(),
  // LGPD Art. 18 IX — revogação total. True = apagar e parar tudo.
  dataErasureRequested: z.boolean().optional(),
  // R8 — confirmação de leitura dos 8 princípios.
  acknowledgeEthics: z.boolean().optional(),
});

// ============================================================================
// Helpers
// ============================================================================

async function loadProfile(userId: string): Promise<UserNotificationProfile> {
  const row = await prisma.notificationProfile.findUnique({
    where: { userId },
  });
  const typePrefs = await prisma.notificationPreference.findMany({
    where: { userId },
    select: { type: true, inApp: true, email: true, push: true },
  });
  const typePreferences: UserNotificationProfile['typePreferences'] = {};
  for (const p of typePrefs) {
    typePreferences[p.type] = {
      inApp: p.inApp,
      email: p.email,
      push: p.push,
    };
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
    marketingConsent:
      row?.marketingConsent ?? DEFAULT_PROFILE.marketingConsent,
    dataErasureRequested:
      row?.dataErasureRequested ?? DEFAULT_PROFILE.dataErasureRequested,
    ethicsAcknowledgedAt: row?.ethicsAcknowledgedAt ?? null,
    typePreferences,
  };
}

// ============================================================================
// GET
// ============================================================================

export async function GET() {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const profile = await loadProfile(viewer.id);
    return NextResponse.json({ profile, defaults: DEFAULT_PROFILE });
  } catch (err) {
    console.error('[api/notifications/preferences/profile][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao carregar perfil' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = PatchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Corpo inválido', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // LGPD: ao revogar consentimento, registrar para auditoria.
    const data: Record<string, unknown> = {};
    if (body.quietHoursStart !== undefined) data.quietHoursStart = body.quietHoursStart;
    if (body.quietHoursEnd !== undefined) data.quietHoursEnd = body.quietHoursEnd;
    if (body.sacredDaysOff !== undefined) data.sacredDaysOff = body.sacredDaysOff;
    if (body.frequencyCap !== undefined) data.frequencyCap = body.frequencyCap;
    if (body.tone !== undefined) data.tone = body.tone;
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.aiPersonalizationEnabled !== undefined) {
      // LGPD Art. 8 — opt-in explícito (não presume consentimento)
      data.aiPersonalizationEnabled = body.aiPersonalizationEnabled;
    }
    if (body.marketingConsent !== undefined) {
      data.marketingConsent = body.marketingConsent;
      data.marketingConsentAt = body.marketingConsent ? new Date() : null;
    }
    if (body.dataErasureRequested !== undefined) {
      data.dataErasureRequested = body.dataErasureRequested;
      data.dataErasureRequestedAt = body.dataErasureRequested ? new Date() : null;
    }
    if (body.acknowledgeEthics === true) {
      data.ethicsAcknowledgedAt = new Date();
    }

    const row = await prisma.notificationProfile.upsert({
      where: { userId: viewer.id },
      create: { userId: viewer.id, ...data },
      update: data,
    });

    return NextResponse.json({
      success: true,
      updated: Object.keys(data).length,
      profile: {
        quietHoursStart: row.quietHoursStart,
        quietHoursEnd: row.quietHoursEnd,
        sacredDaysOff: row.sacredDaysOff,
        frequencyCap: row.frequencyCap,
        tone: row.tone,
        timezone: row.timezone,
        aiPersonalizationEnabled: row.aiPersonalizationEnabled,
        marketingConsent: row.marketingConsent,
        dataErasureRequested: row.dataErasureRequested,
        ethicsAcknowledgedAt: row.ethicsAcknowledgedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error('[api/notifications/preferences/profile][PATCH] error', err);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}

// ============================================================================
// API /api/notifications/v2/context-evaluate — simula decisão de uma notif
// ============================================================================
// POST   — dado payload + categoria, retorna decisão (SEND_NOW/DEFER/SKIP)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import { evaluateContext } from '@/lib/notifications/v2';
import type { NotificationCategory } from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schema (sem dep zod — manual)
// ============================================================================

interface EvaluateBody {
  category: NotificationCategory;
  context: {
    device: 'mobile' | 'desktop' | 'tablet';
    lastVisitAt?: string | null;
    engagementByCategory?: Record<string, number>;
    tradition?: string;
    locale?: string;
    timezone?: string;
    marketingConsentRevoked?: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

const VALID_CATEGORIES: readonly NotificationCategory[] = [
  'mention', 'reply', 'follow', 'akasha', 'marketplace',
  'mentorship', 'event', 'system', 'marketing',
];

const VALID_DEVICES = new Set(['mobile', 'desktop', 'tablet']);

export async function POST(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    let body: EvaluateBody;
    try {
      body = (await req.json()) as EvaluateBody;
    } catch {
      return fail(400, 'INVALID_JSON', 'Body inválido');
    }

    if (!VALID_CATEGORIES.includes(body.category)) {
      return fail(400, 'INVALID_CATEGORY', `categoria inválida: ${body.category}`);
    }
    if (!body.context || !VALID_DEVICES.has(body.context.device)) {
      return fail(400, 'INVALID_DEVICE', 'device inválido');
    }
    if (!body.quietHours) {
      return fail(400, 'INVALID_QUIET_HOURS', 'quietHours obrigatório');
    }

    const result = evaluateContext(
      body.category,
      {
        device: body.context.device,
        lastVisitAt: body.context.lastVisitAt ?? null,
        engagementByCategory: (body.context.engagementByCategory ?? {}) as Parameters<
          typeof evaluateContext
        >[1]['engagementByCategory'],
        tradition: body.context.tradition ?? 'candomble',
        locale: body.context.locale ?? 'pt-BR',
        timezone: body.context.timezone ?? 'America/Sao_Paulo',
        marketingConsentRevoked: body.context.marketingConsentRevoked ?? false,
      },
      body.quietHours
    );

    return ok({
      userId: viewer.id,
      category: body.category,
      ...result,
    });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * GET  /api/notifications/preferences
 *   Lista as preferências do user autenticado para todos os 5 tipos de
 *   notificação. Tipos sem row persistida retornam enabled: true (opt-out
 *   model — "all enabled" é o default).
 *
 * PATCH /api/notifications/preferences
 *   Seta (upsert) a preferência de UM tipo para o user.
 *   Body: { type: 'DIARIO' | 'MENTOR' | 'CONEXOES' | 'CREDITS' | 'SYSTEM',
 *           enabled: boolean }
 *   Retorna o DTO da preferência atualizada.
 *
 * Auth: requireAkashaApi (cookie akasha_session).
 *
 * LGPD Art. 18 §VI (revogação granular): user pode desativar DIARIO
 * mantendo MENTOR + CONEXOES. Preferences são userId-only, sem PII.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  ALL_NOTIFICATION_TYPES,
  getUserPreferences,
  setPreference,
} from '@/lib/application/notifications/preferences';
import type { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const preferences = await getUserPreferences(userId);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  // ─── Parse + validate body ─────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Body inválido (espera JSON)' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Body deve ser um objeto' },
      { status: 400 }
    );
  }

  const { type, enabled } = body as { type?: unknown; enabled?: unknown };

  if (typeof type !== 'string') {
    return NextResponse.json(
      { error: 'Campo "type" é obrigatório (string)' },
      { status: 400 }
    );
  }
  if (!ALL_NOTIFICATION_TYPES.includes(type as NotificationType)) {
    return NextResponse.json(
      {
        error: `Campo "type" deve ser um de: ${ALL_NOTIFICATION_TYPES.join(', ')}`,
      },
      { status: 400 }
    );
  }
  if (typeof enabled !== 'boolean') {
    return NextResponse.json(
      { error: 'Campo "enabled" é obrigatório (boolean)' },
      { status: 400 }
    );
  }

  // ─── Upsert ────────────────────────────────────────────────────────
  const preference = await setPreference(
    userId,
    type as NotificationType,
    enabled
  );

  return NextResponse.json({ preference });
}

/**
 * GET  /api/account/privacy
 *   Lista o estado VIGENTE de consentimento do user autenticado (1 row por
 *   tipo = a decisão mais recente). Para tipos sem decisão prévia,
 *   retorna o default de signup (LGPD Art. 7º, I).
 *
 *   Resposta:
 *     {
 *       consents: [{ type, granted, decidedAt }],
 *       history:  [{ id, type, granted, decidedAt }, ...] // últimas 50
 *     }
 *
 * PATCH /api/account/privacy
 *   Registra uma NOVA decisão de consentimento (append-only, LGPD Art. 37).
 *   NÃO atualiza a row anterior — gera uma nova entrada no audit trail.
 *   Body: { type: 'MARKETING'|'ANALYTICS'|'AI_TRAINING'|'THIRD_PARTY_SHARING',
 *           granted: boolean }
 *   Resposta: { consent: { id, type, granted, decidedAt }, state: [...] }
 *
 * Auth: requireAkashaApi (cookie akasha_session). NÃO é rota cron.
 *
 * LGPD Art. 7º (consentimento) + Art. 8º (revogação) + Art. 18 §VI
 * (revogação granular) + Art. 37 (registro das operações de tratamento).
 *
 * Wave 19.3: rota nova. Compat com Wave 8.3 (User.consentAt) — não
 * sobrescrevemos esse campo aqui (são coisas diferentes: consentAt é o
 * timestamp mínimo de aceite dos termos no signup; este endpoint é sobre
 * consentimentos granulares pós-signup).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  ALL_PRIVACY_CONSENT_TYPES,
  extractConsentContext,
  getUserConsentHistory,
  getUserConsentState,
  recordConsentDecision,
} from '@/lib/application/privacy/consent';
import type { PrivacyConsentType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  // 2 queries em paralelo — estado atual + histórico. Ambas são rápidas
  // (índices userId_grantedAt cobrem as duas queries).
  const [state, history] = await Promise.all([
    getUserConsentState(userId),
    getUserConsentHistory(userId, 50),
  ]);

  return NextResponse.json({ consents: state, history });
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

  const { type, granted } = body as { type?: unknown; granted?: unknown };

  if (typeof type !== 'string') {
    return NextResponse.json(
      { error: 'Campo "type" é obrigatório (string)' },
      { status: 400 }
    );
  }
  if (!ALL_PRIVACY_CONSENT_TYPES.includes(type as PrivacyConsentType)) {
    return NextResponse.json(
      {
        error: `Campo "type" deve ser um de: ${ALL_PRIVACY_CONSENT_TYPES.join(', ')}`,
      },
      { status: 400 }
    );
  }
  if (typeof granted !== 'boolean') {
    return NextResponse.json(
      { error: 'Campo "granted" é obrigatório (boolean)' },
      { status: 400 }
    );
  }

  // ─── LGPD context (IP hash + user agent) ────────────────────────────
  const { ipHash, userAgent } = extractConsentContext(request);

  // ─── Append-only decision ──────────────────────────────────────────
  const consent = await recordConsentDecision({
    userId,
    type: type as PrivacyConsentType,
    granted,
    ipHash,
    userAgent,
  });

  // Retornar o estado vigente ATUALIZADO para a UI sincronizar sem refetch.
  const state = await getUserConsentState(userId);

  return NextResponse.json({ consent, state });
}
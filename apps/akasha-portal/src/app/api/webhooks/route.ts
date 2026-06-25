/**
 * GET  /api/webhooks
 *   Lista webhooks do user autenticado (LGPD: userId-only).
 *   - 200 → { webhooks: WebhookDTO[] } (SEM `secret` cru)
 *
 * POST /api/webhooks
 *   Cria um novo webhook para o user autenticado.
 *   Body: { url: string, events: string[], isActive?: boolean }
 *   - 201 → { webhook: WebhookWithSecretDTO } (COM `secret` plain —
 *           exibido UMA ÚNICA VEZ; chamadas seguintes só veem
 *           `secretFingerprint`)
 *   - 400 → { error: 'validation' } com mensagem específica
 *
 * Auth: requireAkashaApi (cookie akasha_session).
 *
 * LGPD Art. 18 §VI + Art. 33:
 *   - Webhooks são userId-only — GET sempre filtra por `userId`.
 *   - `secret` retornado apenas no POST (random server-side, nunca
 *     derivado de PII do user).
 *   - Sem cross-user access, sem broadcast.
 *
 * Não confundir com `/api/webhooks/akasha-stripe` que é o INCOMING
 * webhook do Stripe (server recebe). Esta rota é o CRUD do user para
 * OUTGOING webhooks (server envia).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  WebhookValidationError,
  createWebhook,
  listWebhooks,
} from '@/lib/application/webhooks/service';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  const auth = await requireAkashaApi(_request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const webhooks = await listWebhooks(userId);
  return NextResponse.json({ webhooks });
}

export async function POST(request: NextRequest) {
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

  const { url, events, isActive } = body as {
    url?: unknown;
    events?: unknown;
    isActive?: unknown;
  };

  if (typeof url !== 'string') {
    return NextResponse.json(
      { error: 'Campo "url" é obrigatório (string)' },
      { status: 400 }
    );
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return NextResponse.json(
      { error: 'Campo "isActive" deve ser boolean se presente' },
      { status: 400 }
    );
  }

  // ─── Create ────────────────────────────────────────────────────────
  try {
    const webhook = await createWebhook(userId, {
      url,
      events: Array.isArray(events) ? (events as string[]) : [],
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
    });
    return NextResponse.json({ webhook }, { status: 201 });
  } catch (err) {
    if (err instanceof WebhookValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[webhooks] POST failed', { userId, err: (err as Error).message });
    return NextResponse.json(
      { error: 'Falha ao criar webhook' },
      { status: 500 }
    );
  }
}

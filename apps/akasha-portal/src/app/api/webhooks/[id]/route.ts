/**
 * GET    /api/webhooks/[id]
 *   Retorna um webhook do user autenticado.
 *   - 200 → { webhook: WebhookDTO } (SEM `secret` cru)
 *   - 404 → { error: 'not_found' }  (id não existe OU não pertence ao user)
 *
 * PATCH  /api/webhooks/[id]
 *   Atualiza url / events / isActive. Pelo menos um campo obrigatório.
 *   Body: { url?: string, events?: string[], isActive?: boolean }
 *   - 200 → { webhook: WebhookDTO } (atualizado)
 *   - 400 → { error: 'validation' }
 *   - 404 → { error: 'not_found' }
 *
 * DELETE /api/webhooks/[id]
 *   Deleta um webhook do user.
 *   - 204 No Content (sucesso)
 *   - 404 → { error: 'not_found' }
 *
 * Segurança (IDOR-safe):
 *   - findFirst / updateMany / deleteMany SEMPRE filtram por
 *     `(id, userId)`. Mesmo que um atacante saiba o cuid de outro
 *     user, ele não consegue ler/atualizar/deletar.
 *
 * LGPD (Art. 18 §VI + Art. 33):
 *   - Webhooks são userId-only — zero cross-user access.
 *   - `secret` NUNCA exposto em GET/PATCH (apenas no POST, UMA VEZ).
 *   - DELETE remove a row completamente; secret some junto (não há
 *     tombstone — minimização Art. 33 §II).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  WebhookValidationError,
  deleteWebhook,
  getWebhook,
  updateWebhook,
} from '@/lib/application/webhooks/service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAkashaApi(_request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  const webhook = await getWebhook(userId, id);
  if (!webhook) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ webhook });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

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

  const patch: { url?: string; events?: string[]; isActive?: boolean } = {};
  if (url !== undefined) {
    if (typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Campo "url" deve ser string' },
        { status: 400 }
      );
    }
    patch.url = url;
  }
  if (events !== undefined) {
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Campo "events" deve ser array de strings' },
        { status: 400 }
      );
    }
    patch.events = events as string[];
  }
  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo "isActive" deve ser boolean' },
        { status: 400 }
      );
    }
    patch.isActive = isActive;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: 'Pelo menos um campo (url / events / isActive) é obrigatório' },
      { status: 400 }
    );
  }

  // ─── Update ────────────────────────────────────────────────────────
  try {
    const webhook = await updateWebhook(userId, id, patch);
    if (!webhook) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ webhook });
  } catch (err) {
    if (err instanceof WebhookValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[webhooks] PATCH failed', { userId, id, err: (err as Error).message });
    return NextResponse.json(
      { error: 'Falha ao atualizar webhook' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAkashaApi(_request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  const deleted = await deleteWebhook(userId, id);
  if (!deleted) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * POST /api/webhooks/[id]/test
 *
 * Dispara UMA delivery de teste para o webhook do user autenticado.
 * Não subscreve evento nenhum — gera payload ad-hoc com event
 * 'webhook.test' (reservado, NÃO está em WEBHOOK_EVENT_TYPES).
 *
 * Response:
 *   - 200 → { ok: boolean, status?: number, error?: string }
 *       (ok=true → receiver respondeu 2xx; ok=false → falha)
 *   - 404 → { error: 'not_found' }  (id não existe OU não pertence)
 *   - 400 → { error: 'webhook_inactive' }  (isActive=false — não dispara)
 *
 * Auth: requireAkashaApi.
 *
 * LGPD: userId-only — só podemos testar webhooks do próprio user.
 *
 * Headers enviados:
 *   - Content-Type: application/json
 *   - X-Akasha-Signature: sha256=<hmac-hex>  ← HMAC-SHA256(secret, body)
 *   - X-Akasha-Event: webhook.test
 *   - X-Akasha-Webhook-Id: <id>
 *   - User-Agent: Akasha-Webhooks/1.0
 *
 * Payload (JSON):
 *   {
 *     "deliveredAt": "2026-06-25T12:34:56.789Z",
 *     "event": "webhook.test",
 *     "userId": "<userId>",
 *     "data": { "message": "This is a test delivery from Akasha Webhooks." },
 *     "version": "1"
 *   }
 *
 * Receiver deve verificar a signature antes de processar — exemplo
 * Node.js:
 *
 *   const expected = require('crypto')
 *     .createHmac('sha256', process.env.AKASHA_WEBHOOK_SECRET)
 *     .update(rawBody, 'utf8')
 *     .digest('hex');
 *   const provided = req.headers['x-akasha-signature'].replace(/^sha256=/, '');
 *   if (expected !== provided) return res.status(401).end();
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { dispatchTestEvent } from '@/lib/application/webhooks/dispatcher';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  // IDOR-safe: filtra por (id, userId) e seleciona apenas campos
  // necessários (incluindo secret, que é server-side only).
  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
    select: { id: true, url: true, secret: true, isActive: true },
  });

  if (!webhook) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (!webhook.isActive) {
    return NextResponse.json(
      { error: 'webhook_inactive', message: 'Ative o webhook antes de testar' },
      { status: 400 }
    );
  }

  const result = await dispatchTestEvent(userId, webhook.id, webhook.url, webhook.secret);

  return NextResponse.json(result);
}

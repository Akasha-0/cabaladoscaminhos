import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  upsertPushSubscription,
  deletePushSubscription,
} from '@/lib/application/push/push-subscription-service';
import { getPublicVapidKey } from '@/lib/application/push/web-push-server';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/push/vapid-public-key
 *
 * Retorna a chave pública VAPID para o cliente subscrever.
 * Não requer auth (a chave pública é, por definição, pública).
 */
export async function GET() {
  return NextResponse.json({
    publicKey: getPublicVapidKey(),
  });
}

/**
 * POST /api/push/subscribe
 *
 * Salva/atualiza uma PushSubscription para o usuário logado.
 * Body: { subscription: PushSubscriptionJSON, userAgent?: string }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    subscription?: { endpoint: string; keys: { p256dh: string; auth: string } };
  };

  if (
    !body.subscription?.endpoint ||
    !body.subscription.keys?.p256dh ||
    !body.subscription.keys?.auth
  ) {
    return NextResponse.json(
      { error: 'subscription inválida — campos endpoint, keys.p256dh, keys.auth são obrigatórios' },
      { status: 400 }
    );
  }

  const userAgent = request.headers.get('user-agent') ?? undefined;

  try {
    await upsertPushSubscription(auth.id, body.subscription, userAgent);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha ao salvar subscription', details: (err as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 *
 * Remove a PushSubscription do usuário (unsubscribe).
 * Body: { endpoint: string }
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as { endpoint?: string };
  if (!body.endpoint) {
    return NextResponse.json({ error: 'endpoint obrigatório' }, { status: 400 });
  }

  // Garante que o subscription pertence ao usuário
  const sub = await prisma.pushSubscription.findUnique({
    where: { endpoint: body.endpoint },
    select: { userId: true },
  });
  if (!sub || sub.userId !== auth.id) {
    return NextResponse.json({ error: 'Subscription não encontrada' }, { status: 404 });
  }

  await deletePushSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}

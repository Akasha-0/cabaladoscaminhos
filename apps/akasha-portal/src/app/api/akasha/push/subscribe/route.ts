/**
 * /api/akasha/push/subscribe — Akasha (T7 / Doc 25 §11)
 *
 * Endpoints:
 *   POST   — opt-in: salva a PushSubscription do browser e liga o flag `User.pushEnabled`.
 *   DELETE — opt-out: desliga `User.pushEnabled` e remove todas as subscriptions do user.
 *
 * Gate: `requireAkashaApi` (sessão JWT do B2C Akasha, Doc 04).
 * Privacidade: emite `push.subscribed` / `push.unsubscribed` no log
 * estruturado (Doc 22 AD-22.4) com `endpoint` truncado a 80 chars — sem PII.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  upsertPushSubscription,
  deletePushSubscription,
  getUserPushSubscriptions,
} from '@/lib/application/push/push-subscription-service';
import { logSecurityEvent } from '@/lib/shared/logging';

export const dynamic = 'force-dynamic';

const SubscriptionSchema = z.object({
  endpoint: z.string().url().min(10),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const BodySchema = z.object({
  subscription: SubscriptionSchema,
  userAgent: z.string().optional(),
});

/** POST /api/akasha/push/subscribe — opt-in */
export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const raw = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'subscription inválida', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { subscription, userAgent } = parsed.data;
  const ua = userAgent ?? request.headers.get('user-agent') ?? undefined;

  try {
    await upsertPushSubscription(auth.id, subscription, ua);
    await prisma.user.update({
      where: { id: auth.id },
      data: { pushEnabled: true },
    });

    logSecurityEvent('push.subscribed', {
      userId: auth.id,
      endpoint: subscription.endpoint.slice(0, 80),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha ao salvar subscription', details: (err as Error).message },
      { status: 500 }
    );
  }
}

/** DELETE /api/akasha/push/subscribe — opt-out */
export async function DELETE(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Body opcional { endpoint?: string }. Se ausente, remove TODAS as subscriptions do user.
  const raw = await request.json().catch(() => ({}));
  const body = (raw ?? {}) as { endpoint?: string };

  try {
    if (body.endpoint) {
      // Garante que a subscription pertence ao user (anti-IDOR).
      const subs = await getUserPushSubscriptions(auth.id);
      const owns = subs.some((s) => s.endpoint === body.endpoint);
      if (!owns) {
        return NextResponse.json({ error: 'Subscription não encontrada' }, { status: 404 });
      }
      await deletePushSubscription(body.endpoint);
    } else {
      // Remove todas as subscriptions do user.
      await prisma.pushSubscription.deleteMany({ where: { userId: auth.id } });
    }

    await prisma.user.update({
      where: { id: auth.id },
      data: { pushEnabled: false },
    });

    logSecurityEvent('push.unsubscribed', {
      userId: auth.id,
      scope: body.endpoint ? 'single' : 'all',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha ao remover subscription', details: (err as Error).message },
      { status: 500 }
    );
  }
}

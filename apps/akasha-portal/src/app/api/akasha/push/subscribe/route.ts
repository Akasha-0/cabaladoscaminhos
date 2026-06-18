import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import {
  upsertPushSubscription,
  deletePushSubscription,
  getUserPushSubscriptions,
} from '@/lib/application/push/push-subscription-service';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface SubscribeBody {
  subscription: PushSubscriptionPayload;
}

export interface DeleteBody {
  endpoint?: string;
}

export interface SubscribeResponse {
  ok: true;
}

function isValidSubscription(sub: unknown): sub is PushSubscriptionPayload {
  if (typeof sub !== 'object' || sub === null) return false;
  const s = sub as PushSubscriptionPayload;
  return (
    typeof s.endpoint === 'string' &&
    typeof s.keys === 'object' &&
    s.keys !== null &&
    typeof s.keys.p256dh === 'string' &&
    typeof s.keys.auth === 'string'
  );
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<SubscribeResponse | { error: string }>> {
  try {
    const authResult = await requireAkashaApi(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult as { id: string };

    let body: SubscribeBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!isValidSubscription(body.subscription)) {
      return NextResponse.json({ error: 'subscription inválida ou incompleta' }, { status: 400 });
    }

    const sub = body.subscription;
    await upsertPushSubscription(
      user.id,
      { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
      req.headers.get('user-agent') ?? undefined
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { pushEnabled: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/akasha/push/subscribe]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  try {
    const authResult = await requireAkashaApi(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult as { id: string };

    let body: DeleteBody;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body.endpoint) {
      const userSubs = await getUserPushSubscriptions(user.id);
      const found = userSubs.some((s) => s.endpoint === body.endpoint);
      if (!found) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }
      await deletePushSubscription(body.endpoint);
      await prisma.user.update({
        where: { id: user.id },
        data: { pushEnabled: false },
      });
    } else {
      await prisma.pushSubscription.deleteMany({ where: { userId: user.id } });
      await prisma.user.update({
        where: { id: user.id },
        data: { pushEnabled: false },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/akasha/push/subscribe]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { upsertPushSubscription, deletePushSubscription, getUserPushSubscriptions } from '@/lib/push/push-subscription-service';

export interface PushSubscriptionPayload {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

export interface SubscribeBody {
  subscription?: PushSubscriptionPayload;
}

export interface DeleteBody {
  endpoint?: string;
}

export interface SubscribeResponse {
  ok: true;
}

function isValidSubscription(sub: PushSubscriptionPayload | undefined): sub is PushSubscriptionPayload {
  return sub !== undefined && typeof sub.endpoint === 'string' && sub.keys !== undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse<SubscribeResponse | { error: string }>> {
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

  await upsertPushSubscription(user.id, body.subscription, req.headers.get('user-agent'));
  await prisma.user.update({
    where: { id: user.id },
    data: { pushEnabled: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest): Promise<NextResponse<{ ok: true } | { error: string }>> {
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
}

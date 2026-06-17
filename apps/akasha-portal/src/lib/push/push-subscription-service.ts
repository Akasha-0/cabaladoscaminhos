import { prisma } from '@/lib/prisma';

export interface PushSubscription {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function upsertPushSubscription(
  userId: string,
  subscription: PushSubscription,
  userAgent?: string | null
): Promise<void> {
  const { endpoint, keys } = subscription;
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dh: keys?.p256dh,
      auth: keys?.auth,
      userAgent: userAgent ?? null,
    },
    create: {
      userId,
      endpoint,
      p256dh: keys?.p256dh,
      auth: keys?.auth,
      userAgent: userAgent ?? null,
    },
  });
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint },
  });
}

export async function getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
  const rows = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  });
  return rows.map((r) => ({
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh ?? undefined, auth: r.auth ?? undefined },
  }));
}

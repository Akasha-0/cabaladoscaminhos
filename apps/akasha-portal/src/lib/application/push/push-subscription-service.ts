/**
 * Push Subscription Service — Akasha (Doc 25 §6)
 *
 * Helpers para salvar/buscar/deletar push subscriptions no PostgreSQL.
 * O modelo `pushSubscription` está no schema Prisma com FK para `userId`.
 */
import { prisma } from '@/lib/infrastructure/prisma';
import type { PushSubscriptionJSON } from './web-push-server';

/**
 * Salva (ou atualiza) uma subscription para o usuário.
 * Endpoint é único — se já existir para esse user, atualiza as keys.
 */
export async function upsertPushSubscription(
  userId: string,
  sub: PushSubscriptionJSON,
  userAgent?: string
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: userAgent ?? null,
    },
    create: {
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: userAgent ?? null,
    },
  });
}

/** Remove uma subscription (chamado quando 404/410). */
export async function deletePushSubscription(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

/** Lista subscriptions ativas de um usuário. */
export async function getUserPushSubscriptions(userId: string): Promise<PushSubscriptionJSON[]> {
  const rows = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  });

  return rows.map((r) => ({
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh, auth: r.auth },
  }));
}

/** F-237: Lista TODAS as subscriptions ativas (para o cron diário). */
export async function getAllActivePushSubscriptions(): Promise<
  Array<PushSubscriptionJSON & { userId: string }>
> {
  const rows = await prisma.pushSubscription.findMany({
    where: { user: { pushEnabled: true } },
    select: { userId: true, endpoint: true, p256dh: true, auth: true },
  });

  return rows.map((r) => ({
    userId: r.userId,
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh, auth: r.auth },
  }));
}

/** F-237: Conta quantos usuários têm push ativo (métrica de health). */
export async function countActivePushSubscribers(): Promise<number> {
  return prisma.pushSubscription.count({
    where: { user: { pushEnabled: true } },
  });
}

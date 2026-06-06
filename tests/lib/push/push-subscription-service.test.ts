import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockUpsert = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pushSubscription: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const { upsertPushSubscription, deletePushSubscription, getUserPushSubscriptions } =
  await import('@/lib/push/push-subscription-service');

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue({ id: 'ps-1' });
  mockDeleteMany.mockResolvedValue({ count: 1 });
  mockFindMany.mockResolvedValue([
    { endpoint: 'https://push.example.com/1', p256dh: 'k1', auth: 'a1' },
    { endpoint: 'https://push.example.com/2', p256dh: 'k2', auth: 'a2' },
  ]);
  mockFindUnique.mockResolvedValue({ userId: 'user-1' });
});

describe('push-subscription-service', () => {
  describe('upsertPushSubscription', () => {
    it('faz upsert por endpoint (unico globalmente)', async () => {
      const sub = {
        endpoint: 'https://push.example.com/abc',
        keys: { p256dh: 'AAAA', auth: 'BBBB' },
      };

      await upsertPushSubscription('user-1', sub, 'Mozilla/5.0');

      expect(mockUpsert).toHaveBeenCalledWith({
        where: { endpoint: sub.endpoint },
        update: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userAgent: 'Mozilla/5.0',
        },
        create: {
          userId: 'user-1',
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userAgent: 'Mozilla/5.0',
        },
      });
    });

    it('funciona sem userAgent (opcional)', async () => {
      const sub = {
        endpoint: 'https://push.example.com/xyz',
        keys: { p256dh: 'k', auth: 'a' },
      };
      await upsertPushSubscription('user-1', sub);
      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('deletePushSubscription', () => {
    it('deleta por endpoint', async () => {
      await deletePushSubscription('https://push.example.com/abc');
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/abc' },
      });
    });
  });

  describe('getUserPushSubscriptions', () => {
    it('retorna array de PushSubscriptionJSON do user', async () => {
      const subs = await getUserPushSubscriptions('user-1');

      expect(subs).toHaveLength(2);
      expect(subs[0]).toEqual({
        endpoint: 'https://push.example.com/1',
        keys: { p256dh: 'k1', auth: 'a1' },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { endpoint: true, p256dh: true, auth: true },
      });
    });

    it('retorna [] quando user nao tem subscriptions', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      const subs = await getUserPushSubscriptions('user-2');
      expect(subs).toEqual([]);
    });
  });
});

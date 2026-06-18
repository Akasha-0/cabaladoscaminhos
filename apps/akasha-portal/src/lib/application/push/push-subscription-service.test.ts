// Co-located unit test for push-subscription-service.
//
// The push-subscription-service is the persistence layer for Web Push
// subscriptions — saves them to PostgreSQL (via Prisma), lists by user,
// and removes them when they expire (404/410 from web-push-server).
// This test mocks the Prisma client entirely.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const upsert = vi.fn();
const deleteMany = vi.fn();
const findMany = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    pushSubscription: {
      upsert,
      deleteMany,
      findMany,
    },
  },
}));

async function loadModule() {
  vi.resetModules();
  return import('./push-subscription-service');
}

const VALID_SUB = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
  keys: { p256dh: 'BPubKey', auth: 'AuthSecret' },
};

beforeEach(() => {
  upsert.mockReset();
  deleteMany.mockReset();
  findMany.mockReset();
});

describe('upsertPushSubscription', () => {
  it('cria nova subscription quando endpoint não existe', async () => {
    upsert.mockResolvedValueOnce({});
    const { upsertPushSubscription } = await loadModule();

    await upsertPushSubscription('user-1', VALID_SUB, 'Mozilla/5.0');

    expect(upsert).toHaveBeenCalledOnce();
    expect(upsert).toHaveBeenCalledWith({
      where: { endpoint: VALID_SUB.endpoint },
      update: {
        p256dh: VALID_SUB.keys.p256dh,
        auth: VALID_SUB.keys.auth,
        userAgent: 'Mozilla/5.0',
      },
      create: {
        userId: 'user-1',
        endpoint: VALID_SUB.endpoint,
        p256dh: VALID_SUB.keys.p256dh,
        auth: VALID_SUB.keys.auth,
        userAgent: 'Mozilla/5.0',
      },
    });
  });

  it('atualiza subscription existente (mesmo endpoint) com novas keys', async () => {
    upsert.mockResolvedValueOnce({});
    const { upsertPushSubscription } = await loadModule();

    const newKeys = {
      endpoint: VALID_SUB.endpoint,
      keys: { p256dh: 'NewPub', auth: 'NewAuth' },
    };

    await upsertPushSubscription('user-1', newKeys);

    expect(upsert).toHaveBeenCalledWith({
      where: { endpoint: VALID_SUB.endpoint },
      update: {
        p256dh: 'NewPub',
        auth: 'NewAuth',
        userAgent: null,
      },
      create: expect.objectContaining({
        userId: 'user-1',
        endpoint: VALID_SUB.endpoint,
        p256dh: 'NewPub',
        auth: 'NewAuth',
      }),
    });
  });

  it('passa userAgent como null quando não fornecido', async () => {
    upsert.mockResolvedValueOnce({});
    const { upsertPushSubscription } = await loadModule();

    await upsertPushSubscription('user-1', VALID_SUB);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ userAgent: null }),
        create: expect.objectContaining({ userAgent: null }),
      })
    );
  });
});

describe('deletePushSubscription', () => {
  it('deleta por endpoint', async () => {
    deleteMany.mockResolvedValueOnce({ count: 1 });
    const { deletePushSubscription } = await loadModule();

    await deletePushSubscription(VALID_SUB.endpoint);

    expect(deleteMany).toHaveBeenCalledOnce();
    expect(deleteMany).toHaveBeenCalledWith({
      where: { endpoint: VALID_SUB.endpoint },
    });
  });

  it('não joga erro quando endpoint não existe (deleteMany idempotente)', async () => {
    deleteMany.mockResolvedValueOnce({ count: 0 });
    const { deletePushSubscription } = await loadModule();

    await expect(deletePushSubscription('not-found')).resolves.toBeUndefined();
  });
});

describe('getUserPushSubscriptions', () => {
  it('retorna array vazio quando usuário não tem subscriptions', async () => {
    findMany.mockResolvedValueOnce([]);
    const { getUserPushSubscriptions } = await loadModule();

    const result = await getUserPushSubscriptions('user-empty');

    expect(result).toEqual([]);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'user-empty' },
      select: { endpoint: true, p256dh: true, auth: true },
    });
  });

  it('mapeia rows do Prisma para o shape PushSubscriptionJSON', async () => {
    findMany.mockResolvedValueOnce([
      {
        endpoint: 'https://example.com/sub1',
        p256dh: 'p1',
        auth: 'a1',
      },
      {
        endpoint: 'https://example.com/sub2',
        p256dh: 'p2',
        auth: 'a2',
      },
    ]);

    const { getUserPushSubscriptions } = await loadModule();
    const result = await getUserPushSubscriptions('user-2');

    expect(result).toEqual([
      {
        endpoint: 'https://example.com/sub1',
        keys: { p256dh: 'p1', auth: 'a1' },
      },
      {
        endpoint: 'https://example.com/sub2',
        keys: { p256dh: 'p2', auth: 'a2' },
      },
    ]);
  });

  it('filtra por userId', async () => {
    findMany.mockResolvedValueOnce([]);
    const { getUserPushSubscriptions } = await loadModule();

    await getUserPushSubscriptions('user-specific');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-specific' } })
    );
  });
});

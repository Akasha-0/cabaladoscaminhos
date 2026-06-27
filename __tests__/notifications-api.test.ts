// ============================================================================
// API ROUTES — NOTIFICATIONS
// ============================================================================
// Cobre: GET /api/notifications (list, filters), PATCH /:id/read,
// PATCH /read-all, GET/POST/DELETE /preferences, GET/POST /unsubscribe,
// GET/POST/DELETE /push.
//
// Mock strategy: Prisma + getViewer mockados. Testes usam fixtures estáticas.
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// Prisma mock
// ============================================================================

const prismaMock = {
  notification: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  notificationPreference: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  },
  pushSubscription: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  unsubscribeToken: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

const viewerMock = vi.fn();
vi.mock('@/lib/community/auth', () => ({
  getViewer: () => viewerMock(),
  requireViewer: async () => {
    const v = await viewerMock();
    if (!v) {
      const e = new Error('Não autenticado');
      (e as Error & { statusCode?: number }).statusCode = 401;
      throw e;
    }
    return v;
  },
}));

// ============================================================================
// Import routes AFTER mocks
// ============================================================================

const { GET: listNotifications } = await import(
  '@/app/api/notifications/route'
);
const { PATCH: markReadRoute } = await import(
  '@/app/api/notifications/[id]/read/route'
);
const { PATCH: readAllRoute } = await import(
  '@/app/api/notifications/read-all/route'
);
const { GET: getPrefsRoute, PATCH: patchPrefsRoute } = await import(
  '@/app/api/notifications/preferences/route'
);
const { POST: unsubscribeRoute } = await import(
  '@/app/api/notifications/unsubscribe/route'
);
const { GET: getPushRoute, POST: postPushRoute, DELETE: deletePushRoute } =
  await import('@/app/api/notifications/push/route');

// ============================================================================
// Helpers
// ============================================================================

function makeGetRequest(url: string) {
  return new NextRequest(new Request(url, { method: 'GET' }));
}

function makePatchRequest(url: string, body: unknown) {
  return new NextRequest(
    new Request(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

function makePostRequest(url: string, body: unknown) {
  return new NextRequest(
    new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

function makeDeleteRequest(url: string, body: unknown) {
  return new NextRequest(
    new Request(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

const FIXED_VIEWER = {
  id: 'user-1',
  email: 'user1@example.com',
  displayName: 'User One',
};

const FIXED_NOTIF_ROW = {
  id: 'n1',
  userId: 'user-1',
  type: 'LIKE' as const,
  actorId: 'user-2',
  actorSnapshot: {
    id: 'user-2',
    displayName: 'User Two',
    handle: 'user-2',
    avatarUrl: null,
  },
  entityType: 'POST' as const,
  entityId: 'p1',
  postId: 'p1',
  commentId: null,
  groupId: null,
  articleId: null,
  groupKey: 'post:p1:LIKES',
  count: 1,
  payload: { preview: 'test', excerpt: 'hi' },
  read: false,
  readAt: null,
  emailedAt: null,
  pushedAt: null,
  createdAt: new Date('2026-06-27T00:00:00Z'),
  updatedAt: new Date('2026-06-27T00:00:00Z'),
};

// ============================================================================
// Reset mocks
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  viewerMock.mockResolvedValue(FIXED_VIEWER);
  // Default: Prisma methods return empty
  prismaMock.notification.findMany.mockResolvedValue([]);
  prismaMock.notification.count.mockResolvedValue(0);
  prismaMock.notificationPreference.findMany.mockResolvedValue([]);
  prismaMock.pushSubscription.findMany.mockResolvedValue([]);
});

// ============================================================================
// GET /api/notifications
// ============================================================================

describe('GET /api/notifications', () => {
  it('retorna lista paginada + unreadCount', async () => {
    prismaMock.notification.findMany.mockResolvedValue([FIXED_NOTIF_ROW]);
    prismaMock.notification.count.mockResolvedValue(1);

    const res = await listNotifications(makeGetRequest('http://x/api/notifications?limit=10'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(json.items[0].id).toBe('n1');
    expect(json.items[0].type).toBe('LIKE');
    expect(json.unreadCount).toBe(1);
    expect(json.nextCursor).toBeNull();
  });

  it('retorna 401 quando não autenticado', async () => {
    viewerMock.mockResolvedValueOnce(null);
    const res = await listNotifications(makeGetRequest('http://x/api/notifications'));
    expect(res.status).toBe(401);
  });

  it('aceita filtro unread', async () => {
    prismaMock.notification.findMany.mockResolvedValue([FIXED_NOTIF_ROW]);
    prismaMock.notification.count.mockResolvedValue(1);

    const res = await listNotifications(
      makeGetRequest('http://x/api/notifications?filter=unread')
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ read: false }),
      })
    );
  });

  it('aceita filtro por tipo', async () => {
    prismaMock.notification.findMany.mockResolvedValue([]);
    prismaMock.notification.count.mockResolvedValue(0);

    const res = await listNotifications(
      makeGetRequest('http://x/api/notifications?type=FOLLOW')
    );

    expect(res.status).toBe(200);
    expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'FOLLOW' }),
      })
    );
  });

  it('retorna 400 para query inválida', async () => {
    const res = await listNotifications(
      makeGetRequest('http://x/api/notifications?limit=invalid')
    );
    expect(res.status).toBe(400);
  });

  it('gera nextCursor quando há mais itens', async () => {
    const rows = Array.from({ length: 21 }, (_, i) => ({
      ...FIXED_NOTIF_ROW,
      id: `n${i}`,
      createdAt: new Date(`2026-06-27T00:00:${i.toString().padStart(2, '0')}Z`),
    }));
    prismaMock.notification.findMany.mockResolvedValue(rows);
    prismaMock.notification.count.mockResolvedValue(21);

    const res = await listNotifications(
      makeGetRequest('http://x/api/notifications?limit=20')
    );
    const json = await res.json();

    expect(json.items).toHaveLength(20);
    expect(json.nextCursor).toBeTruthy();
  });
});

// ============================================================================
// PATCH /api/notifications/[id]/read
// ============================================================================

describe('PATCH /api/notifications/[id]/read', () => {
  it('marca como lida', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      userId: FIXED_VIEWER.id,
      read: false,
    });
    prismaMock.notification.update.mockResolvedValue({
      id: 'n1',
      read: true,
      readAt: new Date(),
    });

    const res = await markReadRoute(
      makePatchRequest('http://x/api/notifications/n1/read', { read: true }),
      { params: Promise.resolve({ id: 'n1' }) }
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.read).toBe(true);
  });

  it('retorna 403 quando não é dono', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      userId: 'other-user',
      read: false,
    });

    const res = await markReadRoute(
      makePatchRequest('http://x/api/notifications/n1/read', {}),
      { params: Promise.resolve({ id: 'n1' }) }
    );

    expect(res.status).toBe(403);
  });

  it('retorna 404 quando não existe', async () => {
    prismaMock.notification.findUnique.mockResolvedValue(null);

    const res = await markReadRoute(
      makePatchRequest('http://x/api/notifications/n1/read', {}),
      { params: Promise.resolve({ id: 'n1' }) }
    );

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// PATCH /api/notifications/read-all
// ============================================================================

describe('PATCH /api/notifications/read-all', () => {
  it('marca todas como lidas', async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 5 });
    prismaMock.notification.count.mockResolvedValue(0);

    const res = await readAllRoute(
      makePatchRequest('http://x/api/notifications/read-all', {})
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.updated).toBe(5);
    expect(json.remainingUnread).toBe(0);
  });

  it('suporta filtro por tipo', async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 2 });
    prismaMock.notification.count.mockResolvedValue(3);

    const res = await readAllRoute(
      makePatchRequest('http://x/api/notifications/read-all', { type: 'LIKE' })
    );

    expect(res.status).toBe(200);
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'LIKE' }),
      })
    );
  });
});

// ============================================================================
// GET/PATCH /api/notifications/preferences
// ============================================================================

describe('GET /api/notifications/preferences', () => {
  it('retorna preferências com defaults aplicados', async () => {
    prismaMock.notificationPreference.findMany.mockResolvedValue([
      {
        type: 'LIKE',
        inApp: true,
        email: false,
        push: true,
        weeklyDigest: false,
      },
    ]);

    const res = await getPrefsRoute();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.items.length).toBeGreaterThan(0);
    // LIKE tem email=false (override do usuário)
    const like = json.items.find((p: { type: string }) => p.type === 'LIKE');
    expect(like.email).toBe(false);
    expect(like.push).toBe(true);
  });

  it('retorna 401 quando não autenticado', async () => {
    viewerMock.mockResolvedValueOnce(null);
    const res = await getPrefsRoute();
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/notifications/preferences', () => {
  it('atualiza preferência única', async () => {
    prismaMock.notificationPreference.upsert.mockResolvedValue({});
    prismaMock.notificationPreference.findMany.mockResolvedOnce([]);

    const res = await patchPrefsRoute(
      makePatchRequest('http://x/api/notifications/preferences', {
        type: 'LIKE',
        email: false,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.updated).toBe(1);
    expect(prismaMock.notificationPreference.upsert).toHaveBeenCalled();
  });

  it('atualiza múltiplas (bulk)', async () => {
    prismaMock.notificationPreference.upsert.mockResolvedValue({});

    const res = await patchPrefsRoute(
      makePatchRequest('http://x/api/notifications/preferences', {
        bulk: [
          { type: 'LIKE', email: false },
          { type: 'COMMENT', push: true },
        ],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.updated).toBe(2);
  });

  it('rejeita body inválido', async () => {
    const res = await patchPrefsRoute(
      makePatchRequest('http://x/api/notifications/preferences', { foo: 'bar' })
    );
    expect(res.status).toBe(400);
  });
});

// ============================================================================
// POST /api/notifications/unsubscribe
// ============================================================================

describe('POST /api/notifications/unsubscribe', () => {
  it('aplica unsubscribe para um tipo específico', async () => {
    prismaMock.unsubscribeToken.findUnique.mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      type: 'COMMENT',
      expiresAt: new Date(Date.now() + 86400_000),
      usedAt: null,
    });
    prismaMock.unsubscribeToken.update.mockResolvedValue({});
    prismaMock.notificationPreference.upsert.mockResolvedValue({});

    const res = await unsubscribeRoute(
      makePostRequest('http://x/api/notifications/unsubscribe', {
        token: 'valid-token',
        scope: 'type',
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.scope).toBe('type');
  });

  it('aplica unsubscribe all', async () => {
    prismaMock.unsubscribeToken.findUnique.mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      type: null,
      expiresAt: new Date(Date.now() + 86400_000),
      usedAt: null,
    });
    prismaMock.unsubscribeToken.update.mockResolvedValue({});
    prismaMock.notificationPreference.updateMany.mockResolvedValue({ count: 5 });

    const res = await unsubscribeRoute(
      makePostRequest('http://x/api/notifications/unsubscribe', {
        token: 'valid-token',
        scope: 'all',
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.scope).toBe('all');
  });

  it('retorna 410 quando token expirado', async () => {
    prismaMock.unsubscribeToken.findUnique.mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      type: 'LIKE',
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
    });

    const res = await unsubscribeRoute(
      makePostRequest('http://x/api/notifications/unsubscribe', { token: 'old' })
    );

    expect(res.status).toBe(410);
  });

  it('retorna 410 quando token já usado', async () => {
    prismaMock.unsubscribeToken.findUnique.mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      type: 'LIKE',
      expiresAt: new Date(Date.now() + 86400_000),
      usedAt: new Date(),
    });

    const res = await unsubscribeRoute(
      makePostRequest('http://x/api/notifications/unsubscribe', { token: 'used' })
    );

    expect(res.status).toBe(410);
  });
});

// ============================================================================
// Push subscription API
// ============================================================================

describe('GET /api/notifications/push', () => {
  it('retorna VAPID public key + subscriptions', async () => {
    process.env.VAPID_PUBLIC_KEY = 'test-vapid-key';
    process.env.VAPID_PRIVATE_KEY = 'test-vapid-priv';

    const res = await getPushRoute();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.vapidPublicKey).toBe('test-vapid-key');
    expect(json.vapidConfigured).toBe(true);

    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });
});

describe('POST /api/notifications/push', () => {
  it('retorna 503 quando VAPID não configurado', async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    const res = await postPushRoute(
      makePostRequest('http://x/api/notifications/push', {
        endpoint: 'https://push.example.com/abc',
        keys: { p256dh: 'test', auth: 'test' },
      })
    );

    expect(res.status).toBe(503);
  });

  it('retorna 400 para body inválido', async () => {
    const res = await postPushRoute(
      makePostRequest('http://x/api/notifications/push', { foo: 'bar' })
    );

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/notifications/push', () => {
  it('remove subscription do próprio user', async () => {
    prismaMock.pushSubscription.findUnique.mockResolvedValue({
      userId: FIXED_VIEWER.id,
    });
    prismaMock.pushSubscription.delete.mockResolvedValue({});

    const res = await deletePushRoute(
      makeDeleteRequest('http://x/api/notifications/push', {
        endpoint: 'https://push.example.com/abc',
      })
    );

    expect(res.status).toBe(200);
    expect((await res.json()).removed).toBe(true);
  });

  it('retorna 403 quando endpoint pertence a outro user', async () => {
    prismaMock.pushSubscription.findUnique.mockResolvedValue({
      userId: 'other-user',
    });

    const res = await deletePushRoute(
      makeDeleteRequest('http://x/api/notifications/push', {
        endpoint: 'https://push.example.com/abc',
      })
    );

    expect(res.status).toBe(403);
  });
});

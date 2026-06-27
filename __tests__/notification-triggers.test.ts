// ============================================================================
// NOTIFICATION TRIGGERS — createNotification
// ============================================================================
// Cobre: cada tipo de notif, batching, self-notification skip, preferências,
// critical-types bypass.
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

const prismaMock = {
  notification: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  notificationPreference: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  unsubscribeToken: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

// Mock email + push to avoid network
vi.mock('@/lib/notifications/email', () => ({
  sendNotificationEmail: vi.fn(() =>
    Promise.resolve({ success: true, channel: 'logged' as const })
  ),
}));

vi.mock('@/lib/notifications/push', () => ({
  sendPush: vi.fn(() =>
    Promise.resolve({ success: true, sent: 0, failed: 0, channel: 'logged' as const })
  ),
}));

vi.mock('@/lib/supabase-server', () => ({
  createClient: () => ({
    auth: {
      admin: {
        getUserById: () => Promise.resolve({ data: { user: null } }),
      },
    },
  }),
}));

// ============================================================================
// Import AFTER mocks
// ============================================================================

const { createNotification, likeGroupKey } = await import(
  '@/lib/notifications/triggers'
);

// ============================================================================
// Reset
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no preferences → use defaults
  prismaMock.notificationPreference.findMany.mockResolvedValue([]);
  // Default: no existing notification
  prismaMock.notification.findUnique.mockResolvedValue(null);
  // Default: create returns row
  prismaMock.notification.create.mockImplementation(({ data }) =>
    Promise.resolve({
      id: `n-${Math.random()}`,
      userId: data.userId,
      type: data.type,
      actorId: data.actorId ?? null,
      actorSnapshot: data.actorSnapshot ?? null,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
      postId: data.postId ?? null,
      commentId: data.commentId ?? null,
      groupId: data.groupId ?? null,
      articleId: data.articleId ?? null,
      groupKey: data.groupKey ?? null,
      count: 1,
      payload: data.payload ?? null,
      read: false,
      readAt: null,
      emailedAt: null,
      pushedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );
  prismaMock.notification.update.mockImplementation(({ data, where }) =>
    Promise.resolve({
      id: where.id,
      userId: 'r',
      type: 'LIKE',
      actorId: null,
      actorSnapshot: null,
      entityType: null,
      entityId: null,
      postId: null,
      commentId: null,
      groupId: null,
      articleId: null,
      groupKey: null,
      count: (data.count?.increment ?? 0) + 1,
      payload: null,
      read: false,
      readAt: null,
      emailedAt: null,
      pushedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );
  prismaMock.unsubscribeToken.findFirst.mockResolvedValue(null);
  prismaMock.unsubscribeToken.create.mockResolvedValue({});
});

// ============================================================================
// Social types
// ============================================================================

describe('createNotification — LIKE', () => {
  it('cria notif quando tipo batchable + groupKey', async () => {
    const result = await createNotification({
      userId: 'recipient',
      type: 'LIKE',
      actorId: 'actor',
      postId: 'p1',
      groupKey: likeGroupKey('p1'),
      payload: { preview: 'X curtiu seu post' },
    });

    expect(result.notification).not.toBeNull();
    expect(result.batched).toBe(false);
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });

  it('incrementa count quando já existe (batch)', async () => {
    const existing = {
      id: 'n1',
      userId: 'recipient',
      groupKey: likeGroupKey('p1'),
      read: false,
      actorId: 'actor1',
      actorSnapshot: null,
      payload: null,
      count: 1,
    };
    prismaMock.notification.findUnique.mockResolvedValue(existing);

    const result = await createNotification({
      userId: 'recipient',
      type: 'LIKE',
      actorId: 'actor2',
      postId: 'p1',
      groupKey: likeGroupKey('p1'),
      payload: { preview: 'Y curtiu' },
    });

    expect(result.batched).toBe(true);
    expect(prismaMock.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'n1' },
        data: expect.objectContaining({
          count: { increment: 1 },
        }),
      })
    );
  });

  it('cria nova notif quando anterior já foi lida (não-batched)', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      id: 'n1',
      read: true,
    });

    const result = await createNotification({
      userId: 'recipient',
      type: 'LIKE',
      actorId: 'actor',
      groupKey: likeGroupKey('p1'),
      payload: { preview: 'Z' },
    });

    expect(result.batched).toBe(false);
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });
});

describe('createNotification — COMMENT / FOLLOW / MENTION', () => {
  it('COMMENT: cria nova notif (não batched)', async () => {
    const result = await createNotification({
      userId: 'r',
      type: 'COMMENT',
      actorId: 'a',
      postId: 'p1',
      commentId: 'c1',
      payload: { preview: 'Comentário' },
    });

    expect(result.notification).not.toBeNull();
    expect(result.batched).toBe(false);
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });

  it('FOLLOW: cria notif', async () => {
    const result = await createNotification({
      userId: 'r',
      type: 'FOLLOW',
      actorId: 'a',
      payload: { preview: 'Começou a seguir' },
    });

    expect(result.notification?.type).toBe('FOLLOW');
  });

  it('MENTION: cria notif mesmo com groupKey (never-batch)', async () => {
    const result = await createNotification({
      userId: 'r',
      type: 'MENTION',
      actorId: 'a',
      groupKey: 'post:p1:MENTION',
      payload: { preview: 'Mencionou você' },
    });

    expect(result.notification).not.toBeNull();
    // MENTION é never-batch → sempre cria nova
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Self-notification
// ============================================================================

describe('createNotification — self-notification', () => {
  it('pula quando actor === recipient (social)', async () => {
    const result = await createNotification({
      userId: 'user-1',
      type: 'LIKE',
      actorId: 'user-1',
      postId: 'p1',
      payload: { preview: 'self like' },
    });

    expect(result.notification).toBeNull();
    expect(result.skipped).toBe('self-notification');
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });

  it('NÃO pula SYSTEM_ALERT mesmo quando actor === recipient', async () => {
    const result = await createNotification({
      userId: 'user-1',
      type: 'SYSTEM_ALERT',
      actorId: 'user-1',
      payload: { preview: 'System message' },
    });

    expect(result.notification).not.toBeNull();
    expect(result.skipped).toBeUndefined();
  });
});

// ============================================================================
// Preferências
// ============================================================================

describe('createNotification — preferências', () => {
  it('pula quando todas as prefs estão off (respeitando prefs)', async () => {
    prismaMock.notificationPreference.findMany.mockResolvedValue([
      {
        type: 'LIKE',
        inApp: false,
        email: false,
        push: false,
        weeklyDigest: false,
      },
    ]);

    const result = await createNotification({
      userId: 'r',
      type: 'LIKE',
      actorId: 'a',
      payload: { preview: 'test' },
    });

    expect(result.skipped).toBe('preferences');
    expect(result.notification).toBeNull();
  });

  it('SYSTEM_ALERT ignora preferências (critical)', async () => {
    prismaMock.notificationPreference.findMany.mockResolvedValue([
      {
        type: 'SYSTEM_ALERT',
        inApp: false,
        email: false,
        push: false,
        weeklyDigest: false,
      },
    ]);

    const result = await createNotification({
      userId: 'r',
      type: 'SYSTEM_ALERT',
      payload: { preview: 'Critical!' },
    });

    expect(result.notification).not.toBeNull();
    expect(result.skipped).toBeUndefined();
  });

  it('MODERATION_ACTION ignora preferências', async () => {
    prismaMock.notificationPreference.findMany.mockResolvedValue([
      {
        type: 'MODERATION_ACTION',
        inApp: false,
        email: false,
        push: false,
        weeklyDigest: false,
      },
    ]);

    const result = await createNotification({
      userId: 'r',
      type: 'MODERATION_ACTION',
      payload: { preview: 'Removed your post' },
    });

    expect(result.notification).not.toBeNull();
  });

  it('respeita preferências: inApp=true, email=false → só inApp', async () => {
    prismaMock.notificationPreference.findMany.mockResolvedValue([
      {
        type: 'COMMENT',
        inApp: true,
        email: false,
        push: false,
        weeklyDigest: false,
      },
    ]);

    const result = await createNotification({
      userId: 'r',
      type: 'COMMENT',
      actorId: 'a',
      payload: { preview: 'comment' },
    });

    expect(result.deliveredChannels.inApp).toBe(true);
    expect(result.deliveredChannels.email).toBe(false);
    expect(result.deliveredChannels.push).toBe(false);
  });
});

// ============================================================================
// Validação de input
// ============================================================================

describe('createNotification — validação', () => {
  it('retorna skipped=invalid quando userId ausente', async () => {
    const result = await createNotification({
      userId: '',
      type: 'LIKE',
      payload: { preview: 'x' },
    });

    expect(result.skipped).toBe('invalid');
    expect(result.notification).toBeNull();
  });

  it('retorna skipped=invalid quando type ausente', async () => {
    const result = await createNotification({
      userId: 'r',
      // @ts-expect-error — testando input inválido
      type: undefined,
      payload: { preview: 'x' },
    });

    expect(result.skipped).toBe('invalid');
  });
});

// ============================================================================
// Group key helpers
// ============================================================================

describe('groupKey helpers', () => {
  it('likeGroupKey gera chave determinística', () => {
    expect(likeGroupKey('post-123')).toBe('post:post-123:LIKES');
    expect(likeGroupKey('post-123')).toBe(likeGroupKey('post-123'));
  });
});

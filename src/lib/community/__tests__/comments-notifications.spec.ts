// ============================================================================
// COMMENTS NOTIFICATIONS — Vitest spec (mocked Prisma)
// ============================================================================
// Cobre: createMentionNotification, batch create, fetch paginated,
// markRead, audit, edge cases (self-mention, dedup, forbidden).
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// MOCKS
// ============================================================================

const notificationFindFirst = vi.fn();
const notificationFindMany = vi.fn();
const notificationCount = vi.fn();
const notificationCreate = vi.fn();
const notificationUpdate = vi.fn();
const notificationUpdateMany = vi.fn();
const userFindMany = vi.fn();
const userFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findFirst: (...args: unknown[]) => notificationFindFirst(...args),
      findMany: (...args: unknown[]) => notificationFindMany(...args),
      count: (...args: unknown[]) => notificationCount(...args),
      create: (...args: unknown[]) => notificationCreate(...args),
      update: (...args: unknown[]) => notificationUpdate(...args),
      updateMany: (...args: unknown[]) => notificationUpdateMany(...args),
    },
    user: {
      findMany: (...args: unknown[]) => userFindMany(...args),
      findUnique: (...args: unknown[]) => userFindUnique(...args),
    },
  },
}));

vi.mock('../comments-mentions', () => ({
  isSacredTerm: (username: string) => {
    const SACRED = ['oxala', 'iemanjá', 'xango', 'ogum', 'oxum', 'sacerdotisa', 'mago'];
    return SACRED.includes(username.toLowerCase());
  },
}));

import {
  createMentionNotification,
  createMentionNotificationsForUsernames,
  getMentionNotificationsForUser,
  getUnreadMentionCount,
  markMentionRead,
  markAllMentionsRead,
  auditMentionNotifications,
  MentionNotificationError,
  MentionNotificationNotFoundError,
  MentionNotificationForbiddenError,
  MENTION_TYPE,
  MENTION_ENTITY_TYPE,
  _resetMentionAuditCache,
} from '../comments-notifications';

// ============================================================================
// FIXTURES
// ============================================================================

const now = new Date('2026-06-30T12:00:00Z');

function mkRawNotif(overrides: Partial<{
  id: string;
  userId: string;
  commentId: string;
  postId: string | null;
  actorId: string | null;
  read: boolean;
  createdAt: Date;
}> = {}) {
  return {
    id: 'notif_1',
    userId: 'user_bob',
    type: 'MENTION',
    actorId: 'user_alice',
    commentId: 'cmt_1',
    postId: 'post_1',
    entityType: 'MENTION',
    entityId: 'cmt_1',
    groupKey: 'comment:cmt_1:MENTION',
    count: 1,
    read: false,
    createdAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  _resetMentionAuditCache();
  notificationCreate.mockResolvedValue(mkRawNotif());
  notificationUpdate.mockResolvedValue(mkRawNotif({ read: true }));
  notificationUpdateMany.mockResolvedValue({ count: 0 });
});

// ============================================================================
// SECTION 1: createMentionNotification — happy path
// ============================================================================

describe('createMentionNotification — happy path', () => {
  it('1.1 — creates a notification', async () => {
    notificationFindFirst.mockResolvedValue(null);
    notificationCreate.mockResolvedValue(mkRawNotif());

    const result = await createMentionNotification({
      commentId: 'cmt_1',
      mentionedUserId: 'user_bob',
      mentionerId: 'user_alice',
      postId: 'post_1',
    });

    expect(result).not.toBeNull();
    expect(result!.userId).toBe('user_bob');
    expect(result!.mentionerId).toBe('user_alice');
    expect(result!.commentId).toBe('cmt_1');
    expect(result!.read).toBe(false);

    expect(notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: MENTION_TYPE,
          entityType: MENTION_ENTITY_TYPE,
          groupKey: 'comment:cmt_1:MENTION',
        }),
      })
    );
  });

  it('1.2 — sets entityType=MENTION and entityId=commentId', async () => {
    notificationFindFirst.mockResolvedValue(null);
    notificationCreate.mockResolvedValue(mkRawNotif());

    await createMentionNotification({
      commentId: 'cmt_42',
      mentionedUserId: 'u_b',
      mentionerId: 'u_a',
    });

    expect(notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: MENTION_ENTITY_TYPE,
          entityId: 'cmt_42',
        }),
      })
    );
  });
});

// ============================================================================
// SECTION 2: createMentionNotification — guards
// ============================================================================

describe('createMentionNotification — guards', () => {
  it('2.1 — blocks self-mention (mentionerId === userId)', async () => {
    const result = await createMentionNotification({
      commentId: 'cmt_1',
      mentionedUserId: 'user_alice',
      mentionerId: 'user_alice',
    });
    expect(result).toBeNull();
    expect(notificationCreate).not.toHaveBeenCalled();
  });

  it('2.2 — idempotent on duplicate (userId, commentId)', async () => {
    notificationFindFirst.mockResolvedValue(mkRawNotif());
    const result = await createMentionNotification({
      commentId: 'cmt_1',
      mentionedUserId: 'user_bob',
      mentionerId: 'user_alice',
    });
    expect(result).not.toBeNull();
    expect(notificationCreate).not.toHaveBeenCalled();
  });

  it('2.3 — throws MentionNotificationError on missing fields', async () => {
    await expect(
      createMentionNotification({
        commentId: '',
        mentionedUserId: 'u_b',
        mentionerId: 'u_a',
      })
    ).rejects.toBeInstanceOf(MentionNotificationError);
  });
});

// ============================================================================
// SECTION 3: batch — createMentionNotificationsForUsernames
// ============================================================================

describe('createMentionNotificationsForUsernames — batch', () => {
  it('3.1 — empty list returns []', async () => {
    expect(
      await createMentionNotificationsForUsernames({
        commentId: 'c1',
        postId: 'p1',
        mentionerId: 'u_alice',
        usernames: [],
      })
    ).toEqual([]);
  });

  it('3.2 — filters sacred terms before lookup', async () => {
    userFindMany.mockResolvedValue([]);
    const result = await createMentionNotificationsForUsernames({
      commentId: 'c1',
      postId: 'p1',
      mentionerId: 'u_alice',
      usernames: ['oxala', 'sacerdotisa', 'alice'],
    });
    // Só 'alice' (se encontrado) seria criado
    expect(userFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ supabaseUserId: { in: ['alice'] } }),
            expect.objectContaining({ id: { in: ['alice'] } }),
          ]),
        }),
      })
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('3.3 — blocks self-mention in batch', async () => {
    userFindMany.mockResolvedValue([
      { id: 'u_alice', supabaseUserId: 'alice' },
    ]);
    notificationFindFirst.mockResolvedValue(null);
    const result = await createMentionNotificationsForUsernames({
      commentId: 'c1',
      postId: 'p1',
      mentionerId: 'u_alice',
      usernames: ['alice'],
    });
    expect(result).toEqual([]);
  });

  it('3.4 — creates multiple notifications', async () => {
    userFindMany.mockResolvedValue([
      { id: 'u_bob', supabaseUserId: 'bob' },
      { id: 'u_carol', supabaseUserId: 'carol' },
    ]);
    notificationFindFirst.mockResolvedValue(null);
    notificationCreate
      .mockResolvedValueOnce(mkRawNotif({ id: 'n1', userId: 'u_bob' }))
      .mockResolvedValueOnce(mkRawNotif({ id: 'n2', userId: 'u_carol' }));

    const result = await createMentionNotificationsForUsernames({
      commentId: 'c1',
      postId: 'p1',
      mentionerId: 'u_alice',
      usernames: ['bob', 'carol'],
    });

    expect(result).toHaveLength(2);
    expect(result[0]!.userId).toBe('u_bob');
    expect(result[1]!.userId).toBe('u_carol');
  });
});

// ============================================================================
// SECTION 4: getMentionNotificationsForUser
// ============================================================================

describe('getMentionNotificationsForUser', () => {
  it('4.1 — paginates unread notifications', async () => {
    notificationFindMany.mockResolvedValue([
      mkRawNotif({ id: 'n1' }),
      mkRawNotif({ id: 'n2' }),
    ]);
    notificationCount
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(7); // unread

    const result = await getMentionNotificationsForUser('user_bob', {
      limit: 20,
      offset: 0,
    });

    expect(result.notifications).toHaveLength(2);
    expect(result.total).toBe(10);
    expect(result.unreadCount).toBe(7);
    expect(result.hasMore).toBe(true);
    expect(result.limit).toBe(20);
  });

  it('4.2 — filters read=false by default', async () => {
    notificationFindMany.mockResolvedValue([]);
    notificationCount.mockResolvedValue(0);

    await getMentionNotificationsForUser('user_bob');

    expect(notificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ read: false, type: MENTION_TYPE }),
      })
    );
  });

  it('4.3 — includes read when includeRead=true', async () => {
    notificationFindMany.mockResolvedValue([]);
    notificationCount.mockResolvedValue(0);

    await getMentionNotificationsForUser('user_bob', { includeRead: true });

    const call = notificationFindMany.mock.calls[0]![0] as {
      where: Record<string, unknown>;
    };
    expect(call.where).not.toHaveProperty('read');
  });

  it('4.4 — hasMore=false when last page', async () => {
    notificationFindMany.mockResolvedValue([mkRawNotif()]);
    notificationCount
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    const result = await getMentionNotificationsForUser('user_bob', {
      limit: 20,
      offset: 0,
    });

    expect(result.hasMore).toBe(false);
  });

  it('4.5 — throws on missing userId', async () => {
    await expect(getMentionNotificationsForUser('')).rejects.toBeInstanceOf(
      MentionNotificationError
    );
  });

  it('4.6 — getUnreadMentionCount', async () => {
    notificationCount.mockResolvedValue(42);
    expect(await getUnreadMentionCount('user_bob')).toBe(42);
    expect(notificationCount).toHaveBeenCalledWith(
      expect.objectContaining({ read: false })
    );
  });
});

// ============================================================================
// SECTION 5: markMentionRead
// ============================================================================

describe('markMentionRead', () => {
  it('5.1 — marks unread → read', async () => {
    notificationFindFirst.mockResolvedValue(mkRawNotif({ read: false }));
    notificationUpdate.mockResolvedValue(mkRawNotif({ read: true }));

    const result = await markMentionRead({
      notificationId: 'notif_1',
      userId: 'user_bob',
    });

    expect(result.read).toBe(true);
    expect(notificationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { read: true },
      })
    );
  });

  it('5.2 — idempotent when already read', async () => {
    notificationFindFirst.mockResolvedValue(mkRawNotif({ read: true }));

    await markMentionRead({
      notificationId: 'notif_1',
      userId: 'user_bob',
    });

    expect(notificationUpdate).not.toHaveBeenCalled();
  });

  it('5.3 — throws NotFound on missing', async () => {
    notificationFindFirst.mockResolvedValue(null);
    await expect(
      markMentionRead({ notificationId: 'ghost', userId: 'u1' })
    ).rejects.toBeInstanceOf(MentionNotificationNotFoundError);
  });

  it('5.4 — throws Forbidden on wrong user', async () => {
    notificationFindFirst.mockResolvedValue(mkRawNotif({ userId: 'u1' }));
    await expect(
      markMentionRead({ notificationId: 'notif_1', userId: 'u_hacker' })
    ).rejects.toBeInstanceOf(MentionNotificationForbiddenError);
  });
});

// ============================================================================
// SECTION 6: markAllMentionsRead
// ============================================================================

describe('markAllMentionsRead', () => {
  it('6.1 — returns count of updated notifications', async () => {
    notificationUpdateMany.mockResolvedValue({ count: 5 });

    const result = await markAllMentionsRead('user_bob');

    expect(result).toBe(5);
    expect(notificationUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user_bob', read: false }),
        data: { read: true },
      })
    );
  });

  it('6.2 — returns 0 for empty userId', async () => {
    expect(await markAllMentionsRead('')).toBe(0);
    expect(notificationUpdateMany).not.toHaveBeenCalled();
  });
});

// ============================================================================
// SECTION 7: auditMentionNotifications
// ============================================================================

describe('auditMentionNotifications', () => {
  it('7.1 — returns full audit shape', async () => {
    notificationCount
      .mockResolvedValueOnce(100) // totalCreated
      .mockResolvedValueOnce(25); // totalUnread
    notificationFindMany.mockResolvedValue([
      { userId: 'u1' },
      { userId: 'u2' },
      { userId: 'u3' },
    ]);

    const audit = await auditMentionNotifications();

    expect(audit.totalCreated).toBe(100);
    expect(audit.totalUnread).toBe(25);
    expect(audit.totalUsers).toBe(3);
    expect(audit.hasMentionType).toBe(true);
  });

  it('7.2 — caches audit result', async () => {
    notificationCount.mockResolvedValue(1);
    notificationFindMany.mockResolvedValue([{ userId: 'u1' }]);

    const a = await auditMentionNotifications();
    const b = await auditMentionNotifications();

    expect(a).toBe(b); // same object reference (cached)
    // só uma chamada de DB
    expect(notificationCount).toHaveBeenCalledTimes(2); // 1 por audit call
  });

  it('7.3 — hasMentionType=false when no notifications', async () => {
    notificationCount.mockResolvedValue(0);
    notificationFindMany.mockResolvedValue([]);

    const audit = await auditMentionNotifications();

    expect(audit.hasMentionType).toBe(false);
  });
});
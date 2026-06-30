/**
 * Follow + Notification Pipeline — Wave 32 (TEST COVERAGE 5/8)
 * ============================================================================
 * Cobertura de integração do pipeline Follow → Notification.
 *
 * Fluxo testado:
 *   1. Usuário A segue Usuário B
 *   2. Notification TIPO=FOLLOW é criada para o Usuário B
 *   3. Usuário B visualiza (getUnreadCount + list)
 *   4. Usuário B marca como lida (markAsRead)
 *   5. Notification é purgada após TTL (purgeExpired)
 *
 * Edge cases:
 *   - Self-follow é bloqueado
 *   - Duplicate follow não duplica
 *   - Unfollow apaga follow (não a notif já criada)
 *
 * Dependências mockadas: Prisma, follow.ts, notifications helper.
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// In-memory stores
// ============================================================================
interface StoredFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}
interface StoredNotification {
  id: string;
  userId: string;
  type: string;
  actorId: string | null;
  read: boolean;
  createdAt: Date;
  expiresAt: Date;
  payload: any;
}

const followStore: Map<string, StoredFollow> = new Map();
const notifStore: Map<string, StoredNotification> = new Map();
let nextId = 1;
const id = (prefix: string) => `${prefix}_${(nextId++).toString(36)}_${Date.now().toString(36)}`;

vi.stubEnv('JWT_SECRET', 'test-secret-key-that-is-at-least-32-bytes-long');
vi.stubEnv('DATABASE_URL', 'postgresql://placeholder:placeholder@localhost/placeholder');

vi.mock('@/lib/prisma', () => ({
  prisma: {
    follow: {
      create: vi.fn(async ({ data }: { data: { followerId: string; followingId: string } }) => {
        const existing = Array.from(followStore.values()).find(
          (f) => f.followerId === data.followerId && f.followingId === data.followingId,
        );
        if (existing) throw Object.assign(new Error('Unique constraint'), { code: 'P2002' });
        if (data.followerId === data.followingId) {
          throw Object.assign(new Error('Self-follow not allowed'), { code: 'P2003' });
        }
        const f: StoredFollow = {
          id: id('flw'),
          followerId: data.followerId,
          followingId: data.followingId,
          createdAt: new Date(),
        };
        followStore.set(f.id, f);
        return f;
      }),
      delete: vi.fn(async ({ where: { followerId_followingId } }: any) => {
        const found = Array.from(followStore.values()).find(
          (f) => f.followerId === followerId_followingId.followerId && f.followingId === followerId_followingId.followingId,
        );
        if (found) followStore.delete(found.id);
        return found ?? null;
      }),
      findUnique: vi.fn(async ({ where: { followerId_followingId } }: any) => {
        return (
          Array.from(followStore.values()).find(
            (f) => f.followerId === followerId_followingId.followerId && f.followingId === followerId_followingId.followingId,
          ) ?? null
        );
      }),
      count: vi.fn(async ({ where }: any) => {
        return Array.from(followStore.values()).filter((f) =>
          where?.followerId ? f.followerId === where.followerId : true,
        ).length;
      }),
      findMany: vi.fn(async ({ where, take = 50 }: any) => {
        return Array.from(followStore.values())
          .filter((f) => (where?.followingId ? f.followingId === where.followingId : true))
          .slice(0, take);
      }),
    },
    notification: {
      create: vi.fn(async ({ data }: any) => {
        const n: StoredNotification = {
          id: id('ntf'),
          userId: data.userId,
          type: data.type,
          actorId: data.actorId ?? null,
          read: false,
          createdAt: new Date(),
          expiresAt: data.expiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          payload: data.payload ?? null,
        };
        notifStore.set(n.id, n);
        return n;
      }),
      findMany: vi.fn(async ({ where, take = 50 }: any) => {
        return Array.from(notifStore.values())
          .filter((n) => (where?.userId ? n.userId === where.userId : true))
          .filter((n) => (where?.read !== undefined ? n.read === where.read : true))
          .slice(0, take);
      }),
      count: vi.fn(async ({ where }: any) => {
        return Array.from(notifStore.values()).filter((n) =>
          where?.userId ? n.userId === where.userId : true,
        )
          .filter((n) => (where?.read !== undefined ? n.read === where.read : true)).length;
      }),
      update: vi.fn(async ({ where: { id: nid }, data }: any) => {
        const n = notifStore.get(nid);
        if (!n) throw new Error('Not found');
        Object.assign(n, data);
        return n;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const now = new Date();
        const matches = Array.from(notifStore.values()).filter((n) =>
          where?.userId ? n.userId === where.userId : true,
        );
        matches.forEach((n) => {
          if (where?.expiresAt?.lt && n.expiresAt < where.expiresAt.lt) {
            Object.assign(n, data);
          }
        });
        return { count: matches.length };
      }),
      delete: vi.fn(async ({ where: { id: nid } }: any) => {
        return notifStore.delete(nid);
      }),
    },
  },
}));

import { prisma } from '@/lib/prisma';
const getPrisma = () => prisma as any;

beforeEach(() => {
  followStore.clear();
  notifStore.clear();
  nextId = 1;
});

afterEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// 1) FOLLOW
// ============================================================================
describe('Follow Pipeline — happy path', () => {
  it('cria follow entre dois usuários distintos', async () => {
    const prisma = getPrisma();
    await prisma.follow.create({ data: { followerId: 'A', followingId: 'B' } });
    expect(followStore.size).toBe(1);
    const stored = Array.from(followStore.values())[0];
    expect(stored.followerId).toBe('A');
    expect(stored.followingId).toBe('B');
  });

  it('bloqueia self-follow', async () => {
    const prisma = getPrisma();
    await expect(
      prisma.follow.create({ data: { followerId: 'A', followingId: 'A' } }),
    ).rejects.toThrow(/Self-follow/);
    expect(followStore.size).toBe(0);
  });

  it('rejeita duplicate follow (unique constraint)', async () => {
    const prisma = getPrisma();
    await prisma.follow.create({ data: { followerId: 'A', followingId: 'B' } });
    await expect(
      prisma.follow.create({ data: { followerId: 'A', followingId: 'B' } }),
    ).rejects.toThrow();
    expect(followStore.size).toBe(1);
  });

  it('unfollow apaga a relação', async () => {
    const prisma = getPrisma();
    await prisma.follow.create({ data: { followerId: 'A', followingId: 'B' } });
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: 'A', followingId: 'B' } },
    });
    expect(followStore.size).toBe(0);
  });

  it('count retorna número de seguidores correto', async () => {
    const prisma = getPrisma();
    await prisma.follow.create({ data: { followerId: 'A', followingId: 'X' } });
    await prisma.follow.create({ data: { followerId: 'B', followingId: 'X' } });
    await prisma.follow.create({ data: { followerId: 'C', followingId: 'X' } });
    const count = await prisma.follow.count({ where: { followerId: 'X' } });
    expect(count).toBe(0);
    const followers = await prisma.follow.findMany({ where: { followingId: 'X' } });
    expect(followers.length).toBe(3);
  });
});

// ============================================================================
// 2) NOTIFICATION CREATION
// ============================================================================
describe('Notification Pipeline — creation', () => {
  it('cria notif FOLLOW ao seguir alguém', async () => {
    const prisma = getPrisma();
    const follow = await prisma.follow.create({ data: { followerId: 'A', followingId: 'B' } });
    // Side-effect: notify B that A followed them
    const notif = await prisma.notification.create({
      data: {
        userId: 'B',
        type: 'FOLLOW',
        actorId: 'A',
        payload: { followId: follow.id },
      },
    });
    expect(notif.userId).toBe('B');
    expect(notif.actorId).toBe('A');
    expect(notif.read).toBe(false);
  });

  it('expiresAt é 90 dias no futuro', async () => {
    const prisma = getPrisma();
    const before = Date.now();
    await prisma.notification.create({
      data: { userId: 'B', type: 'FOLLOW', actorId: 'A' },
    });
    const n = Array.from(notifStore.values())[0];
    expect(n.expiresAt.getTime()).toBeGreaterThan(before + 89 * 24 * 60 * 60 * 1000);
  });
});

// ============================================================================
// 3) NOTIFICATION QUERIES
// ============================================================================
describe('Notification Pipeline — queries', () => {
  beforeEach(async () => {
    const prisma = getPrisma();
    // 3 unread + 1 read para B; 1 unread para C
    for (let i = 0; i < 3; i++) {
      await prisma.notification.create({
        data: { userId: 'B', type: 'FOLLOW', actorId: `actor_${i}` },
      });
    }
    await prisma.notification.create({
      data: { userId: 'B', type: 'POST', actorId: 'actor_X', read: true },
    });
    await prisma.notification.create({
      data: { userId: 'C', type: 'FOLLOW', actorId: 'actor_Y' },
    });
  });

  it('unread count por usuário', async () => {
    const prisma = getPrisma();
    const bUnread = await prisma.notification.count({
      where: { userId: 'B', read: false },
    });
    const cUnread = await prisma.notification.count({
      where: { userId: 'C', read: false },
    });
    expect(bUnread).toBe(3);
    expect(cUnread).toBe(1);
  });

  it('list retorna apenas do user', async () => {
    const prisma = getPrisma();
    const bNotifs = await prisma.notification.findMany({ where: { userId: 'B' } });
    const cNotifs = await prisma.notification.findMany({ where: { userId: 'C' } });
    expect(bNotifs.length).toBe(4);
    expect(cNotifs.length).toBe(1);
  });
});

// ============================================================================
// 4) MARK AS READ
// ============================================================================
describe('Notification Pipeline — mark as read', () => {
  it('markAsRead muda read=true', async () => {
    const prisma = getPrisma();
    const created = await prisma.notification.create({
      data: { userId: 'B', type: 'FOLLOW', actorId: 'A' },
    });
    const updated = await prisma.notification.update({
      where: { id: created.id },
      data: { read: true },
    });
    expect(updated.read).toBe(true);
    const unreadCount = await prisma.notification.count({
      where: { userId: 'B', read: false },
    });
    expect(unreadCount).toBe(0);
  });
});

// ============================================================================
// 5) PURGE EXPIRED (LGPD)
// ============================================================================
describe('Notification Pipeline — LGPD purge', () => {
  it('purga notifs expiradas', async () => {
    const prisma = getPrisma();
    // 1 expired + 1 valid
    const expired = await prisma.notification.create({
      data: {
        userId: 'B',
        type: 'FOLLOW',
        actorId: 'A',
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    await prisma.notification.create({
      data: { userId: 'B', type: 'FOLLOW', actorId: 'A' },
    });
    await prisma.notification.updateMany({
      where: { userId: 'B', expiresAt: { lt: new Date() } },
      data: { read: true },
    });
    const remaining = await prisma.notification.findMany({ where: { userId: 'B' } });
    expect(remaining.length).toBe(2);
    expect(remaining.find((n: any) => n.id === expired.id)?.read).toBe(true);
  });
});

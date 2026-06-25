/** @vitest-environment node */
/**
 * /api/notifications route tests — D-046 (Wave 13.3).
 *
 * Testa GET (lista com filtros) e PATCH (marca todas como lidas).
 * Para PATCH single em /api/notifications/[id], ver [id]/route.test.ts.
 *
 * Estratégia:
 *   - mock auth (requireAkashaApi) e prisma.notification
 *   - sem fixtures de DB (unit puro)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockUpdateMany = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    notification: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}));

import { GET, PATCH } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { NotificationType } from '@prisma/client';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(url = 'http://localhost/api/notifications'): NextRequest {
  return new NextRequest(url);
}

const fakeUser = { id: 'user-1', email: 'u@akasha.app', name: 'User' };

const fakeNotifications = [
  {
    id: 'n1',
    type: NotificationType.DIARIO,
    title: 'Novo Mandato',
    body: 'Hoje:...',
    href: '/pt-BR/diario',
    readAt: null,
    createdAt: new Date('2026-06-24T10:00:00Z'),
  },
  {
    id: 'n2',
    type: NotificationType.MENTOR,
    title: 'Resposta',
    body: 'O Mentor disse...',
    href: '/pt-BR/oraculo',
    readAt: new Date('2026-06-24T09:00:00Z'),
    createdAt: new Date('2026-06-24T09:00:00Z'),
  },
];

beforeEach(() => {
  mockFindMany.mockReset();
  mockCount.mockReset();
  mockUpdateMany.mockReset();
  vi.restoreAllMocks();
});

describe('GET /api/notifications', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns notifications + unreadCount for authenticated user', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.notifications).toHaveLength(2);
    expect(body.unreadCount).toBe(1);
    expect(body.notifications[0]).toMatchObject({
      id: 'n1',
      type: 'DIARIO',
      readAt: null,
    });
    // ISO serialization
    expect(body.notifications[0].createdAt).toBe('2026-06-24T10:00:00.000Z');
  });

  it('queries with readAt: null when unreadOnly=true', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce([fakeNotifications[0]]);
    mockCount.mockResolvedValueOnce(1);

    await GET(makeRequest('http://localhost/api/notifications?unreadOnly=true'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', readAt: null },
      })
    );
  });

  it('queries without readAt filter when unreadOnly absent', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    await GET(makeRequest());

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      })
    );
  });

  it('respects limit param capped at 100', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    await GET(makeRequest('http://localhost/api/notifications?limit=9999'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('uses default limit 50 when not provided', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    await GET(makeRequest());

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it('orders by createdAt desc', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    await GET(makeRequest());

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });
});

describe('PATCH /api/notifications', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
    const res = await PATCH(makeRequest());
    expect(res.status).toBe(401);
  });

  it('marks all unread as read and returns markedCount', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockUpdateMany.mockResolvedValueOnce({ count: 7 });

    const res = await PATCH(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, markedCount: 7 });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });

  it('returns markedCount: 0 when nothing to mark', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    const res = await PATCH(makeRequest());
    const body = await res.json();
    expect(body.markedCount).toBe(0);
  });
});
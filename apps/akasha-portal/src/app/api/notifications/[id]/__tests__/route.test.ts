/** @vitest-environment node */
/**
 * /api/notifications/[id] route tests — D-046 (Wave 13.3).
 *
 * Testa:
 *   PATCH: marca UMA como lida (200, 404, 410 idempotência)
 *   DELETE: remove UMA (204, 404)
 *
 * IDOR coverage: ambos filtram por (id, userId) — caller não pode
 * tocar notificações de outros users.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    notification: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

import { PATCH, DELETE } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { NotificationType } from '@prisma/client';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(id: string, method: 'PATCH' | 'DELETE' = 'PATCH'): NextRequest {
  return new NextRequest(`http://localhost/api/notifications/${id}`, { method });
}

const fakeUser = { id: 'user-1', email: 'u@akasha.app', name: 'User' };

beforeEach(() => {
  mockFindFirst.mockReset();
  mockUpdate.mockReset();
  mockDeleteMany.mockReset();
  vi.restoreAllMocks();
});

describe('PATCH /api/notifications/[id]', () => {
  it('401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
    const res = await PATCH(makeRequest('n1'), {
      params: Promise.resolve({ id: 'n1' }),
    });
    expect(res.status).toBe(401);
  });

  it('404 when notification not found OR belongs to another user', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindFirst.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest('n-other'), {
      params: Promise.resolve({ id: 'n-other' }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('not_found');
  });

  it('queries with both id AND userId (IDOR prevention)', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindFirst.mockResolvedValueOnce({
      id: 'n1',
      readAt: null,
    });
    mockUpdate.mockResolvedValueOnce({
      id: 'n1',
      type: NotificationType.DIARIO,
      title: 'X',
      body: 'Y',
      href: null,
      readAt: new Date(),
      createdAt: new Date(),
    });

    await PATCH(makeRequest('n1'), {
      params: Promise.resolve({ id: 'n1' }),
    });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'user-1' },
      select: { id: true, readAt: true },
    });
  });

  it('410 when already read (idempotência)', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindFirst.mockResolvedValueOnce({
      id: 'n1',
      readAt: new Date('2026-06-24T08:00:00Z'),
    });

    const res = await PATCH(makeRequest('n1'), {
      params: Promise.resolve({ id: 'n1' }),
    });
    expect(res.status).toBe(410);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('200 with DTO when marking unread → read', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindFirst.mockResolvedValueOnce({
      id: 'n1',
      readAt: null,
    });
    mockUpdate.mockResolvedValueOnce({
      id: 'n1',
      type: NotificationType.MENTOR,
      title: 'Resposta',
      body: 'O Mentor disse...',
      href: '/pt-BR/oraculo',
      readAt: new Date('2026-06-24T10:00:00Z'),
      createdAt: new Date('2026-06-24T09:00:00Z'),
    });

    const res = await PATCH(makeRequest('n1'), {
      params: Promise.resolve({ id: 'n1' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.notification).toMatchObject({
      id: 'n1',
      type: 'MENTOR',
      readAt: '2026-06-24T10:00:00.000Z',
    });
  });
});

describe('DELETE /api/notifications/[id]', () => {
  it('401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
    const res = await DELETE(makeRequest('n1', 'DELETE'), {
      params: Promise.resolve({ id: 'n1' }),
    });
    expect(res.status).toBe(401);
  });

  it('204 on success', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockDeleteMany.mockResolvedValueOnce({ count: 1 });

    const res = await DELETE(makeRequest('n1', 'DELETE'), {
      params: Promise.resolve({ id: 'n1' }),
    });
    expect(res.status).toBe(204);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'user-1' },
    });
  });

  it('404 when nothing deleted (not found OR not yours)', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });

    const res = await DELETE(makeRequest('n-missing', 'DELETE'), {
      params: Promise.resolve({ id: 'n-missing' }),
    });
    expect(res.status).toBe(404);
  });
});
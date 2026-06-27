// ============================================================================
// useCommunityNotifications — hook de notificações da comunidade
// ============================================================================
// Cobre: polling, optimistic updates, filtros, error states.
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ============================================================================
// Mocks
// ============================================================================

const fetchMock = vi.fn();

global.fetch = fetchMock as unknown as typeof fetch;

// Mock Supabase para realtime
vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    }),
    removeChannel: () => Promise.resolve(),
  }),
}));

// ============================================================================
// Import AFTER mocks
// ============================================================================

const { useCommunityNotifications } = await import(
  '@/hooks/useCommunityNotifications'
);

// ============================================================================
// Reset
// ============================================================================

beforeEach(() => {
  fetchMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// ============================================================================
// Testes
// ============================================================================

describe('useCommunityNotifications — fetch', () => {
  it('faz fetch inicial automaticamente', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'n1',
            userId: 'user-1',
            type: 'LIKE',
            actorId: 'u2',
            actorSnapshot: null,
            entityType: 'POST',
            entityId: 'p1',
            postId: 'p1',
            commentId: null,
            groupId: null,
            articleId: null,
            groupKey: null,
            count: 1,
            payload: { preview: 'X curtiu', link: '/post/p1' },
            read: false,
            readAt: null,
            emailedAt: null,
            pushedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        nextCursor: null,
        unreadCount: 1,
      }),
    });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    expect(result.current.unreadCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/notifications'),
      expect.any(Object)
    );
  });

  it('trata 401 silenciosamente (clear list)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Não autenticado' }),
    });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('idle');
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('expõe error em falha genérica', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal' }),
    });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.connectionStatus).toBe('error');
  });

  it('passa query params de filtro', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: [], nextCursor: null, unreadCount: 0 }),
    });

    renderHook(() =>
      useCommunityNotifications({
        autoFetch: true,
        pollingInterval: 60_000,
        initialFilter: 'unread',
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('filter=unread');
  });
});

// ============================================================================
// markAsRead
// ============================================================================

describe('useCommunityNotifications — markAsRead', () => {
  it('faz update otimista + PATCH', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'n1',
              userId: 'user-1',
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
              count: 1,
              payload: null,
              read: false,
              readAt: null,
              emailedAt: null,
              pushedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
          unreadCount: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'n1', read: true, readAt: new Date().toISOString() }),
      });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    // Optimistic update: deve estar como lida
    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);

    // PATCH foi chamado
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const patchCall = fetchMock.mock.calls[1];
    expect(patchCall[0]).toContain('/api/notifications/n1/read');
    expect(patchCall[1].method).toBe('PATCH');
  });
});

// ============================================================================
// markAllAsRead
// ============================================================================

describe('useCommunityNotifications — markAllAsRead', () => {
  it('marca todas como lidas', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'n1',
              userId: 'user-1',
              type: 'LIKE',
              read: false,
              actorId: null,
              actorSnapshot: null,
              entityType: null,
              entityId: null,
              postId: null,
              commentId: null,
              groupId: null,
              articleId: null,
              groupKey: null,
              count: 1,
              payload: null,
              readAt: null,
              emailedAt: null,
              pushedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'n2',
              userId: 'user-1',
              type: 'COMMENT',
              read: false,
              actorId: null,
              actorSnapshot: null,
              entityType: null,
              entityId: null,
              postId: null,
              commentId: null,
              groupId: null,
              articleId: null,
              groupKey: null,
              count: 1,
              payload: null,
              readAt: null,
              emailedAt: null,
              pushedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
          unreadCount: 2,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: 2, remainingUnread: 0 }),
      });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it('suporta filtro por tipo', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [],
          nextCursor: null,
          unreadCount: 0,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: 1, remainingUnread: 0 }),
      });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.notifications).toBeDefined();
    });

    await act(async () => {
      await result.current.markAllAsRead('LIKE');
    });

    const patchCall = fetchMock.mock.calls[1];
    expect(patchCall[1].body).toContain('LIKE');
  });
});

// ============================================================================
// fetchMore (paginação)
// ============================================================================

describe('useCommunityNotifications — fetchMore', () => {
  it('anexa itens quando há nextCursor', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'n1',
              userId: 'user-1',
              type: 'LIKE',
              read: false,
              actorId: null,
              actorSnapshot: null,
              entityType: null,
              entityId: null,
              postId: null,
              commentId: null,
              groupId: null,
              articleId: null,
              groupKey: null,
              count: 1,
              payload: null,
              readAt: null,
              emailedAt: null,
              pushedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          nextCursor: 'cursor-1',
          unreadCount: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'n2',
              userId: 'user-1',
              type: 'COMMENT',
              read: false,
              actorId: null,
              actorSnapshot: null,
              entityType: null,
              entityId: null,
              postId: null,
              commentId: null,
              groupId: null,
              articleId: null,
              groupKey: null,
              count: 1,
              payload: null,
              readAt: null,
              emailedAt: null,
              pushedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
          unreadCount: 1,
        }),
      });

    const { result } = renderHook(() =>
      useCommunityNotifications({ autoFetch: true, pollingInterval: 60_000 })
    );

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.fetchMore();
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[1].id).toBe('n2');
  });
});

// ============================================================================
// onNewNotification callback
// ============================================================================

describe('useCommunityNotifications — onNewNotification', () => {
  it('dispara callback quando chega notificação nova no polling', async () => {
    const callback = vi.fn();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'n1',
            userId: 'user-1',
            type: 'LIKE',
            read: false,
            actorId: 'u2',
            actorSnapshot: null,
            entityType: 'POST',
            entityId: 'p1',
            postId: 'p1',
            commentId: null,
            groupId: null,
            articleId: null,
            groupKey: null,
            count: 1,
            payload: { preview: 'novo' },
            readAt: null,
            emailedAt: null,
            pushedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        nextCursor: null,
        unreadCount: 1,
      }),
    });

    renderHook(() =>
      useCommunityNotifications({
        autoFetch: true,
        pollingInterval: 60_000,
        onNewNotification: callback,
      })
    );

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'n1' })
      );
    });
  });
});

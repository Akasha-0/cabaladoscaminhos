// ============================================================================
// HOOKS — usePosts
// ============================================================================
// Testa o fetch + estado dos hooks com mocks de fetch global.
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import { useFeed, useCreatePost, useLikePost, useDeletePost } from '@/hooks/usePosts';

// ============================================================================
// fetch mock
// ============================================================================

function mockFetch(responses: Array<{ status: number; body: unknown }>) {
  let i = 0;
  global.fetch = vi.fn(async () => {
    const next = responses[i] ?? responses[responses.length - 1];
    i++;
    return new Response(JSON.stringify(next?.body ?? {}), {
      status: next?.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// useFeed
// ============================================================================

describe('useFeed', () => {
  it('carrega primeira página e popula posts', async () => {
    mockFetch([
      {
        status: 200,
        body: {
          data: {
            posts: [
              { id: 'p1', author: { id: 'u1' }, content: 'A', likesCount: 1, commentsCount: 0, sharesCount: 0, createdAt: new Date().toISOString() },
              { id: 'p2', author: { id: 'u2' }, content: 'B', likesCount: 0, commentsCount: 0, sharesCount: 0, createdAt: new Date().toISOString() },
            ],
            nextCursor: null,
            total: 2,
          },
          meta: { timestamp: new Date().toISOString() },
        },
      },
    ]);

    const { result } = renderHook(() => useFeed({ limit: 10 }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('expõe error quando fetch falha', async () => {
    mockFetch([
      { status: 500, body: { error: { code: 5000, message: 'Boom' } } },
    ]);

    const { result } = renderHook(() => useFeed());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Boom');
    expect(result.current.posts).toHaveLength(0);
  });

  it('faz loadMore quando há nextCursor', async () => {
    mockFetch([
      {
        status: 200,
        body: {
          data: { posts: [{ id: 'p1', author: { id: 'u1' }, content: 'A', likesCount: 0, commentsCount: 0, sharesCount: 0, createdAt: new Date().toISOString() }], nextCursor: 'cursor-2', total: 5 },
          meta: { timestamp: new Date().toISOString() },
        },
      },
      {
        status: 200,
        body: {
          data: { posts: [{ id: 'p2', author: { id: 'u2' }, content: 'B', likesCount: 0, commentsCount: 0, sharesCount: 0, createdAt: new Date().toISOString() }], nextCursor: null, total: 5 },
          meta: { timestamp: new Date().toISOString() },
        },
      },
    ]);

    const { result } = renderHook(() => useFeed({ limit: 1 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.posts).toHaveLength(1);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(2));
    expect(result.current.hasMore).toBe(false);
  });

  it('prependPost adiciona no topo', async () => {
    mockFetch([
      { status: 200, body: { data: { posts: [], nextCursor: null, total: 0 }, meta: { timestamp: new Date().toISOString() } } },
    ]);

    const { result } = renderHook(() => useFeed());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.prependPost({
        id: 'p-new',
        author: { id: 'u', handle: 'u', displayName: 'U' },
        content: 'novo',
        type: 'TEXT',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: new Date().toISOString(),
      });
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]?.id).toBe('p-new');
  });
});

// ============================================================================
// useLikePost
// ============================================================================

describe('useLikePost', () => {
  it('faz update otimista e mantém valor do servidor', async () => {
    mockFetch([
      { status: 200, body: { data: { posts: [{ id: 'p1', author: { id: 'u1' }, content: 'A', likesCount: 5, commentsCount: 0, sharesCount: 0, liked: false, createdAt: new Date().toISOString() }], nextCursor: null, total: 1 }, meta: { timestamp: new Date().toISOString() } } },
      { status: 200, body: { data: { liked: true, likesCount: 6 }, meta: { timestamp: new Date().toISOString() } } },
    ]);

    const { result, rerender } = renderHook(() => {
      const feed = useFeed({ limit: 5 });
      const like = useLikePost(feed);
      return { feed, like };
    });

    await waitFor(() => expect(result.current.feed.loading).toBe(false));
    expect(result.current.feed.posts[0]?.likesCount).toBe(5);

    await act(async () => {
      await result.current.like.toggleLike('p1');
    });

    // Após confirmação do servidor: liked=true, likesCount=6
    expect(result.current.feed.posts[0]?.liked).toBe(true);
    expect(result.current.feed.posts[0]?.likesCount).toBe(6);
    rerender();
  });

  it('rollback em caso de erro', async () => {
    mockFetch([
      { status: 200, body: { data: { posts: [{ id: 'p1', author: { id: 'u1' }, content: 'A', likesCount: 5, commentsCount: 0, sharesCount: 0, liked: false, createdAt: new Date().toISOString() }], nextCursor: null, total: 1 }, meta: { timestamp: new Date().toISOString() } } },
      { status: 500, body: { error: { code: 5000, message: 'erro' } } },
    ]);

    const { result } = renderHook(() => {
      const feed = useFeed();
      const like = useLikePost(feed);
      return { feed, like };
    });
    await waitFor(() => expect(result.current.feed.loading).toBe(false));

    await act(async () => {
      await result.current.like.toggleLike('p1');
    });

    // Volta para o estado original (rollback)
    expect(result.current.feed.posts[0]?.liked).toBe(false);
    expect(result.current.feed.posts[0]?.likesCount).toBe(5);
  });
});

// ============================================================================
// useCreatePost
// ============================================================================

describe('useCreatePost', () => {
  it('chama API e prepende no feed', async () => {
    mockFetch([
      // GET inicial vazio
      { status: 200, body: { data: { posts: [], nextCursor: null, total: 0 }, meta: { timestamp: new Date().toISOString() } } },
      // POST create
      {
        status: 201,
        body: {
          data: {
            id: 'p-new',
            author: { id: 'me', handle: 'me', displayName: 'Eu' },
            content: 'oi',
            type: 'TEXT',
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            createdAt: new Date().toISOString(),
          },
          meta: { timestamp: new Date().toISOString() },
        },
      },
    ]);

    const { result } = renderHook(() => {
      const feed = useFeed();
      const create = useCreatePost(feed);
      return { feed, create };
    });

    await waitFor(() => expect(result.current.feed.loading).toBe(false));

    let okResult: { ok: boolean; post?: unknown; error?: string } | undefined;
    await act(async () => {
      okResult = await result.current.create.createPost({ content: 'oi' });
    });

    expect(okResult?.ok).toBe(true);
    await waitFor(() => expect(result.current.feed.posts).toHaveLength(1));
    expect(result.current.feed.posts[0]?.id).toBe('p-new');
  });

  it('retorna error em caso de validação do servidor', async () => {
    mockFetch([
      { status: 200, body: { data: { posts: [], nextCursor: null, total: 0 }, meta: { timestamp: new Date().toISOString() } } },
      { status: 400, body: { error: { code: 4002, message: 'Dados inválidos' } } },
    ]);

    const { result } = renderHook(() => {
      const feed = useFeed();
      const create = useCreatePost(feed);
      return { feed, create };
    });
    await waitFor(() => expect(result.current.feed.loading).toBe(false));

    let out: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      out = await result.current.create.createPost({ content: '' });
    });

    expect(out?.ok).toBe(false);
    expect(out?.error).toBe('Dados inválidos');
  });
});

// ============================================================================
// useDeletePost
// ============================================================================

describe('useDeletePost', () => {
  it('remove post do feed em sucesso', async () => {
    mockFetch([
      // GET inicial com 2 posts
      {
        status: 200,
        body: {
          data: {
            posts: [
              { id: 'p1', author: { id: 'u1' }, content: 'A', likesCount: 0, commentsCount: 0, sharesCount: 0, createdAt: new Date().toISOString() },
              { id: 'p2', author: { id: 'u2' }, content: 'B', likesCount: 0, commentsCount: 0, sharesCount: 0, createdAt: new Date().toISOString() },
            ],
            nextCursor: null,
            total: 2,
          },
          meta: { timestamp: new Date().toISOString() },
        },
      },
      // DELETE
      { status: 200, body: { data: { deleted: true }, meta: { timestamp: new Date().toISOString() } } },
    ]);

    const { result } = renderHook(() => {
      const feed = useFeed();
      const del = useDeletePost(feed);
      return { feed, del };
    });
    await waitFor(() => expect(result.current.feed.loading).toBe(false));
    expect(result.current.feed.posts).toHaveLength(2);

    let out: { ok: boolean } | undefined;
    await act(async () => {
      out = await result.current.del.deletePost('p1');
    });
    expect(out?.ok).toBe(true);
    expect(result.current.feed.posts).toHaveLength(1);
    expect(result.current.feed.posts[0]?.id).toBe('p2');
  });
});
'use client';

// ============================================================================
// usePosts — Hooks do feed de posts (lista, criar, curtir, deletar)
// ============================================================================
// Estratégia: usa useState + useEffect (sem dependência externa de React
// Query / SWR). É o suficiente pro MVP e mantém bundle pequeno.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Post, ApiResponse, FeedPage, LikeResponse } from '@/types/community';
import type {
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
} from '@/lib/validators/posts';

// ============================================================================
// Internal fetcher with envelope unwrapping
// ============================================================================

async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok || !json || json.error) {
      return {
        ok: false,
        error: json?.error?.message ?? `Erro HTTP ${res.status}`,
        status: res.status,
      };
    }
    return { ok: true, data: json.data as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro de rede',
      status: 0,
    };
  }
}

// ============================================================================
// useFeed — listagem paginada do feed (cursor-based)
// ============================================================================

export interface UseFeedOptions {
  limit?: number;
  tradition?: string;
  topic?: string;
  groupSlug?: string;
  /** Filtro de alto nível: 'all' (default), 'para-voce' (recommendation engine), etc */
  filter?: 'all' | 'seguindo' | 'grupos' | 'tendencias' | 'para-voce';
  /** Dev user id — usado em sandbox/dev sem Supabase */
  devUserId?: string;
}

export interface UseFeedResult {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  /**
   * Atualização otimista local — substitui um post no array (ex: novo like,
   * novo comentário). Usado pelos hooks de mutação após success.
   */
  updatePost: (postId: string, partial: Partial<Post>) => void;
  prependPost: (post: Post) => void;
  removePost: (postId: string) => void;
}

export function useFeed(options: UseFeedOptions = {}): UseFeedResult {
  const { limit = 20, tradition, topic, groupSlug, filter, devUserId } = options;
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set('limit', String(limit));
    if (filter && filter !== 'all') sp.set('filter', filter);
    if (tradition) sp.set('tradition', tradition);
    if (topic) sp.set('topic', topic);
    if (groupSlug) sp.set('groupSlug', groupSlug);
    return sp.toString();
  }, [limit, tradition, topic, groupSlug, filter]);

  const fetchPage = useCallback(
    async (cursorValue: string | null, replace: boolean) => {
      const sp = new URLSearchParams(queryString);
      if (cursorValue) sp.set('cursor', cursorValue);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const url = `/api/posts?${sp.toString()}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (devUserId) headers['x-dev-user-id'] = devUserId;

      const result = await fetchJson<FeedPage>(url, {
        method: 'GET',
        headers,
        signal: ac.signal,
      });

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setError(null);
      setPosts((prev) => (replace ? result.data.posts : [...prev, ...result.data.posts]));
      setCursor(result.data.nextCursor);
      setHasMore(Boolean(result.data.nextCursor));
      setLoading(false);
      setLoadingMore(false);
    },
    [queryString, devUserId]
  );

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    fetchPage(null, true);
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchPage(null, true);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    await fetchPage(cursor, false);
  }, [fetchPage, hasMore, loadingMore, loading, cursor]);

  const updatePost = useCallback((postId: string, partial: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...partial } : p))
    );
  }, []);

  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    updatePost,
    prependPost,
    removePost,
  };
}

// ============================================================================
// useCreatePost — cria novo post (otimistic prepend + rollback)
// ============================================================================

export interface UseCreatePostResult {
  createPost: (input: CreatePostInput) => Promise<{ ok: boolean; post?: Post; error?: string }>;
  loading: boolean;
}

export function useCreatePost(
  feed?: Pick<UseFeedResult, 'prependPost'>
): UseCreatePostResult {
  const [loading, setLoading] = useState(false);

  const createPost = useCallback(
    async (input: CreatePostInput) => {
      setLoading(true);
      const result = await fetchJson<Post>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setLoading(false);

      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      feed?.prependPost(result.data);
      return { ok: true, post: result.data };
    },
    [feed]
  );

  return { createPost, loading };
}

// ============================================================================
// useLikePost — toggle like com atualização otimista
// ============================================================================

export interface UseLikePostResult {
  toggleLike: (postId: string) => Promise<void>;
}

export function useLikePost(
  feed?: Pick<UseFeedResult, 'posts' | 'updatePost'>
): UseLikePostResult {
  const toggleLike = useCallback(
    async (postId: string) => {
      if (!feed) return;
      const target = feed.posts.find((p) => p.id === postId);
      if (!target) return;

      const previousLiked = Boolean(target.liked);
      const previousCount = target.likesCount;

      // Optimistic update
      feed.updatePost(postId, {
        liked: !previousLiked,
        likesCount: previousLiked
          ? Math.max(0, previousCount - 1)
          : previousCount + 1,
      });

      const result = await fetchJson<LikeResponse>(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!result.ok) {
        // Rollback
        feed.updatePost(postId, {
          liked: previousLiked,
          likesCount: previousCount,
        });
        return;
      }

      // Confirma com o valor real do servidor
      feed.updatePost(postId, {
        liked: result.data.liked,
        likesCount: result.data.likesCount,
      });
    },
    [feed]
  );

  return { toggleLike };
}

// ============================================================================
// useDeletePost — soft delete com remoção otimista
// ============================================================================

export interface UseDeletePostResult {
  deletePost: (postId: string) => Promise<{ ok: boolean; error?: string }>;
  loading: boolean;
}

export function useDeletePost(
  feed?: Pick<UseFeedResult, 'removePost'>
): UseDeletePostResult {
  const [loading, setLoading] = useState(false);

  const deletePost = useCallback(
    async (postId: string) => {
      setLoading(true);
      const result = await fetchJson<{ deleted: boolean }>(
        `/api/posts/${postId}`,
        { method: 'DELETE' }
      );
      setLoading(false);

      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      feed?.removePost(postId);
      return { ok: true };
    },
    [feed]
  );

  return { deletePost, loading };
}

// ============================================================================
// useUpdatePost — PATCH parcial
// ============================================================================

export interface UseUpdatePostResult {
  updatePost: (
    postId: string,
    input: UpdatePostInput
  ) => Promise<{ ok: boolean; post?: Post; error?: string }>;
  loading: boolean;
}

export function useUpdatePost(
  feed?: Pick<UseFeedResult, 'updatePost'>
): UseUpdatePostResult {
  const [loading, setLoading] = useState(false);

  const updatePost = useCallback(
    async (postId: string, input: UpdatePostInput) => {
      setLoading(true);
      const result = await fetchJson<Post>(`/api/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      setLoading(false);

      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      feed?.updatePost(postId, result.data);
      return { ok: true, post: result.data };
    },
    [feed]
  );

  return { updatePost, loading };
}

// ============================================================================
// useComments — lista paginada de comentários de um post
// ============================================================================

import type { Comment } from '@/types/community';

export interface UseCommentsResult {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
  prepend: (comment: Comment) => void;
}

export function useComments(postId: string): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (cursorValue: string | null, replace: boolean) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const sp = new URLSearchParams({ limit: '20' });
      if (cursorValue) sp.set('cursor', cursorValue);

      const url = `/api/posts/${postId}/comments?${sp.toString()}`;
      const result = await fetchJson<{ comments: Comment[]; nextCursor: string | null }>(
        url,
        { method: 'GET', signal: ac.signal }
      );

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setError(null);
      setComments((prev) => (replace ? result.data.comments : [...prev, ...result.data.comments]));
      setCursor(result.data.nextCursor);
      setHasMore(Boolean(result.data.nextCursor));
      setLoading(false);
      setLoadingMore(false);
    },
    [postId]
  );

  useEffect(() => {
    setLoading(true);
    fetchPage(null, true);
    return () => abortRef.current?.abort();
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    await fetchPage(cursor, false);
  }, [fetchPage, cursor, hasMore, loading, loadingMore]);

  const prepend = useCallback((comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  }, []);

  return { comments, loading, loadingMore, error, hasMore, loadMore, prepend };
}
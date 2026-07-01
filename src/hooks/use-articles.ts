// ============================================================================
// useArticles — Hook para listagem + filtros da Biblioteca Akasha (Wave 29)
// ============================================================================
// Wrapper sobre fetch('/api/articles') com cache SWR-style (sem lib extra).
// Suporta: search, tradition, evidenceLevel, type, sort, cursor pagination.
// ============================================================================

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// ============================================================================
// Types — espelham o DTO de /api/articles
// ============================================================================

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  authors: string[];
  journal: string | null;
  year: number;
  doi: string | null;
  url: string | null;
  tags: string[];
  tradition: string | null;
  evidenceLevel: string;
  type: string;
  language: string;
  citations: number;
  viewCount: number;
  bookmarkCount: number;
  likesCount: number;
  publishedAt: string | null;
  createdAt: string;
  readingTimeMinutes: number;
}

export type ArticleSort =
  | 'recent'
  | 'popular'
  | 'most-viewed'
  | 'most-bookmarked'
  | 'most-cited';

export interface ArticleFilters {
  q?: string;
  tradition?: string;
  tag?: string;
  level?: 'ANECDOTAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  format?:
    | 'SCIENTIFIC_PAPER'
    | 'MAGAZINE_ARTICLE'
    | 'BOOK'
    | 'VIDEO'
    | 'PODCAST'
    | 'ESSAY';
  author?: string;
  yearFrom?: number;
  yearTo?: number;
  sort?: ArticleSort;
}

export interface UseArticlesResult {
  articles: ArticleListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

const DEFAULT_LIMIT = 20;
const API_PATH = '/api/articles';

export function useArticles(filters: ArticleFilters): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Serialize filters para detectar mudança
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const buildUrl = useCallback(
    (cursorOverride: string | null) => {
      const sp = new URLSearchParams();
      if (filters.q) sp.set('q', filters.q);
      if (filters.tradition) sp.set('tradition', filters.tradition);
      if (filters.tag) sp.set('tag', filters.tag);
      if (filters.level) sp.set('level', filters.level);
      if (filters.format) sp.set('format', filters.format);
      if (filters.author) sp.set('author', filters.author);
      if (filters.yearFrom !== undefined)
        sp.set('yearFrom', String(filters.yearFrom));
      if (filters.yearTo !== undefined)
        sp.set('yearTo', String(filters.yearTo));
      if (filters.sort) sp.set('sort', filters.sort);
      if (cursorOverride) sp.set('cursor', cursorOverride);
      sp.set('limit', String(DEFAULT_LIMIT));
      return `${API_PATH}?${sp.toString()}`;
    },
    [filters]
  );

  const fetchPage = useCallback(
    async (
      cursorOverride: string | null,
      append: boolean
    ): Promise<{ nextCursor: string | null; totalFetched: number }> => {
      const url = buildUrl(cursorOverride);
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao buscar artigos`);
      }
      const json = (await res.json()) as {
        data: {
          articles: ArticleListItem[];
          nextCursor: string | null;
          total: number;
        };
      };
      const next = json.data.articles;
      const nextCursor = json.data.nextCursor;
      const totalFetched = json.data.total;

      if (append) {
        setArticles((prev) => [...prev, ...next]);
      } else {
        setArticles(next);
      }
      setTotal(totalFetched);
      setCursor(nextCursor);
      setHasMore(nextCursor !== null);
      return { nextCursor, totalFetched };
    },
    [buildUrl]
  );

  // Initial / filter-change load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPage(null, false)
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setArticles([]);
        setTotal(0);
        setCursor(null);
        setHasMore(false);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursor) return;
    setLoading(true);
    try {
      await fetchPage(cursor, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mais');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, cursor, fetchPage]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchPage(null, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recarregar');
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  return {
    articles,
    total,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// ============================================================================
// useArticle — detalhe
// ============================================================================

export interface ArticleDetail extends ArticleListItem {
  content: string;
  references: unknown;
  topics: string[];
  contributor: string | null;
  curatedBy: string | null;
  source: string | null;
  updatedAt: string;
  relatedArticles: ArticleListItem[];
}

export interface UseArticleDetailResult {
  article: ArticleDetail | null;
  loading: boolean;
  error: string | null;
}

export function useArticleDetail(slug: string | null): UseArticleDetailResult {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/articles/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Artigo não encontrado' : `Erro ${res.status}`);
        }
        const json = (await res.json()) as { data: ArticleDetail };
        if (!cancelled) setArticle(json.data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setArticle(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { article, loading, error };
}

// ============================================================================
// useFeaturedArticles — destaque para home/library header
// ============================================================================

export interface FeaturedArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: string;
  evidenceLevel: string;
  tradition: string | null;
  tags: string[];
  authors: string[];
  year: number;
  viewCount: number;
  bookmarkCount: number;
  citations: number;
  featuredReason: 'evidence' | 'trending' | 'editorial';
}

export interface UseFeaturedArticlesResult {
  articles: FeaturedArticle[];
  loading: boolean;
  error: string | null;
}

export function useFeaturedArticles(limit = 6): UseFeaturedArticlesResult {
  const [articles, setArticles] = useState<FeaturedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/articles/featured?limit=${limit}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}`);
        }
        const json = (await res.json()) as {
          data: { articles: FeaturedArticle[] };
        };
        if (!cancelled) setArticles(json.data.articles ?? []);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { articles, loading, error };
}

// ============================================================================
// useArticleBookmark — toggle bookmark do artigo
// ============================================================================

export interface UseArticleBookmarkResult {
  bookmarked: boolean;
  loading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
}

export function useArticleBookmark(
  slug: string,
  initialBookmarked = false
): UseArticleBookmarkResult {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}/bookmark`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Faça login para salvar artigos'
            : `Erro ${res.status}`
        );
      }
      const json = (await res.json()) as {
        data: { bookmarked: boolean };
      };
      setBookmarked(json.data.bookmarked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  return { bookmarked, loading, error, toggle };
}
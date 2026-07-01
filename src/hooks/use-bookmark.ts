// ============================================================================
// useBookmark — Toggle de bookmark com optimistic update + toast (Wave 29)
// ============================================================================
// Hook client-side que faz POST /api/articles/[slug]/bookmark e atualiza o
// estado local de forma otimista. Em caso de erro, reverte.
//
// Toast: feedback simples com aria-live. Sem lib externa — usa element.
// ============================================================================

'use client';

import { useCallback, useState } from 'react';

export interface UseBookmarkResult {
  /** true se está marcado como salvo pelo usuário atual */
  isBookmarked: boolean;
  /** toggle em andamento */
  loading: boolean;
  /** erro da última tentativa (revertido) */
  error: string | null;
  /** feedback UI mais recente */
  toast: { kind: 'success' | 'error'; message: string } | null;
  /** ação principal */
  toggle: () => Promise<void>;
}

const TOAST_TIMEOUT_MS = 2_500;

/**
 * Hook de bookmark. Recebe o estado inicial (vindo da API) e expõe toggle.
 */
export function useBookmark(slug: string, initial = false): UseBookmarkResult {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<UseBookmarkResult['toast']>(null);

  const showToast = useCallback((t: UseBookmarkResult['toast']) => {
    setToast(t);
    setTimeout(() => setToast(null), TOAST_TIMEOUT_MS);
  }, []);

  const toggle = useCallback(async () => {
    if (loading) return;
    const previous = isBookmarked;
    const next = !previous;

    // Optimistic update
    setIsBookmarked(next);
    setLoading(true);
    setError(null);

    try {
      // POST é toggle no backend (idempotente).
      const res = await fetch(
        `/api/articles/${encodeURIComponent(slug)}/bookmark`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      }

      showToast({
        kind: 'success',
        message: next ? 'Artigo salvo nos favoritos' : 'Removido dos favoritos',
      });
    } catch (err: unknown) {
      // Reverte optimistic update
      setIsBookmarked(previous);
      const msg = err instanceof Error ? err.message : 'Falha ao salvar';
      setError(msg);
      showToast({ kind: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [slug, isBookmarked, loading, showToast]);

  return { isBookmarked, loading, error, toast, toggle };
}

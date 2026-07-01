/**
 * hooks/use-recovery — client-side error recovery hooks (Wave 36)
 * ============================================================================
 * Thin React wrappers around `@/lib/errors/recovery`:
 *
 *   - useRecoveryPlan(status)      → { strategy, retryable, redirectTo, toastSeverity }
 *   - useRetryFetch()              → fetch with auto-retry + exponential backoff
 *   - useRecoveryToast(status)     → user-facing toast descriptor (pt-BR)
 *
 * SSR-safe: each hook degrades to safe defaults when window/navigator is
 * undefined. Tested via Vitest when present (no tests in this wave).
 * ============================================================================
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  classify,
  getStrategy,
  planFor,
  isOnline,
  onConnectivityChange,
  retryFetch,
  fetchWithRecovery,
  type RecoveryClass,
  type RecoveryPlan,
  type RecoveryStrategy,
  type RetryOptions,
} from '@/lib/errors/recovery';

// ---------------------------------------------------------------------------
// useRecoveryPlan
// ---------------------------------------------------------------------------

export function useRecoveryPlan(status: number | null): RecoveryPlan {
  return useMemo(() => planFor(status), [status]);
}

export function useRecoveryClass(status: number | null): RecoveryClass {
  return useMemo(() => classify(status), [status]);
}

export function useRecoveryStrategy(status: number | null): RecoveryStrategy {
  return useMemo(() => getStrategy(classify(status)), [status]);
}

// ---------------------------------------------------------------------------
// useRetryFetch — fetch wrapper with auto-retry
// ---------------------------------------------------------------------------

export interface UseRetryFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
  plan: RecoveryPlan;
  retry: () => void;
  reset: () => void;
}

export function useRetryFetch<T = unknown>(
  url: string | null,
  init: RequestInit = {},
  opts: RetryOptions = {},
): UseRetryFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(url !== null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    if (!url) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    const result = await fetchWithRecovery(url, { ...init, signal: ctrl.signal }, opts);
    setStatus(result.status);
    if (result.ok && result.res) {
      try {
        const body = (await result.res.json()) as T;
        setData(body);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'invalid response body');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [url, init, opts]);

  useEffect(() => {
    void run();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick]);

  const plan = useMemo(() => planFor(status), [status]);

  return {
    data,
    loading,
    error,
    status,
    plan,
    retry: () => setTick((t) => t + 1),
    reset: () => {
      setData(null);
      setError(null);
      setStatus(null);
    },
  };
}

// ---------------------------------------------------------------------------
// useOnlineStatus — wrapper for offline detection
// ---------------------------------------------------------------------------

export interface UseOnlineStatusResult {
  online: boolean;
  /** True if the app should show a "you're offline" banner. */
  showOfflineBanner: boolean;
}

export function useOnlineStatus(): UseOnlineStatusResult {
  const [online, setOnline] = useState<boolean>(isOnline());
  useEffect(() => {
    return onConnectivityChange((next) => setOnline(next));
  }, []);
  return { online, showOfflineBanner: !online };
}

// ---------------------------------------------------------------------------
// useRecoveryToast — turn a status code into a toast descriptor
// ---------------------------------------------------------------------------

export interface ToastDescriptor {
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  /** Show for X ms. */
  durationMs: number;
}

export function useRecoveryToast(status: number | null): ToastDescriptor | null {
  return useMemo<ToastDescriptor | null>(() => {
    if (status === null) return null;
    if (status >= 200 && status < 300) return null;
    const plan = planFor(status);
    return {
      message: plan.strategy.userMessage,
      severity: plan.toastSeverity,
      durationMs: 4000,
    };
  }, [status]);
}

// ---------------------------------------------------------------------------
// Re-export for callers that want raw utilities.
// ---------------------------------------------------------------------------

export { retryFetch, fetchWithRecovery, planFor, classify, isOnline };
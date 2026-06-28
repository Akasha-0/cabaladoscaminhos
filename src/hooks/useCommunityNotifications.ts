'use client';

// ============================================================================
// useCommunityNotifications — hook para notificações da comunidade
// ============================================================================
// Camada de cliente para o novo sistema de notificações (in-app + email + push).
// Faz polling a cada 30s (configurável) e expõe ações de mark-as-read.
// Realtime via Supabase é opcional (use `enableRealtime: true`).
//
// Nota: o hook `useNotifications.ts` original é para toasts efêmeros da UI
// e continua intacto — este hook é específico para notificações persistentes
// da comunidade (likes, comments, follows, mentions, group invites, etc).
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  NotificationDto,
  PaginatedNotifications,
} from '@/lib/notifications';

// ============================================================================
// Tipos
// ============================================================================

export type ConnectionStatus =
  | 'idle'
  | 'fetching'
  | 'connected'
  | 'error';

export interface UseCommunityNotificationsOptions {
  /** Intervalo de polling em ms (default: 30000) */
  pollingInterval?: number;
  /** Habilita Supabase Realtime (default: false; polling é fallback confiável) */
  enableRealtime?: boolean;
  /** Filtro inicial */
  initialFilter?: 'all' | 'unread' | 'read';
  /** Tipo inicial (opcional) */
  initialType?: string;
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Callback ao receber nova notif */
  onNewNotification?: (n: NotificationDto) => void;
}

export interface UseCommunityNotificationsResult {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  // Actions
  fetch: (opts?: { cursor?: string | null; append?: boolean }) => Promise<void>;
  fetchMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (type?: string) => Promise<void>;
  refresh: () => Promise<void>;
  // Realtime state
  isRealtimeActive: boolean;
}

// ============================================================================
// Constantes
// ============================================================================

const DEFAULT_POLLING_INTERVAL = 30_000;
const API_BASE = '/api/notifications';

// ============================================================================
// Hook
// ============================================================================

export function useCommunityNotifications(
  options: UseCommunityNotificationsOptions = {}
): UseCommunityNotificationsResult {
  const {
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    enableRealtime = false,
    initialFilter = 'all',
    initialType,
    autoFetch = true,
    onNewNotification,
  } = options;

  // ============================================================================
  // State
  // ============================================================================

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('idle');
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  const filterRef = useRef(initialFilter);
  const typeRef = useRef(initialType);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeChannelRef = useRef<unknown>(null);
  // Callback ref para evitar re-running de effects quando onNewNotification muda
  // (sem isso, polling seria destruído e recriado a cada render do parent)
  const callbackRef = useRef(onNewNotification);
  // Atualiza em effect (não em render) para satisfazer react-hooks/refs
  useEffect(() => {
    callbackRef.current = onNewNotification;
  }, [onNewNotification]);

  // ============================================================================
  // Fetch helpers
  // ============================================================================

  const buildQueryString = useCallback(
    (cursorValue: string | null, limit = 20): string => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (cursorValue) params.set('cursor', cursorValue);
      if (filterRef.current !== 'all')
        params.set('filter', filterRef.current);
      if (typeRef.current) params.set('type', typeRef.current);
      return params.toString();
    },
    []
  );

  const fetchPage = useCallback(
    async (cursorValue: string | null, append: boolean): Promise<void> => {
      setIsLoading(true);
      setConnectionStatus('fetching');
      try {
        const qs = buildQueryString(cursorValue);
        const res = await fetch(`${API_BASE}?${qs}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          if (res.status === 401) {
            // Não autenticado — silenciar (UI deve mostrar empty state)
            setError(null);
            setNotifications([]);
            setUnreadCount(0);
            setConnectionStatus('idle');
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as PaginatedNotifications;
        setUnreadCount(data.unreadCount);

        // Detecta novas (id nunca visto) para callback onNewNotification
        if (append === false) {
          // Substituição completa — não dispara onNewNotification (refresh manual)
        } else if (cursorValue === null) {
          // Refresh — dispara onNewNotification pra ids novos
          for (const n of data.items) {
            if (!knownIdsRef.current.has(n.id)) {
              knownIdsRef.current.add(n.id);
              callbackRef.current?.(n);
            }
          }
        }

        if (append && cursorValue) {
          setNotifications((prev) => [...prev, ...data.items]);
        } else {
          // Reset — popula knownIds sem disparar callback em massa
          for (const n of data.items) knownIdsRef.current.add(n.id);
          setNotifications(data.items);
        }

        setCursor(data.nextCursor);
        setError(null);
        setConnectionStatus('connected');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'fetch failed');
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryString]
  );

  // ============================================================================
  // Public actions
  // ============================================================================

  const fetchFn = useCallback(
    async (opts: { cursor?: string | null; append?: boolean } = {}) => {
      const c = opts.cursor ?? null;
      const append = opts.append ?? false;
      await fetchPage(c, append);
    },
    [fetchPage]
  );

  const fetchMore = useCallback(async () => {
    if (!cursor) return;
    await fetchPage(cursor, true);
  }, [cursor, fetchPage]);

  const refresh = useCallback(async () => {
    knownIdsRef.current.clear();
    await fetchPage(null, false);
  }, [fetchPage]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.read
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('[useCommunityNotifications] markAsRead failed', err);
      // Reverte optimistic em caso de erro
      // (best-effort — não bloqueia UX)
    }
  }, []);

  const markAllAsRead = useCallback(
    async (type?: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.read || (type && n.type !== type)
            ? n
            : { ...n, read: true, readAt: new Date().toISOString() }
        )
      );
      setUnreadCount(0);

      try {
        const res = await fetch(`${API_BASE}/read-all`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(type ? { type } : {}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        console.error('[useCommunityNotifications] markAllAsRead failed', err);
      }
    },
    []
  );

  // ============================================================================
  // Effects
  // ============================================================================

  // Polling
  useEffect(() => {
    if (!autoFetch) return;

    // Initial fetch
    void fetchPage(null, false);

    // Set up polling
    pollIntervalRef.current = setInterval(() => {
      void fetchPage(null, false);
    }, pollingInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [autoFetch, pollingInterval, fetchPage]);

  // Realtime (opcional) — Supabase Realtime
  useEffect(() => {
    if (!enableRealtime) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        const channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            (payload) => {
              if (cancelled) return;
              const row = payload.new as Record<string, unknown>;
              if (!row || row.userId !== getCurrentUserId()) return;
              const dto: NotificationDto = mapRowToDto(row);
              setNotifications((prev) =>
                prev.some((n) => n.id === dto.id) ? prev : [dto, ...prev]
              );
              setUnreadCount((c) => c + 1);
              knownIdsRef.current.add(dto.id);
              callbackRef.current?.(dto);
            }
          )
          .subscribe();

        realtimeChannelRef.current = channel;
        setIsRealtimeActive(true);

        cleanup = () => {
          void supabase.removeChannel(channel);
          setIsRealtimeActive(false);
        };
      } catch (err) {
        console.warn(
          '[useCommunityNotifications] realtime unavailable, polling only',
          err
        );
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
     
  }, [enableRealtime]);

  // ============================================================================
  // Memoized result
  // ============================================================================

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      connectionStatus,
      fetch: fetchFn,
      fetchMore,
      markAsRead,
      markAllAsRead,
      refresh,
      isRealtimeActive,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      connectionStatus,
      fetchFn,
      fetchMore,
      markAsRead,
      markAllAsRead,
      refresh,
      isRealtimeActive,
    ]
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  // Tenta pegar do sessionStorage (setado pelo app após login)
  try {
    return window.sessionStorage.getItem('userId');
  } catch {
    return null;
  }
}

function mapRowToDto(row: Record<string, unknown>): NotificationDto {
  return {
    id: String(row.id ?? ''),
    userId: String(row.userId ?? ''),
    type: row.type as NotificationDto['type'],
    actorId: (row.actorId as string | null) ?? null,
    actorSnapshot: (row.actorSnapshot as NotificationDto['actorSnapshot']) ?? null,
    entityType: (row.entityType as NotificationDto['entityType']) ?? null,
    entityId: (row.entityId as string | null) ?? null,
    postId: (row.postId as string | null) ?? null,
    commentId: (row.commentId as string | null) ?? null,
    groupId: (row.groupId as string | null) ?? null,
    articleId: (row.articleId as string | null) ?? null,
    groupKey: (row.groupKey as string | null) ?? null,
    count: (row.count as number) ?? 1,
    payload: (row.payload as NotificationDto['payload']) ?? null,
    read: Boolean(row.read),
    readAt: (row.readAt as string | null) ?? null,
    emailedAt: (row.emailedAt as string | null) ?? null,
    pushedAt: (row.pushedAt as string | null) ?? null,
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString()),
  };
}

'use client';

/**
 * BackgroundSyncIndicator — feedback visual para mutations offline.
 * ----------------------------------------------------------------------------
 * Mostra:
 *   - "3 items pendentes" quando há mutations no queue (offline)
 *   - "Sincronizando..." durante flush
 *   - "✓ 3 items sincronizados" após sucesso
 *   - "1 falha: ..." se alguma falhou
 *
 * Posiciona no canto inferior-esquerdo (acima do InstallPrompt).
 * Auto-hide após 5s em caso de sucesso.
 *
 * Compatibilidade: SSR-safe.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Loader2, CloudOff } from 'lucide-react';
import { useSyncListener, registerSyncHandlers } from '@/lib/pwa/sync-handler';
import { countPending, pendingByIntent, flushQueue, registerBackgroundSync } from '@/lib/pwa/sync-queue';
import type { SyncIntent } from '@/lib/pwa/sync-queue';

type SyncState =
  | { kind: 'idle' }
  | { kind: 'pending'; count: number; byIntent: Record<string, number> }
  | { kind: 'syncing'; count: number }
  | { kind: 'success'; synced: number; total: number; failures: number }
  | { kind: 'error'; message: string };

const INTENT_LABELS: Record<SyncIntent, string> = {
  like: 'curtidas',
  comment: 'comentários',
  post: 'posts',
  bookmark: 'salvos',
  follow: 'seguindo',
};

const HIDE_AFTER_MS = 5000;

export interface BackgroundSyncIndicatorProps {
  className?: string;
  /** Hide completely (for pages where it would be visual noise) */
  hidden?: boolean;
}

export function BackgroundSyncIndicator({
  className,
  hidden = false,
}: BackgroundSyncIndicatorProps) {
  const [state, setState] = useState<SyncState>({ kind: 'idle' });
  const [isOnline, setIsOnline] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // Refresh pending — usado no mount + polling (declarado antes)
  // ============================================================
  const refreshPending = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const [count, byIntent] = await Promise.all([
        countPending(),
        pendingByIntent(),
      ]);
      if (count > 0) {
        setState({ kind: 'pending', count, byIntent });
      } else if (state.kind === 'pending') {
        setState({ kind: 'idle' });
      }
    } catch {
      /* IndexedDB não disponível — fica idle */
    }
  }, [state.kind]);

  // ============================================================
  // Mount: registrar handlers + status inicial
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanup = registerSyncHandlers();

    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Refresh pending count
    refreshPending();
    const poll = setInterval(refreshPending, 5000);

    return () => {
      cleanup();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(poll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [refreshPending]);

  // ============================================================
  // Listener: SYNC_COMPLETE vindo do SW
  // ============================================================
  useSyncListener(
    useCallback((event) => {
      if (event.synced === 0 && event.total === 0) {
        setState({ kind: 'idle' });
        return;
      }
      const failures = event.failures?.length ?? 0;
      if (event.synced > 0) {
        setState({
          kind: 'success',
          synced: event.synced,
          total: event.total,
          failures,
        });
      } else if (failures > 0) {
        setState({
          kind: 'error',
          message: `${failures} ${failures === 1 ? 'item falhou' : 'items falharam'}`,
        });
      }
      // Auto-hide após 5s
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setState((s) => (s.kind === 'success' || s.kind === 'error' ? { kind: 'idle' } : s));
      }, HIDE_AFTER_MS);
    }, [])
  );

  // ============================================================
  // Handlers
  // ============================================================
  const handleRetry = useCallback(async () => {
    setState({ kind: 'syncing', count: 0 });
    try {
      const registered = await registerBackgroundSync();
      if (!registered) {
        // Fallback: flush direto
        const result = await flushQueue();
        setState({
          kind: 'success',
          synced: result.synced,
          total: result.synced + result.failed,
          failures: result.failed,
        });
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(
          () => setState({ kind: 'idle' }),
          HIDE_AFTER_MS
        );
      }
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Falha ao sincronizar',
      });
    }
  }, []);

  if (hidden) return null;
  if (state.kind === 'idle') return null;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed left-4 bottom-20 md:bottom-4 z-30 max-w-[calc(100vw-2rem)] ${className ?? ''}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="rounded-xl border bg-[var(--card)] shadow-lg backdrop-blur-sm px-4 py-3 min-w-[260px] max-w-sm">
        {state.kind === 'pending' && (
          <PendingView count={state.count} byIntent={state.byIntent} isOnline={isOnline} onRetry={handleRetry} />
        )}
        {state.kind === 'syncing' && <SyncingView />}
        {state.kind === 'success' && <SuccessView synced={state.synced} total={state.total} failures={state.failures} />}
        {state.kind === 'error' && <ErrorView message={state.message} />}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEWS
// ============================================================================

function PendingView({
  count,
  byIntent,
  isOnline,
  onRetry,
}: {
  count: number;
  byIntent: Record<string, number>;
  isOnline: boolean;
  onRetry: () => void;
}) {
  const breakdown = Object.entries(byIntent)
    .filter(([, n]) => n > 0)
    .slice(0, 2)
    .map(([intent, n]) => `${n} ${INTENT_LABELS[intent as SyncIntent] ?? intent}`)
    .join(', ');

  return (
    <div className="flex items-start gap-3">
      <CloudOff className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {count} {count === 1 ? 'item pendente' : 'itens pendentes'}
        </p>
        {breakdown && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{breakdown}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {isOnline ? 'Sincronizando...' : 'Aguardando conexão'}
        </p>
        {isOnline && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs text-[var(--spiritual-gold)] font-medium mt-1 hover:underline min-h-[32px]"
          >
            Tentar agora
          </button>
        )}
      </div>
    </div>
  );
}

function SyncingView() {
  return (
    <div className="flex items-center gap-3">
      <Loader2 className="w-5 h-5 text-[var(--spiritual-gold)] animate-spin" aria-hidden="true" />
      <p className="text-sm font-medium">Sincronizando...</p>
    </div>
  );
}

function SuccessView({ synced, total, failures }: { synced: number; total: number; failures: number }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          ✓ {synced} {synced === 1 ? 'sincronizado' : 'sincronizados'}
        </p>
        {failures > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            {failures} {failures === 1 ? 'falhou' : 'falharam'}
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default BackgroundSyncIndicator;

'use client';

/**
 * OfflinePageClient — versão interativa do /offline.
 * ----------------------------------------------------------------------------
 * - Mostra últimos items do cache (se houver)
 * - Botão "tentar de novo" → window.location.reload()
 * - Escuta 'online' event para auto-retry
 * - Safe-area-inset
 * - prefers-reduced-motion
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CloudOff, RefreshCw, Home, Wifi, Inbox } from 'lucide-react';

interface CachedItem {
  title: string;
  url: string;
}

const KNOWN_CACHED_ROUTES = [
  { url: '/feed', title: 'Feed da comunidade' },
  { url: '/dashboard', title: 'Dashboard pessoal' },
  { url: '/calendario', title: 'Calendário energético' },
  { url: '/chat', title: 'Chat com a curadora' },
];

export function OfflinePageClient() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [cachedItems, setCachedItems] = useState<CachedItem[]>([]);

  // ============================================================
  // Check cache (declarado antes do effect que o consome)
  // ============================================================
  const checkCachedRoutes = useCallback(async (): Promise<CachedItem[]> => {
    if (typeof window === 'undefined' || !('caches' in window)) return [];
    const out: CachedItem[] = [];
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (!name.includes('static') && !name.includes('runtime')) continue;
        const cache = await caches.open(name);
        for (const route of KNOWN_CACHED_ROUTES) {
          const match = await cache.match(route.url);
          if (match) {
            out.push({ url: route.url, title: route.title });
          }
        }
      }
    } catch {
      /* silencioso */
    }
    return out;
  }, []);

  // ============================================================
  // Detecta online + lista routes cached
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const onOnline = () => {
      setIsOnline(true);
      // Auto-retry quando volta online
      setTimeout(() => window.location.reload(), 500);
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Verifica quais routes estão no cache
    checkCachedRoutes().then(setCachedItems);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [checkCachedRoutes]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    // Pequeno delay pra mostrar o spinner
    setTimeout(() => window.location.reload(), 600);
  }, []);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      style={{
        paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
      }}
      role="main"
    >
      <a href="#offline-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded">
        Pular para conteúdo
      </a>
      <div id="offline-main" className="max-w-md w-full">
        {/* Ícone */}
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--spiritual-gold)] to-purple-600 flex items-center justify-center shadow-2xl motion-safe:animate-pulse"
          aria-hidden="true"
        >
          <CloudOff className="w-12 h-12 text-black" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-[var(--spiritual-gold)] via-amber-300 to-purple-400 bg-clip-text text-transparent mb-3">
          Você está offline
        </h1>
        <p className="text-base text-slate-300 leading-relaxed mb-8">
          A conexão com a internet foi perdida. Verifique sua rede e tente novamente —
          suas práticas continuam acessíveis offline.
        </p>

        {/* Status badge */}
        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          {isOnline ? 'Conexão detectada — recarregando...' : 'Sem conexão'}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="min-h-[52px] rounded-xl bg-gradient-to-r from-[var(--spiritual-gold)] to-amber-500 text-black font-semibold text-base hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRetrying ? 'motion-safe:animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isRetrying ? 'Reconectando...' : 'Tentar reconectar'}
          </button>
          <Link
            href="/"
            className="min-h-[52px] rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 font-medium text-base hover:bg-slate-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            Voltar ao início
          </Link>
        </div>

        {/* Cached items */}
        {cachedItems.length > 0 && (
          <section
            className="mt-10 pt-8 border-t border-slate-800"
            aria-labelledby="cached-heading"
          >
            <h2
              id="cached-heading"
              className="text-sm font-semibold text-slate-300 mb-4 flex items-center justify-center gap-2"
            >
              <Inbox className="w-4 h-4" aria-hidden="true" />
              Disponível offline
            </h2>
            <ul className="space-y-2 text-left">
              {cachedItems.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    className="block min-h-[48px] px-4 py-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-[var(--spiritual-gold)]/40 hover:bg-slate-900 transition"
                  >
                    <span className="text-sm font-medium text-slate-100">{item.title}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{item.url}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tip */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
          <span>As páginas acima foram visitadas antes e estão salvas no dispositivo.</span>
        </div>
      </div>
    </main>
  );
}

export default OfflinePageClient;

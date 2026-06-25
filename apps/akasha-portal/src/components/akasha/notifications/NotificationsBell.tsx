'use client';

/**
 * NotificationsBell — D-046 (Wave 13.3) + SSE push (Wave 18.1).
 *
 * Visual:
 *   - Botão circular 40x40 com ícone Bell (lucide-react).
 *   - Badge vermelho canto superior direito: número de não-lidas (9+ se ≥10).
 *   - Dropdown 360px abre ao clicar (toggle). Fecha ao:
 *       • clicar fora (click outside listener)
 *       • clicar num item (Link → href navega)
 *       • pressionar Escape
 *   - Lista mostra últimas 5 (mistas lidas + não-lidas, com dot indicator
 *     à esquerda do item não-lido).
 *   - "Marcar todas como lidas" no footer do dropdown (PATCH bulk).
 *   - Estado vazio: ícone + texto i18n.
 *
 * Real-time updates (Wave 18.1):
 *   - Conecta em /api/notifications/stream via EventSource (SSE).
 *   - Servidor emite `event: snapshot` na conexão inicial → hidrata o state.
 *   - Servidor emite `data: {...}\nid: <id>` quando nova notificação chega
 *     → atualiza badge + prepend na lista.
 *   - Suporta reconexão automática do browser (Last-Event-ID header
 *     é reenviado automaticamente pelo EventSource).
 *
 * Fallback polling:
 *   - Se SSE falhar 3× consecutivas (ex: proxy corporativo que mata
 *     streaming), cai automaticamente para polling 30s.
 *   - Polling também roda como safety net quando document.hidden.
 *
 * Por que SSE + polling (não SSE puro):
 *   - Algumas redes (corp firewalls, school networks) matam conexões
 *     longas. Manter o polling como fallback = UX consistente.
 *   - Polling também serve como "freshness check" mesmo quando o SSE
 *     está conectado (defense in depth contra drift de estado).
 *
 * Por que dropdown e não página /notificacoes:
 *   - 90% do uso é "ver badge → conferir 1 item → fechar". Página dedicada
 *     adiciona 1 hop de navegação sem ganho pra esse flow.
 *   - Página completa fica pra Wave 14 (junto com preferences).
 *
 * i18n:
 *   - Usa `useTranslations('notification')` + namespace 'notification.types.X'
 *     para o label de cada tipo.
 *   - Fallback hardcoded em PT-BR se o provider não estiver disponível
 *     (server-side rendering ou teste isolado).
 *
 * A11y:
 *   - Botão tem aria-label dinâmico com count de unread.
 *   - aria-expanded no botão.
 *   - role="menu" no dropdown, role="menuitem" nos itens.
 *   - Escape fecha; focus trap não implementado (1 nível só — não modal).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, BookOpen, MessageCircle, Sparkles, Coins, Info, Check } from 'lucide-react';
import type { NotificationType } from '@/lib/application/notifications/types';

// ─── Tipos locais ─────────────────────────────────────────────────────
interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

interface ApiResponse {
  notifications: NotificationDTO[];
  unreadCount: number;
}

// ─── Constantes ──────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 30_000;
const DROPDOWN_PREVIEW_COUNT = 5;
const SSE_STREAM_URL = '/api/notifications/stream';
// Quantas falhas consecutivas de SSE antes de cair pro polling puro.
// 3 falhas = ~15s de instabilidade; acima disso, polling 30s é mais
// eficiente que reconectar SSE a cada 5s.
const SSE_MAX_FAILURES = 3;

// i18n fallback (PT-BR). Usado quando useTranslations() não está no contexto
// (testes unit, server-render isolado, etc). Componente PRECISA ser wrappeado
// em <NextIntlClientProvider> na app real.
const FALLBACK_I18N = {
  title: 'Notificações',
  empty: 'Sem notificações por enquanto',
  markAllRead: 'Marcar todas como lidas',
  viewAll: 'Ver todas',
  openBell: 'Abrir notificações',
  unreadBadge: (count: number) =>
    count === 1 ? '1 não lida' : `${count} não lidas`,
  typeLabels: {
    DIARIO: 'Diário',
    MENTOR: 'Mentor',
    CONEXOES: 'Conexões',
    CREDITS: 'Créditos',
    SYSTEM: 'Sistema',
  } as Record<NotificationType, string>,
};

// ─── Helpers de mapping ─────────────────────────────────────────────
function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'DIARIO':
      return BookOpen;
    case 'MENTOR':
      return MessageCircle;
    case 'CONEXOES':
      return Sparkles;
    case 'CREDITS':
      return Coins;
    case 'SYSTEM':
      return Info;
  }
}

function formatRelative(iso: string): string {
  // Format simples: "agora" / "há 5 min" / "há 2 h" / "ontem" / "dd/mm".
  // Para i18n completa, usar Intl.RelativeTimeFormat com locale; aqui
  // ficamos com string PT-BR direta porque o dropdown é compacto.
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

// ─── Props ────────────────────────────────────────────────────────────
export interface NotificationsBellProps {
  /** Locale prefix para construir hrefs internos (ex: 'pt-BR' ou 'en'). */
  locale: string;
  /**
   * Função de tradução. Se omitida, usa FALLBACK_I18N (PT-BR hardcoded).
   * Em produção, passar `useTranslations('notification')` da next-intl.
   * Tipada como função genérica para desacoplar do next-intl.
   */
  t?: (key: string, params?: Record<string, unknown>) => string;
}

// ─── Componente ──────────────────────────────────────────────────────
export function NotificationsBell({ locale, t }: NotificationsBellProps) {
  const [data, setData] = useState<ApiResponse>({
    notifications: [],
    unreadCount: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/notifications?limit=50', {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        // Silencioso: se falhar, mantém o último estado conhecido.
        return;
      }
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch {
      // Network error: silencioso. Polling tentará de novo em 30s.
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Mark all as read ──────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'same-origin',
      });
      if (!res.ok) return;
      // Optimistic update: zera badge localmente, marca items como lidos.
      setData((prev) => ({
        notifications: prev.notifications.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch {
      // Silencioso.
    }
  }, []);

  // ─── Single item click → mark as read (best-effort) ───────────────
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic first: marca localmente como lida.
    setData((prev) => {
      const next = prev.notifications.map((n) =>
        n.id === id && !n.readAt
          ? { ...n, readAt: new Date().toISOString() }
          : n
      );
      const stillUnread = next.filter((n) => !n.readAt).length;
      return { notifications: next, unreadCount: stillUnread };
    });
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
      });
    } catch {
      // Silencioso.
    }
  }, []);

  // ─── SSE / polling lifecycle ───────────────────────────────────────
  // Estratégia (Wave 18.1):
  //   1. Tenta conectar EventSource.
  //   2. Servidor envia `event: snapshot` → hidrata state, badge aparece.
  //   3. Servidor envia `data: {...}\nid: <id>` → adiciona notificação nova.
  //   4. Se EventSource der erro 3× seguidas (proxy matou, 401, etc),
  //      cai pro polling 30s como fallback.
  //   5. Polling 30s roda em paralelo como safety net (defense in depth
  //      contra drift se SSE cair silenciosamente entre reconexões).
  //
  // Por que polling em paralelo com SSE não é desperdício:
  //   - 30s é raro o suficiente pra não competir com SSE.
  //   - SSE + polling = no pior caso, latência 30s em vez de ∞ se SSE
  //     estiver desconectado silenciosamente.
  //   - Sob carga, polling é cacheable, SSE não.

  // Helpers de merge — declarados fora do useEffect para satisfazer
  // regras de hooks (não chamar hooks dentro de loops/conditions).
  const mergeSnapshot = useCallback((snapshot: ApiResponse) => {
    setData(snapshot);
  }, []);

  const appendNotification = useCallback((n: NotificationDTO) => {
    setData((prev) => {
      // Dedup por id (cliente pode receber a mesma via SSE + poll)
      if (prev.notifications.some((x) => x.id === n.id)) return prev;
      const unreadDelta = n.readAt === null ? 1 : 0;
      return {
        notifications: [n, ...prev.notifications].slice(0, 50),
        unreadCount: prev.unreadCount + unreadDelta,
      };
    });
  }, []);

  useEffect(() => {
    // SSE state (ref evita re-render do componente quando falha)
    const esRef = { current: null as EventSource | null };
    let sseFailures = 0;
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    // ─── SSE connection ───────────────────────────────────────────
    const connectSSE = () => {
      if (cancelled) return;
      // EventSource nativo do browser. Envia cookies same-origin
      // automaticamente; não precisa credentials.
      // withCredentials: false é o default mas deixo explícito.
      const es = new EventSource(SSE_STREAM_URL, { withCredentials: false });
      esRef.current = es;

      es.addEventListener('open', () => {
        // Conexão aberta — reset failure counter
        sseFailures = 0;
      });

      es.addEventListener('snapshot', (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data) as ApiResponse;
          mergeSnapshot(data);
        } catch {
          // Payload malformado: ignora silenciosamente.
        }
      });

      // Default message = evento SSE sem `event:` → cai aqui
      es.addEventListener('message', (ev) => {
        try {
          const n = JSON.parse((ev as MessageEvent).data) as NotificationDTO;
          appendNotification(n);
        } catch {
          // Ignora
        }
      });

      es.addEventListener('error', () => {
        // EventSource auto-reconnect é nativo do browser, mas se o
        // servidor retornar 401 (cookie expirou) ou 5xx persistente,
        // EventSource fica em loop. Contamos falhas e após N, fechamos
        // definitivamente → polling cobre.
        sseFailures += 1;
        if (sseFailures >= SSE_MAX_FAILURES) {
          es.close();
          esRef.current = null;
        }
      });
    };

    connectSSE();

    // ─── Polling safety net ───────────────────────────────────────
    // Roda em paralelo com SSE. SSE wins on latency; polling wins on
    // reliability. Custo: 1 GET /30s por usuário ativo.
    const startPolling = () => {
      if (pollIntervalId !== null) return;
      pollIntervalId = setInterval(() => {
        if (!document.hidden) fetchNotifications();
      }, POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (pollIntervalId !== null) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
      }
    };

    startPolling();

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchNotifications(); // refetch ao voltar
        startPolling();
      }
    };
    const handleFocus = () => {
      if (!document.hidden) fetchNotifications();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      // SSE cleanup — fecha EventSource pra liberar conexão TCP no server
      esRef.current?.close();
      esRef.current = null;
    };
  }, [fetchNotifications, mergeSnapshot, appendNotification]);

  // ─── Click outside / Escape to close ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // ─── i18n resolution ──────────────────────────────────────────────
  const translate = useCallback(
    (key: string, fallback: string): string => {
      if (!t) return fallback;
      try {
        const result = t(key);
        return typeof result === 'string' ? result : fallback;
      } catch {
        return fallback;
      }
    },
    [t]
  );

  const title = translate('title', FALLBACK_I18N.title);
  const empty = translate('empty', FALLBACK_I18N.empty);
  const markAllText = translate('markAllRead', FALLBACK_I18N.markAllRead);
  const viewAllText = translate('viewAll', FALLBACK_I18N.viewAll);
  const ariaLabel = FALLBACK_I18N.unreadBadge(data.unreadCount);
  const typeLabel = (type: NotificationType) =>
    translate(
      `types.${type.toLowerCase()}`,
      FALLBACK_I18N.typeLabels[type] ?? type
    );

  // ─── Render ────────────────────────────────────────────────────────
  const preview = data.notifications.slice(0, DROPDOWN_PREVIEW_COUNT);
  const showBadge = data.unreadCount > 0;

  return (
    <div
      ref={containerRef}
      className="relative"
      data-testid="notifications-bell"
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`${title} (${ariaLabel})`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        data-testid="notifications-bell-button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
      >
        <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
        {showBadge && (
          <span
            data-testid="notifications-bell-badge"
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white"
          >
            {data.unreadCount > 9 ? '9+' : data.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={title}
          data-testid="notifications-bell-dropdown"
          className="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-white/10 bg-[#06070F]/96 shadow-2xl backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">{title}</span>
            {data.unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                data-testid="notifications-bell-mark-all"
                className="flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200 focus:outline-none"
              >
                <Check size={14} aria-hidden="true" />
                {markAllText}
              </button>
            )}
          </div>

          {/* Lista */}
          {preview.length === 0 ? (
            <div
              data-testid="notifications-bell-empty"
              className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-white/60"
            >
              <Bell size={28} className="opacity-40" aria-hidden="true" />
              <span>{empty}</span>
            </div>
          ) : (
            <ul
              role="list"
              data-testid="notifications-bell-list"
              className="max-h-[400px] overflow-y-auto"
            >
              {preview.map((n) => {
                const Icon = getTypeIcon(n.type);
                const isUnread = n.readAt === null;
                const inner = (
                  <div
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                    data-unread={isUnread ? 'true' : 'false'}
                  >
                    {/* Unread dot */}
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        isUnread ? 'bg-violet-400' : 'bg-transparent'
                      }`}
                    />
                    {/* Icon */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isUnread
                          ? 'bg-violet-500/15 text-violet-300'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[10px] text-white/40">
                          {formatRelative(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-white/60">
                        {n.body}
                      </p>
                      <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-white/30">
                        {typeLabel(n.type)}
                      </span>
                    </div>
                  </div>
                );

                return (
                  <li key={n.id} role="none">
                    {n.href ? (
                      <Link
                        href={n.href.startsWith('/') ? n.href : `/${locale}${n.href}`}
                        role="menuitem"
                        onClick={() => {
                          if (isUnread) markAsRead(n.id);
                          setIsOpen(false);
                        }}
                        className="block focus:outline-none focus-visible:bg-white/5"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          if (isUnread) markAsRead(n.id);
                          setIsOpen(false);
                        }}
                        className="block w-full text-left focus:outline-none focus-visible:bg-white/5"
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer */}
          {data.notifications.length > DROPDOWN_PREVIEW_COUNT && (
            <div className="border-t border-white/10 px-4 py-2 text-center">
              <Link
                href={`/${locale}/notificacoes`}
                className="text-xs font-medium text-violet-300 hover:text-violet-200"
                onClick={() => setIsOpen(false)}
              >
                {viewAllText} →
              </Link>
            </div>
          )}

          {isLoading && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 animate-pulse rounded-xl bg-white/5 opacity-0"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
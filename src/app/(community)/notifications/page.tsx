'use client';

// ============================================================================
// NOTIFICATIONS — /notifications (real, consumindo API)
// ============================================================================
// Refatorado em 2026-06-27 — usa /api/notifications em vez de mocks.
// Features:
//   * Lista paginada (cursor-based)
//   * Filtros: todas, não lidas, lidas, por tipo
//   * Mark-as-read em single + bulk
//   * Click navega pro entity (post/comment/group/article/user)
//   * Empty state + loading skeleton
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign, BookOpen,
  Users, Shield, AlertTriangle, Sparkles, CheckCheck,
  Settings, Inbox, Mail, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommunityNotifications } from '@/hooks/useCommunityNotifications';
import type { NotificationDto, NotificationType } from '@/lib/notifications';

// ============================================================================
// Type config (espelha o componente NotificationBell)
// ============================================================================

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  POST_REPLY: MessageCircle,
  FOLLOW: UserPlus,
  MENTION: AtSign,
  GROUP_INVITE: Users,
  GROUP_POST: Users,
  GROUP_ROLE_CHANGE: Shield,
  ARTICLE_RECOMMENDATION: BookOpen,
  ARTICLE_PUBLISHED: BookOpen,
  SYSTEM_ALERT: AlertTriangle,
  MODERATION_ACTION: Shield,
  DIGEST_WEEKLY: Sparkles,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  LIKE: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  COMMENT: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  POST_REPLY: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  FOLLOW: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  MENTION: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  GROUP_INVITE: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  GROUP_POST: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  GROUP_ROLE_CHANGE: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  ARTICLE_RECOMMENDATION: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  ARTICLE_PUBLISHED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  SYSTEM_ALERT: 'text-red-400 bg-red-500/10 border-red-500/30',
  MODERATION_ACTION: 'text-red-400 bg-red-500/10 border-red-500/30',
  DIGEST_WEEKLY: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  LIKE: 'Curtida',
  COMMENT: 'Comentário',
  POST_REPLY: 'Resposta',
  FOLLOW: 'Seguidor',
  MENTION: 'Menção',
  GROUP_INVITE: 'Convite',
  GROUP_POST: 'Grupo',
  GROUP_ROLE_CHANGE: 'Papel',
  ARTICLE_RECOMMENDATION: 'Recomendação',
  ARTICLE_PUBLISHED: 'Artigo',
  SYSTEM_ALERT: 'Alerta',
  MODERATION_ACTION: 'Moderação',
  DIGEST_WEEKLY: 'Resumo',
};

function getNotificationLink(n: NotificationDto): string {
  if (n.payload?.link && typeof n.payload.link === 'string') {
    return n.payload.link;
  }
  if (n.entityType === 'POST' && n.entityId) return `/post/${n.entityId}`;
  if (n.entityType === 'COMMENT' && n.entityId) return `/post/${n.entityId}#comment-${n.entityId}`;
  if (n.entityType === 'GROUP' && n.entityId) return `/groups/${n.entityId}`;
  if (n.entityType === 'ARTICLE' && n.entityId) return `/library/${n.entityId}`;
  if (n.entityType === 'USER' && n.entityId) return `/u/${n.entityId}`;
  if (n.postId) return `/post/${n.postId}`;
  if (n.commentId) return `/post/${n.commentId}#comment-${n.commentId}`;
  if (n.groupId) return `/groups/${n.groupId}`;
  if (n.articleId) return `/library/${n.articleId}`;
  return '/notifications';
}

function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const seconds = Math.max(0, Math.floor((now - then) / 1000));
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d atrás`;
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

// ============================================================================
// MAIN
// ============================================================================

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | null>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchMore,
  } = useCommunityNotifications({
    pollingInterval: 30_000,
    autoFetch: true,
  });

  // Apply client-side filters
  const filtered = useMemo(() => {
    let result = notifications;
    if (filter === 'unread') result = result.filter((n) => !n.read);
    if (filter === 'read') result = result.filter((n) => n.read);
    if (typeFilter) result = result.filter((n) => n.type === typeFilter);
    return result;
  }, [notifications, filter, typeFilter]);

  // Contagem por tipo (para filtros)
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notifications) {
      counts[n.type] = (counts[n.type] ?? 0) + 1;
    }
    return counts;
  }, [notifications]);

  const handleClick = (n: NotificationDto) => {
    if (!n.read) void markAsRead(n.id);
    router.push(getNotificationLink(n));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              🔔 Notificações
            </h1>
            <p className="text-slate-400 text-sm font-raleway mt-1">
              {unreadCount > 0
                ? `${unreadCount} não lidas`
                : 'Tudo lido ✨'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings/notifications">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                aria-label="Configurar preferências de notificação"
              >
                <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                Preferências
              </Button>
            </Link>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void markAllAsRead()}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
              >
                <CheckCheck className="w-4 h-4 mr-2" aria-hidden="true" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs — primary */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterChip
            label="Todas"
            count={notifications.length}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterChip
            label="Não lidas"
            count={unreadCount}
            active={filter === 'unread'}
            onClick={() => setFilter('unread')}
          />
          <FilterChip
            label="Lidas"
            count={notifications.length - unreadCount}
            active={filter === 'read'}
            onClick={() => setFilter('read')}
          />
        </div>

        {/* Filter — por tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Tipo:</span>
          <TypeChip
            label="Todos"
            active={typeFilter === null}
            onClick={() => setTypeFilter(null)}
          />
          {(Object.keys(TYPE_LABELS) as NotificationType[]).map((t) =>
            typeCounts[t] ? (
              <TypeChip
                key={t}
                label={TYPE_LABELS[t]}
                active={typeFilter === t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              />
            ) : null
          )}
        </div>

        {/* Notif list */}
        <div className="space-y-2">
          {isLoading && filtered.length === 0 ? (
            <NotificationsSkeleton />
          ) : error ? (
            <Card className="card-spiritual bg-slate-900/50 border-red-500/30">
              <CardContent className="pt-8 pb-8 text-center space-y-2">
                <AlertTriangle className="w-10 h-10 mx-auto text-red-400" />
                <p className="text-red-400">Erro ao carregar notificações</p>
                <p className="text-xs text-slate-500">{error}</p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} hasAny={notifications.length > 0} />
          ) : (
            filtered.map((n) => (
              <NotificationListItem
                key={n.id}
                notification={n}
                onClick={() => handleClick(n)}
              />
            ))
          )}

          {/* Load more */}
          {!isLoading && notifications.length >= 20 && (
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void fetchMore()}
                className="text-amber-300 hover:text-amber-200"
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function NotificationListItem({
  notification: n,
  onClick,
}: {
  notification: NotificationDto;
  onClick: () => void;
}) {
  const Icon = TYPE_ICONS[n.type] ?? Bell;
  const colorClass = TYPE_COLORS[n.type] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  const displayName = n.actorSnapshot?.displayName ?? 'Alguém';

  // Texto principal por tipo
  let main: React.ReactNode;
  switch (n.type) {
    case 'LIKE':
      main = (
        <>
          <strong>{displayName}</strong>{' '}
          {n.count > 1 ? (
            <>e mais {n.count - 1} pessoa{n.count > 2 ? 's' : ''}</>
          ) : null}{' '}
          curtiu{n.count > 1 ? 'ram' : ''} seu post
        </>
      );
      break;
    case 'COMMENT':
      main = (
        <>
          <strong>{displayName}</strong> comentou no seu post
        </>
      );
      break;
    case 'POST_REPLY':
      main = (
        <>
          <strong>{displayName}</strong> respondeu seu comentário
        </>
      );
      break;
    case 'FOLLOW':
      main = (
        <>
          <strong>{displayName}</strong> começou a seguir você
        </>
      );
      break;
    case 'MENTION':
      main = (
        <>
          <strong>{displayName}</strong> mencionou você
        </>
      );
      break;
    case 'GROUP_INVITE':
      main = (
        <>
          <strong>{displayName}</strong> convidou você para um grupo
        </>
      );
      break;
    case 'GROUP_POST':
      main = (
        <>
          <strong>{displayName}</strong> postou em um grupo que você participa
        </>
      );
      break;
    case 'GROUP_ROLE_CHANGE':
      main = (
        <>
          Seu papel no grupo foi atualizado
        </>
      );
      break;
    case 'ARTICLE_RECOMMENDATION':
      main = <>Akasha IA recomendou um artigo para você</>;
      break;
    case 'ARTICLE_PUBLISHED':
      main = (
        <>
          <strong>{displayName}</strong> publicou um novo artigo
        </>
      );
      break;
    case 'SYSTEM_ALERT':
      main = <>Alerta do sistema</>;
      break;
    case 'MODERATION_ACTION':
      main = <>Ação de moderação</>;
      break;
    case 'DIGEST_WEEKLY':
      main = <>Seu resumo semanal chegou</>;
      break;
    default:
      main = <>Nova atividade</>;
  }

  const excerpt =
    typeof n.payload?.excerpt === 'string' ? (n.payload.excerpt as string) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-xl border transition-all hover:bg-slate-800/50',
        n.read
          ? 'bg-slate-900/30 border-slate-800/30'
          : 'bg-slate-900/70 border-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.05)]'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center',
            colorClass
          )}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200">{main}</p>
          {excerpt && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">
              "{excerpt}"
            </p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            {formatRelativeTime(n.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {!n.read && (
          <div
            className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2"
            aria-label="Não lida"
          />
        )}
      </div>
    </button>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border min-h-[36px]',
        active
          ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border-amber-500/30'
          : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:text-slate-200'
      )}
    >
      {label}
      <span
        className={cn(
          'px-1.5 rounded-full text-[10px]',
          active ? 'bg-amber-500/20' : 'bg-slate-700/50'
        )}
      >
        {count}
      </span>
    </button>
  );
}

function TypeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
        active
          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
          : 'bg-slate-900/50 text-slate-500 border-slate-800/30 hover:text-slate-300'
      )}
    >
      {label}
    </button>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="bg-slate-900/30 border-slate-800/30">
          <CardContent className="p-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-800/50 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-slate-800/50 rounded animate-pulse w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  filter,
  hasAny,
}: {
  filter: 'all' | 'unread' | 'read';
  hasAny: boolean;
}) {
  if (hasAny) {
    // Há notificações mas o filtro está zerado
    return (
      <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardContent className="pt-8 pb-8 text-center space-y-2">
          <Inbox className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-slate-400">Nenhuma notificação neste filtro</p>
          <p className="text-xs text-slate-500">
            Tente outro filtro acima
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
      <CardContent className="pt-8 pb-8 text-center space-y-3">
        <Bell className="w-12 h-12 mx-auto text-slate-600" />
        <p className="text-slate-300">Nenhuma notificação por aqui</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Quando alguém curtir, comentar, mencionar ou seguir você,
          vai aparecer aqui em tempo real.
        </p>
        <Link href="/feed">
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-slate-700 bg-slate-800/50"
          >
            Explorar o feed
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

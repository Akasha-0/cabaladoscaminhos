'use client';

// ============================================================================
// NotificationBell — sino de notificações no header da comunidade
// ============================================================================
// Substitui o badge estático do CommunityNav. Mostra:
//   * Badge com count de não lidas (atualizado a cada 30s via hook)
//   * Dropdown com top 10 notificações mais recentes
//   * Ação de "marcar todas como lidas"
//   * Click em notif → navega pro entity + marca como lida
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign, BookOpen,
  Users, Shield, AlertTriangle, Sparkles, CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCommunityNotifications } from '@/hooks/useCommunityNotifications';
import type { NotificationDto, NotificationType } from '@/lib/notifications';

// ============================================================================
// Type config
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

// ============================================================================
// Helper: navigation link para uma notificação
// ============================================================================

function getNotificationLink(n: NotificationDto): string {
  // Prioridade: payload.link → entity-derived fallback
  if (n.payload?.link && typeof n.payload.link === 'string') {
    return n.payload.link;
  }

  if (n.entityType === 'POST' && n.entityId) return `/post/${n.entityId}`;
  if (n.entityType === 'COMMENT' && n.entityId) return `/post/${n.entityId}#comment-${n.entityId}`;
  if (n.entityType === 'GROUP' && n.entityId) return `/groups/${n.entityId}`;
  if (n.entityType === 'ARTICLE' && n.entityId) return `/library/${n.entityId}`;
  if (n.entityType === 'USER' && n.entityId) return `/u/${n.entityId}`;

  // Post/comment shortcuts
  if (n.postId) return `/post/${n.postId}`;
  if (n.commentId) return `/post/${n.commentId}#comment-${n.commentId}`;
  if (n.groupId) return `/groups/${n.groupId}`;
  if (n.articleId) return `/library/${n.articleId}`;

  return '/notifications';
}

// ============================================================================
// Helper: formatar tempo relativo
// ============================================================================

function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const seconds = Math.max(0, Math.floor((now - then) / 1000));
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}m`;
  } catch {
    return '';
  }
}

// ============================================================================
// NotificationBell
// ============================================================================

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useCommunityNotifications({
    pollingInterval: 30_000,
    autoFetch: true,
  });

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleClick = (n: NotificationDto) => {
    if (!n.read) void markAsRead(n.id);
    setOpen(false);
    router.push(getNotificationLink(n));
  };

  const top = notifications.slice(0, 10);

  return (
    <div className="relative">
      {/* Botão sino */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={
          unreadCount > 0
            ? `Notificações (${unreadCount} não lidas)`
            : 'Notificações'
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-label="Notificações recentes"
          className="absolute right-0 top-12 w-80 max-h-[28rem] overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Notificações</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo lido ✨'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void markAllAsRead()}
                className="text-xs text-amber-300 hover:text-amber-200 hover:bg-slate-800/50"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Marcar todas
              </Button>
            )}
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && top.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                Carregando…
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-xs text-red-400">
                Erro ao carregar
              </div>
            ) : top.length === 0 ? (
              <div className="px-4 py-8 text-center space-y-1">
                <Bell className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm text-slate-400">Nenhuma notificação</p>
                <p className="text-xs text-slate-500">
                  Curtidas, comentários e follows aparecem aqui.
                </p>
              </div>
            ) : (
              top.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => handleClick(n)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800/50 px-3 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-amber-300 hover:text-amber-200 py-2 min-h-[44px] leading-[28px]"
            >
              Ver todas →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NotificationRow — uma linha da lista
// ============================================================================

function NotificationRow({
  notification: n,
  onClick,
}: {
  notification: NotificationDto;
  onClick: () => void;
}) {
  const Icon = TYPE_ICONS[n.type] ?? Bell;
  const colorClass = TYPE_COLORS[n.type] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  const typeLabel = TYPE_LABELS[n.type] ?? n.type;
  const displayName = n.actorSnapshot?.displayName ?? 'Alguém';

  // Texto descritivo por tipo
  let preview = '';
  if (typeof n.payload?.preview === 'string') {
    preview = n.payload.preview;
  } else if (n.count > 1) {
    preview = `${displayName} e mais ${n.count - 1}`;
  } else {
    preview = displayName;
  }

  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={cn(
        'w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800/30 min-h-[44px]',
        !n.read && 'bg-slate-800/30'
      )}
    >
      {/* Ícone do tipo */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center',
          colorClass
        )}
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-300 leading-snug">
          <span className="font-medium">{preview}</span>
          {' '}
          <span className="text-slate-500">{typeLabel.toLowerCase()}</span>
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          {formatRelativeTime(n.createdAt)}
        </p>
      </div>

      {/* Não lida indicator */}
      {!n.read && (
        <div
          className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400 mt-2"
          aria-label="Não lida"
        />
      )}
    </button>
  );
}

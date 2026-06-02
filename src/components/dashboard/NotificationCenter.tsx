// fallow-ignore-file unused-file
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell,
  BellRing,
  X,
  CheckCheck,
  Clock,
  Sparkles,
  Moon,
  Sun,
  Zap,
  Calendar,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// fallow-ignore-next-line unresolved-import
import { useNotifications, type SpiritualNotification, type NotificationType } from '@/lib/hooks/useNotifications';

// ============================================================
// TYPES
// ============================================================

export interface NotificationCenterProps {
  className?: string;
  maxVisible?: number;
  showFilters?: boolean;
  userId?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  ritual: <Sparkles className="w-4 h-4" />,
  odu: <Calendar className="w-4 h-4" />,
  moon: <Moon className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
};

const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; text: string; border: string }> = {
  ritual: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  odu: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  moon: { bg: 'bg-slate-400/10', text: 'text-slate-300', border: 'border-slate-400/30' },
  energy: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

const TYPE_LABELS: Record<NotificationType, string> = {
  ritual: 'Ritual',
  odu: 'Odu',
  moon: 'Lua',
  energy: 'Energia',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function getTimeIcon(timestamp: number): React.ReactNode {
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return <Sun className="w-3 h-3" />;
  if (hour >= 12 && hour < 18) return <Sun className="w-3 h-3 text-orange-400" />;
  return <Moon className="w-3 h-3" />;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface NotificationItemProps {
  notification: SpiritualNotification;
  onClick: () => void;
  onDismiss: () => void;
  onSnooze: () => void;
  onComplete: () => void;
}

// fallow-ignore-next-line complexity
function NotificationItem({
  notification,
  onClick,
  onDismiss,
  onSnooze,
  onComplete,
}: NotificationItemProps) {
  const colors = NOTIFICATION_COLORS[notification.type];
  const isUnread = !notification.read;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative group p-4 rounded-xl cursor-pointer transition-all duration-200',
        'border',
        colors.bg,
        colors.border,
        isUnread ? 'bg-slate-800/50' : 'bg-transparent hover:bg-slate-800/30',
        isUnread && 'border-l-2 border-l-amber-500'
      )}
    >
      {/* Unread indicator */}
      {isUnread && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500" />
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', colors.bg, colors.text)}>
          {NOTIFICATION_ICONS[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn('font-medium text-sm truncate', colors.text)}>
              {notification.title}
            </h4>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full uppercase font-medium',
              colors.bg,
              colors.text
            )}>
              {TYPE_LABELS[notification.type]}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              {getTimeIcon(notification.timestamp)}
              {formatTime(notification.timestamp)}
            </span>
            {notification.metadata?.orixa && (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {notification.metadata.orixa}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions (visible on hover) */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {notification.type === 'ritual' && notification.metadata?.ritualId && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            title="Marcar como feito"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onSnooze(); }}
          className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-colors"
          title="Adiar 1 hora"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-red-500/30 hover:text-red-400 transition-colors"
          title="Dispensar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
  color: string;
}

function FilterChip({ label, isActive, count, onClick, color }: FilterChipProps) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    violet: { bg: 'bg-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400' },
    slate: { bg: 'bg-slate-600/20', border: 'border-slate-500/30', text: 'text-slate-300' },
    orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  };

  const colors = colorMap[color] || colorMap.amber;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        isActive
          ? `${colors.bg} ${colors.text} ${colors.border} border`
          : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
      )}
    >
      {label}
      {count > 0 && (
        <span className={cn(
          'px-1.5 py-0.5 rounded-full text-[10px]',
          isActive ? 'bg-amber-500/30' : 'bg-slate-700'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function NotificationCenter({
  className = '',
  maxVisible = 10,
  showFilters = true,
  userId = 'default',
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    snoozeNotification,
    completeRitual,
    refreshNotifications,
  } = useNotifications({ userId });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Filter notifications
  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const visibleNotifications = filteredNotifications.slice(0, maxVisible);

  // Counts by type
  const typeCounts = {
    ritual: notifications.filter(n => n.type === 'ritual').length,
    odu: notifications.filter(n => n.type === 'odu').length,
    moon: notifications.filter(n => n.type === 'moon').length,
    energy: notifications.filter(n => n.type === 'energy').length,
  };

  const handleNotificationClick = useCallback((id: string) => {
    markAsRead(id);
  }, [markAsRead]);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2.5 rounded-xl transition-all duration-200',
          'hover:bg-slate-800/80',
          isOpen ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
        )}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-amber-500 text-black text-xs font-bold rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/50 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white">
                  Notificações Espirituais
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  unreadCount > 0
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                )}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas como lidas
              </button>
              <button
                onClick={refreshNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 mt-3">
                <FilterChip
                  label="Todas"
                  isActive={activeFilter === 'all'}
                  count={notifications.length}
                  onClick={() => setActiveFilter('all')}
                  color="amber"
                />
                <FilterChip
                  label="Rituais"
                  isActive={activeFilter === 'ritual'}
                  count={typeCounts.ritual}
                  onClick={() => setActiveFilter('ritual')}
                  color="amber"
                />
                <FilterChip
                  label="Odu"
                  isActive={activeFilter === 'odu'}
                  count={typeCounts.odu}
                  onClick={() => setActiveFilter('odu')}
                  color="violet"
                />
                <FilterChip
                  label="Lua"
                  isActive={activeFilter === 'moon'}
                  count={typeCounts.moon}
                  onClick={() => setActiveFilter('moon')}
                  color="slate"
                />
                <FilterChip
                  label="Energia"
                  isActive={activeFilter === 'energy'}
                  count={typeCounts.energy}
                  onClick={() => setActiveFilter('energy')}
                  color="orange"
                />
              </div>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {visibleNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Nenhuma notificação</p>
                <p className="text-slate-500 text-xs">
                  {activeFilter === 'all'
                    ? 'Suas notificações espirituais aparecerão aqui'
                    : `Sem notificações de ${TYPE_LABELS[activeFilter as NotificationType]}`}
                </p>
              </div>
            ) : (
              visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification.id)}
                  onDismiss={() => dismissNotification(notification.id)}
                  onSnooze={() => snoozeNotification(notification.id, 60)}
                  onComplete={() => {
                    if (notification.metadata?.ritualId) {
                      completeRitual(notification.metadata.ritualId);
                    }
                  }}
                />
              ))
            )}

            {/* Show more indicator */}
            {filteredNotifications.length > maxVisible && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-center text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Ver todas as {filteredNotifications.length} notificações
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800/50 p-3">
            <p className="text-[10px] text-slate-500 text-center">
              Notificações geradas automaticamente com base na sua prática espiritual
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
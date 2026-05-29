'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Moon,
  Sun,
  AlertCircle,
  Info,
  Star,
  Zap,
  Calendar,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualNotificationCenterProps {
  notifications?: Notification[];
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  maxVisible?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'insight' | 'reminder' | 'alert' | 'achievement' | 'system';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    orixa?: string;
    odu?: string;
    category?: string;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const NOTIFICATION_ICONS = {
  insight: <Sparkles className="w-4 h-4" />,
  reminder: <Clock className="w-4 h-4" />,
  alert: <AlertCircle className="w-4 h-4" />,
  achievement: <Star className="w-4 h-4" />,
  system: <Info className="w-4 h-4" />,
};

const NOTIFICATION_COLORS = {
  insight: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    ring: 'ring-purple-500/20',
  },
  reminder: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
  alert: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    ring: 'ring-amber-500/20',
  },
  achievement: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  system: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    ring: 'ring-slate-500/20',
  },
};

const PRIORITY_INDICATORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-500',
};

// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Insight Astral',
    message: 'A posição de Vênus favorece relacionamentos e harmonia hoje.',
    type: 'insight',
    priority: 'high',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    metadata: { category: 'astrologia' },
  },
  {
    id: '2',
    title: 'Lembrete de Meditação',
    message: 'Horário ideal para prática contemplativa: após o nascer do sol.',
    type: 'reminder',
    priority: 'medium',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    metadata: { orixa: 'Oxalá' },
  },
  {
    id: '3',
    title: 'Nova Conquista',
    message: 'Você alcançou 50% de progresso na Jornada Espiritual!',
    type: 'achievement',
    priority: 'low',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    metadata: { category: 'progresso' },
  },
  {
    id: '4',
    title: 'Alerta Energético',
    message: 'Lua cheia em breve. Período propício para ritual de proteção.',
    type: 'alert',
    priority: 'high',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    metadata: { orixa: 'Iemanjá', odu: 'Ogbe' },
  },
  {
    id: '5',
    title: 'Atualização do Sistema',
    message: 'Novas funcionalidades de análise espiritual disponíveis.',
    type: 'system',
    priority: 'low',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '6',
    title: 'Insight Numerológico',
    message: 'Seu número de destino indica mudança significativa nos próximos dias.',
    type: 'insight',
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    metadata: { category: 'numerologia' },
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
}

function getTimeIcon(date: Date): React.ReactNode {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return <Sun className="w-3 h-3" />;
  if (hour >= 12 && hour < 18) return <Zap className="w-3 h-3" />;
  return <Moon className="w-3 h-3" />;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onDismiss?: () => void;
}

function NotificationItem({ notification, onClick, onDismiss }: NotificationItemProps) {
  const colors = NOTIFICATION_COLORS[notification.type];
  const icon = NOTIFICATION_ICONS[notification.type];
  const priorityDot = PRIORITY_INDICATORS[notification.priority];

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all duration-300 group cursor-pointer',
        colors.bg,
        colors.border,
        !notification.read && 'ring-1',
        !notification.read && colors.ring
      )}
      onClick={onClick}
    >
      {/* Priority Indicator */}
      <div className={cn('absolute top-4 right-4 w-2 h-2 rounded-full', priorityDot)} />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg bg-slate-800/50', colors.text)}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            )}
            <h4 className={cn('font-semibold text-white text-sm truncate', colors.text)}>
              {notification.title}
            </h4>
          </div>
          <p className="text-slate-400 text-xs line-clamp-2">{notification.message}</p>

          {/* Metadata & Timestamp */}
          <div className="flex items-center gap-3 mt-2">
            {notification.metadata?.orixa && (
              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                {notification.metadata.orixa}
              </span>
            )}
            {notification.metadata?.odu && (
              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                Odu {notification.metadata.odu}
              </span>
            )}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              {getTimeIcon(notification.timestamp)}
              {formatRelativeTime(notification.timestamp)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={(e) => { e.stopPropagation(); /* mark as read */ }}
              className="p-1 rounded hover:bg-slate-700/50 transition-colors"
              title="Marcar como lida"
            >
              <Check className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}
            className="p-1 rounded hover:bg-slate-700/50 transition-colors"
            title="Dispensar"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  count?: number;
  onClick: () => void;
  color?: string;
}

function FilterChip({ label, isActive, count, onClick, color = 'slate' }: FilterChipProps) {
  const colorClasses: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    slate: 'text-slate-400 bg-slate-700/50 border-slate-600/50',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs rounded-lg border transition-colors',
        isActive ? colorClasses[color] : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-600/50'
      )}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1 text-xs opacity-70">({count})</span>
      )}
    </button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualNotificationCenter({
  notifications = DEFAULT_NOTIFICATIONS,
  className = '',
  onNotificationClick,
  onMarkAllRead,
  maxVisible = 10,
}: SpiritualNotificationCenterProps) {
  const [expanded, setExpanded] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read && !dismissedIds.has(n.id)).length;
  }, [notifications, dismissedIds]);

  const filteredNotifications = useMemo(() => {
    let result = notifications.filter(n => !dismissedIds.has(n.id));
    
    if (filterType) {
      result = result.filter(n => n.type === filterType);
    }
    
    return result.sort((a, b) => {
      // Unread first
      if (a.read !== b.read) return a.read ? 1 : -1;
      // Then by timestamp
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, filterType, dismissedIds]);

  const visibleNotifications = expanded 
    ? filteredNotifications 
    : filteredNotifications.slice(0, maxVisible);

  const notificationTypes = ['insight', 'reminder', 'alert', 'achievement', 'system'] as const;
  const typeColors: Record<string, string> = {
    insight: 'purple',
    reminder: 'blue',
    alert: 'amber',
    achievement: 'emerald',
    system: 'slate',
  };

  const handleDismiss = (notificationId: string) => {
    setDismissedIds(prev => new Set(prev).add(notificationId));
  };

  const handleMarkAllRead = () => {
    onMarkAllRead?.();
  };

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">Centro de Notificações</h3>
              <p className="text-slate-400 text-xs">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações foram vistas'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-4 h-4 text-slate-400" />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <FilterChip
            label="Todas"
            isActive={filterType === null}
            count={filteredNotifications.length}
            onClick={() => setFilterType(null)}
          />
          {notificationTypes.map(type => {
            const count = notifications.filter(n => n.type === type && !dismissedIds.has(n.id)).length;
            if (count === 0) return null;
            return (
              <FilterChip
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                isActive={filterType === type}
                count={count}
                onClick={() => setFilterType(filterType === type ? null : type)}
                color={typeColors[type]}
              />
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          visibleNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => onNotificationClick?.(notification)}
              onDismiss={() => handleDismiss(notification.id)}
            />
          ))
        )}
      </div>

      {/* Show More */}
      {!expanded && filteredNotifications.length > maxVisible && (
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Ver todas as {filteredNotifications.length} notificações
          </button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-white">{notifications.length}</p>
            <p className="text-slate-500 text-xs">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-400">{unreadCount}</p>
            <p className="text-slate-500 text-xs">Não lidas</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-400">{notifications.length - unreadCount}</p>
            <p className="text-slate-500 text-xs">Lidas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpiritualNotificationCenter;
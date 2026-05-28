'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  X,
  AlertCircle,
  Info,
  Star,
  MessageSquare,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent } from '@/components/ui/spiritual-card';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type NotificationType = 'info' | 'warning' | 'success' | 'reminder' | 'update' | 'insight';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  category?: string;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  info: { icon: <Info className="w-4 h-4" />, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  warning: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  success: { icon: <Check className="w-4 h-4" />, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  reminder: { icon: <Bell className="w-4 h-4" />, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  update: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  insight: { icon: <Star className="w-4 h-4" />, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
};

const TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Info',
  warning: 'Aviso',
  success: 'Sucesso',
  reminder: 'Lembrete',
  update: 'Atualização',
  insight: 'Insight',
};

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-4 h-4" />,
  warning: <AlertCircle className="w-4 h-4" />,
  success: <Check className="w-4 h-4" />,
  reminder: <Calendar className="w-4 h-4" />,
  update: <TrendingUp className="w-4 h-4" />,
  insight: <Star className="w-4 h-4" />,
};

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('dashboard_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dashboard_notifications', JSON.stringify(notifications));
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return new Date(timestamp).toLocaleDateString('pt-BR');
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const stored = getStoredNotifications();
    if (stored.length === 0) {
      const sample: Notification[] = [
        {
          id: generateId(),
          type: 'insight',
          title: 'Novo insight disponível',
          message: 'Descubra como os astros influenciam seu caminho espiritual hoje.',
          timestamp: Date.now() - 1800000,
          read: false,
          category: 'astrologia',
        },
        {
          id: generateId(),
          type: 'reminder',
          title: 'Hora da meditação',
          message: 'Reserve um momento para equilibrar seus chakras.',
          timestamp: Date.now() - 3600000,
          read: false,
          category: 'meditacao',
        },
        {
          id: generateId(),
          type: 'update',
          title: 'Recurso adicionado',
          message: 'Novo ritual de proteção spiritual foi adicionado ao seu dashboard.',
          timestamp: Date.now() - 86400000,
          read: true,
          category: 'ritual',
        },
        {
          id: generateId(),
          type: 'success',
          title: 'Ritual concluído',
          message: 'Você completou 7 dias consecutivos de prática espiritual.',
          timestamp: Date.now() - 172800000,
          read: true,
        },
        {
          id: generateId(),
          type: 'info',
          title: 'Sincronização completa',
          message: 'Seus dados estão seguros e atualizados.',
          timestamp: Date.now() - 259200000,
          read: true,
        },
      ];
      setNotifications(sample);
      saveNotifications(sample);
    } else {
      setNotifications(stored);
    }
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications;
    return notifications.filter((n) => n.type === filterType);
  }, [notifications, filterType]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => !n.read);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  return (
    <SpiritualCard variant="default" className="relative overflow-hidden">
      <SpiritualCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <SpiritualCardTitle>Centro de Notificações</SpiritualCardTitle>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Marcar todas lidas
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SpiritualCardHeader>

      {showFilters && (
        <div className="px-4 pb-3 border-b border-border/50">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="h-7 text-xs"
            >
              Todas
            </Button>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type as NotificationType)}
                className="h-7 text-xs"
              >
                {TYPE_ICONS[type as NotificationType]}
                <span className="ml-1">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <SpiritualCardContent className="p-0">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {filterType === 'all'
                ? 'Nenhuma notificação ainda'
                : `Nenhuma notificação do tipo "${TYPE_LABELS[filterType]}"`}
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.map((notification) => {
              const config = TYPE_CONFIG[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`group relative px-4 py-3 border-b border-border/30 hover:bg-muted/30 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.category && (
                        <Badge variant="secondary" className="mt-2 text-[10px] h-5">
                          {notification.category}
                        </Badge>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 w-7"
                          title="Marcar como lida"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notifications.filter((n) => n.read).length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllRead}
                className="w-full text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar notificações lidas
              </Button>
            </div>
          </>
        )}
      </SpiritualCardContent>
    </SpiritualCard>
  );
}

export default NotificationCenter;
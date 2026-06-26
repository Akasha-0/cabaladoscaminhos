'use client';

// ============================================================================
// NOTIFICATIONS — /notifications
// ============================================================================
// Notificações de atividade da comunidade (followers, likes, comments, menções).
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign, BookOpen,
  Check, CheckCheck, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type NotifType = 'NEW_FOLLOWER' | 'NEW_COMMENT' | 'NEW_LIKE' | 'MENTION' | 'ARTICLE_REC' | 'GROUP_INVITE';

interface Notification {
  id: string;
  type: NotifType;
  actor: { name: string; handle: string; avatarUrl?: string };
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ============================================================
// MOCK
// ============================================================

const MOCK_NOTIFS: Notification[] = [
  {
    id: '1',
    type: 'NEW_FOLLOWER',
    actor: { name: 'Ruy de Ogum', handle: 'ruy-ogum' },
    content: 'começou a seguir você',
    link: '/u/ruy-ogum',
    read: false,
    createdAt: 'agora',
  },
  {
    id: '2',
    type: 'NEW_COMMENT',
    actor: { name: 'Marina dos Caminhos', handle: 'marina-caminhos' },
    content: 'comentou no seu post: "Que experiência linda! Você escreveu sobre ayahuasca e..."',
    link: '/post/1',
    read: false,
    createdAt: '5min',
  },
  {
    id: '3',
    type: 'NEW_LIKE',
    actor: { name: 'Bia Kether', handle: 'bia-kether' },
    content: 'e outras 12 pessoas curtiram seu post',
    link: '/post/3',
    read: false,
    createdAt: '1h',
  },
  {
    id: '4',
    type: 'ARTICLE_REC',
    actor: { name: 'Akasha IA', handle: 'akasha-ia' },
    content: 'encontrou um artigo pra você: "Efeitos do Reiki em ansiedade — meta-análise 2024"',
    link: '/library#a1',
    read: true,
    createdAt: '3h',
  },
  {
    id: '5',
    type: 'MENTION',
    actor: { name: 'Caio de Oxossi', handle: 'caio-oxossi' },
    content: 'mencionou você em um post sobre intuição',
    link: '/post/4',
    read: true,
    createdAt: '1d',
  },
  {
    id: '6',
    type: 'NEW_FOLLOWER',
    actor: { name: 'Leo Ary', handle: 'leo-ary' },
    content: 'começou a seguir você',
    link: '/u/leo-ary',
    read: true,
    createdAt: '2d',
  },
  {
    id: '7',
    type: 'GROUP_INVITE',
    actor: { name: 'Grupo Tantra', handle: 'tantra' },
    content: 'te convidou para participar do grupo',
    link: '/groups/tantra',
    read: true,
    createdAt: '3d',
  },
];

// ============================================================
// ICONS
// ============================================================

const TYPE_ICONS = {
  NEW_FOLLOWER: UserPlus,
  NEW_COMMENT: MessageCircle,
  NEW_LIKE: Heart,
  MENTION: AtSign,
  ARTICLE_REC: BookOpen,
  GROUP_INVITE: Sparkles,
};

const TYPE_COLORS = {
  NEW_FOLLOWER: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  NEW_COMMENT: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  NEW_LIKE: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  MENTION: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  ARTICLE_REC: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  GROUP_INVITE: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

// ============================================================
// MAIN
// ============================================================

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo lido ✨'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <FilterChip label="Tudo" count={notifs.length} active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterChip label="Não lidas" count={unreadCount} active={filter === 'unread'} onClick={() => setFilter('unread')} />
        </div>

        {/* Notif list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardContent className="pt-8 pb-8 text-center space-y-2">
                <Bell className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-slate-400">Nenhuma notificação por aqui</p>
                <p className="text-xs text-slate-500">
                  Quando alguém curtir, comentar ou seguir, você vê aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((n) => {
              const Icon = TYPE_ICONS[n.type];
              return (
                <Link
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    'block p-3 rounded-xl border transition-all hover:bg-slate-800/50',
                    n.read
                      ? 'bg-slate-900/30 border-slate-800/30'
                      : 'bg-slate-900/70 border-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.05)]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={n.actor.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-xs">
                          {n.actor.name[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center',
                        TYPE_COLORS[n.type]
                      )}>
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">
                        <span className="font-medium">{n.actor.name}</span>{' '}
                        <span className="text-slate-400">{n.content}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.createdAt}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label, count, active, onClick,
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
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
        active
          ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border-amber-500/30'
          : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:text-slate-200'
      )}
    >
      {label}
      <span className={cn(
        'px-1.5 rounded-full text-[10px]',
        active ? 'bg-amber-500/20' : 'bg-slate-700/50'
      )}>
        {count}
      </span>
    </button>
  );
}

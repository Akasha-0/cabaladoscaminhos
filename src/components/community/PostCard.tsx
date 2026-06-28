'use client';

// ============================================================================
// PostCard — Card de post do feed com like/delete otimistas
// ============================================================================
// Recebe callbacks para like/delete do hook pai (useFeed/useLikePost/etc).
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart, MessageCircle, Share2, MoreHorizontal,
  Users, BookOpen, Lightbulb, Star, Leaf,
  Pencil, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ui/ShareButton';
import { FlagButton } from '@/components/moderation/FlagButton';
import { BookmarkButton } from '@/components/community/BookmarkButton';
import { cn } from '@/lib/utils';
import type { Post } from '@/types/community';
import { useT } from '@/lib/i18n/useT';
import { ReactionBar } from '@/components/community/ReactionBar';

// ============================================================================
// Visual constants
// ============================================================================

const TRADITION_COLORS: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30',
  ifa: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
  xamanismo: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
  tantra: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30',
  reiki: 'from-cyan-500/20 to-sky-500/20 text-cyan-300 border-cyan-500/30',
  ayurveda: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
};

const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  xamanismo: 'Xamanismo',
  tantra: 'Tantra',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
};

const POST_TYPE_ICONS = {
  TEXT: <MessageCircle className="w-3 h-3" />,
  LINK: <Share2 className="w-3 h-3" />,
  ARTICLE: <BookOpen className="w-3 h-3" />,
  QUESTION: <Lightbulb className="w-3 h-3" />,
  EXPERIENCE: <Star className="w-3 h-3" />,
  PRACTICE: <Leaf className="w-3 h-3" />,
};

// ============================================================================
// Helpers
// ============================================================================

export function formatRelativeTime(iso: string, t?: (k: string) => string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  // resolveRel: usa i18n se t() disponível, senão fallback PT-BR inline (preserva compat com testes existentes)
  const resolveRel = (ptBr: string) => (t ? t(`post.${ptBr === 'agora' ? 'justNow' : ptBr.endsWith('min') ? 'suffixMin' : ptBr.endsWith('h') ? 'suffixHour' : ptBr.endsWith('d') ? 'suffixDay' : ptBr.endsWith('m') ? 'suffixMonth' : 'suffixYear'}`) : ptBr);
  if (sec < 60) return resolveRel('agora');
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}${resolveRel('min')}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}${resolveRel('h')}`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}${resolveRel('d')}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}${resolveRel('m')}`;
  return `${Math.floor(months / 12)}${resolveRel('a')}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ============================================================================
// PostCard
// ============================================================================

export interface PostCardProps {
  post: Post;
  currentUserId?: string | null;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onReport,
}: PostCardProps) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fecha menu ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const isAuthor = Boolean(
    currentUserId && currentUserId === post.author.id
  );

  const initials = getInitials(post.author.displayName || 'Anônimo');
  const time = formatRelativeTime(post.createdAt, t);

  return (
    <Card className="bg-slate-900/40 border-slate-800/50 hover:border-slate-700/70 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/u/${post.author.handle}`}
            className="flex items-center gap-3 group"
          >
            <Avatar className="w-11 h-11 border-2 border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
              <AvatarImage src={post.author.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                {post.author.displayName}
              </p>
              <p className="text-xs text-slate-500">
                @{post.author.handle} · {time}
              </p>
              {post.author.spiritualTag && (
                <p className="text-xs text-amber-400/80 mt-0.5">
                  {post.author.spiritualTag}
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2 relative">
            {post.tradition && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs bg-gradient-to-br border',
                  TRADITION_COLORS[post.tradition] ||
                    'from-slate-500/20 to-slate-500/20 text-slate-300 border-slate-500/30'
                )}
              >
                {TRADITION_LABELS[post.tradition] || post.tradition}
              </Badge>
            )}

            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label={t('post.moreOptions')}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 z-10 min-w-[160px] rounded-lg border border-slate-800 bg-slate-950/95 shadow-lg shadow-black/50 backdrop-blur py-1"
                >
                  {isAuthor && onEdit && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(post.id);
                      }}
                      className="w-full text-left px-3 py-2.5 min-h-[44px] text-sm text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 flex items-center gap-2 focus-visible:outline-none focus-visible:bg-slate-800/70 focus-visible:text-slate-100"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('post.edit')}
                    </button>
                  )}
                  {isAuthor && onDelete && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(post.id);
                      }}
                      className="w-full text-left px-3 py-2.5 min-h-[44px] text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 flex items-center gap-2 focus-visible:outline-none focus-visible:bg-red-500/10 focus-visible:text-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('post.delete')}
                    </button>
                  )}
                  {!isAuthor && (
                    <div role="menuitem" onClick={(e) => e.stopPropagation()}>
                      <FlagButton
                        targetType="POST"
                        targetId={post.id}
                        variant="menu-item"
                        label={t('post.report')}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.groupName && post.groupSlug && (
          <Link
            href={`/groups/${post.groupSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Users className="w-3 h-3" />
            {t('post.groupLabelPrefix')} <span className="font-medium">{post.groupName}</span>
          </Link>
        )}

        {post.references && post.references.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              {t('post.referencesTitle')}
            </p>
            {post.references.map((ref, i) => (
              <a
                key={i}
                href={ref.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-slate-400 hover:text-emerald-300 transition-colors"
              >
                • {ref.title}
                {ref.year && <span className="text-slate-600"> ({ref.year})</span>}
                {ref.doi && <span className="text-slate-600"> · DOI: {ref.doi}</span>}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-1">
            <ActionButton
              icon={
                <Heart
                  className={cn(
                    'w-4 h-4',
                    post.liked && 'fill-red-400 text-red-400'
                  )}
                />
              }
              count={post.likesCount}
              active={post.liked}
              onClick={() => onLike?.(post.id)}
              label={t('post.like')}
              activeColor="text-red-400"
            />
            <ActionButton
              icon={<MessageCircle className="w-4 h-4" />}
              count={post.commentsCount}
              onClick={() => onComment?.(post.id)}
              label={t('post.comment')}
            />
            {(() => {
              const shareUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/feed#post-${post.id}`
                : `/feed#post-${post.id}`;
              return (
                <ShareButton
                  data={{
                    title: `Post de ${post.author.displayName}`,
                    text: post.content.slice(0, 120),
                    url: shareUrl,
                  }}
                  count={post.sharesCount}
                  variant="pill"
                  onShared={(method) => {
                    // Notifica o handler externo para tracking
                    onShare?.(post.id);
                    // Analytics poderia ser disparado aqui
                    if (typeof console !== 'undefined' && process.env.NODE_ENV !== 'production') {
                      console.debug('[share]', { postId: post.id, method });
                    }
                  }}
                />
              );
            })()}
          </div>
          <BookmarkButton
            postId={post.id}
            bookmarked={Boolean(post.bookmarked)}
            label={t('post.bookmark')}
            size="sm"
            onChange={(b) => {
              // Mantém o onBookmark do parent (analytics) sem quebrar o contrato
              onBookmark?.(post.id);
              void b;
            }}
          />
          {!isAuthor && (
            <FlagButton targetType="POST" targetId={post.id} variant="icon" />
          )}
        </div>

        {/* ReactionBar — feedback emocional além do like binário */}
        <ReactionBar
          targetType="POST"
          targetId={post.id}
          isAuthenticated={Boolean(currentUserId)}
          variant="post"
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ActionButton
// ============================================================================

interface ActionButtonProps {
  icon: React.ReactNode;
  count: number;
  active?: boolean;
  onClick?: () => void;
  label: string;
  activeColor?: string;
}

function ActionButton({
  icon, count, active, onClick, label, activeColor = 'text-amber-400',
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        active
          ? activeColor
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
      )}
      aria-label={label}
      aria-pressed={Boolean(active)}
    >
      {icon}
      <span className="text-xs font-medium">{count}</span>
    </button>
  );
}
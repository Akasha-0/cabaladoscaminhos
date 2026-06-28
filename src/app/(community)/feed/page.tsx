'use client';

// ============================================================================
// COMMUNITY FEED — Timeline principal da comunidade Akasha
// ============================================================================
// Conectado à API real (`/api/posts`) via hooks `useFeed`/`useLikePost`/etc.
// Mocks removidos — agora o feed consome dados persistidos no Prisma.
// ============================================================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useHaptic } from '@/hooks/useHaptic';
import {
  Sparkles, Users, BookOpen, Hash, TrendingUp, Filter,
  PenSquare, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { PostCard } from '@/components/community/PostCard';
import dynamic from 'next/dynamic';
import { FeedSkeleton } from '@/components/community/FeedSkeleton';
import { FeedSidebar } from '@/components/community/FeedSidebar';
// ============================================================================
// Code split — CreatePost (288 lines + useGroupsList + form state) is loaded
// lazily so its JS isn't in the feed route's initial bundle. SSR HTML still
// renders the compose box immediately (default `ssr: true`).
// ============================================================================
const CreatePost = dynamic(
  () => import('@/components/community/CreatePost').then((m) => m.CreatePost),
  {
    loading: () => (
      <div className="card-spiritual bg-slate-900/40 border-slate-800/30 rounded-xl p-4 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800/50" />
          <div className="flex-1 space-y-2">
            <div className="h-10 bg-slate-800/40 rounded" />
            <div className="h-3 bg-slate-800/40 rounded w-1/3" />
          </div>
        </div>
      </div>
    ),
  }
);
import { FeedEmpty } from '@/components/community/FeedEmpty';
import { FeedError } from '@/components/community/FeedErrorBoundary';
import {
  useFeed,
  useCreatePost,
  useLikePost,
  useDeletePost,
} from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/lib/i18n/useT';

// ============================================================
// CONSTANTS
// ============================================================

const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  xamanismo: 'Xamanismo',
  tantra: 'Tantra',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
};

// MAIN FEED PAGE
// ============================================================

type FilterKey = 'all' | 'seguindo' | 'grupos' | 'tendencias' | 'para-voce';

export default function CommunityFeedPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const { light: lightHaptic } = useHaptic();
  const t = useT();

  // Hooks do feed — passa o filter ativo pro recommendation engine quando for 'para-voce'
  const feed = useFeed({
    limit: 20,
    filter: filter === 'para-voce' ? 'para-voce' : undefined,
  });
  const { createPost, loading: creating } = useCreatePost({ prependPost: feed.prependPost });
  const { toggleLike } = useLikePost(feed);
  const { deletePost } = useDeletePost({ removePost: feed.removePost });

  // Auth — pra saber se o usuário é dono de cada post (mostra menu editar/deletar)
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  // Handlers do PostCard
  const handleLike = (id: string) => void toggleLike(id);
  const handleDelete = async (id: string) => {
    if (!confirm(t('feed.deleteConfirm'))) return;
    const r = await deletePost(id);
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[feed] ${t('feed.deleteFailed')}`, r.error);
    }
  };
  const handleCreate = async (input: Parameters<typeof createPost>[0]) => {
    const r = await createPost(input);
    return { ok: r.ok, error: r.error };
  };
  const userInitials = (user?.email?.[0] ?? 'V').toUpperCase() + 'C';

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main feed column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  {t('feed.title')}
                </h1>
                <p className="text-sm text-slate-400 font-raleway mt-1">
                  {t('feed.subtitle')}
                </p>
              </div>
            </div>

            {/* Filter tabs — pr-4 gives breathing room when scrolling right on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-4 scrollbar-thin">
              <FilterChip
                icon={<Sparkles className="w-3 h-3" />}
                label={t('feed.filterForYou')}
                active={filter === 'para-voce'}
                onClick={() => setFilter('para-voce')}
              />
              <FilterChip
                icon={<Filter className="w-3 h-3" />}
                label={t('feed.filterAll')}
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterChip
                icon={<Users className="w-3 h-3" />}
                label={t('feed.filterFollowing')}
                active={filter === 'seguindo'}
                onClick={() => setFilter('seguindo')}
              />
              <FilterChip
                icon={<Hash className="w-3 h-3" />}
                label={t('feed.filterGroups')}
                active={filter === 'grupos'}
                onClick={() => setFilter('grupos')}
              />
              <FilterChip
                icon={<TrendingUp className="w-3 h-3" />}
                label={t('feed.filterTrending')}
                active={filter === 'tendencias'}
                onClick={() => setFilter('tendencias')}
              />
            </div>

            {/* Compose (desktop / tablet) — mobile usa BottomSheet via FAB */}
            <div className="hidden md:block">
              <CreatePost onCreate={handleCreate} loading={creating} userInitials={userInitials} />
            </div>

            {/* Posts */}
            {feed.loading && feed.posts.length === 0 ? (
              <FeedSkeleton count={3} />
            ) : feed.error && feed.posts.length === 0 ? (
              <FeedError error={feed.error} onRetry={feed.refresh} />
            ) : feed.posts.length === 0 ? (
              <FeedEmpty
                title={
                  filter === 'para-voce'
                    ? t('feed.emptyForYouTitle')
                    : t('feed.emptyTitle')
                }
                message={
                  filter === 'para-voce'
                    ? t('feed.emptyForYouMessage')
                    : t('feed.emptyMessage')
                }
              />
            ) : (
              <>
                <div className="space-y-4" data-testid="posts-list">
                  {feed.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                      onLike={handleLike}
                      onComment={(id) => {
                        // eslint-disable-next-line no-console
                        console.log('comment', id);
                      }}
                      onShare={(id) => {
                        // eslint-disable-next-line no-console
                        console.log('share', id);
                      }}
                      onBookmark={(id) => {
                        // eslint-disable-next-line no-console
                        console.log('bookmark', id);
                      }}
                      onEdit={(id) => {
                        // eslint-disable-next-line no-console
                        console.log('edit', id);
                      }}
                      onDelete={handleDelete}
                      onReport={(id) => {
                        // eslint-disable-next-line no-console
                        console.log('report', id);
                      }}
                    />
                  ))}
                </div>

                {/* Carregar mais */}
                {feed.hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={feed.loadMore}
                      disabled={feed.loadingMore}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      data-testid="load-more"
                    >
                      {feed.loadingMore ? t('feed.loadingMore') : t('feed.loadMore')}
                    </Button>
                  </div>
                )}

                {/* Erro inline (após já ter posts) */}
                {feed.error && (
                  <FeedError error={feed.error} onRetry={feed.refresh} />
                )}
              </>
            )}
          </div>

          {/* Sidebar (lazy) */}
          <div className="hidden lg:block">
            <FeedSidebar />
          </div>
        </div>
      </div>

      {/* FAB mobile — abre CreatePost em BottomSheet */}
      <button
        type="button"
        onClick={() => {
          lightHaptic();
          setComposeOpen(true);
        }}
        className="md:hidden fixed right-4 z-30 min-h-[56px] min-w-[56px] rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-violet-500 text-white shadow-lg shadow-amber-500/30 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        }}
        aria-label={t('feed.composeDesktopAria')}
        data-testid="mobile-compose-fab"
      >
        <PenSquare className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* BottomSheet — compose no mobile */}
      <BottomSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title={t('feed.composeSheetTitle')}
        description={t('feed.composeSheetDescription')}
        height="auto"
      >
        <CreatePost
          onCreate={async (input) => {
            const r = await handleCreate(input);
            if (r.ok) setComposeOpen(false);
            return r;
          }}
          loading={creating}
          userInitials={userInitials}
        />
      </BottomSheet>
    </div>
  );
}

function FilterChip({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[44px]',
        active
          ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border border-amber-500/30'
          : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-slate-200 hover:border-slate-600/50'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
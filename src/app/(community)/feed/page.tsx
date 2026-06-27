'use client';

// ============================================================================
// COMMUNITY FEED — Timeline principal da comunidade Akasha
// ============================================================================
// Conectado à API real (`/api/posts`) via hooks `useFeed`/`useLikePost`/etc.
// Mocks removidos — agora o feed consome dados persistidos no Prisma.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Users, BookOpen, Hash, TrendingUp, Filter,
  Heart, MessageCircle, Share2, Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { PostCard } from '@/components/community/PostCard';
import { CreatePost } from '@/components/community/CreatePost';
import { FeedSkeleton } from '@/components/community/FeedSkeleton';
import { FeedEmpty } from '@/components/community/FeedEmpty';
import { FeedError } from '@/components/community/FeedErrorBoundary';
import {
  useFeed,
  useCreatePost,
  useLikePost,
  useDeletePost,
} from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

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

// ============================================================
// SIDEBAR (mantida — IA suggestions e CTA)
// =========================================================================

function Sidebar() {
  return (
    <div className="space-y-4">
      <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Tradições em destaque
          </h3>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          {['cabala', 'ifa', 'xamanismo', 'tantra', 'reiki'].map((t) => (
            <Link
              key={t}
              href={`/groups/${t}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-all group"
            >
              <span className="text-sm text-slate-300 group-hover:text-amber-300 transition-colors">
                {TRADITION_LABELS[t] || t}
              </span>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                {(Math.floor(Math.random() * 900) + 100)}+ membros
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="card-spiritual bg-gradient-to-br from-violet-900/30 to-slate-900/90 border-violet-500/20">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Sugestões da Akasha IA
          </h3>
          <p className="text-xs text-slate-500 mt-1">Baseado no seu mapa espiritual</p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <SuggestionItem
            title="Como Escorpião pode usar a meditação Vipassana"
            reason="seu signo lunar"
          />
          <SuggestionItem
            title="Estudo: Reiki em pacientes oncológicos (2023)"
            reason="tradição que você segue"
          />
          <SuggestionItem
            title="Ayahuasca e neuroplasticidade — revisão de 47 papers"
            reason="tópico que você curtiu"
          />
        </CardContent>
      </Card>

      <Card className="card-spiritual bg-gradient-to-br from-amber-500/10 to-violet-500/10 border-amber-500/20">
        <CardContent className="pt-4 text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-amber-400" />
          <p className="text-sm text-slate-200">Complete seu mapa espiritual</p>
          <p className="text-xs text-slate-400">
            Quanto mais dados você compartilhar, mais personalizadas são as sugestões da IA
          </p>
          <Button
            variant="outline"
            className="w-full mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            Ver meu perfil espiritual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SuggestionItem({ title, reason }: { title: string; reason: string }) {
  return (
    <Link
      href="/library"
      className="block p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-all group"
    >
      <p className="text-sm text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">
        {title}
      </p>
      <p className="text-xs text-slate-500 mt-1">Por causa de: {reason}</p>
    </Link>
  );
}

// ============================================================
// MAIN FEED PAGE
// ============================================================

type FilterKey = 'all' | 'seguindo' | 'grupos' | 'tendencias';

export default function CommunityFeedPage() {
  const [filter, setFilter] = useState<FilterKey>('all');

  // Hooks do feed
  const feed = useFeed({ limit: 20 });
  const { createPost, loading: creating } = useCreatePost({ prependPost: feed.prependPost });
  const { toggleLike } = useLikePost(feed);
  const { deletePost } = useDeletePost({ removePost: feed.removePost });

  // Auth — pra saber se o usuário é dono de cada post (mostra menu editar/deletar)
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  // Handlers do PostCard
  const handleLike = (id: string) => void toggleLike(id);
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;
    const r = await deletePost(id);
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.warn('[feed] Falha ao deletar:', r.error);
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
                  🌌 Akasha — Comunidade Viva
                </h1>
                <p className="text-sm text-slate-400 font-raleway mt-1">
                  Compartilhe, aprenda e evolua junto
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <FilterChip
                icon={<Sparkles className="w-3 h-3" />}
                label="Tudo"
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterChip
                icon={<Users className="w-3 h-3" />}
                label="Seguindo"
                active={filter === 'seguindo'}
                onClick={() => setFilter('seguindo')}
              />
              <FilterChip
                icon={<Hash className="w-3 h-3" />}
                label="Meus grupos"
                active={filter === 'grupos'}
                onClick={() => setFilter('grupos')}
              />
              <FilterChip
                icon={<TrendingUp className="w-3 h-3" />}
                label="Tendências"
                active={filter === 'tendencias'}
                onClick={() => setFilter('tendencias')}
              />
            </div>

            {/* Compose */}
            <CreatePost onCreate={handleCreate} loading={creating} userInitials={userInitials} />

            {/* Posts */}
            {feed.loading && feed.posts.length === 0 ? (
              <FeedSkeleton count={3} />
            ) : feed.error && feed.posts.length === 0 ? (
              <FeedError error={feed.error} onRetry={feed.refresh} />
            ) : feed.posts.length === 0 ? (
              <FeedEmpty />
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
                      {feed.loadingMore ? 'Carregando…' : 'Carregar mais'}
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

          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
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
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
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
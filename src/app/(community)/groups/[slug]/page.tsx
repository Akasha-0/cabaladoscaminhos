'use client';

// ============================================================================
// GROUP PAGE — /groups/[slug]
// ============================================================================
// Página de um grupo por tradição. Conectado à API real:
//   - Header com cover, avatar, nome, descrição, member count
//   - Botão "Entrar" / "Sair" / "Membro"
//   - Feed do grupo (posts filtrados por groupId)
//   - Tabs: Posts, Membros, Sobre, Regras
//   - Lista de moderadores
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users, MessageCircle, ArrowLeft, Check, Plus,
  Loader2, Lock, Globe, Shield, Star,
} from 'lucide-react';

import { useGroup, useGroupMembership, useGroupMembers, useGroupPosts } from '@/hooks/useGroups';
import { useCreatePost } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { CreatePost } from '@/components/community/CreatePost';
import { FeedSkeleton } from '@/components/community/FeedSkeleton';
import { FeedEmpty } from '@/components/community/FeedEmpty';
import { FeedError } from '@/components/community/FeedErrorBoundary';
import { cn } from '@/lib/utils';

// ============================================================
// Helpers visuais — fallback emoji/cor por tradição
// ============================================================

const TRADITION_COLOR: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  ifa: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  astrologia: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  tantra: 'from-rose-500/20 to-fuchsia-500/20 border-rose-500/30',
  reiki: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30',
  meditacao: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  xamanismo: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/30',
  'cristianismo-mistico': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  sufismo: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  taoismo: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30',
  umbanda: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  candomble: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
};

const TRADITION_EMOJI: Record<string, string> = {
  cabala: '✡️',
  ifa: '🪶',
  astrologia: '♈',
  tantra: '🕉️',
  reiki: '🔆',
  meditacao: '🧘',
  xamanismo: '🌿',
  'cristianismo-mistico': '✝️',
  sufismo: '☪️',
  taoismo: '☯️',
  umbanda: '🪘',
  candomble: '🌍',
};

// ============================================================
// MAIN
// ============================================================

export default function GroupPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { user } = useAuth();
  const devUserId = user?.id ?? undefined;

  // Hooks top-level (regra do React — não chamar dentro de condicionais)
  const { group, loading, error, refresh } = useGroup(slug, devUserId);
  const { members, refresh: refreshMembers } = useGroupMembers(slug, devUserId);
  const membership = useGroupMembership(slug, {
    onChange: () => {
      refresh();
      refreshMembers();
    },
    ...(devUserId ? { devUserId } : {}),
  });
  const { createPost, loading: creating } = useCreatePost();

  const [activeTab, setActiveTab] = useState<
    'posts' | 'membros' | 'sobre' | 'regras'
  >('posts');

  const userInitials = (user?.email?.[0] ?? 'V').toUpperCase() + 'C';

  // ============================================================
  // Handlers
  // ============================================================

  const handleJoin = async () => {
    const r = await membership.join();
    if (!r.ok && r.error) {
      // eslint-disable-next-line no-console
      console.warn('[group] join falhou:', r.error);
      alert(r.error);
    }
  };

  const handleLeave = async () => {
    if (!group) return;
    if (!confirm(`Tem certeza que deseja sair de ${group.name}?`)) return;
    const r = await membership.leave();
    if (!r.ok && r.error) {
      // eslint-disable-next-line no-console
      console.warn('[group] leave falhou:', r.error);
      alert(r.error);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  if (loading && !group) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="group-loading">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" aria-label="Carregando grupo" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
        <p className="text-slate-300 text-lg">Grupo não encontrado</p>
        <Link href="/groups" className="text-sm text-amber-300 hover:text-amber-200">
          ← Ver todos os grupos
        </Link>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  const colorClass =
    TRADITION_COLOR[group.tradition] ||
    'from-slate-500/20 to-slate-500/20 border-slate-500/30';
  const emoji = TRADITION_EMOJI[group.tradition] || '🌌';

  const canJoin = !group.isMember && group.isPublic;
  const canLeave = group.isMember && group.viewerRole !== 'ADMIN';
  const isAdminOrMod = group.viewerRole === 'ADMIN' || group.viewerRole === 'MODERATOR';

  return (
    <div className="min-h-screen" data-testid="group-page" data-group-slug={slug}>
      {/* Hero / Cover */}
      <div className={cn('relative h-48 md:h-64 bg-gradient-to-br border-b', colorClass)}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top right, rgba(251, 191, 36, 0.3), transparent 60%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 h-full flex items-end pb-6">
          <Link
            href="/groups"
            className="text-slate-300 hover:text-amber-300 text-sm flex items-center gap-1 mb-4 min-h-[44px]"
            data-testid="back-to-groups"
          >
            <ArrowLeft className="w-3 h-3" />
            Todos os grupos
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 md:-mt-12 relative z-10">
        {/* Group identity */}
        <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border-2 border-slate-800/50 flex items-center justify-center text-5xl"
                data-testid="group-emoji"
              >
                {group.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.iconUrl}
                    alt={group.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  emoji
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h1
                      className="text-2xl md:text-3xl font-cinzel text-slate-100"
                      data-testid="group-name"
                    >
                      {group.name}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                      {group.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canJoin && (
                      <Button
                        onClick={handleJoin}
                        disabled={membership.loading}
                        data-testid="join-button"
                        className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
                      >
                        {membership.loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Entrar
                      </Button>
                    )}
                    {canLeave && (
                      <Button
                        onClick={handleLeave}
                        disabled={membership.loading}
                        variant="outline"
                        data-testid="leave-button"
                        className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                      >
                        {membership.loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Membro
                      </Button>
                    )}
                    {group.isMember && group.viewerRole === 'ADMIN' && (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500/40 text-amber-300"
                        data-testid="admin-badge"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Admin
                      </Badge>
                    )}
                    {group.isMember && group.viewerRole === 'MODERATOR' && (
                      <Badge
                        variant="outline"
                        className="text-xs border-violet-500/40 text-violet-300"
                        data-testid="moderator-badge"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Moderador
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 flex-wrap">
                  <span
                    className="flex items-center gap-1.5"
                    data-testid="members-count"
                  >
                    <Users className="w-4 h-4" />
                    {group.membersCount} membros
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {group.postsCount} posts
                  </span>
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                    {group.isPublic ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" /> público
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" /> privado
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                    tradição: {group.tradition}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50 mt-6">
            <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
            <TabsTrigger value="membros" data-testid="tab-members">Membros</TabsTrigger>
            <TabsTrigger value="sobre" data-testid="tab-about">Sobre</TabsTrigger>
            <TabsTrigger value="regras" data-testid="tab-rules">Regras</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <div className="space-y-3">
                {group.isMember ? (
                  <CreatePost
                    onCreate={async (input) => {
                      const r = await createPost(input);
                      return { ok: r.ok, error: r.error };
                    }}
                    loading={creating}
                    userInitials={userInitials}
                    defaultGroupSlug={slug}
                    hideGroupSelector
                    {...(devUserId ? { devUserId } : {})}
                  />
                ) : (
                  <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-slate-400">
                        Entre no grupo para publicar e ver posts completos.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <GroupFeed slug={slug} />
              </div>

              <Sidebar
                group={group}
                members={members}
              />
            </div>
          </TabsContent>

          <TabsContent value="membros" className="mt-6">
            <GroupMembers
              slug={slug}
              members={members}
              isAdminOrMod={isAdminOrMod}
              onChange={refreshMembers}
            />
          </TabsContent>

          <TabsContent value="sobre" className="mt-6">
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-base text-slate-100">
                  Sobre {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-300 leading-relaxed">
                {group.longDescription || group.description}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regras" className="mt-6">
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-base text-slate-100">
                  Regras da comunidade
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                {group.rules.length === 0 ? (
                  <p className="text-slate-400">Sem regras publicadas.</p>
                ) : (
                  <ol className="space-y-2 list-decimal list-inside text-slate-300">
                    {group.rules.map((rule, i) => (
                      <li key={i} className="leading-relaxed">
                        {rule}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================================
// GROUP FEED — usa useGroupPosts (cursor pagination)
// ============================================================================

function GroupFeed({ slug }: { slug: string }) {
  const { posts, loading, loadingMore, error, hasMore, loadMore, refresh } =
    useGroupPosts(slug);

  if (loading && posts.length === 0) {
    return <FeedSkeleton count={3} />;
  }
  if (error && posts.length === 0) {
    return <FeedError error={error} onRetry={refresh} />;
  }
  if (posts.length === 0) {
    return (
      <FeedEmpty
        title="Nenhum post no grupo ainda"
        subtitle="Seja o primeiro a compartilhar algo."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3" data-testid="group-posts-list">
        {posts.map((p) => (
          <GroupPostCard key={p.id} post={p} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {loadingMore ? 'Carregando…' : 'Carregar mais'}
          </Button>
        </div>
      )}
      {error && <FeedError error={error} onRetry={refresh} />}
    </div>
  );
}

// ============================================================================
// GROUP POST CARD (resumido para o feed de grupo)
// ============================================================================

function GroupPostCard({
  post,
}: {
  post: {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
  };
}) {
  const initials = post.authorId.slice(0, 2).toUpperCase();
  const displayName = post.authorId.startsWith('seed-')
    ? `Membro ${post.authorId.slice(-6).toUpperCase()}`
    : `Membro ${post.authorId.slice(-4)}`;

  return (
    <Card
      data-testid="group-post"
      data-post-id={post.id}
      className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50"
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-amber-500/20 text-amber-300 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-slate-200">{displayName}</p>
            <p className="text-xs text-slate-500">
              {new Date(post.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
          {post.content}
        </p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/50 text-xs text-slate-500">
          <span>♥ {post.likesCount}</span>
          <span>💬 {post.commentsCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SIDEBAR — descrição + moderadores
// ============================================================================

function Sidebar({
  group,
  members,
}: {
  group: {
    name: string;
    longDescription: string | null;
    description: string;
    tradition: string;
  };
  members: Array<{
    userId: string;
    displayName: string;
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  }>;
}) {
  const mods = members
    .filter((m) => m.role === 'ADMIN' || m.role === 'MODERATOR')
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <CardTitle className="text-sm text-amber-300 flex items-center gap-2">
            Sobre o grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 text-xs text-slate-400 leading-relaxed">
          {group.longDescription || group.description}
        </CardContent>
      </Card>

      <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <CardTitle className="text-sm text-amber-300 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Moderadores
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2" data-testid="moderators-list">
          {mods.length === 0 ? (
            <p className="text-xs text-slate-500">Sem moderadores ainda.</p>
          ) : (
            mods.map((m) => (
              <div key={m.userId} className="flex items-center gap-2 text-xs">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-violet-500/20 text-violet-300 text-[10px]">
                    {m.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-300 truncate flex-1">
                  {m.displayName}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-violet-500/30 text-violet-300"
                >
                  {m.role}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MEMBERS LIST — com promote/remove (só ADMIN/MODERATOR)
// ============================================================================

function GroupMembers({
  slug,
  members,
  isAdminOrMod,
  onChange,
}: {
  slug: string;
  members: Array<{
    userId: string;
    displayName: string;
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
    joinedAt: string;
    invitedBy: string | null;
  }>;
  isAdminOrMod: boolean;
  onChange: () => void;
}) {
  const { promote, remove, loading } = useGroupMembership(slug, {
    onChange,
  });

  if (members.length === 0) {
    return (
      <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardContent className="py-12 text-center">
          <Users className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">Nenhum membro ainda.</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...members].sort((a, b) => {
    const roleOrder = { ADMIN: 0, MODERATOR: 1, MEMBER: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      data-testid="members-grid"
    >
      {sorted.map((m) => (
        <Card
          key={m.userId}
          className="card-spiritual bg-slate-900/50 border-slate-800/50"
          data-testid={`member-${m.userId}`}
        >
          <CardContent className="pt-4 flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-amber-500/20 text-amber-300">
                {m.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate">
                {m.displayName}
              </p>
              <p className="text-xs text-slate-500">
                desde {new Date(m.joinedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                m.role === 'ADMIN'
                  ? 'border-amber-500/40 text-amber-300'
                  : m.role === 'MODERATOR'
                    ? 'border-violet-500/40 text-violet-300'
                    : 'border-slate-700 text-slate-500'
              )}
            >
              {m.role}
            </Badge>
            {isAdminOrMod && m.role === 'MEMBER' && (
              <Button
                size="sm"
                variant="ghost"
                disabled={loading}
                onClick={() => promote(m.userId, 'MODERATOR')}
                data-testid={`promote-${m.userId}`}
                className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                title="Promover a Moderador"
              >
                <Star className="w-3 h-3" />
              </Button>
            )}
            {isAdminOrMod && m.role !== 'ADMIN' && (
              <Button
                size="sm"
                variant="ghost"
                disabled={loading}
                onClick={() => {
                  if (confirm(`Remover ${m.displayName} do grupo?`)) {
                    void remove(m.userId);
                  }
                }}
                data-testid={`remove-${m.userId}`}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                title="Remover do grupo"
              >
                ✕
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

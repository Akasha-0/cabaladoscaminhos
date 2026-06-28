'use client';

// ============================================================================
// PERFIL PÚBLICO — /u/[handle]
// ============================================================================
// Mostra o perfil espiritual do usuário, contadores, e ações (seguir, etc).
//
// Dados vêm de `/api/users/profile?handle=<handle>` (Prisma User +
// MapaNatal). Campos ausentes no schema (avatar, bio, cover) retornam `null`
// e a UI renderiza estados vazios honestos — sem mocks.
//
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  UserPlus, UserCheck, MessageCircle, MapPin, Calendar, Star,
  Sparkles, Users, BookOpen, Moon, Sun, Flame, Heart,
  Loader2, Share2, MoreHorizontal, Lock, Globe, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES — alinhado com /api/users/profile (PublicProfileDto)
// ============================================================

type SpiritualTag = {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  color: string;
  emptyHint?: string;
};

interface PublicProfile {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  joinedAt: string; // ISO

  // Spiritual
  odu: string | null;
  orixa: string | null;
  elemento: string | null;
  signoSolar: string | null;
  signoLunar: string | null;
  ascendente: string | null;
  caminhoDeVida: number | null;

  // Stats
  followersCount: number;
  followingCount: number;
  postsCount: number;
  groupsCount: number;

  // Flags
  isOwn: boolean;
  isPrivate: boolean;
}

// ============================================================
// MAIN
// ============================================================

export default function PublicProfilePage() {
  const params = useParams<{ handle: string }>();
  const handle = (params?.handle as string | undefined) ?? '';

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'library' | 'groups' | 'about'>('posts');

  const fetchProfile = useCallback(async () => {
    if (!handle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/users/profile?handle=${encodeURIComponent(handle)}`
      );
      const body = await res.json();
      if (!res.ok || body?.error) {
        const msg = body?.error?.message ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setProfile(body.data as PublicProfile);
    } catch (e) {
      console.error('[profile-page] fetch error:', e);
      setError(e instanceof Error ? e.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`/api/users/${profile.id}/follow`, {
        method: 'POST',
      });
      if (!res.ok) {
        // 401 esperado quando não logado — silencioso
        if (res.status !== 401) {
          console.warn('[profile-page] follow falhou:', res.status);
        }
        return;
      }
      // Optimistic update local
      setProfile((p) =>
        p
          ? {
              ...p,
              isFollowing: !p.isFollowing,
              followersCount: p.isFollowing
                ? p.followersCount - 1
                : p.followersCount + 1,
            }
          : p
      );
    } catch (e) {
      console.warn('[profile-page] follow error:', e);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return <ProfileSkeleton />;
  }

  // ─── Error / Not found ──────────────────────────────────────────────────
  if (error || !profile) {
    return <ProfileError message={error ?? 'Perfil não encontrado'} />;
  }

  const initials = (profile.displayName || profile.handle)
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '??';

  const joinedAtLabel = formatMonthYear(profile.joinedAt);

  return (
    <div className="min-h-screen">
      {/* Cover + Avatar */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-violet-900/40 via-amber-900/30 to-pink-900/40 overflow-hidden">
        {profile.coverUrl ? (
          <Image
            src={profile.coverUrl}
            alt=""
            width={1280}
            height={256}
            className="w-full h-full object-cover"
            loading="eager"
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        ) : (
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at top right, rgba(251, 191, 36, 0.3), transparent 60%)',
          }} />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 md:-mt-20 relative z-10">
        {/* Identity block */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 border-slate-950 shadow-2xl">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500/30 to-violet-500/30 text-amber-200 text-2xl sm:text-3xl md:text-4xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-cinzel text-slate-100">
                  {profile.displayName}
                </h1>
                <p className="text-slate-400 text-sm">@{profile.handle}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Na comunidade desde {joinedAtLabel}
                </p>
              </div>

              {!profile.isOwn && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleFollow}
                    variant={profile.isFollowing ? 'outline' : 'default'}
                    className={cn(
                      profile.isFollowing
                        ? 'border-slate-700 bg-slate-800/50'
                        : 'bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0'
                    )}
                  >
                    {profile.isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Seguindo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Seguir
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio — honest empty state */}
        {profile.bio ? (
          <p className="text-slate-300 leading-relaxed mb-6 max-w-2xl">{profile.bio}</p>
        ) : (
          <p className="text-slate-500 text-sm italic mb-6 max-w-2xl">
            Este membro ainda não escreveu uma bio.
          </p>
        )}

        {/* Spiritual map */}
        <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 mb-6">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                Mapa Espiritual
              </span>
              {!profile.isPrivate && (
                <Badge variant="outline" className="ml-2 text-xs border-emerald-500/30 text-emerald-300 bg-emerald-500/5">
                  <Globe className="w-3 h-3 mr-1" />
                  público
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {buildSpiritualTags(profile).map((tag) => (
                <SpiritualTagCard key={tag.label} tag={tag} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard label="Posts" value={profile.postsCount} />
          <StatCard label="Seguidores" value={profile.followersCount} />
          <StatCard label="Seguindo" value={profile.followingCount} />
          <StatCard label="Grupos" value={profile.groupsCount} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'posts')}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-3">
              {profile.isPrivate ? (
                <PrivateProfileNotice handle={profile.handle} />
              ) : (
                <p className="text-center text-slate-500 py-12">
                  Posts de @{profile.handle} aparecerão aqui
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="library" className="mt-6">
            <p className="text-center text-slate-500 py-12">
              Artigos salvos aparecerão aqui
            </p>
          </TabsContent>
          <TabsContent value="groups" className="mt-6">
            <p className="text-center text-slate-500 py-12">
              Grupos que @{profile.handle} participa
            </p>
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardContent className="pt-4 space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Nome completo</p>
                  <p className="text-slate-200">{profile.displayName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Na comunidade desde</p>
                  <p className="text-slate-200">{joinedAtLabel}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Orixá regente</p>
                  <p className={profile.orixa ? 'text-amber-300' : 'text-slate-500 italic'}>
                    {profile.orixa ?? 'ainda não calculado'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Odu de nascimento</p>
                  <p className={profile.odu ? 'text-violet-300' : 'text-slate-500 italic'}>
                    {profile.odu ?? 'ainda não calculado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 text-center hover:bg-slate-800/50 transition-all">
      <p className="text-xl font-bold text-amber-300">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function PrivateProfileNotice({ handle }: { handle: string }) {
  return (
    <Card className="card-spiritual bg-slate-900/50 border-slate-800/50 text-center">
      <CardContent className="pt-8 pb-8 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center">
          <Lock className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-slate-300">Este perfil é privado</p>
        <p className="text-sm text-slate-500">Siga @{handle} para ver os posts</p>
      </CardContent>
    </Card>
  );
}

function SpiritualTagCard({ tag }: { tag: SpiritualTag }) {
  return (
    <div
      className={cn(
        'p-3 rounded-xl border text-center transition-all hover:scale-[1.02]',
        tag.color
      )}
    >
      <div className="flex items-center justify-center gap-1 mb-1 opacity-80">
        {tag.icon}
        <span className="text-xs">{tag.label}</span>
      </div>
      <p className="text-base font-bold">
        {tag.value ?? (
          <span className="text-xs font-normal italic opacity-60">
            {tag.emptyHint ?? '—'}
          </span>
        )}
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      <p className="text-sm">Carregando perfil…</p>
    </div>
  );
}

function ProfileError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-3">
      <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-rose-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-200">
        Não conseguimos carregar este perfil
      </h2>
      <p className="text-sm text-slate-500 max-w-md">{message}</p>
      <p className="text-xs text-slate-600">
        Verifique se o handle está correto ou tente novamente em alguns instantes.
      </p>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function buildSpiritualTags(profile: PublicProfile): SpiritualTag[] {
  return [
    {
      label: 'Caminho de Vida',
      value: profile.caminhoDeVida !== null ? String(profile.caminhoDeVida) : null,
      icon: <Star className="w-3 h-3" />,
      color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      emptyHint: 'ainda não calculado',
    },
    {
      label: 'Signo Solar',
      value: profile.signoSolar,
      icon: <Sun className="w-3 h-3" />,
      color: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
      emptyHint: 'ainda não calculado',
    },
    {
      label: 'Signo Lunar',
      value: profile.signoLunar,
      icon: <Moon className="w-3 h-3" />,
      color: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
      emptyHint: 'ainda não calculado',
    },
    {
      label: 'Ascendente',
      value: profile.ascendente,
      icon: <Sparkles className="w-3 h-3" />,
      color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
      emptyHint: 'ainda não calculado',
    },
    {
      label: 'Odu',
      value: profile.odu,
      icon: <Flame className="w-3 h-3" />,
      color: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
      emptyHint: 'ainda não calculado',
    },
    {
      label: 'Orixá',
      value: profile.orixa,
      icon: <Heart className="w-3 h-3" />,
      color: 'text-pink-300 bg-pink-500/10 border-pink-500/20',
      emptyHint: 'ainda não calculado',
    },
    {
      label: 'Elemento',
      value: profile.elemento,
      icon: <Sparkles className="w-3 h-3" />,
      color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
      emptyHint: '—',
    },
  ];
}

function formatMonthYear(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return '—';
  }
}

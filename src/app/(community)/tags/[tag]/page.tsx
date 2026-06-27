'use client';

// ============================================================================
// TAG PAGE — /tags/[tag] (Onda 12, 2026-06-27)
// ============================================================================
// Lista tudo que usa uma tag específica:
//   - Posts com topic=tag ou tradition=tag
//   - Articles com tag ∈ tags[]
//   - Pessoas (SpiritualProfile) com sinal/odu/orixá tag-related
// ============================================================================

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Users, BookOpen, FileText, Hash,
  Loader2, ChevronLeft, Heart, MessageCircle,
  ChevronRight, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/community/SearchBar';

// ============================================================================
// Tipos
// ============================================================================

interface TagResults {
  tag: string;
  posts: PostHit[];
  articles: ArticleHit[];
  people: UserHit[];
  counts: {
    posts: number;
    articles: number;
    people: number;
    total: number;
  };
  took_ms: number;
}

interface PostHit {
  id: string;
  preview: string;
  content: string;
  authorName: string;
  tradition: string | null;
  topic: string | null;
  groupSlug: string | null;
  groupName: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  url: string;
}

interface ArticleHit {
  id: string;
  slug: string;
  title: string;
  preview: string;
  authors: string[];
  year: number;
  evidenceLevel: string;
  viewCount: number;
  url: string;
}

interface UserHit {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  signoSolar: string | null;
  oduNascimento: string | null;
  orixaRegente: string | null;
  url: string;
}

type TabId = 'all' | 'posts' | 'articles' | 'people';

// ============================================================================
// Constantes
// ============================================================================

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'all', label: 'Tudo', icon: Hash },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'articles', label: 'Artigos', icon: BookOpen },
  { id: 'people', label: 'Pessoas', icon: Users },
];

const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá e Orixás',
  xamanismo: 'Xamanismo',
  tantra: 'Tantra',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
  meditacao: 'Meditação',
  astrologia: 'Astrologia',
};

const EVIDENCE_LABELS: Record<string, string> = {
  ANECDOTAL: 'Anecdótico',
  LOW: 'Baixa evidência',
  MEDIUM: 'Evidência média',
  HIGH: 'Alta evidência',
};

// ============================================================================
// Page (envolto em Suspense por useParams)
// ============================================================================

export default function TagPage() {
  return (
    <Suspense fallback={<TagSkeleton />}>
      <TagPageInner />
    </Suspense>
  );
}

function TagPageInner() {
  const params = useParams();
  const search = useSearchParams();
  const tag = decodeURIComponent((params?.tag as string) ?? '');
  const [type, setType] = useState<TabId>((search?.get('type') as TabId) ?? 'all');
  const [data, setData] = useState<TagResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTag = useCallback(async () => {
    if (!tag) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(tag)}`);
      const body = await res.json();
      if (!res.ok || body.error) {
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      setData(body.data as TagResults);
    } catch (e) {
      console.error('[tag-page] fetch error:', e);
      setError(e instanceof Error ? e.message : 'Erro ao buscar tag');
    } finally {
      setLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    fetchTag();
  }, [fetchTag]);

  // ============================================================================
  // RENDERS
  // ============================================================================

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/explore"
          className="text-xs text-slate-500 hover:text-amber-300 inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" />
          Voltar para Explorar
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Hash className="w-8 h-8 text-cyan-300" />
            <h1 className="text-2xl md:text-3xl font-cinzel text-slate-100">
              {tag || 'Tag'}
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-raleway">
            Tudo sobre <span className="text-cyan-300">#{tag}</span> na comunidade
          </p>
        </div>

        {/* Search bar (caso queira refinar) */}
        <div className="max-w-xl">
          <SearchBar initialQuery={tag} size="md" />
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex items-center gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'posts' ? data?.counts.posts :
              tab.id === 'articles' ? data?.counts.articles :
              tab.id === 'people' ? data?.counts.people :
              data?.counts.total ?? 0;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={type === tab.id}
                onClick={() => setType(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  type === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-200 border border-cyan-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-slate-200',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {data && count > 0 && (
                  <span className="ml-1 text-xs text-slate-500">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && <LoadingTagState />}

        {/* Erro */}
        {error && (
          <Card className="border-red-500/30 bg-red-950/20">
            <CardContent className="pt-6 text-center text-red-300">
              <p>Erro: {error}</p>
              <Button onClick={fetchTag} variant="outline" className="mt-3">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && data && data.counts.total === 0 && (
          <Card className="border-slate-800/50 bg-slate-900/30">
            <CardContent className="pt-8 pb-8 text-center">
              <Hash className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h2 className="text-lg font-semibold text-slate-300 mb-2">
                Nenhum conteúdo com #{tag}
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Essa tag ainda não tem posts, artigos ou pessoas. Que tal contribuir?
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button asChild variant="outline" className="border-slate-700">
                  <Link href="/explore">Buscar outra coisa</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {data && data.counts.total > 0 && (
          <div className="space-y-6">
            {/* Posts */}
            {(type === 'all' || type === 'posts') && data.posts.length > 0 && (
              <section className="space-y-3">
                {type === 'all' && (
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Posts ({data.counts.posts})
                  </h2>
                )}
                {data.posts.map((p) => (
                  <PostCard key={p.id} hit={p} />
                ))}
              </section>
            )}

            {/* Artigos */}
            {(type === 'all' || type === 'articles') && data.articles.length > 0 && (
              <section className="space-y-3">
                {type === 'all' && (
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Artigos ({data.counts.articles})
                  </h2>
                )}
                {data.articles.map((a) => (
                  <ArticleCard key={a.id} hit={a} />
                ))}
              </section>
            )}

            {/* Pessoas */}
            {(type === 'all' || type === 'people') && data.people.length > 0 && (
              <section className="space-y-3">
                {type === 'all' && (
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Pessoas ({data.counts.people})
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.people.map((u) => (
                    <UserCard key={u.id} hit={u} />
                  ))}
                </div>
              </section>
            )}

            {/* Métricas */}
            <div className="text-center text-xs text-slate-500 pt-2">
              {data.counts.total} resultado{data.counts.total !== 1 ? 's' : ''} em {data.took_ms}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponentes
// ============================================================================

function PostCard({ hit }: { hit: PostHit }) {
  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-amber-500/30 transition-all">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 flex items-center justify-center text-amber-300 font-semibold text-sm flex-shrink-0">
            {hit.authorName.slice(-2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
              <span className="text-slate-300 font-medium">{hit.authorName}</span>
              {hit.tradition && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                  {TRADITION_LABELS[hit.tradition] ?? hit.tradition}
                </Badge>
              )}
              {hit.groupName && <span className="text-slate-500">em {hit.groupName}</span>}
              <span className="text-slate-600 ml-auto">{formatTimeAgo(hit.createdAt)}</span>
            </div>
            <Link href={hit.url} className="block group">
              <p
                className="text-sm text-slate-200 leading-relaxed group-hover:text-amber-100 transition-colors"
                dangerouslySetInnerHTML={{ __html: hit.preview }}
              />
            </Link>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {hit.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {hit.commentsCount}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ hit }: { hit: ArticleHit }) {
  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-violet-500/30 transition-all">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-violet-300 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                {EVIDENCE_LABELS[hit.evidenceLevel] ?? hit.evidenceLevel}
              </Badge>
              {hit.year > 0 && <span className="text-slate-500">{hit.year}</span>}
            </div>
            <Link href={hit.url} className="block group">
              <h3
                className="font-semibold text-slate-100 group-hover:text-violet-200 transition-colors"
                dangerouslySetInnerHTML={{ __html: hit.preview }}
              />
            </Link>
            {hit.authors.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{hit.authors.slice(0, 3).join(', ')}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span>{hit.viewCount} leituras</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserCard({ hit }: { hit: UserHit }) {
  return (
    <Link href={hit.url} className="block">
      <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-pink-500/30 transition-all">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-pink-300 font-semibold flex-shrink-0">
              {hit.displayName[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100">{hit.displayName}</h3>
              {hit.bio && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{hit.bio}</p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs flex-wrap">
                {hit.signoSolar && (
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                    ♒ {hit.signoSolar}
                  </Badge>
                )}
                {hit.orixaRegente && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                    {hit.orixaRegente}
                  </Badge>
                )}
                {hit.oduNascimento && (
                  <Badge variant="outline" className="border-rose-500/30 text-rose-300">
                    {hit.oduNascimento}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingTagState() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-slate-800/50 bg-slate-900/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TagSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="h-3 bg-slate-800/50 rounded animate-pulse w-32 mb-4" />
        <div className="h-8 bg-slate-800/50 rounded animate-pulse w-48 mb-2" />
        <div className="h-4 bg-slate-800/50 rounded animate-pulse w-72 mb-6" />
        <LoadingTagState />
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatTimeAgo(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = now - t;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 30 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

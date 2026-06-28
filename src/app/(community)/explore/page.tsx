'use client';

// ============================================================================
// EXPLORAR — /explore (refatorado em 2026-06-27 — Onda 12 Search)
// ============================================================================
// Página de descoberta com search REAL (Postgres full-text via /api/search):
//   - SearchBar com autocomplete no topo
//   - Tabs: Tudo, Posts, Artigos, Pessoas, Grupos, Tags
//   - Resultados com <mark> highlighting
//   - Filtros laterais: tradição, ordenação, data
//   - Empty state + Loading state + Erro state
//   - Suporta query params: ?q=cabala&type=posts&tradition=ifa&tag=meditacao
// ============================================================================

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Users, BookOpen, FileText, Hash, Layers,
  Loader2, ChevronLeft, ChevronRight, Filter,
  Sparkles, Heart, MessageCircle, ExternalLink, X, Eye, Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/community/SearchBar';

// ============================================================================
// Tipos (espelham lib/community/search.ts)
// ============================================================================

type Hit =
  | {
      type: 'post';
      id: string;
      title: string | null;
      preview: string;
      content: string;
      authorId: string;
      authorName: string;
      tradition: string | null;
      topic: string | null;
      groupSlug: string | null;
      groupName: string | null;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
      score: number;
      url: string;
    }
  | {
      type: 'article';
      id: string;
      slug: string;
      title: string;
      preview: string;
      summary: string;
      authors: string[];
      year: number;
      doi: string | null;
      tags: string[];
      tradition: string | null;
      evidenceLevel: string;
      viewCount: number;
      bookmarkCount: number;
      citations: number;
      createdAt: string;
      score: number;
      url: string;
    }
  | {
      type: 'group';
      id: string;
      slug: string;
      name: string;
      preview: string;
      description: string;
      tradition: string;
      membersCount: number;
      postsCount: number;
      createdAt: string;
      score: number;
      url: string;
    }
  | {
      type: 'user';
      id: string;
      userId: string;
      displayName: string;
      handle: string;
      preview: string;
      bio: string | null;
      signoSolar: string | null;
      oduNascimento: string | null;
      orixaRegente: string | null;
      caminhoDeVida: number | null;
      createdAt: string;
      score: number;
      url: string;
    }
  | {
      type: 'tag';
      /** Alias para `tag` — usado em keys/lists. Tags sao identificadas pelo slug. */
      id: string;
      tag: string;
      kind: 'tradition' | 'topic' | 'article_tag';
      count: number;
      score: number;
      url: string;
    };

interface SearchResults {
  query: string;
  type: 'all' | 'posts' | 'articles' | 'users' | 'groups' | 'tags';
  hits: Hit[];
  facets: {
    posts: number;
    articles: number;
    groups: number;
    users: number;
    tags: number;
    total: number;
  };
  nextCursor: string | null;
  took_ms: number;
}

// ============================================================================
// Constantes
// ============================================================================

const TABS = [
  { id: 'all', label: 'Tudo', icon: Sparkles },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'articles', label: 'Artigos', icon: BookOpen },
  { id: 'users', label: 'Pessoas', icon: Users },
  { id: 'groups', label: 'Grupos', icon: Users },
  { id: 'tags', label: 'Tags', icon: Hash },
] as const;

type TabId = typeof TABS[number]['id'];

const TRADITIONS = [
  'cabala', 'ifa', 'xamanismo', 'tantra', 'reiki', 'ayurveda', 'meditacao', 'astrologia',
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

const EVIDENCE_COLORS: Record<string, string> = {
  ANECDOTAL: 'text-slate-400 border-slate-500/30',
  LOW: 'text-cyan-300 border-cyan-500/30',
  MEDIUM: 'text-amber-300 border-amber-500/30',
  HIGH: 'text-emerald-300 border-emerald-500/30',
};

const TAG_KIND_LABELS: Record<string, string> = {
  tradition: 'Tradição',
  topic: 'Tópico',
  article_tag: 'Tag de artigo',
};

// ============================================================================
// Componente principal (envolto em Suspense por causa de useSearchParams)
// ============================================================================

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExplorePageInner />
    </Suspense>
  );
}

function ExplorePageInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Estado da busca
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [type, setType] = useState<TabId>((params.get('type') as TabId) ?? 'all');
  const [tradition, setTradition] = useState<string>(params.get('tradition') ?? '');
  const [tag, setTag] = useState<string>(params.get('tag') ?? '');
  const [sort, setSort] = useState<'relevance' | 'recent' | 'popular'>(
    (params.get('sort') as 'relevance' | 'recent' | 'popular') ?? 'relevance',
  );
  const [cursor, setCursor] = useState<string | null>(null);
  const [allHits, setAllHits] = useState<Hit[]>([]);
  const [facets, setFacets] = useState<SearchResults['facets'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [tookMs, setTookMs] = useState<number>(0);

  // Atualiza URL sem reload
  const updateUrl = useCallback(
    (updates: Partial<{ q: string; type: TabId; tradition: string; tag: string; sort: typeof sort }>) => {
      const next = new URLSearchParams(params);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, String(v));
        else next.delete(k);
      });
      router.replace(`/explore?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  // Fetch
  const fetchResults = useCallback(
    async (reset = false) => {
      if (!query.trim()) {
        setAllHits([]);
        setFacets(null);
        setHasMore(false);
        setCursor(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const sp = new URLSearchParams();
        sp.set('q', query);
        sp.set('type', type);
        sp.set('sort', sort);
        if (tradition) sp.set('tradition', tradition);
        if (tag) sp.set('tag', tag);
        if (!reset && cursor) sp.set('cursor', cursor);

        const res = await fetch(`/api/search?${sp.toString()}`);
        const body = await res.json();

        if (!res.ok || body.error) {
          throw new Error(body.error?.message ?? `HTTP ${res.status}`);
        }

        const data = body.data as SearchResults;

        setTookMs(data.took_ms);
        setFacets(data.facets);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);

        if (reset) {
          setAllHits(data.hits);
        } else {
          setAllHits((prev) => [...prev, ...data.hits]);
        }
      } catch (e) {
        console.error('[explore] fetch error:', e);
        setError(e instanceof Error ? e.message : 'Erro ao buscar');
        if (reset) setAllHits([]);
      } finally {
        setLoading(false);
      }
    },
    [query, type, tradition, tag, sort, cursor],
  );

  // Refetch quando query/filtros mudam
  useEffect(() => {
    setCursor(null);
    fetchResults(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, tradition, tag, sort]);

  // Paginação
  const loadMore = () => {
    if (!loading && hasMore) fetchResults(false);
  };

  // ============================================================================
  // RENDERS — Tabs/Filters
  // ============================================================================

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            ✦ Explorar
          </h1>
          <p className="text-slate-400 text-sm font-raleway mt-1">
            Descubra tradições, pessoas, artigos e tópicos em destaque na comunidade
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl">
          <SearchBar
            initialQuery={query}
            placeholder="Buscar posts, artigos, pessoas, grupos, tags..."
            size="md"
            onSubmit={(q) => {
              setQuery(q);
              updateUrl({ q });
            }}
          />
        </div>

        {/* Filtros laterais + Tabs (em grid no desktop, stack no mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
          {/* Sidebar de filtros */}
          <aside className="space-y-4">
            <FilterSection title="Ordenar por">
              {(['relevance', 'recent', 'popular'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    updateUrl({ sort: s });
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-2.5 rounded text-sm transition-colors min-h-[44px]',
                    sort === s
                      ? 'bg-amber-500/15 text-amber-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
                  )}
                >
                  {s === 'relevance' && 'Relevância'}
                  {s === 'recent' && 'Mais recentes'}
                  {s === 'popular' && 'Mais populares'}
                </button>
              ))}
            </FilterSection>

            <FilterSection title="Tradição">
              <button
                onClick={() => {
                  setTradition('');
                  updateUrl({ tradition: '' });
                }}
                className={cn(
                  'block w-full text-left px-3 py-2.5 rounded text-sm transition-colors min-h-[44px]',
                  !tradition ? 'bg-amber-500/15 text-amber-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
                )}
              >
                Todas
              </button>
              {TRADITIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTradition(t);
                    updateUrl({ tradition: t });
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-2.5 rounded text-sm transition-colors min-h-[44px]',
                    tradition === t
                      ? 'bg-amber-500/15 text-amber-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
                  )}
                >
                  {TRADITION_LABELS[t] ?? t}
                </button>
              ))}
            </FilterSection>

            {(tag || tradition) && (
              <button
                onClick={() => {
                  setTradition('');
                  setTag('');
                  updateUrl({ tradition: '', tag: '' });
                }}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 px-3 min-h-[44px] transition-colors"
                aria-label="Limpar todos os filtros de busca"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                Limpar filtros
              </button>
            )}
          </aside>

          {/* Resultados */}
          <section className="space-y-4">
            {/* Tabs */}
            <div role="tablist" className="flex items-center gap-2 overflow-x-auto pb-2 pr-4 scrollbar-thin">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const count =
                  tab.id === 'posts' ? facets?.posts :
                  tab.id === 'articles' ? facets?.articles :
                  tab.id === 'users' ? facets?.users :
                  tab.id === 'groups' ? facets?.groups :
                  tab.id === 'tags' ? facets?.tags :
                  facets?.total ?? 0;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={type === tab.id}
                    onClick={() => {
                      setType(tab.id);
                      updateUrl({ type: tab.id as TabId });
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[44px]',
                      type === tab.id
                        ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-200 border border-amber-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-slate-200',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {facets && count !== undefined && count > 0 && (
                      <span className="ml-1 text-xs text-slate-500">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tag ativa (deep link) */}
            {(tag || tradition) && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Filtro:</span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-200 bg-amber-500/10">
                  {tradition && <span>{TRADITION_LABELS[tradition] ?? tradition}</span>}
                  {tradition && tag && <span> + </span>}
                  {tag && <span>#{tag}</span>}
                  <button
                    onClick={() => {
                      setTag('');
                      setTradition('');
                      updateUrl({ tag: '', tradition: '' });
                    }}
                    className="ml-2 hover:text-amber-100"
                    aria-label="Remover filtro"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}

            {/* Estado: sem query */}
            {!query.trim() && (
              <EmptyState />
            )}

            {/* Estado: erro */}
            {error && (
              <Card className="border-red-500/30 bg-red-950/20">
                <CardContent className="pt-6 text-center text-red-300">
                  <p>Erro: {error}</p>
                  <Button onClick={() => fetchResults(true)} variant="outline" className="mt-3">
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading inicial */}
            {loading && allHits.length === 0 && query.trim() && (
              <LoadingState />
            )}

            {/* Empty results */}
            {!loading && !error && query.trim() && allHits.length === 0 && (
              <NoResultsState query={query} />
            )}

            {/* Resultados */}
            {allHits.length > 0 && (
              <div className="space-y-3">
                {allHits.map((hit, idx) => (
                  <HitCard key={`${hit.type}-${hit.id}-${idx}`} hit={hit} />
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      className="border-slate-700 hover:border-amber-500/40"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Carregar mais
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Métricas */}
                <div className="text-center text-xs text-slate-500 pt-2">
                  {allHits.length} resultado{allHits.length !== 1 ? 's' : ''} em {tookMs}ms
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponentes
// ============================================================================

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-3 flex items-center gap-1.5">
        <Filter className="w-3 h-3" />
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function HitCard({ hit }: { hit: Hit }) {
  switch (hit.type) {
    case 'post':
      return <PostHit hit={hit} />;
    case 'article':
      return <ArticleHit hit={hit} />;
    case 'group':
      return <GroupHit hit={hit} />;
    case 'user':
      return <UserHit hit={hit} />;
    case 'tag':
      return <TagHit hit={hit} />;
  }
}

function PostHit({ hit }: { hit: Extract<Hit, { type: 'post' }> }) {
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
              {hit.topic && (
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                  #{hit.topic}
                </Badge>
              )}
              {hit.groupName && (
                <span className="text-slate-500">em {hit.groupName}</span>
              )}
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

function ArticleHit({ hit }: { hit: Extract<Hit, { type: 'article' }> }) {
  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-violet-500/30 transition-all">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-violet-300 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
              <Badge variant="outline" className={cn('text-xs', EVIDENCE_COLORS[hit.evidenceLevel] ?? 'text-slate-400 border-slate-500/30')}>
                {EVIDENCE_LABELS[hit.evidenceLevel] ?? hit.evidenceLevel}
              </Badge>
              {hit.tradition && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                  {TRADITION_LABELS[hit.tradition] ?? hit.tradition}
                </Badge>
              )}
              {hit.year > 0 && <span className="text-slate-500">{hit.year}</span>}
              {hit.doi && (
                <Link
                  href={`https://doi.org/${hit.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-violet-300 flex items-center gap-0.5"
                >
                  DOI <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              )}
            </div>

            <Link href={hit.url} className="block group">
              <h3
                className="font-semibold text-slate-100 group-hover:text-violet-200 transition-colors"
                dangerouslySetInnerHTML={{ __html: hit.preview }}
              />
            </Link>

            {hit.authors.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {hit.authors.slice(0, 3).join(', ')}
                {hit.authors.length > 3 && ` +${hit.authors.length - 3}`}
              </p>
            )}

            {hit.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {hit.tags.slice(0, 4).map((t) => (
                  <Link
                    key={t}
                    href={`/tags/${encodeURIComponent(t)}`}
                    className="text-xs text-cyan-400 hover:text-cyan-200"
                  >
                    #{t}
                  </Link>
                ))}
                {hit.tags.length > 4 && (
                  <span className="text-xs text-slate-600">+{hit.tags.length - 4}</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {hit.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                {hit.bookmarkCount}
              </span>
              <span className="text-slate-600">{hit.citations} citações</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupHit({ hit }: { hit: Extract<Hit, { type: 'group' }> }) {
  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-emerald-500/30 transition-all">
      <CardContent className="pt-4">
        <Link href={hit.url} className="block group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                  {TRADITION_LABELS[hit.tradition] ?? hit.tradition}
                </Badge>
              </div>
              <h3
                className="font-semibold text-slate-100 group-hover:text-emerald-200 transition-colors"
                dangerouslySetInnerHTML={{ __html: hit.preview }}
              />
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {hit.membersCount} membros
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {hit.postsCount} posts
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

function UserHit({ hit }: { hit: Extract<Hit, { type: 'user' }> }) {
  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-pink-500/30 transition-all">
      <CardContent className="pt-4">
        <Link href={hit.url} className="block group">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-pink-300 font-semibold flex-shrink-0">
              {hit.displayName[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100 group-hover:text-pink-200 transition-colors">
                {hit.displayName}
              </h3>
              {hit.bio && (
                <p
                  className="text-sm text-slate-400 mt-0.5 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: hit.preview }}
                />
              )}
              <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
                {hit.signoSolar && (
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                    ♒ {hit.signoSolar}
                  </Badge>
                )}
                {hit.caminhoDeVida && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                    Caminho {hit.caminhoDeVida}
                  </Badge>
                )}
                {hit.orixaRegente && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                    {hit.orixaRegente}
                  </Badge>
                )}
                {hit.oduNascimento && (
                  <Badge variant="outline" className="border-rose-500/30 text-rose-300">
                    Odu {hit.oduNascimento}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

function TagHit({ hit }: { hit: Extract<Hit, { type: 'tag' }> }) {
  return (
    <Link href={hit.url} className="block">
      <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-cyan-500/30 transition-all">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-cyan-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100">{hit.tag}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {TAG_KIND_LABELS[hit.kind]} · {hit.count} {hit.count === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================================================
// States
// ============================================================================

function EmptyState() {
  return (
    <Card className="border-slate-800/50 bg-slate-900/30">
      <CardContent className="pt-8 pb-8 text-center">
        <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h2 className="text-lg font-semibold text-slate-300 mb-2">
          Comece a explorar a comunidade
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Busque por tradições, práticas, autores, artigos ou pessoas. Use o filtro lateral pra refinar por linha espiritual.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['cabala', 'meditação', 'reiki', 'psilocibina', 'astrologia'].map((s) => (
            <Link
              key={s}
              href={`/explore?q=${encodeURIComponent(s)}`}
              className="px-3 py-1 rounded-full text-xs bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-amber-500/40 hover:text-amber-200 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
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

function NoResultsState({ query }: { query: string }) {
  return (
    <Card className="border-slate-800/50 bg-slate-900/30">
      <CardContent className="pt-8 pb-8 text-center">
        <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h2 className="text-lg font-semibold text-slate-300 mb-2">
          Nada encontrado para "{query}"
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          Tente outras palavras-chave, ou explore uma tradição específica nos grupos.
        </p>
        <div className="flex justify-center gap-2">
          <Button asChild variant="outline" className="border-slate-700">
            <Link href="/explore">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Limpar busca
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ExploreSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 bg-slate-800/50 rounded animate-pulse w-48 mb-2" />
        <div className="h-4 bg-slate-800/50 rounded animate-pulse w-96 mb-6" />
        <div className="h-12 bg-slate-800/50 rounded animate-pulse mb-6" />
        <LoadingState />
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

'use client';

// ============================================================================
// AKASHA PORTAL — Library Page (Wave 17: states integration)
// ============================================================================
// Acervo de artigos, papers e práticas curadas pela IA. Adds:
//   - Loading skeleton via Next.js `loading.tsx`
//   - Empty state via <EmptyScreen variant="library" />
//   - Error state via <ApiError />
//   - Filter state with empty-results handling via <EmptyResults />
// ============================================================================

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { EmptyScreen } from '@/components/design-system/empty-illustrations';
import {
  ApiError,
  EmptyResults,
} from '@/components/design-system/error-states';
import { SectionLoading } from '@/components/design-system/loading-states';
import { ArticleCardSkeleton } from '@/components/design-system/skeleton';

type Evidence = 'anecdótico' | 'revisado' | 'meta-análise';

type Article = {
  id: string;
  title: string;
  tradition: string;
  excerpt: string;
  evidence: Evidence;
  readTime: string;
};

type Section = {
  id: string;
  title: string;
  description: string;
  articles: Article[];
};

const SECTIONS: Section[] = [
  {
    id: 'cabala',
    title: 'Cabala',
    description: 'Tradição mística judaica. Árvore da Vida, sephiroth, caminhos.',
    articles: [
      {
        id: 'c1',
        title: 'Os 4 Mundos e a jornada da alma',
        tradition: 'cabala',
        excerpt: 'Como Atziluth, Beriah, Yetzirah e Assiah se relacionam com nosso dia a dia.',
        evidence: 'revisado',
        readTime: '8 min',
      },
      {
        id: 'c2',
        title: 'Meditação com os 72 nomes de Deus',
        tradition: 'cabala',
        excerpt: 'Prática contemplativa baseada nos shem ha-mephorash.',
        evidence: 'anecdótico',
        readTime: '12 min',
      },
    ],
  },
  {
    id: 'ifa',
    title: 'Ifá',
    description: 'Sistema divinatório yorubá. 16 Odus principais, 256 derivados.',
    articles: [
      {
        id: 'i1',
        title: 'O Odu Ofun e o equilíbrio interior',
        tradition: 'ifa',
        excerpt: 'Reflexões sobre o Odu que fala de estabilidade e conexão com ancestrais.',
        evidence: 'anecdótico',
        readTime: '6 min',
      },
    ],
  },
  {
    id: 'tantra',
    title: 'Tantra',
    description: 'Tradições não-duais do subcontinente indiano. Kundalini, chakras, mantra.',
    articles: [
      {
        id: 't1',
        title: 'Kundalini e os 7 chakras — uma introdução',
        tradition: 'tantra',
        excerpt:
          'Visão integrativa dos centros energéticos à luz da neurociência contemporânea.',
        evidence: 'meta-análise',
        readTime: '15 min',
      },
    ],
  },
];

type FetchState = 'loading' | 'success' | 'empty' | 'error' | 'no-results';

export default function LibraryPage() {
  const [state, setState] = React.useState<FetchState>('loading');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(
      () => setState(SECTIONS.every((s) => s.articles.length === 0) ? 'empty' : 'success'),
      700
    );
    return () => clearTimeout(t);
  }, []);

  const filteredSections =
    searchQuery.trim() === ''
      ? SECTIONS
      : SECTIONS.map((s) => ({
          ...s,
          articles: s.articles.filter(
            (a) =>
              a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        })).filter((s) => s.articles.length > 0);

  const hasResults = filteredSections.length > 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-400" />
            <span className="text-caps text-tiny text-violet-300">Acervo Curado</span>
          </div>
          <h1 className="mb-3">Biblioteca Viva</h1>
          <p className="text-body max-w-2xl text-slate-400">
            Artigos, papers e práticas organizados por tradição. Cada conteúdo passa por
            curadoria da IA com classificação de nível de evidência.
          </p>

          {/* Search input — drives the empty-results state */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setState('no-results');
                else setState('success');
              }}
              placeholder="Buscar artigos, práticas…"
              aria-label="Buscar na biblioteca"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <Button variant="outline" size="sm" className="border-slate-700">
              <Filter className="mr-2 h-3 w-3" /> Filtrar tradição
            </Button>
          </div>

          {/* State demo controls — remove in production */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {(['loading', 'success', 'empty', 'no-results', 'error'] as FetchState[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setState(s)}
                  className="rounded-md border border-slate-700 px-2 py-0.5 text-slate-400 hover:bg-slate-800/60"
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        {state === 'loading' && (
          <div className="space-y-12">
            <section>
              <div className="mb-6 space-y-2">
                <div className="h-7 w-40 rounded skeleton" />
                <div className="h-4 w-96 max-w-full rounded skeleton" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
              </div>
            </section>
          </div>
        )}

        {state === 'success' && hasResults && (
          <div className="space-y-12">
            {filteredSections.map((section) => (
              <section key={section.id}>
                <div className="mb-6">
                  <h2 className="mb-2 text-slate-100">{section.title}</h2>
                  <p className="text-body max-w-2xl text-slate-400">{section.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {state === 'empty' && (
          <EmptyScreen
            variant="library"
            title="Biblioteca em construção"
            description="Em breve 100+ artigos curados pelas tradições e pela IA. Enquanto isso, explore as práticas diárias."
            primaryLabel="Práticas diárias"
            primaryHref="/rituals"
            secondaryLabel="Sugerir tema"
            secondaryHref="/contact"
          />
        )}

        {state === 'no-results' && (
          <EmptyResults
            query={searchQuery}
            onClear={() => {
              setSearchQuery('');
              setState('success');
            }}
          />
        )}

        {state === 'error' && (
          <ApiError
            title="Não conseguimos carregar a biblioteca"
            description="Houve uma dissonância ao buscar os artigos. Tente novamente."
            onRetry={() => setState('loading')}
            onSupport={() => window.open('mailto:suporte@akasha.portal', '_blank')}
          />
        )}
      </main>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/library/${article.id}`}
      className="group block rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-amber-500/30"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-caps text-tiny rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-amber-300">
          {article.evidence}
        </span>
        <span className="text-tiny text-slate-500">{article.readTime}</span>
      </div>
      <h3 className="mb-2 text-xl text-slate-100 transition-colors group-hover:text-amber-300">
        {article.title}
      </h3>
      <p className="text-caption leading-relaxed text-slate-400">{article.excerpt}</p>
    </Link>
  );
}

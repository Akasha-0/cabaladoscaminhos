'use client';

// ============================================================================
// AKASHA PORTAL — Feed Page (Wave 17: states integration)
// ============================================================================
// Timeline de posts da comunidade. Adds:
//   - Loading skeleton via Next.js `loading.tsx`
//   - Empty state via <EmptyScreen variant="feed" />
//   - Error state via <ApiError />
//   - ContentTransition cross-fade between loading → content (300ms)
// Uses mock data with a simulated delay to demonstrate the full state cycle.
// ============================================================================

import * as React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';

import { EmptyScreen } from '@/components/design-system/empty-illustrations';
import { ApiError } from '@/components/design-system/error-states';
import {
  ContentTransition,
  SectionLoading,
} from '@/components/design-system/loading-states';
import { PostCardSkeleton } from '@/components/design-system/skeleton';

type FeedPost = {
  id: string;
  author: string;
  tradition: string;
  excerpt: string;
  likes: number;
  comments: number;
  timeAgo: string;
};

const MOCK_POSTS: FeedPost[] = [
  {
    id: '1',
    author: 'Maria Helena',
    tradition: 'Cabala',
    excerpt:
      'Hoje no estudo da Árvore da Vida entendi que cada sephirah é um espelho da jornada interior. Malchuth nos ensina sobre presença, sobre aterrar o divino no cotidiano.',
    likes: 42,
    comments: 7,
    timeAgo: 'há 2 horas',
  },
  {
    id: '2',
    author: 'João de Oxalá',
    tradition: 'Ifá',
    excerpt:
      'O Odu de hoje trouxe uma mensagem sobre paciência e respeito aos mais velhos. Compartilho aqui a reflexão que fiz no terreiro esta manhã.',
    likes: 38,
    comments: 12,
    timeAgo: 'há 5 horas',
  },
  {
    id: '3',
    author: 'Ana Luz',
    tradition: 'Tantra',
    excerpt:
      'Meditação do coração aberto. A prática de hoje foi sobre deixar o chakra do coração respirar sem julgamentos. 🌸',
    likes: 27,
    comments: 4,
    timeAgo: 'ontem',
  },
];

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export default function FeedPage() {
  // Demonstration state machine. In production this becomes useSWR / React Query.
  const [state, setState] = React.useState<FetchState>('idle');

  React.useEffect(() => {
    setState('loading');
    const t = setTimeout(() => {
      // Toggle to 'empty' to see the empty state demo, 'error' for the error demo.
      setState(MOCK_POSTS.length === 0 ? 'empty' : 'success');
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-caps text-tiny text-amber-300">Comunidade</span>
          </div>
          <h1 className="mb-2">Feed da Comunidade</h1>
          <p className="text-body max-w-xl text-slate-400">
            Reflexões, práticas e descobertas compartilhadas por praticantes de todas as tradições.
          </p>
          {/* State demo controls — remove in production */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {(['idle', 'loading', 'success', 'empty', 'error'] as FetchState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                className="rounded-md border border-slate-700 px-2 py-0.5 text-slate-400 hover:bg-slate-800/60"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Feed body — handles all 5 states */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none mx-auto max-w-3xl px-4 py-8">
        {state === 'loading' && (
          <SectionLoading message="Carregando reflexões da comunidade…" />
        )}

        {state === 'success' && (
          <div className="space-y-6">
            {MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {state === 'empty' && (
          <EmptyScreen
            variant="feed"
            title="Nenhum post ainda"
            description="A comunidade está em silêncio — seja o primeiro a partilhar uma reflexão, prática ou descoberta."
            primaryLabel="Partilhar reflexão"
            primaryHref="/community/new-post"
            secondaryLabel="Explorar tradições"
            secondaryHref="/library"
          />
        )}

        {state === 'error' && (
          <ApiError
            title="Não conseguimos carregar o feed"
            description="A conexão com a comunidade teve uma dissonância."
            onRetry={() => setState('loading')}
            onSupport={() => window.open('mailto:suporte@akasha.portal', '_blank')}
          />
        )}

        {state === 'idle' && (
          <SectionLoading message="Preparando o espaço…" />
        )}
      </main>

      {/* Example ContentTransition usage — for sub-sections that load later */}
      <ContentTransitionExample />
    </div>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-6 transition-all hover:border-amber-500/30">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30" />
        <div>
          <h4 className="text-base font-semibold text-slate-100">{post.author}</h4>
          <p className="text-tiny text-slate-500">
            {post.tradition} · {post.timeAgo}
          </p>
        </div>
      </div>

      <p className="text-body mb-4 leading-relaxed text-slate-300">{post.excerpt}</p>

      <div className="text-tiny flex items-center gap-6 text-slate-500">
        <button
          className="flex items-center gap-1.5 transition-colors hover:text-amber-400 min-h-[44px] min-w-[44px] px-2"
          aria-label={`Curtir publicação (${post.likes} curtidas)`}
        >
          <Heart className="h-4 w-4" aria-hidden="true" /> {post.likes}
        </button>
        <button
          className="flex items-center gap-1.5 transition-colors hover:text-violet-400 min-h-[44px] min-w-[44px] px-2"
          aria-label={`Ver comentários (${post.comments} comentários)`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> {post.comments}
        </button>
        <button
          className="flex items-center gap-1.5 transition-colors hover:text-emerald-400 min-h-[44px] min-w-[44px] px-2"
          aria-label="Compartilhar publicação"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar
        </button>
      </div>

      <Link
        href={`/post/${post.id}`}
        className="text-caption mt-3 block text-amber-300 transition-colors hover:text-amber-200"
      >
        Ler mais →
      </Link>
    </article>
  );
}

/* Example of ContentTransition in a "related posts" sub-section */
function ContentTransitionExample() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-12">
      <h2 className="mb-4 text-lg font-semibold text-slate-200">Você pode gostar</h2>
      <ContentTransition
        ready={ready}
        fallback={
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        }
      >
        <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-5 text-sm text-slate-400">
          Recomendações personalizadas aparecerão aqui em breve.
        </div>
      </ContentTransition>
    </section>
  );
}

'use client';

// ============================================================================
// FirstValueExperience — Aha moment pós-signup (Wave 20)
// ============================================================================
// Logo após signup, redireciona para /feed?first=value (interceptado por este
// componente se a flag `first-value-recommendation` estiver ativa).
//
// Mostra:
//   - 3 posts recomendados (placeholder até integrar feed real)
//   - 3 tradições pré-selecionadas baseado no quiz (se houver)
//   - Botão "explorar comunidade" (deep link para /feed)
//
// Métrica objetivo: time-to-first-value < 30s.
// ============================================================================

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, Sparkles, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFlag } from '@/hooks/use-flag';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/analytics/events-catalog';
import { funnelEvents } from '@/lib/analytics/funnel';

interface RecommendedPost {
  id: string;
  title: string;
  tradition: string;
  author: string;
  excerpt: string;
  readMinutes: number;
}

const PLACEHOLDER_POSTS: RecommendedPost[] = [
  {
    id: 'p1',
    title: 'Cabala e Ciência: a correspondência entre Árvore da Vida e modelo atômico',
    tradition: 'Cabala',
    author: 'A. ben Judah',
    excerpt: 'Um olhar racional sobre paralelos entre as 10 sefirot e os níveis de organização da matéria.',
    readMinutes: 8,
  },
  {
    id: 'p2',
    title: 'Ifá — Os 16 Odus principais e como identificá-los na sua vida',
    tradition: 'Ifá',
    author: 'Babalawô Ade',
    excerpt: 'Introdução acessível ao sistema de Odus — caminhos do destino na tradição Yorubá.',
    readMinutes: 12,
  },
  {
    id: 'p3',
    title: 'Tantra: desmistificando o sexo sagrado',
    tradition: 'Tantra',
    author: 'Swami Jñana',
    excerpt: 'O que tantra realmente é (e o que não é) — visão filosófica além do mercado ocidental.',
    readMinutes: 6,
  },
];

export function FirstValueExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { enabled, loading } = useFlag('first-value-recommendation');

  const [selectedTraditions, setSelectedTraditions] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [enterTime] = useState(Date.now());

  // Read ?traditions=cabala,ifa from quiz referral
  useEffect(() => {
    const t = searchParams.get('traditions');
    if (t) {
      setSelectedTraditions(new Set(t.split(',').filter(Boolean)));
    }
  }, [searchParams]);

  // Track aha moment
  useEffect(() => {
    if (!enabled || loading || dismissed) return;
    const elapsed = Date.now() - enterTime;
    trackEvent('page_viewed', {
      path: '/first-value',
      query: { user_id: user?.id, elapsed_ms: String(elapsed) },
    });
  }, [enabled, loading, dismissed, enterTime, user?.id]);

  // If flag off, just redirect to /feed
  useEffect(() => {
    if (!loading && !enabled && !dismissed) {
      router.replace('/feed');
    }
  }, [enabled, loading, dismissed, router]);

  if (loading || !enabled || dismissed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const toggleTradition = (slug: string) => {
    setSelectedTraditions((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleContinue = () => {
    funnelEvents.ctaClick({ variant: 'A', ctaId: 'first-value-continue' });
    const query = selectedTraditions.size > 0
      ? `?traditions=${Array.from(selectedTraditions).join(',')}`
      : '';
    router.push(`/feed${query}`);
  };

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-4 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Bem-vindo à comunidade
          </div>
          <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-2">
            Sua jornada começa agora
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Preparamos 3 leituras perfeitas para você começar.
            Escolha suas tradições de interesse para personalizar o feed.
          </p>
        </div>

        {/* Recommended posts */}
        <section className="mb-8">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Leituras para começar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PLACEHOLDER_POSTS.map((p) => (
              <article
                key={p.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-amber-500/30 transition"
              >
                <p className="text-xs uppercase tracking-wider text-amber-300/80 mb-1.5">
                  {p.tradition}
                </p>
                <h3 className="text-sm font-semibold text-slate-100 mb-2 leading-tight">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{p.author}</span>
                  <span>{p.readMinutes} min</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Tradition pre-selection */}
        <section className="mb-8 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3">
            Suas tradições de interesse
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Toque para ajustar (você pode mudar depois)
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: 'cabala', label: '✡️ Cabala' },
              { slug: 'ifa', label: '🌿 Ifá' },
              { slug: 'tantra', label: '🕉️ Tantra' },
              { slug: 'xamanismo', label: '🦅 Xamanismo' },
              { slug: 'cristianismo-mistico', label: '✝️ Crist. Místico' },
              { slug: 'sufismo', label: '☪️ Sufismo' },
              { slug: 'umbanda', label: '🌙 Umbanda' },
              { slug: 'reiki', label: '🌀 Reiki' },
            ].map((t) => {
              const selected = selectedTraditions.has(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleTradition(t.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${
                    selected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 h-12 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition flex items-center justify-center gap-2"
          >
            Explorar comunidade
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="h-12 px-5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 transition"
          >
            Pular
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          <Link href="/onboarding" className="text-amber-300 hover:underline">
            Preferir onboarding completo →
          </Link>
        </p>
      </div>
    </main>
  );
}

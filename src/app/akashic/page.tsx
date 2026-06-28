'use client';

// ============================================================================
// AKASHA PORTAL — Akashic Records Page (Wave 17)
// ============================================================================
// Deep introspective reading view. Heavy content → loading state is prominent.
// Uses PageLoading (full spiritual anchor) + IndeterminateProgress for
// multi-stage loads + skeletons for sections.
// ============================================================================

import * as React from 'react';
import { Sparkles, Eye, BookOpen, Compass } from 'lucide-react';

import {
  EmptyScreen,
} from '@/components/design-system/empty-illustrations';
import { ApiError } from '@/components/design-system/error-states';
import {
  IndeterminateProgress,
  PageLoading,
  ProgressBar,
  SectionLoading,
} from '@/components/design-system/loading-states';

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

const MOCK_READING = {
  user: 'Visitante',
  date: new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
  cards: [
    { id: 'a1', label: 'O Espelho', tradition: 'Árvore da Vida', excerpt: 'A Sephirah Tiferet ilumina o caminho entre compaixão e verdade.' },
    { id: 'a2', label: 'O Guerreiro', tradition: 'Ifá', excerpt: 'Ogum abre caminhos onde antes havia apenas mato cerrado.' },
    { id: 'a3', label: 'O Vazio', tradition: 'Tantra', excerpt: 'No espaço entre os pensamentos repousa a sabedoria original.' },
  ],
};

export default function AkashicPage() {
  const [state, setState] = React.useState<FetchState>('idle');
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setState('loading');
    // Simulate multi-stage load with progress updates
    const stages = [25, 55, 80, 100];
    let i = 0;
    const interval = setInterval(() => {
      setProgress(stages[i] ?? 100);
      i += 1;
      if (i >= stages.length) {
        clearInterval(interval);
        setTimeout(() => setState('success'), 300);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Eye className="h-4 w-4 text-amber-400" />
            <span className="text-caps text-tiny text-amber-300">Leitura Profunda</span>
          </div>
          <h1 className="mb-2">Registros Akáshicos</h1>
          <p className="text-body text-slate-400">
            Cruzamento das 4 tradições: Cabala, Ifá, Tantra e Numerologia.
          </p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="focus:outline-none mx-auto max-w-3xl px-4 py-8">
        {state === 'loading' && (
          <div className="space-y-8">
            {/* Full-page anchor */}
            <PageLoading
              title="Consultando os registros…"
              description="Cruzando os 4 mapas do seu mapa interior."
            />

            {/* Determinate progress (stages) */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5">
              <ProgressBar
                value={progress}
                label="Sincronização dos registros"
                tone="violet"
              />
              <p className="mt-3 text-tiny text-slate-500">
                Etapa {Math.floor(progress / 25)} de 4 · {progress}%
              </p>
            </div>

            {/* Indeterminate shimmer for sub-system */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-5">
              <p className="mb-3 text-sm text-slate-300">Alinhando com sua data de nascimento…</p>
              <IndeterminateProgress label="Alinhamento fino" />
            </div>
          </div>
        )}

        {state === 'success' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
              <p className="text-tiny uppercase tracking-widest text-amber-300">
                Leitura de {MOCK_READING.user}
              </p>
              <p className="mt-1 text-sm text-slate-400">{MOCK_READING.date}</p>
            </div>

            {MOCK_READING.cards.map((card) => (
              <article
                key={card.id}
                className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-6"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-violet-400" aria-hidden />
                  <span className="text-caps text-tiny text-violet-300">
                    {card.tradition}
                  </span>
                </div>
                <h3 className="mb-3 text-lg text-slate-100">{card.label}</h3>
                <p className="text-body leading-relaxed text-slate-300">
                  {card.excerpt}
                </p>
              </article>
            ))}

            <div className="flex justify-center pt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
              >
                <BookOpen className="h-4 w-4" />
                Salvar no diário
              </button>
            </div>
          </div>
        )}

        {state === 'empty' && (
          <EmptyScreen
            variant="library"
            title="Registros ainda não cruzados"
            description="Para acessar seus registros akáshicos, precisamos das suas informações de nascimento (data, hora e local)."
            primaryLabel="Preencher dados"
            primaryHref="/onboarding"
            secondaryLabel="Voltar ao dashboard"
            secondaryHref="/dashboard"
          />
        )}

        {state === 'error' && (
          <ApiError
            title="Não conseguimos consultar os registros"
            description="A conexão com a fonte akáshica teve uma dissonância."
            onRetry={() => {
              setState('loading');
              setProgress(0);
            }}
          />
        )}

        {state === 'idle' && (
          <SectionLoading message="Preparando o espaço contemplativo…" />
        )}

        {/* Static demo controls — remove in production */}
        <div className="mt-8 flex flex-wrap justify-center gap-1.5 text-xs">
          {(['idle', 'loading', 'success', 'empty', 'error'] as FetchState[]).map(
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
      </main>
    </div>
  );
}

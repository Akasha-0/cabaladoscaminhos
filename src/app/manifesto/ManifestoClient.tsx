'use client';

// ============================================================================
// Manifesto — Client wrapper (Wave 19 i18n)
// ============================================================================
// Usa `useT()` para resolver strings em PT-BR/EN/ES. Tudo hardcoded
// de W20 vira t('manifesto.*').
// ============================================================================

import { useT } from '@/lib/i18n/useT';

interface Principle {
  key: string;
  n: string;
}

const PRINCIPLE_KEYS: Principle[] = [
  { key: 'p01', n: '01' },
  { key: 'p02', n: '02' },
  { key: 'p03', n: '03' },
  { key: 'p04', n: '04' },
  { key: 'p05', n: '05' },
];

export function ManifestoClient() {
  const t = useT();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-caps text-violet-300 mb-3">{t('manifesto.kicker')}</p>
          <h1 className="text-display-5xl bg-gradient-to-r from-violet-300 via-pink-300 to-violet-400 bg-clip-text text-transparent mb-4">
            {t('manifesto.title')}
          </h1>
          <p className="text-body text-slate-300 leading-relaxed">
            {t('manifesto.intro')}
          </p>
        </header>

        <ol className="space-y-8 mb-16">
          {PRINCIPLE_KEYS.map((p) => (
            <li
              key={p.key}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60"
            >
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-amber-300 font-mono text-sm">{p.n}</span>
                <h2 className="text-xl text-slate-100">{t(`manifesto.${p.key}Title`)}</h2>
              </div>
              <p className="text-body text-slate-300 leading-relaxed">
                {t(`manifesto.${p.key}Body`)}
              </p>
            </li>
          ))}
        </ol>

        <footer className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/20 text-center">
          <p className="text-body text-slate-200">
            {t('manifesto.closing')}
          </p>
        </footer>
      </article>
    </main>
  );
}
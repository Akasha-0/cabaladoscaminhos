// ============================================================================
// AboutClient — Parágrafos traduzíveis da página About
// ============================================================================
// Separado do page.tsx (server component) para usar useT() que requer client.
// ============================================================================

'use client';

import { useT } from '@/lib/i18n/useT';

export function AboutClient() {
  const t = useT();

  const paragraphs = [
    { key: 'about.intro', emphasis: true },
    { key: 'about.method' },
    { key: 'about.lineage' },
    { key: 'about.principles' },
    { key: 'about.closing', emphasis: false },
  ];

  return (
    <article className="space-y-6 text-slate-300 leading-relaxed">
      {paragraphs.map((p) => (
        <p
          key={p.key}
          className={
            p.emphasis
              ? 'text-lg text-slate-200 italic border-l-2 border-amber-500/40 pl-4'
              : ''
          }
        >
          {t(p.key)}
        </p>
      ))}
    </article>
  );
}

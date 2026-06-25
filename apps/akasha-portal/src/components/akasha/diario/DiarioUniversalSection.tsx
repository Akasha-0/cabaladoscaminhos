'use client';

/**
 * DiarioUniversalSection — Wave 28.2
 *
 * Seção "Mandato Universalista" do /diario que mostra:
 *   ① Cross-references com os 5 Pilares (chips → /mandala)
 *   ② Papers reais (Wave 21.1) relacionados ao Mandato do Dia
 *
 * Universalista+visceral (ADR-013):
 *   - Mostra os 5 Pilares em diálogo, não só o principal.
 *   - Papers com DOI + journal — concretos, não abstratos.
 *   - Mobile-first 360px: cards colapsáveis, hierarquia clara.
 *
 * LGPD:
 *   - Papers são obras públicas (sem PII).
 *   - citationCount derivado de hash (mock estável).
 *
 * i18n:
 *   - `diario.universal.*` namespace (15 chaves — Wave 28.2).
 */

import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, FileText, Lock } from 'lucide-react';
import { getTranslations } from '@/lib/i18n';
import type { Pilar } from '@/lib/grimoire/significados-curados';
import { PILLAR_COLORS, PILLAR_ORDER } from './types';
import type { DiarioPaperDTO } from './DiarioPapersAdapter';

export interface DiarioUniversalSectionProps {
  /** Pilar principal do Mandato do Dia. */
  pilarPrincipal: Pilar;
  /** Papers relacionados (do DiarioPapersAdapter). */
  papers: DiarioPaperDTO[];
  /** Locale for i18n. */
  locale: string;
}

const ABSTRACT_PREVIEW_MAX_CHARS = 180;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function buildHref(paper: DiarioPaperDTO): string {
  if (paper.fullTextUrl) return paper.fullTextUrl;
  if (paper.doi) return `https://doi.org/${paper.doi}`;
  return '#';
}

export function DiarioUniversalSection({
  pilarPrincipal,
  papers,
  locale,
}: DiarioUniversalSectionProps) {
  const t = getTranslations(locale);
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);

  const pilatesSecundarios = PILLAR_ORDER.filter((p) => p !== pilarPrincipal);

  return (
    <section
      aria-labelledby="diario-universal-title"
      data-testid="diario-universal-section"
      className="mx-auto w-full max-w-xl px-5 py-4"
    >
      {/* Header */}
      <header className="mb-4">
        <h2
          id="diario-universal-title"
          className="font-cinzel text-[1.05rem] font-medium tracking-wide text-[#F4F5FF]"
        >
          {t('diario.universal.sectionTitle')}
        </h2>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-[#A7AECF]">
          {t('diario.universal.sectionSubtitle')}
        </p>
      </header>

      {/* ── 5 Pilares cross-reference ── */}
      <div
        data-testid="diario-universal-pilares"
        className="mb-5 rounded-xl border border-[#7C5CFF]/25 bg-[rgba(11,14,28,0.72)] p-4 backdrop-blur-xl"
      >
        <h3 className="mb-1 text-[0.78rem] font-cinzel uppercase tracking-[0.15em] text-[#A7AECF]">
          {t('diario.universal.crossRefTitle')}
        </h3>
        <p className="mb-3 text-[0.72rem] leading-relaxed text-[#5C6691]">
          {t('diario.universal.crossRefDesc')}
        </p>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="list">
          {PILLAR_ORDER.map((pilar) => {
            const isPrincipal = pilar === pilarPrincipal;
            const color = PILLAR_COLORS[pilar];
            return (
              <li key={pilar}>
                <Link
                  href={`/${locale}/mandala?pilar=${pilar}`}
                  data-testid={`diario-universal-pilar-${pilar}`}
                  data-pilar={pilar}
                  data-pilar-active={isPrincipal ? 'true' : 'false'}
                  className={[
                    'group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                    isPrincipal
                      ? 'border-l-[3px] bg-[rgba(124,92,255,0.08)] hover:bg-[rgba(124,92,255,0.14)]'
                      : 'border-[#141A33] bg-[rgba(11,14,28,0.5)] hover:bg-[rgba(11,14,28,0.7)]',
                  ].join(' ')}
                  style={{
                    borderLeftColor: isPrincipal ? color : undefined,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[0.78rem] text-[#F4F5FF]">
                    {t(`diario.significado.pilarNames.${pilar}`)}
                  </span>
                  {isPrincipal ? (
                    <span className="shrink-0 rounded-full bg-[rgba(124,92,255,0.2)] px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-[#7C5CFF]">
                      {t('diario.universal.pilarActive')}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[0.6rem] uppercase tracking-wider text-[#5C6691]">
                      {t('diario.universal.pilarRelated')}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Convergência — pequenos dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
          {PILLAR_ORDER.map((pilar) => (
            <span
              key={pilar}
              className="inline-block h-1 w-1 rounded-full"
              style={{ backgroundColor: PILLAR_COLORS[pilar], opacity: 0.7 }}
            />
          ))}
          <span className="ml-2 text-[0.62rem] uppercase tracking-wider text-[#5C6691]">
            {t('diario.universal.pilarConvergence')}
          </span>
        </div>

        <Link
          href={`/${locale}/mandala`}
          className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-medium text-[#7C5CFF] hover:text-[#A78BFA]"
        >
          {t('diario.universal.crossRefViewAll')}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* ── Papers (Wave 21.1) ── */}
      <div
        data-testid="diario-universal-papers"
        className="rounded-xl border border-[#2DD4BF]/25 bg-[rgba(11,14,28,0.72)] p-4 backdrop-blur-xl"
      >
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h3 className="text-[0.78rem] font-cinzel uppercase tracking-[0.15em] text-[#2DD4BF]">
            {t('diario.universal.papersTitle')}
          </h3>
          <span className="shrink-0 rounded-full bg-[rgba(45,212,191,0.12)] px-2 py-0.5 text-[0.58rem] font-medium uppercase tracking-wider text-[#2DD4BF]">
            {t('diario.universal.papersBadge')}
          </span>
        </div>
        <p className="mb-3 text-[0.72rem] leading-relaxed text-[#5C6691]">
          {t('diario.universal.papersDesc')}
        </p>

        {papers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#141A33] p-3 text-[0.75rem] text-[#5C6691]">
            {t('diario.universal.papersNone')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {papers.map((paper) => {
              const isOpen = expandedPaper === paper.paperId;
              const isPtBr = locale === 'pt-BR';
              const isPrincipal = paper.pilar === pilarPrincipal;
              const color = PILLAR_COLORS[paper.pilar];
              const href = buildHref(paper);
              const isOpenAccess = !!paper.fullTextUrl || !!paper.doi;
              const isExternal = href !== '#';
              return (
                <li key={paper.paperId}>
                  <article
                    data-testid={`diario-universal-paper-${paper.paperId}`}
                    data-paper-id={paper.paperId}
                    data-pilar={paper.pilar}
                    data-is-principal={isPrincipal ? 'true' : 'false'}
                    className="rounded-lg border border-[#141A33] bg-[rgba(11,14,28,0.55)] p-3 transition-colors hover:border-[#5C6691]/40"
                  >
                    <header className="flex items-start gap-2">
                      {isOpenAccess ? (
                        <FileText
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A7AECF]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Lock
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5C6691]"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[0.78rem] font-medium leading-tight text-[#F4F5FF]">
                          {paper.authors[0] ?? 'Autor'} {paper.year}
                          <span className="mx-1 text-[#5C6691]">—</span>
                          <span className="text-[#A7AECF]">{paper.title}</span>
                        </h4>
                        <p className="mt-0.5 truncate text-[0.68rem] text-[#5C6691]">
                          {paper.journal}
                          {paper.doi ? (
                            <>
                              <span className="mx-1">·</span>
                              <span className="font-mono">DOI: {paper.doi}</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        title={`${t(`diario.significado.pilarNames.${paper.pilar}`)}`}
                        className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </header>

                    <button
                      type="button"
                      onClick={() => setExpandedPaper((prev) => (prev === paper.paperId ? null : paper.paperId))}
                      aria-expanded={isOpen}
                      aria-controls={`diario-paper-abstract-${paper.paperId}`}
                      className="mt-1.5 flex items-center gap-1 text-[0.68rem] font-medium text-[#2DD4BF] hover:text-[#5EEAD4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] rounded-sm"
                    >
                      {isOpen ? '−' : '+'}
                      <span>
                        {isOpen
                          ? isPtBr ? 'recolher' : 'collapse'
                          : isPtBr ? 'ver abstract' : 'see abstract'}
                      </span>
                    </button>

                    {isOpen ? (
                      <p
                        id={`diario-paper-abstract-${paper.paperId}`}
                        className="mt-2 text-[0.7rem] leading-relaxed text-[#A7AECF]"
                      >
                        {truncate(paper.abstract, ABSTRACT_PREVIEW_MAX_CHARS)}
                      </p>
                    ) : null}

                    <footer className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[0.62rem] text-[#5C6691]">
                        {t('diario.universal.papersCitations', { count: paper.citationCount })}
                      </span>
                      {isExternal ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-[#2DD4BF]/30 bg-[rgba(45,212,191,0.08)] px-2 py-0.5 text-[0.66rem] font-medium text-[#2DD4BF] hover:bg-[rgba(45,212,191,0.16)]"
                        >
                          {t('diario.universal.papersOpen')}
                          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-3 text-center text-[0.62rem] text-[#5C6691]">
          {t('diario.universal.papersCount', { count: papers.length })}
        </p>
      </div>

      {/* Hidden: list of secondary pillars for testability / a11y */}
      <span data-testid="diario-universal-pilares-secundarios" className="sr-only">
        {pilatesSecundarios.join(',')}
      </span>
    </section>
  );
}

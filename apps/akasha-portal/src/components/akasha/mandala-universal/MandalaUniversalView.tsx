'use client';

/**
 * MandalaUniversalView — Wave 28.1
 *
 * Client island raiz da página /mandala (universalista+visceral, ADR-013).
 *
 * Estrutura mobile-first 360px stack:
 *
 *   1. HERO — verdade universal em destaque (1 frase, ≤15 palavras, visceral).
 *   2. SUBTÍTULO — convergência dos 5 Pilares (1 linha).
 *   3. 5 CARDS — um por Pilar (cor distinta + ícone + voz ≤25 palavras).
 *      Stack vertical em < 640px; grid 2 colunas em ≥ 640px.
 *   4. PAPERS CITED — cross-references (3-5 papers reais por Pilar).
 *   5. EXPLORE — CTA secundário (link para drill-down por Pilar).
 *
 * Decisões (Wave 28.1):
 *   - Visceral: copy curto, direto, sem floreio acadêmico.
 *   - Universal: 5 Pilares mostrados como "línguas diferentes da mesma
 *     verdade", não como seções competindo.
 *   - Sem dependência de fetch extra: papers e pillars são passados como
 *     props (server-side do page.tsx). Isso garante SSR universalista.
 *   - LGPD by design: nada de PII nos cards — só pilar + voice (universal).
 *   - Mobile-first: tudo flexível, mínimo de media queries. 360px é o
 *     breakpoint de stress test (iPhone SE 1ª geração).
 *
 * O server component (`/mandala/page.tsx`) carrega auth + Mandala data
 * e passa apenas o necessário — este componente é puro apresentação.
 */

import { Compass, Flame, Sparkles, Sprout, Telescope } from 'lucide-react';

import { useTranslation } from '@/i18n';
import { cn } from '@/lib/shared/utils';

import type { LucideIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PillarKey = 'cabala' | 'astrologia' | 'tantra' | 'odu' | 'iching';

export interface PillarVoice {
  key: PillarKey;
  /** Cor HEX/Tailwind-safe (mesma paleta do MandalaChart). */
  color: string;
  /** Classe Tailwind text-color. */
  colorClass: string;
  /** Ícone lucide. */
  icon: LucideIcon;
  /** Classe Tailwind para border-left + glow. */
  borderClass: string;
  /** Fundo gradient by pilar. */
  bgGradient: string;
}

export interface CitedPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi?: string | null;
}

export interface MandalaUniversalViewProps {
  locale: string;
  /** Data do `/api/akasha/mandala` — usada só para saudação, NÃO PII. */
  saudacao: string;
  /** Lista de papers cross-referenciados (3-5 items). */
  papers: CitedPaper[];
}

// ─── 5 Pilares — fonte da verdade visual ─────────────────────────────────────

export const PILLAR_VOICES: readonly PillarVoice[] = [
  {
    key: 'cabala',
    color: '#8b5cf6',
    colorClass: 'text-violet-400',
    borderClass: 'border-violet-500/40',
    bgGradient: 'from-violet-500/15 to-violet-500/0',
    icon: Sparkles,
  },
  {
    key: 'astrologia',
    color: '#fbbf24',
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-500/40',
    bgGradient: 'from-amber-500/15 to-amber-500/0',
    icon: Compass,
  },
  {
    key: 'tantra',
    color: '#f43f5e',
    colorClass: 'text-rose-400',
    borderClass: 'border-rose-500/40',
    bgGradient: 'from-rose-500/15 to-rose-500/0',
    icon: Flame,
  },
  {
    key: 'odu',
    color: '#10b981',
    colorClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
    bgGradient: 'from-emerald-500/15 to-emerald-500/0',
    icon: Sprout,
  },
  {
    key: 'iching',
    color: '#3b82f6',
    colorClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
    bgGradient: 'from-blue-500/15 to-blue-500/0',
    icon: Telescope,
  },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────

export function MandalaUniversalView({
  locale: _locale,
  saudacao,
  papers,
}: MandalaUniversalViewProps) {
  const { t } = useTranslation();

  return (
    <main
      className="flex flex-col items-center px-4 py-6 sm:py-8"
      style={{
        background: '#06070F',
        minHeight: 'calc(100vh - 56px)',
        position: 'relative',
      }}
    >
      {/* Atmosfera — pulse radial sutil, sem distrair. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at top, rgba(240,180,41,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(124,92,255,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        {/* 1. HERO — verdade universal em destaque */}
        <header className="flex flex-col items-center gap-3 pt-2 text-center sm:pt-4">
          <span
            className="text-[0.65rem] uppercase tracking-[0.25em] text-amber-300/70 sm:text-xs"
            style={{ fontFamily: 'var(--font-cinzel, serif)' }}
          >
            {saudacao}
          </span>
          <h1
            className="px-2 text-2xl font-bold leading-tight text-white sm:text-4xl"
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              letterSpacing: '0.04em',
              textShadow: '0 0 30px rgba(240,180,41,0.25)',
            }}
          >
            {t('mandala.universal.tagline')}
          </h1>
          <p
            className="max-w-md px-2 text-sm leading-relaxed text-white/70 sm:text-base"
            style={{ fontFamily: 'var(--font-cinzel, serif)' }}
          >
            {t('mandala.universal.subtitle')}
          </p>
        </header>

        {/* 2. 5 CARDS — grid mobile-first */}
        <section
          aria-label={t('mandala.universal.explore')}
          className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-1"
        >
          {PILLAR_VOICES.map((p) => (
            <PillarCard
              key={p.key}
              pillar={p}
              voice={t(`mandala.universal.pillar.${p.key}`)}
            />
          ))}
        </section>

        {/* 3. PAPERS CITED — cross-references */}
        {papers.length > 0 && (
          <section
            aria-label={t('mandala.universal.citations')}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
          >
            <h2
              className="text-[0.7rem] uppercase tracking-[0.2em] text-amber-300/70 sm:text-xs"
              style={{ fontFamily: 'var(--font-cinzel, serif)' }}
            >
              {t('mandala.universal.citations')}
            </h2>
            <ul className="flex flex-col gap-3">
              {papers.map((paper) => (
                <li
                  key={paper.id}
                  className="flex flex-col gap-1 border-l-2 border-amber-500/30 pl-3"
                >
                  <span className="text-sm font-medium text-white/90">
                    {paper.title}
                  </span>
                  <span className="text-xs text-white/55">
                    {paper.authors.slice(0, 3).join(', ')}
                    {paper.authors.length > 3 ? ' et al.' : ''} · {paper.year} ·{' '}
                    <em>{paper.journal}</em>
                    {paper.doi && (
                      <>
                        {' · '}
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-300/80 underline-offset-2 hover:underline"
                        >
                          doi:{paper.doi}
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 4. EXPLORE — CTA secundário */}
        <nav className="flex flex-col items-center gap-2 pb-4">
          <a
            href="/dashboard"
            className={cn(
              'inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-wider',
              'border border-violet-500/40 bg-violet-500/10 text-violet-300',
              'transition-all hover:bg-violet-500/20'
            )}
          >
            → Análise Completa
          </a>
          <a
            href="/diario"
            className="text-[0.7rem] tracking-wider text-white/40 transition-colors hover:text-white/70"
          >
            → Ver Diário de hoje
          </a>
        </nav>
      </div>
    </main>
  );
}

// ─── PillarCard (subcomponente) ─────────────────────────────────────────────

interface PillarCardProps {
  pillar: PillarVoice;
  voice: string;
}

function PillarCard({ pillar, voice }: PillarCardProps) {
  const Icon = pillar.icon;

  return (
    <article
      data-pillar={pillar.key}
      className={cn(
        'relative flex flex-col gap-2 overflow-hidden rounded-xl',
        'border bg-gradient-to-br p-3.5 sm:p-4',
        pillar.borderClass,
        pillar.bgGradient
      )}
      style={{
        backgroundColor: 'rgba(6,7,15,0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Header — ícone + nome do pilar */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            'border border-white/10 bg-black/30'
          )}
          style={{ color: pillar.color }}
          aria-hidden
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <h3
          className={cn(
            'text-sm font-bold uppercase tracking-[0.12em] sm:text-base',
            pillar.colorClass
          )}
          style={{ fontFamily: 'var(--font-cinzel, serif)' }}
        >
          {labelForPillar(pillar.key)}
        </h3>
      </div>

      {/* Voz — texto curto, sem floreio (≤25 palavras) */}
      <p className="text-[0.83rem] leading-relaxed text-white/80 sm:text-sm">
        {voice}
      </p>
    </article>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Label canônico por Pilar — i18n fallback (PT-BR) se useTranslation
 * não prover. UI consumers preferem `t()` quando disponível; este é
 * fallback deterministic que mantém aúdio de teste.
 */
function labelForPillar(key: PillarKey): string {
  switch (key) {
    case 'cabala':
      return 'Cabala';
    case 'astrologia':
      return 'Astrologia';
    case 'tantra':
      return 'Tantra';
    case 'odu':
      return 'Odu';
    case 'iching':
      return 'I Ching';
  }
}

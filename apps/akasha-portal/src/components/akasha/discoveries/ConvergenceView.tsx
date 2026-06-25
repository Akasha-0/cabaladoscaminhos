'use client';

/**
 * ConvergenceView — Wave 25.2 (Universalismo visceral em ação).
 *
 * Card visual que mostra as 5 vozes por tradição CONVERGINDO numa única
 * verdade universal. É o coração estético de ADR-013: "Akasha Portal =
 * espiritualidade universalista e visceral" — os 5 Pilares não competem,
 * dizem a MESMA verdade em línguas diferentes.
 *
 * Layout (mobile-first, 360px stack vertical):
 *
 *   ┌────────────────────────────────────────┐
 *   │  ✦ Verdade Universal                    │
 *   │  "Propósito é direção, não destino —   │   ← destaque (Top)
 *   │   vá onde o corpo sente medo."          │
 *   │                                        │
 *   │  As 5 vozes convergem:                  │
 *   │  🕉  Cabala:    "O 11 é iluminação..."  │   ← 5 cards (Mid)
 *   │  ☀️  Astrologia: "Nodo Norte aponta..." │
 *   │  🔥  Tantra:   "Corpo 1 é o centro..." │
 *   │  🌳  Odu:      "ípínlà é o arco..."    │
 *   │  ☯  I Ching:  "Hexagrama 50 — ..."     │
 *   │      ↓ converge em ↓                    │   ← linha visual (Bottom)
 *   │      ✦ Verdade Universal                │
 *   │  [Mostrar papers citados →]             │   ← expand CTA
 *   └────────────────────────────────────────┘
 *
 * Design principles:
 *   - Visceral: Truth no topo (≤ 15 palavras), tipografia generosa,
 *     glow violeta que remete ao "ponto onde tudo se encontra".
 *   - Universalista: 5 pilares SEMPRE com mesma altura/cor (sem
 *     hierarquia), `sourceLabel` resolve label por locale.
 *   - Mobile-first: tudo empilha em 360px; sm: tweaks sutis.
 *   - A11y: aria-labelledby apontando pro title; truth em role=status
 *     com aria-live="polite" (anuncia mudança ao usuário).
 *   - i18n: usa 'discoveries.convergence.*' (5 chaves).
 *
 * Integração (Wave 25.2):
 *   - /atendimento/[sessionId]      — destaca a convergência do chain ativo.
 *   - /admin/discoveries             — auditoria visual das 5 vozes.
 *   - /admin/consciousness (25.1)    — preview rápido.
 *
 * ADR-014: escopo focado — 1 arquivo, sem fetch interno. Caller passa
 * o view-model; se quiser loading state, faça fetch server-side e
 * passe `discovery` já pronto (Wave 25.3+ pode plugar API adapter).
 */

import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

import { useTranslation } from '@/i18n';
import { getTranslations } from '@/lib/i18n';
import { cn } from '@/lib/shared/utils';

import {
  SOURCE_DISPLAY,
  sourceLabel,
  type DiscoverySource,
} from './sources';

// ─── View-model ────────────────────────────────────────────────────────────

/**
 * Voz de uma tradição (1 dos 5 pilares) dizendo sua parte da verdade.
 *
 * ≤ 25 palavras por voz (regra Wave 25.2). É o "fragmento" que
 * o pilar contribui pra síntese.
 */
export interface ConvergenceVoice {
  /** Pilar de origem (cabala | astrologia | tantra | odu | iching). */
  source: DiscoverySource;
  /**
   * Frase visceral da voz (≤ 25 palavras). Ex.: "O 11 é iluminação
   * que só o medo aceita ver."
   */
  statement: string;
  /**
   * Símbolo/ref citável opcional (ex.: "Keter", "Hexagrama 50",
   * "Ofun Ogbè"). Aparece em itálico discreto antes da statement.
   */
  symbol?: string;
}

/**
 * View-model consumido por `ConvergenceView`.
 *
 * Caller (server component ou adapter de API) constrói a partir de:
 *   - `DiscoveryChain.synthesis.verdadeUniversal` (Wave 20.2)
 *   - `DiscoveryChain.synthesis.vozesPorTradicao` (Wave 25.2 — schema
 *     a ser introduzido na Wave 25.3+ junto com o adapter)
 *
 * Este shape é INDEPENDENTE do `ThoughtChainViewModel` (Wave 23.2) —
 * aquele é a cadeia de pensamento completa (5 steps), este é SÓ o
 * momento da convergência. Componentes complementares.
 */
export interface ConvergenceViewModel {
  /** ID da DiscoveryChain (para `data-discovery-id` + analytics). */
  discoveryId: string;
  /**
   * Verdade universal que as 5 vozes convergem (≤ 15 palavras, visceral).
   * É a estrela do card.
   */
  verdadeUniversal: string;
  /**
   * 5 vozes (1 por pilar) que se encontram na verdade. Wave 25.2
   * aceita qualquer tamanho ≥ 2 (não força 5) — se faltar pilar, o
   * caller decide se mostra placeholder ou omite.
   */
  voices: ConvergenceVoice[];
  /** Confidence 0-1 (mostra como mini-badge discreto). */
  confidence?: number;
  /** Número de papers citados (mostra no expand CTA: "Mostrar (3) papers"). */
  papersCount?: number;
  /**
   * Callback para o CTA "Mostrar papers citados →". Se omitido, CTA
   * não renderiza (modo display-only).
   */
  onExpandPapers?: () => void;
  /** Locale para labels i18n. Default = 'pt-BR'. */
  locale?: string;
  /** Optional className for layout integration. */
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Conta palavras de forma robusta (split em whitespace). */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Limita o número de vozes renderizadas a 5 (regra Wave 25.2 — 5 Pilares).
 * Se vier mais (futuro addition de literature), prioriza a ordem do caller
 * (que conhece a relevância).
 */
const MAX_VOICES = 5;
function clampVoices(voices: ConvergenceVoice[]): ConvergenceVoice[] {
  return voices.slice(0, MAX_VOICES);
}

function confidenceLabel(confidence: number, locale: string): string {
  const pct = Math.round(confidence * 100);
  return locale === 'en' ? `confidence ${pct}%` : `confiança ${pct}%`;
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface TruthCardProps {
  verdadeUniversal: string;
  confidence: number | undefined;
  locale: string;
}

function TruthCard({ verdadeUniversal, confidence, locale }: TruthCardProps) {
  const words = countWords(verdadeUniversal);
  return (
    <section
      data-testid="convergence-truth-card"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'relative overflow-hidden rounded-xl border border-violet-700/40',
        'bg-gradient-to-br from-violet-950/60 via-slate-900 to-violet-950/40',
        'px-4 py-5 shadow-[0_0_24px_-12px_rgba(139,92,246,0.6)]'
      )}
    >
      {/* Halo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_60%)]"
      />

      <div className="relative">
        <header className="mb-2 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-900/60 ring-1 ring-violet-500/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            {locale === 'en' ? 'Universal Truth' : 'Verdade Universal'}
          </h3>
          {typeof confidence === 'number' ? (
            <span className="ml-auto rounded-full bg-violet-900/60 px-2 py-0.5 text-[10px] font-medium text-violet-200 ring-1 ring-violet-700/40">
              {confidenceLabel(confidence, locale)}
            </span>
          ) : null}
        </header>

        <blockquote
          data-testid="convergence-truth"
          className="text-base font-medium leading-snug text-slate-50 sm:text-lg"
        >
          <span aria-hidden="true" className="mr-1 text-violet-400">
            ✦
          </span>
          {verdadeUniversal}
        </blockquote>

        {/* Contador de palavras (não-semântico, em sr-only) — assertiva
            "≤ 15 palavras" do design Wave 25.2. */}
        <p className="sr-only" data-testid="convergence-truth-wordcount">
          {words}
        </p>
      </div>
    </section>
  );
}

interface VoiceCardProps {
  voice: ConvergenceVoice;
  locale: string;
  /** Index 0-based (usado para visual da "linha de convergência" e aria). */
  index: number;
}

function VoiceCard({ voice, locale, index }: VoiceCardProps) {
  const display = SOURCE_DISPLAY[voice.source];
  const Icon = display.icon;
  // Fallback: usa label do SOURCE_DISPLAY se caller não passou statement
  // relacionada ao source (defensivo — a contract é caller fornece ambos).
  const label = sourceLabel(voice.source, locale);

  return (
    <li
      data-testid={`convergence-voice-${voice.source}`}
      data-voice-index={index}
      className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          'bg-slate-800 ring-1 ring-slate-700'
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', display.colorClass)} />
      </span>

      <div className="min-w-0 flex-1">
        <header className="flex items-baseline gap-1.5">
          <span className={cn('text-xs font-semibold', display.colorClass)}>
            {label}
          </span>
          {voice.symbol ? (
            <span className="text-xs italic text-slate-400">
              · {voice.symbol}
            </span>
          ) : null}
        </header>
        <p className="mt-0.5 text-sm leading-snug text-slate-200">
          {voice.statement}
        </p>
      </div>
    </li>
  );
}

interface ConvergenceLineProps {
  /** Texto entre as setas (i18n 'convergenceLine'). */
  label: string;
}

/**
 * Linha visual de convergência (Bottom do card).
 *
 * SVG inline simples: seta pra baixo + label + seta pra baixo.
 * Visualmente conecta as 5 vozes (acima) à verdade universal (abaixo).
 */
function ConvergenceLine({ label }: ConvergenceLineProps) {
  return (
    <div
      data-testid="convergence-line"
      aria-hidden="true"
      className="flex flex-col items-center gap-1 py-1"
    >
      <svg
        width="2"
        height="20"
        viewBox="0 0 2 20"
        className="overflow-visible"
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="18"
          stroke="rgb(139 92 246 / 0.5)"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        <polygon
          points="0,18 2,18 1,20"
          fill="rgb(139 92 246 / 0.7)"
        />
      </svg>
      <span className="text-[10px] uppercase tracking-widest text-violet-300/80">
        {label}
      </span>
    </div>
  );
}

interface ExpandCtaProps {
  label: string;
  papersCount: number | undefined;
  onClick: (() => void) | undefined;
}

function ExpandCta({ label, papersCount, onClick }: ExpandCtaProps) {
  if (!onClick) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="convergence-expand-cta"
      className={cn(
        'mt-3 inline-flex w-full items-center justify-center gap-2',
        'rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2',
        'text-xs font-medium text-slate-200',
        'hover:bg-slate-800/80 hover:border-violet-600/60 hover:text-violet-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
        'transition-colors'
      )}
    >
      <BookOpen className="h-3.5 w-3.5" aria-hidden={true} />
      <span>
        {label}
        {typeof papersCount === 'number' && papersCount > 0 ? (
          <span className="ml-1 text-slate-400">({papersCount})</span>
        ) : null}
      </span>
      <ArrowRight className="h-3.5 w-3.5" aria-hidden={true} />
    </button>
  );
}

// ─── Componente raiz ──────────────────────────────────────────────────────

export function ConvergenceView({
  discoveryId,
  verdadeUniversal,
  voices,
  confidence,
  papersCount,
  onExpandPapers,
  locale: localeProp,
  className,
}: ConvergenceViewModel) {
  const { t: defaultT } = useTranslation();

  // Não usamos `t` para labels específicos (verdadeUniversal, voices[].statement)
  // — são conteúdo, não chrome. Mas usamos para o chrome do card.
  // Locale override é necessário em SSR pra evitar mismatch com hydration.
  const locale = localeProp ?? 'pt-BR';

  // Quando locale é fornecido (SSR ou teste), usa o tradutor direto daquele
  // locale; caso contrário usa o hook (default pt-BR). Garante paridade com
  // a prop `locale` em testes E em produção (SSR-safe).
  const t = localeProp ? getTranslations(locale) : defaultT;

  const visibleVoices = clampVoices(voices);
  const titleId = `convergence-view-title-${discoveryId}`;

  return (
    <article
      data-testid="convergence-view"
      data-discovery-id={discoveryId}
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-800',
        'bg-slate-950/60 p-3 sm:p-4',
        className
      )}
    >
      {/* Header */}
      <header className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-900/40 ring-1 ring-violet-700/40"
        >
          <Sparkles className="h-4 w-4 text-violet-300" />
        </span>
        <h2
          id={titleId}
          className="text-base font-semibold leading-tight text-slate-50"
        >
          {t('discoveries.convergence.title')}
        </h2>
      </header>

      {/* Top: Verdade Universal destacada */}
      <TruthCard
        verdadeUniversal={verdadeUniversal}
        confidence={confidence}
        locale={locale}
      />

      {/* Mid: 5 vozes por tradição */}
      <section aria-label={t('discoveries.convergence.voicesLabel')}>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('discoveries.convergence.voicesLabel')}
        </h3>
        {visibleVoices.length === 0 ? (
          <p
            className="text-xs italic text-slate-500"
            data-testid="convergence-voices-empty"
          >
            {locale === 'en'
              ? 'No voices contributed to this synthesis.'
              : 'Nenhuma voz contribuiu para esta síntese.'}
          </p>
        ) : (
          <ul
            data-testid="convergence-voices"
            className="flex flex-col gap-1.5"
          >
            {visibleVoices.map((voice, index) => (
              <VoiceCard
                key={`${voice.source}-${index}`}
                voice={voice}
                locale={locale}
                index={index}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Bottom: linha de convergência (visual) */}
      <ConvergenceLine
        label={t('discoveries.convergence.convergenceLine')}
      />

      {/* CTA: mostrar papers citados */}
      <ExpandCta
        label={t('discoveries.convergence.expand')}
        papersCount={papersCount}
        onClick={onExpandPapers}
      />
    </article>
  );
}
'use client';

/**
 * StatePicker — Wave 9.1 One-Screen Hub
 *
 * The 1-click emotional state chooser. Shown at the top of /meu-dia when
 * the persisted state is missing or stale (≥24h).
 *
 * Design constraints (from the plan + grill-me):
 *   - Touch-friendly: each tile is min 80×80px, full-width grid on mobile.
 *   - One click writes both localStorage and the `akasha_state` cookie.
 *   - Accessible: `role="radiogroup"`, `role="radio"`, `aria-checked`,
 *     and descriptive `aria-label`s for screen readers.
 *   - Visual language: emerald (centrado) / blue (ansioso) / amber (perdido)
 *     / violet (curioso) — distinct hues so the colour itself encodes state.
 *   - "Pular" link is intentionally low-emphasis — we don't force the
 *     picker, but we DO persist whichever choice the user makes (or doesn't).
 *
 * The picker is purely presentational: the caller decides whether to render
 * it (via `useEmotionalState().needsPrompt`). This makes it trivial to test.
 */

import { motion } from 'framer-motion';
import { Sprout, Waves, Compass, Sparkles } from 'lucide-react';

import {
  EMOTIONAL_STATES,
  type EmotionalState,
} from '@/lib/state/emotional-state';

export interface StatePickerProps {
  /** Called when the user picks a state — already persisted by the caller. */
  onSelect: (state: EmotionalState) => void;
  /** Called when the user clicks "pular" — no state is persisted. */
  onSkip?: () => void;
  /** Optional heading override (defaults to a PT-BR fallback). */
  heading?: string;
}

interface TileConfig {
  state: EmotionalState;
  icon: typeof Sprout;
  emoji: string;
  color: string;
  glow: string;
  gradient: string;
  border: string;
}

const TILES: readonly TileConfig[] = [
  {
    state: 'centrado',
    icon: Sprout,
    emoji: '🌿',
    color: '#34D399',
    glow: 'rgba(52, 211, 153, 0.35)',
    gradient: 'linear-gradient(145deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)',
    border: 'rgba(52,211,153,0.45)',
  },
  {
    state: 'ansioso',
    icon: Waves,
    emoji: '🌊',
    color: '#60A5FA',
    glow: 'rgba(96, 165, 250, 0.35)',
    gradient: 'linear-gradient(145deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.06) 100%)',
    border: 'rgba(96,165,250,0.45)',
  },
  {
    state: 'perdido',
    icon: Compass,
    emoji: '🧭',
    color: '#FBBF24',
    glow: 'rgba(251, 191, 36, 0.35)',
    gradient: 'linear-gradient(145deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.06) 100%)',
    border: 'rgba(251,191,36,0.45)',
  },
  {
    state: 'curioso',
    icon: Sparkles,
    emoji: '🔮',
    color: '#A78BFA',
    glow: 'rgba(167, 139, 250, 0.35)',
    gradient: 'linear-gradient(145deg, rgba(167,139,250,0.18) 0%, rgba(139,92,246,0.06) 100%)',
    border: 'rgba(167,139,250,0.45)',
  },
] as const;

export function StatePicker({ onSelect, onSkip, heading }: StatePickerProps) {
  const resolvedHeading = heading ?? 'Como você está hoje?';
  const subtitle =
    'A página se adapta ao que você precisa agora. Escolher uma vez — perguntamos de novo só depois de 24h.';
  const skipLabel = 'Pular por agora';

  // Touch-keyboard accessibility: tiles are real <button>s so they're
  // tab-focusable by default. `role="radiogroup"` lets AT announce the
  // picker as a single-choice group.
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-white/10 p-5 sm:p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(28,28,30,0.95) 0%, rgba(20,20,22,0.98) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      role="radiogroup"
      aria-label={resolvedHeading}
      data-testid="state-picker"
    >
      <header className="mb-4">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold m-0">
          Wave 9 · One-Screen Hub
        </p>
        <h2 className="text-lg sm:text-xl font-bold text-white leading-tight mt-1 mb-1">
          {resolvedHeading}
        </h2>
        <p className="text-xs text-white/55 leading-relaxed m-0">{subtitle}</p>
      </header>

      <div className="grid grid-cols-2 gap-3" data-testid="state-picker-grid">
        {TILES.map((tile, i) => {
          const Icon = tile.icon;
          const ariaLabel = stateAriaLabel(tile.state);
          return (
            <motion.button
              key={tile.state}
              type="button"
              role="radio"
              aria-checked={false}
              aria-label={ariaLabel}
              onClick={() => onSelect(tile.state)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative rounded-2xl p-4 text-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: tile.gradient,
                border: `1px solid ${tile.border}`,
                minHeight: 96,
                minWidth: 96,
              }}
              data-state={tile.state}
              data-testid={`state-picker-tile-${tile.state}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, ${tile.color}25 0%, ${tile.color}10 100%)`,
                    border: `1px solid ${tile.color}50`,
                    boxShadow: `0 0 18px -6px ${tile.glow}`,
                  }}
                >
                  <Icon size={22} style={{ color: tile.color }} aria-hidden />
                </div>
                <div
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: tile.color }}
                >
                  {stateLabel(tile.state)}
                </div>
                <div className="text-[11px] text-white/55 leading-tight">
                  {stateHint(tile.state)}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Sanity: keep EMOTIONAL_STATES referenced so future tiles added there
          surface here too (the grid above is the actual list, but this
          assertion keeps the contract visible at build time). */}
      <span data-states={EMOTIONAL_STATES.join(',')} className="sr-only">
        {EMOTIONAL_STATES.length} estados disponíveis
      </span>

      {onSkip && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] text-white/40 hover:text-white/70 underline-offset-2 hover:underline transition-colors"
            data-testid="state-picker-skip"
          >
            {skipLabel}
          </button>
        </div>
      )}
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Localised label helpers — keyed off the EmotionalState enum.
// Keep these tiny (no i18n lookup needed for the four canonical words).
// The full copy lives in messages/*.json for richer translations; this is
// the at-least-something-readable fallback.
// ─────────────────────────────────────────────────────────────────────────────

function stateLabel(s: EmotionalState): string {
  switch (s) {
    case 'centrado':
      return 'Centrado';
    case 'ansioso':
      return 'Ansioso';
    case 'perdido':
      return 'Perdido';
    case 'curioso':
      return 'Curioso';
  }
}

function stateHint(s: EmotionalState): string {
  switch (s) {
    case 'centrado':
      return 'em paz';
    case 'ansioso':
      return 'preciso de calma';
    case 'perdido':
      return 'sem direção';
    case 'curioso':
      return 'quero explorar';
  }
}

function stateAriaLabel(s: EmotionalState): string {
  switch (s) {
    case 'centrado':
      return 'Estou centrado — em paz';
    case 'ansioso':
      return 'Estou ansioso — preciso de calma';
    case 'perdido':
      return 'Estou perdido — sem direção';
    case 'curioso':
      return 'Estou curioso — quero explorar';
  }
}

export default StatePicker;
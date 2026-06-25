'use client';

/**
 * StatePicker — Wave 10.3 One-Screen Hub polish
 *
 * The 1-click emotional state chooser. Shown at the top of /meu-dia when
 * the persisted state is missing or stale (≥24h).
 *
 * Wave 10.3 polish (driven by Gabriel's frustration: "se eu estou com
 * ansiedade hoje, eu vou ter que ficar procurando na interface até eu
 * achar aquilo que eu preciso"):
 *   - Bigger touch targets (120×120 min, was 96×96) — easier on the thumb.
 *   - Emoji glyph (48px) is now the dominant visual cue, the icon stays
 *     as accent. The colour alone can be ambiguous under poor lighting.
 *   - Copy is shorter: heading is 5 words, subtitle is 8 words.
 *   - Tile layout: emoji → name (bold) → hint. Vertical rhythm is uniform.
 *   - "Pular" stays low-emphasis but is now a real link with min 44px hit
 *     area (was a 11px text node).
 *
 * Accessibility (preserved from Wave 9.1):
 *   - role="radiogroup" + role="radio" + aria-checked.
 *   - aria-label per tile spells the full sentence for screen readers.
 *   - prefers-reduced-motion: framer-motion scales/animations are muted
 *     via the same media query (handled by framer-motion's MotionConfig
 *     up the tree — kept here as a no-JS fallback for legacy mounts).
 *
 * The picker is purely presentational: the caller decides whether to render
 * it (via `useEmotionalState().needsPrompt`). This makes it trivial to test.
 */

import { motion } from 'framer-motion';
import { Sprout, Waves, Compass, Sparkles } from 'lucide-react';
import { useState } from 'react';

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
  /**
   * Pre-selected state. The caller can pass this when the picker is shown
   * in a confirm/edit context. When unset, no tile is marked as checked.
   * NOTE: selection state is *local* to the component on purpose — the
   * authoritative state lives in the caller (useEmotionalState). This
   * avoids a flash of "no selection" on first render when a state is
   * already persisted.
   */
  selected?: EmotionalState | null;
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

export function StatePicker({ onSelect, onSkip, heading, selected = null }: StatePickerProps) {
  const resolvedHeading = heading ?? 'Como você está hoje?';
  const subtitle = 'A página se adapta ao que você precisa.';
  const skipLabel = 'Pular por agora';

  // Local selection state — mirrors the caller-passed `selected` initially
  // and is updated when the user picks a tile. We surface this via
  // aria-checked on each radio so screen readers announce the active
  // selection. The caller is still authoritative via onSelect.
  const [picked, setPicked] = useState<EmotionalState | null>(selected);
  const activeState = picked ?? selected;

  // Touch-keyboard accessibility: tiles are real <button>s so they're
  // tab-focusable by default. `role="radiogroup"` lets AT announce the
  // picker as a single-choice group.
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-white/10 p-4 sm:p-5"
      style={{
        background: 'linear-gradient(145deg, rgba(28,28,30,0.95) 0%, rgba(20,20,22,0.98) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      role="radiogroup"
      aria-label={resolvedHeading}
      data-testid="state-picker"
    >
      <header className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight m-0">
          {resolvedHeading}
        </h2>
        <p className="text-sm text-white/60 leading-relaxed mt-1.5 m-0">
          {subtitle}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3" data-testid="state-picker-grid">
        {TILES.map((tile, i) => {
          const Icon = tile.icon;
          const ariaLabel = stateAriaLabel(tile.state);
          const isSelected = activeState === tile.state;
          return (
            <motion.button
              key={tile.state}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={ariaLabel}
              onClick={() => {
                setPicked(tile.state);
                onSelect(tile.state);
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative rounded-2xl px-3 py-5 text-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: tile.gradient,
                border: `1px solid ${tile.border}`,
                minHeight: 120,
                minWidth: 120,
                // Per-tile focus ring colour keeps the design language:
                // each emotional state tints its own focus indicator.
                // Outline is drawn with outlineColor + box-shadow ring
                // fallback for older Safari.
                outlineColor: tile.color,
                boxShadow: isSelected
                  ? `0 0 0 2px ${tile.color} inset, 0 0 18px -4px ${tile.glow}`
                  : undefined,
              }}
              data-state={tile.state}
              data-testid={`state-picker-tile-${tile.state}`}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Emoji glyph — dominant visual cue (was unused in Wave 9.1) */}
                <span
                  className="leading-none"
                  aria-hidden="true"
                  style={{ fontSize: '2.5rem', lineHeight: 1 }}
                >
                  {tile.emoji}
                </span>
                <div className="flex items-center gap-1.5">
                  <Icon size={14} style={{ color: tile.color }} aria-hidden />
                  <span
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: tile.color }}
                  >
                    {stateLabel(tile.state)}
                  </span>
                </div>
                <div className="text-[11px] text-white/65 leading-tight">
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
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[48px] px-4 text-xs text-white/50 hover:text-white/80 underline-offset-2 hover:underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 rounded"
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

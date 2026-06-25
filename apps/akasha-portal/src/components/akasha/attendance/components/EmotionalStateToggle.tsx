'use client';

/**
 * EmotionalStateToggle — Wave 22.2 Zelador Attendance UI
 *
 * Toggle horizontal compacto com os 4 estados emocionais (Wave 9.1).
 * Aparece logo abaixo do ClientCard em /atendimento, permitindo ao
 * Zelador trocar o estado do cliente em 1 toque — sem abrir modal.
 *
 * Visual:
 *   [🌿 Centrado] [🌊 Ansioso] [🧭 Perdido] [🔮 Curioso]
 *              ^ estado ativo destacado com border + bg
 *
 * Diferenças em relação ao StatePicker (Wave 10.3):
 *   - StatePicker é cheio, com 4 tiles 120×120 + opção "pular".
 *   - Aqui é inline, compacto (44px altura), usado em contexto
 *     de atendimento ativo (não first-time onboarding).
 *
 * Single source of truth:
 *   - O value/onChange vem do parent (que sincroniza com useEmotionalState).
 *   - O hook de localStorage fica no AttendanceClient.
 */

import { Sprout, Waves, Compass, Sparkles } from 'lucide-react';

import {
  EMOTIONAL_STATES,
  type EmotionalState,
} from '@/lib/state/emotional-state';

// ─────────────────────────────────────────────────────────────────────────────
// Visual config
// ─────────────────────────────────────────────────────────────────────────────

interface TileVisual {
  emoji: string;
  icon: typeof Sprout;
  color: string; // text color when active
  bg: string;    // bg color when active
  border: string;// border color when active
}

const TILE_VISUAL: Record<EmotionalState, TileVisual> = {
  centrado: {
    emoji: '🌿',
    icon: Sprout,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-400/50',
  },
  ansioso: {
    emoji: '🌊',
    icon: Waves,
    color: 'text-sky-300',
    bg: 'bg-sky-500/15',
    border: 'border-sky-400/50',
  },
  perdido: {
    emoji: '🧭',
    icon: Compass,
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-400/50',
  },
  curioso: {
    emoji: '🔮',
    icon: Sparkles,
    color: 'text-violet-300',
    bg: 'bg-violet-500/15',
    border: 'border-violet-400/50',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Labels
// ─────────────────────────────────────────────────────────────────────────────

export interface EmotionalStateLabels {
  centrado: string;
  ansioso: string;
  perdido: string;
  curioso: string;
}

export interface EmotionalStateToggleProps {
  /** Estado atual (controlado pelo parent). */
  value: EmotionalState;
  /** Disparado quando Zelador toca em outro estado. */
  onChange: (next: EmotionalState) => void;
  /** Strings traduzidas (parent passa via useTranslation). */
  labels: EmotionalStateLabels;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EmotionalStateToggle({
  value,
  onChange,
  labels,
}: EmotionalStateToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Estado emocional do consulente"
      className="grid grid-cols-4 gap-1.5 md:gap-2"
      data-testid="attendance-emotional-toggle"
    >
      {EMOTIONAL_STATES.map((state) => {
        const visual = TILE_VISUAL[state];
        const Icon = visual.icon;
        const isActive = state === value;
        const label = labels[state];

        return (
          <button
            key={state}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => onChange(state)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl border transition-all min-h-[44px] ${
              isActive
                ? `${visual.bg} ${visual.border} ${visual.color} scale-[1.02]`
                : 'bg-white/[0.02] border-white/10 text-ak-text-subtle hover:bg-white/[0.05] hover:text-white/80'
            }`}
            data-testid={`attendance-emotional-${state}`}
            data-active={isActive}
          >
            <span className="text-lg md:text-xl leading-none" aria-hidden>
              {visual.emoji}
            </span>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.1em] truncate max-w-full">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default EmotionalStateToggle;

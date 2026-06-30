'use client';

// ============================================================================
// VoiceModeButton — chat header toggle for Akasha TTS playback (W94-B)
// ============================================================================
// Three visual states:
//   - off (microphone icon): voice mode disabled
//   - consent-pending (amber ring): awaiting LGPD consent
//   - on (speaker icon, accent color): voice mode active
//
// LGPD-first: NEVER auto-enables. First click opens VoiceConsentModal; only
// after explicit user consent does the engine start playing.
//
// Mobile-first: 44×44 minimum touch target (Apple HIG + WCAG 2.5.5).
// Accessibility:
//   - aria-pressed reflects active state
//   - aria-label localized (pt-BR canonical)
//   - prefers-reduced-motion respected (no scale on active state)
//
// This button is a TOGGLE — pairing with VoiceModePanel for full control.
// ============================================================================

import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type VoiceModeButtonState = 'off' | 'consent_pending' | 'on' | 'loading';

export interface VoiceModeButtonProps {
  /** Current state of the voice mode. */
  state: VoiceModeButtonState;
  /** Triggered on click — must open consent modal first when 'off'. */
  onClick?: () => void;
  /** Show only on mobile (>=sm) — desktop may use voice mode via panel directly. */
  /** Optional localized labels. Defaults to pt-BR. */
  labels?: {
    off?: string;
    on?: string;
    pending?: string;
    loading?: string;
  };
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function VoiceModeButton({
  state,
  onClick,
  labels,
  className,
}: VoiceModeButtonProps) {
  const [pressed, setPressed] = useState(false);

  const handleClick = useCallback(() => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onClick?.();
  }, [onClick]);

  const label =
    state === 'on'
      ? (labels?.on ?? 'A Akasha está falando')
      : state === 'consent_pending'
        ? (labels?.pending ?? 'Aguardando seu consentimento')
        : state === 'loading'
          ? (labels?.loading ?? 'Carregando voz')
          : (labels?.off ?? 'Permitir que a Akasha fale');

  const tooltip =
    state === 'on'
      ? 'Toque para abrir controles de voz'
      : state === 'consent_pending'
        ? 'Confirme o consentimento para continuar'
        : state === 'loading'
          ? 'Preparando sua voz...'
          : 'Ativar voz da Akasha (LGPD)';

  // ─── Visual config per state ──────────────────────────────────────────
  const visualClass =
    state === 'on'
      ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/60 hover:bg-amber-500/30'
      : state === 'consent_pending'
        ? 'bg-amber-900/30 text-amber-300 ring-2 ring-amber-500/40 animate-pulse'
        : state === 'loading'
          ? 'bg-slate-800/60 text-slate-300 ring-1 ring-slate-500/40'
          : 'bg-slate-900/40 text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-800/70 hover:text-amber-200';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={state === 'on'}
      title={tooltip}
      data-testid="voice-mode-button"
      data-state={state}
      className={cn(
        // 44×44 touch target (mobile-first)
        'inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 text-xs',
        // Base transitions
        'transition-all duration-200',
        // Focus visible
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
        // Reduced motion (no scale animation if user opted out)
        'motion-reduce:active:scale-100 active:scale-[0.97]',
        // Disabled if loading
        state === 'loading' && 'cursor-wait',
        // State-driven visual
        visualClass,
        className,
      )}
    >
      {state === 'on' && <Volume2 className="h-4 w-4" aria-hidden />}
      {state === 'consent_pending' && <MicOff className="h-4 w-4" aria-hidden />}
      {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {state === 'off' && <Mic className="h-4 w-4" aria-hidden />}
      <span className="hidden sm:inline">
        {state === 'on' ? 'Voz ativa' : state === 'consent_pending' ? 'Consentir' : state === 'loading' ? '...' : 'Voz'}
      </span>
    </button>
  );
}

export default VoiceModeButton;

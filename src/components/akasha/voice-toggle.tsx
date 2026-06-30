'use client';

// ============================================================================
// VoiceToggle — Floating Action Button for Akasha voice mode (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Floating action button (bottom-right) that opens a voice-mode panel.
// Three states: off (VolumeX icon), on (Volume2 icon), error (alert icon).
// Click outside to dismiss. Mobile-first (44×44 hit target).
//
// This component is the SHELL — the actual playback is wired through
// `useTtsStream` (parent passes the hook return). It only manages
// visibility + tradition picker + speed slider.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, AlertCircle, X, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AKASHA_TRADITIONS,
  type PlaybackSnapshot,
  type Tradition,
} from '@/lib/tts/types';
import { VOICE_PRESETS } from '@/lib/tts/voice-presets';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface VoiceToggleProps {
  /** Whether voice mode is currently active. */
  enabled: boolean;
  /** Setter. */
  onToggle: (next: boolean) => void;
  /** Playback snapshot from useTtsStream. */
  playback?: PlaybackSnapshot;
  /** Currently selected tradition. */
  tradition?: Tradition;
  /** Tradition setter. */
  onTraditionChange?: (t: Tradition) => void;
  /** Optional playback rate slider (0.8..1.2). When set, shows the slider. */
  rate?: number;
  onRateChange?: (r: number) => void;
  /** Optional volume (0..1). */
  volume?: number;
  onVolumeChange?: (v: number) => void;
  /** Cancel / stop in-flight playback. */
  onCancel?: () => void;
  /** Whether the server TTS is reachable. */
  serverAvailable?: boolean | null;
  /** Whether Web Speech API is available. */
  webSpeechAvailable?: boolean;
  /** Show as expanded panel (for desktop) — when false, compact FAB. */
  initiallyExpanded?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VoiceToggle({
  enabled,
  onToggle,
  playback,
  tradition = 'cigano',
  onTraditionChange,
  rate = 1.0,
  onRateChange,
  volume = 1.0,
  onVolumeChange,
  onCancel,
  serverAvailable = null,
  webSpeechAvailable = false,
  initiallyExpanded = false,
  className,
}: VoiceToggleProps) {
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Click-outside dismiss for the panel.
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const handleFabClick = useCallback(() => {
    if (!enabled) {
      onToggle(true);
      setExpanded(true);
    } else {
      setExpanded((prev) => !prev);
    }
  }, [enabled, onToggle]);

  const handleClose = useCallback(() => {
    setExpanded(false);
    if (enabled) onToggle(false);
    onCancel?.();
  }, [enabled, onCancel, onToggle]);

  // -------------------------------------------------------------------
  // Status icon
  // -------------------------------------------------------------------
  const state = playback?.state ?? 'idle';
  const Icon =
    state === 'error'
      ? AlertCircle
      : enabled
        ? Volume2
        : VolumeX;
  const stateLabel =
    state === 'error'
      ? 'Erro de áudio'
      : enabled
        ? 'Modo voz ativo'
        : 'Modo voz desativado';

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2',
        'sm:bottom-6 sm:right-6',
        className
      )}
      data-testid="voice-toggle-root"
    >
      {expanded && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Configurações de voz"
          className={cn(
            'w-72 max-w-[90vw] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl',
            'backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95'
          )}
        >
          <div className="flex items-center justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-500" aria-hidden />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Modo voz
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Fechar painel de voz"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Tradition picker */}
          {onTraditionChange && (
            <div className="mb-3">
              <label
                htmlFor="voice-tradition"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Tradição
              </label>
              <select
                id="voice-tradition"
                value={tradition}
                onChange={(e) => onTraditionChange(e.target.value as Tradition)}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {AKASHA_TRADITIONS.map((t) => (
                  <option key={t} value={t}>
                    {VOICE_PRESETS[t].label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rate slider */}
          {onRateChange && (
            <div className="mb-3">
              <label
                htmlFor="voice-rate"
                className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                <span>Velocidade</span>
                <span className="tabular-nums">{rate.toFixed(2)}x</span>
              </label>
              <input
                id="voice-rate"
                type="range"
                min={0.8}
                max={1.2}
                step={0.05}
                value={rate}
                onChange={(e) => onRateChange(Number(e.target.value))}
                className="w-full"
                aria-label="Velocidade de reprodução"
              />
            </div>
          )}

          {/* Volume slider */}
          {onVolumeChange && (
            <div className="mb-3">
              <label
                htmlFor="voice-volume"
                className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                <span>Volume</span>
                <span className="tabular-nums">{Math.round(volume * 100)}%</span>
              </label>
              <input
                id="voice-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full"
                aria-label="Volume"
              />
            </div>
          )}

          {/* Status row */}
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="truncate">
              {state === 'idle' && 'Aguardando…'}
              {state === 'loading' && 'Carregando…'}
              {state === 'playing' && 'Reproduzindo…'}
              {state === 'paused' && 'Pausado'}
              {state === 'ready' && 'Pronto'}
              {state === 'error' && (playback?.error ?? 'Erro')}
            </span>
            <span className="shrink-0">
              {serverAvailable === true
                ? '🟢 servidor'
                : serverAvailable === false
                  ? webSpeechAvailable
                    ? '🟡 web speech'
                    : '🔴 offline'
                  : '…'}
            </span>
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={handleFabClick}
        aria-label={enabled ? 'Desativar modo voz' : 'Ativar modo voz'}
        aria-pressed={enabled}
        data-state={state}
        data-enabled={enabled}
        className={cn(
          'group flex h-14 w-14 items-center justify-center rounded-full shadow-xl',
          'transition-all duration-150 active:scale-95',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/60',
          enabled
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
        )}
        data-testid="voice-fab"
      >
        <Icon
          className={cn(
            'h-6 w-6 transition-transform',
            state === 'playing' && 'animate-pulse',
            state === 'error' && 'text-red-500'
          )}
          aria-hidden
        />
        <span className="sr-only">{stateLabel}</span>
      </button>
    </div>
  );
}

export default VoiceToggle;

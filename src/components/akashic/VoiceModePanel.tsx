'use client';

// ============================================================================
// VoiceModePanel — voice mode control panel (W94-B)
// ============================================================================
// Slide-up panel from bottom (or modal) with:
//   - Voice preset selector (3 cards: calma, presente, sabia)
//   - Playback controls: play/pause/skip/stop
//   - Volume slider (0-100)
//   - Revoke consent button
//
// Accessibility:
//   - ARIA labels for every interactive element
//   - Keyboard navigation: Space = toggle, Esc = close, ← / → = preset
//   - Reduced motion respected
//
// LGPD:
//   - Revoke button reverts to idle + records consent revocation
//   - "Saiba mais" link to /privacidade
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Square, Volume2, ShieldOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VOICE_PRESETS, type VoicePreset, type VoiceModeState } from '@/lib/w94/voice-mode';
import type { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface VoiceModePanelProps {
  /** Current voice mode engine state. */
  state: VoiceModeState;
  /** Active preset (VoiceMode engine getter). */
  activePreset: VoicePreset;
  /** Toggle playback (play if paused, pause if playing). */
  onToggle?: () => void;
  /** Skip to next segment. */
  onSkip?: () => void;
  /** Stop playback entirely. */
  onStop?: () => void;
  /** Switch to a different preset. */
  onPresetChange?: (preset: VoicePreset) => void;
  /** Volume change handler (0-100). */
  onVolumeChange?: (volume: number) => void;
  /** Current volume (0-100). */
  volume?: number;
  /** Revoke consent — disable voice mode entirely (LGPD). */
  onRevokeConsent?: () => void;
  /** Close the panel. */
  onClose?: () => void;
  /** Optional title (defaults to pt-BR). */
  title?: string;
  /** Optional custom close affordance slot. */
  headerSlot?: ReactNode;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function VoiceModePanel({
  state,
  activePreset,
  onToggle,
  onSkip,
  onStop,
  onPresetChange,
  onVolumeChange,
  volume = 80,
  onRevokeConsent,
  onClose,
  title,
  headerSlot,
  className,
}: VoiceModePanelProps) {
  const [localVolume, setLocalVolume] = useState<number>(volume);
  const panelRef = useRef<HTMLDivElement>(null);

  // ─── Keyboard nav ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onToggle?.();
      } else if (e.key === 'ArrowRight') {
        // Next preset
        e.preventDefault();
        const ordered: VoicePreset[] = ['calma', 'presente', 'sabia'];
        const idx = ordered.indexOf(activePreset);
        const next = ordered[(idx + 1) % ordered.length];
        if (next) onPresetChange?.(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const ordered: VoicePreset[] = ['calma', 'presente', 'sabia'];
        const idx = ordered.indexOf(activePreset);
        const prev = ordered[(idx - 1 + ordered.length) % ordered.length];
        if (prev) onPresetChange?.(prev);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activePreset, onPresetChange, onToggle, onClose]);

  const isPlaying = state.kind === 'playing';
  const isPaused = state.kind === 'paused';
  const isLoading = state.kind === 'loading';

  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setLocalVolume(v);
      onVolumeChange?.(v);
    },
    [onVolumeChange],
  );

  const handleRevoke = useCallback(() => {
    onRevokeConsent?.();
    onClose?.();
  }, [onRevokeConsent, onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-mode-panel-title"
      data-testid="voice-mode-panel"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[90vh] w-full max-w-md flex-col gap-4 rounded-t-2xl border-t border-amber-500/30 bg-slate-950/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black/60 backdrop-blur-md',
        'animate-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none',
        'sm:rounded-2xl sm:border sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2',
        className,
      )}
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <h2
          id="voice-mode-panel-title"
          className="text-base font-semibold text-amber-200"
        >
          {title ?? 'Voz da Akasha'}
        </h2>
        <div className="flex items-center gap-2">
          {headerSlot}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel de voz"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 motion-reduce:active:scale-100 active:scale-[0.97]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* ─── Status line ────────────────────────────────────────────── */}
      <p className="text-xs text-slate-400" aria-live="polite">
        {state.kind === 'idle' && 'Toque em uma voz para começar'}
        {state.kind === 'consent_pending' && 'Aguardando seu consentimento'}
        {state.kind === 'loading' && 'Preparando a voz...'}
        {isPlaying && `Segmento ${state.segment + 1} de ${state.total} — ${VOICE_PRESETS[state.preset].label}`}
        {isPaused && 'Pausado'}
        {state.kind === 'error' && `Erro: ${state.reason}`}
        {state.kind === 'denied' && 'Você optou por não usar a voz da Akasha'}
      </p>

      {/* ─── Preset cards ───────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-2" aria-label="Selecionar voz">
        <legend className="text-[11px] uppercase tracking-wide text-slate-500">
          Voz
        </legend>
        {(Object.values(VOICE_PRESETS) as readonly { id: VoicePreset; label: string; description: string; icon: string }[]).map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetChange?.(preset.id)}
              aria-pressed={isActive}
              data-testid={`preset-${preset.id}`}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
                'motion-reduce:active:scale-100 active:scale-[0.99]',
                isActive
                  ? 'border-amber-400/60 bg-amber-500/10 text-amber-100'
                  : 'border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-500/60 hover:bg-slate-800/60',
              )}
            >
              <span className="text-2xl" aria-hidden>
                {preset.icon}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{preset.label}</span>
                <span className="text-xs text-slate-400">{preset.description}</span>
              </div>
            </button>
          );
        })}
      </fieldset>

      {/* ─── Volume slider ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="voice-volume" className="text-[11px] uppercase tracking-wide text-slate-500">
            Volume
          </label>
          <span className="text-xs text-slate-400">{localVolume}</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            id="voice-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={localVolume}
            onChange={handleVolume}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={localVolume}
            className="h-2 w-full appearance-none rounded-full bg-slate-700/60 accent-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          />
        </div>
      </div>

      {/* ─── Playback controls ──────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={isLoading || state.kind === 'idle' || state.kind === 'consent_pending'}
          aria-label={isPlaying ? 'Pausar leitura' : 'Iniciar leitura'}
          className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-full text-amber-100',
            'bg-amber-500/20 ring-1 ring-amber-400/60 hover:bg-amber-500/30',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
            'motion-reduce:active:scale-100 active:scale-[0.97]',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" aria-hidden />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={!isPlaying && !isPaused}
          aria-label="Pular para o próximo segmento"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 motion-reduce:active:scale-100 active:scale-[0.97] disabled:opacity-40"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={state.kind === 'idle'}
          aria-label="Parar leitura"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 motion-reduce:active:scale-100 active:scale-[0.97] disabled:opacity-40"
        >
          <Square className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* ─── LGPD: revoke consent ───────────────────────────────────── */}
      <button
        type="button"
        onClick={handleRevoke}
        aria-label="Interromper e revogar consentimento de voz"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 motion-reduce:active:scale-100 active:scale-[0.98]"
      >
        <ShieldOff className="h-3.5 w-3.5" aria-hidden />
        Interromper e revogar consentimento
      </button>
    </div>
  );
}

export default VoiceModePanel;

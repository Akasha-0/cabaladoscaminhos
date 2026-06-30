'use client';

// ============================================================================
// AudioPlayer — Inline playback controls (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Renders an inline audio player with play/pause, seek, time readouts,
// and a "cancel" button. Used for a single sentence reply; the floating
// VoiceToggle handles the multi-sentence queue.
//
// State machine: idle → loading → playing ↔ paused → idle | error.
//
// All keyboard-accessible: Space toggles, ← → seek ±5s, M mutes.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlaybackSnapshot, PlaybackState } from '@/lib/tts/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AudioPlayerProps {
  /** Audio URL (object URL or remote). */
  src?: string | null;
  /** Auto-play on mount. Default false (browser autoplay policy). */
  autoPlay?: boolean;
  /** Initial volume (0..1). */
  initialVolume?: number;
  /** Playback rate (0.8..1.2). */
  rate?: number;
  /** Compact mode (no time readouts, smaller controls). */
  compact?: boolean;
  /** When playback ends. */
  onEnded?: () => void;
  /** When user pauses. */
  onPause?: () => void;
  /** When user resumes. */
  onPlay?: () => void;
  /** When an error occurs. */
  onError?: (err: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AudioPlayer({
  src,
  autoPlay = false,
  initialVolume = 1.0,
  rate = 1.0,
  compact = false,
  onEnded,
  onPause,
  onPlay,
  onError,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot>({
    state: 'idle',
    currentTime: 0,
    duration: 0,
  });
  const [volume, setVolume] = useState<number>(initialVolume);
  const [muted, setMuted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bind audio element events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setSnapshot((s) => ({
        ...s,
        state: 'playing' as PlaybackState,
        currentTime: audio.currentTime,
        duration: Number.isFinite(audio.duration) ? audio.duration : s.duration,
      }));
    };
    const onLoaded = () => {
      setSnapshot((s) => ({
        ...s,
        state: 'ready',
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }));
    };
    const onEnd = () => {
      setSnapshot((s) => ({ ...s, state: 'idle', currentTime: 0 }));
      onEnded?.();
    };
    const onErr = () => {
      const msg = 'Falha ao carregar áudio.';
      setErrorMsg(msg);
      setSnapshot((s) => ({ ...s, state: 'error', error: msg }));
      onError?.(msg);
    };
    const onWait = () => setSnapshot((s) => ({ ...s, state: 'loading' }));
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onErr);
    audio.addEventListener('waiting', onWait);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onErr);
      audio.removeEventListener('waiting', onWait);
    };
  }, [onEnded, onError]);

  // Sync src changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (src) {
      audio.src = src;
      audio.load();
      setErrorMsg(null);
      setSnapshot((s) => ({ ...s, state: 'loading' }));
      if (autoPlay) {
        audio.play().catch(() => {
          // Browser blocked autoplay — that's fine, user can press play.
        });
      }
    } else {
      audio.removeAttribute('src');
      audio.load();
      setSnapshot({ state: 'idle', currentTime: 0, duration: 0 });
    }
  }, [src, autoPlay]);

  // Sync rate changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
  }, [rate]);

  // Sync volume.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // -------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------
  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => {
        setSnapshot((s) => ({ ...s, state: 'playing' }));
        onPlay?.();
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Reprodução bloqueada';
        setErrorMsg(msg);
        setSnapshot((s) => ({ ...s, state: 'error', error: msg }));
        onError?.(msg);
      });
  }, [onError, onPlay]);

  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setSnapshot((s) => ({ ...s, state: 'paused' }));
    onPause?.();
  }, [onPause]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setSnapshot((s) => ({ ...s, state: 'idle', currentTime: 0 }));
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, seconds));
  }, []);

  // Keyboard: Space, Arrows, M
  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (snapshot.state === 'playing') handlePause();
        else handlePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(snapshot.currentTime - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeek(snapshot.currentTime + 5);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMuted((m) => !m);
      }
    },
    [snapshot.currentTime, snapshot.state, handlePause, handlePlay, handleSeek]
  );

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  const Icon =
    snapshot.state === 'playing'
      ? Pause
      : snapshot.state === 'loading'
        ? Loader2
        : snapshot.state === 'error'
          ? AlertCircle
          : Play;

  const iconLabel =
    snapshot.state === 'playing'
      ? 'Pausar'
      : snapshot.state === 'loading'
        ? 'Carregando'
        : snapshot.state === 'error'
          ? 'Erro'
          : 'Reproduzir';

  return (
    <div
      role="region"
      aria-label="Player de áudio"
      tabIndex={0}
      onKeyDown={onKey}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm',
        'backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80',
        compact ? 'w-fit' : 'w-full max-w-md',
        className
      )}
      data-testid="audio-player-root"
      data-state={snapshot.state}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        aria-hidden
        data-testid="audio-player-element"
      />
      <button
        type="button"
        onClick={snapshot.state === 'playing' ? handlePause : handlePlay}
        disabled={snapshot.state === 'loading' || !src}
        aria-label={iconLabel}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          'bg-emerald-500 text-white shadow transition-transform active:scale-95',
          'hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
          'disabled:cursor-not-allowed disabled:bg-slate-300'
        )}
        data-testid="audio-player-toggle"
      >
        <Icon
          className={cn(
            'h-5 w-5',
            snapshot.state === 'loading' && 'animate-spin',
            snapshot.state === 'error' && 'text-red-200'
          )}
          aria-hidden
        />
      </button>
      <button
        type="button"
        onClick={handleStop}
        disabled={snapshot.state === 'idle' || snapshot.state === 'error' || !src}
        aria-label="Parar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Square className="h-4 w-4" aria-hidden />
      </button>
      {!compact && (
        <>
          <span
            className="min-w-[3.5rem] text-right text-xs tabular-nums text-slate-500"
            aria-label="Tempo atual"
          >
            {formatTime(snapshot.currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0.01, snapshot.duration)}
            step={0.05}
            value={snapshot.currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            disabled={!snapshot.duration || snapshot.state === 'error'}
            aria-label="Posição da reprodução"
            className="flex-1 accent-emerald-500"
          />
          <span
            className="min-w-[3.5rem] text-left text-xs tabular-nums text-slate-500"
            aria-label="Duração total"
          >
            {formatTime(snapshot.duration)}
          </span>
        </>
      )}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Ativar som' : 'Silenciar'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      </button>
      {errorMsg && !compact && (
        <span
          role="alert"
          className="ml-2 text-xs text-red-600"
          title={errorMsg}
        >
          {truncate(errorMsg, 40)}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

export default AudioPlayer;

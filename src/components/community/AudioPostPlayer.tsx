/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — AudioPostPlayer (client component)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Audio player with play/pause/seek + waveform overlay + time + volume.
 *
 * Uses:
 *   - HTMLAudioElement (createRef pattern + useEffect for play/pause)
 *   - WaveformCanvas via peaks prop
 *   - formatDuration for time display
 *   - Lucide icons for controls
 */

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WaveformCanvas } from './WaveformCanvas';
import { formatDuration } from '@/lib/w90s/audio-posts-upload';

export interface AudioPostPlayerProps {
  /** URL to the playable audio blob/file (object URL or remote URL) */
  src: string;
  /** Title for screen readers */
  title: string;
  /** Waveform peaks array (length ≤200) */
  peaks: readonly number[];
  /** Total duration in seconds */
  durationSeconds: number;
  /** Auto-resume from a position (e.g., when linked with `?t=`) */
  initialSeekSeconds?: number;
  /** Allow user to scrub + control playback */
  controls?: boolean;
  /** Optional className override */
  className?: string;
  /** Called when the audio finishes playing */
  onEnded?: () => void;
}

export function AudioPostPlayer({
  src,
  title,
  peaks,
  durationSeconds,
  initialSeekSeconds = 0,
  controls = true,
  className,
  onEnded,
}: AudioPostPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialSeekSeconds);
  const [duration, setDuration] = useState(durationSeconds);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sync HTMLAudioElement lifecycle with src / currentTime changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (initialSeekSeconds > 0 && Number.isFinite(initialSeekSeconds)) {
      try {
        audio.currentTime = initialSeekSeconds;
      } catch {
        // Some browsers reject setting currentTime before metadata loads
      }
    }
  }, [initialSeekSeconds, src]);

  // Update time + duration on metadata load + timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const onErr = () => setLoadError('Não foi possível carregar o áudio.');
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onErr);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onErr);
    };
  }, [onEnded, src]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro de reprodução';
      setLoadError(msg);
      setIsPlaying(false);
    }
  }, []);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const onScrub = useCallback((positionRatio: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const d = Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : duration;
    const target = Math.max(0, Math.min(d, d * positionRatio));
    audio.currentTime = target;
    setCurrentTime(target);
  }, [duration]);

  const onVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseFloat(e.target.value);
    setVolume(Number.isFinite(next) ? Math.max(0, Math.min(1, next)) : 1);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const progressRatio = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  return (
    <section
      role="region"
      aria-label={`Player de áudio: ${title}`}
      data-testid="audio-post-player"
      className={cn(
        'mx-auto w-full max-w-full space-y-3 rounded-lg border bg-card p-4 md:max-w-2xl',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="truncate text-base font-semibold" title={title}>
          {title}
        </h2>
        <span
          className="shrink-0 text-xs text-muted-foreground"
          aria-label="Duração total"
          data-testid="audio-duration-label"
        >
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </header>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        data-testid="audio-element"
        aria-hidden="true"
      />

      <WaveformCanvas
        peaks={peaks}
        progressRatio={progressRatio}
        onScrub={controls ? onScrub : undefined}
        height={64}
        ariaLabel={`Forma de onda de ${title}`}
      />

      {controls ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={restart}
            aria-label="Voltar ao início"
            data-testid="audio-restart-button"
            className="min-h-[44px] min-w-[44px]"
          >
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            aria-pressed={isPlaying}
            data-testid="audio-play-button"
            data-state={isPlaying ? 'playing' : 'paused'}
            className="min-h-[44px] min-w-[44px]"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <div className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Ativar som' : 'Silenciar'}
              aria-pressed={muted}
              data-testid="audio-mute-button"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-input bg-background hover:bg-muted"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <label className="sr-only" htmlFor="audio-volume-input">
              Volume
            </label>
            <input
              id="audio-volume-input"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={onVolumeChange}
              aria-label="Volume"
              data-testid="audio-volume-input"
              className="h-2 w-full max-w-[160px] cursor-pointer accent-primary"
            />
          </div>
        </div>
      ) : null}

      {loadError ? (
        <p
          role="alert"
          aria-live="polite"
          data-testid="audio-load-error"
          className="text-xs text-destructive"
        >
          {loadError}
        </p>
      ) : null}
    </section>
  );
}

export default AudioPostPlayer;

'use client';

// ============================================================================
// AudioPost — Card de post multimídia com áudio narrado
// ============================================================================
// Player de áudio com waveform customizado (canvas), transcrição
// colapsável, badges de metadados sagrados, e indicador de PII redigido
// (LGPD Art. 18 — direito de saber o que foi modificado).
//
// Mobile-first: tap target 44px, prefers-reduced-motion respeitado.
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play, Pause, Volume2, ChevronDown, ChevronUp,
  Shield, Sparkles, Clock, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/w94/media-posts';
import type { AudioPost as AudioPostType } from '@/lib/w94/media-posts';

// ============================================================================
// Visual constants
// ============================================================================

const TRADITION_LABELS: Record<string, string> = {
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
};

const TRADITION_GRADIENT: Record<string, string> = {
  candomble: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
  umbanda: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
  ifa: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
  cabala: 'from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30',
  astrologia: 'from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30',
  tantra: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30',
};

// ============================================================================
// WaveformCanvas — render de peaks em canvas com seek-on-tap
// ============================================================================

interface WaveformCanvasProps {
  peaks: number[];
  progress: number; // 0..1
  onSeek: (fraction: number) => void;
  height?: number;
  reducedMotion: boolean;
}

function WaveformCanvas({
  peaks, progress, onSeek, height = 64, reducedMotion,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Desenha waveform sempre que peaks/progress mudam
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);

    // Limpa
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const barCount = peaks.length;
    if (barCount === 0) return;

    const totalGap = barCount - 1;
    const barWidth = Math.max(1, (cssWidth - totalGap * 1) / barCount);
    const centerY = cssHeight / 2;

    for (let i = 0; i < barCount; i++) {
      const v = peaks[i] ?? 0;
      const barHeight = Math.max(2, v * (cssHeight - 4));
      const x = i * (barWidth + 1);
      const y = centerY - barHeight / 2;

      // Cor: progress tocada vs não-tocada
      const fraction = i / barCount;
      if (fraction <= progress) {
        ctx.fillStyle = reducedMotion ? '#f59e0b' : 'rgba(245, 158, 11, 0.95)';
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      }
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [peaks, progress, reducedMotion]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fraction = Math.max(0, Math.min(1, x / rect.width));
      onSeek(fraction);
    },
    [onSeek]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full cursor-pointer select-none"
      style={{ height: `${height}px` }}
      role="slider"
      aria-label="Posição do áudio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onKeyDown={(e) => {
        // Keyboard seek: setas ±5%
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onSeek(Math.max(0, progress - 0.05));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onSeek(Math.min(1, progress + 0.05));
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
}

// ============================================================================
// AudioPost — componente principal
// ============================================================================

export interface AudioPostProps {
  post: AudioPostType;
  /** Callback ao trocar like/reaction (passa pro hook pai) */
  onReact?: (postId: string) => void;
  /** Se true, mostra botão de "abrir transcrição" */
  showTranscription?: boolean;
  /** dev user id para auth bypass em sandbox */
  devUserId?: string;
}

export function AudioPost({
  post, onReact, showTranscription = true, devUserId,
}: AudioPostProps) {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptionOpen, setTranscriptionOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detecta prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Listeners do <audio>
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoad = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadeddata', onLoad);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadeddata', onLoad);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch (err) {
        console.warn('[AudioPost] play() rejeitado:', err);
      }
    } else {
      audio.pause();
    }
  }, []);

  const handleSeek = useCallback(
    (fraction: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const target = fraction * post.durationSec;
      audio.currentTime = target;
      setCurrentTime(target);
    },
    [post.durationSec]
  );

  const progress = post.durationSec > 0
    ? Math.min(1, currentTime / post.durationSec)
    : 0;

  const tradition = post.sacredMetadata?.tradition;
  const entities = post.sacredMetadata?.entities ?? [];

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header — Author + Title */}
        <div className="space-y-1">
          <h3
            className="text-base sm:text-lg font-semibold text-slate-100 leading-snug"
            data-testid="audio-post-title"
          >
            {post.title}
          </h3>
          <p className="text-xs text-slate-500">
            {t('media.audioBy', { author: post.authorId } as Record<string, string | number>)}
          </p>
        </div>

        {/* Sacred Metadata Badges */}
        {(tradition || entities.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {tradition && (
              <Badge
                className={cn(
                  'bg-gradient-to-r border text-xs px-2 py-0.5',
                  TRADITION_GRADIENT[tradition] ?? TRADITION_GRADIENT.cabala
                )}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {TRADITION_LABELS[tradition] ?? tradition}
              </Badge>
            )}
            {entities.map((entity) => (
              <Badge
                key={entity}
                variant="outline"
                className="text-xs px-2 py-0.5 border-slate-700 text-slate-300"
              >
                {entity}
              </Badge>
            ))}
          </div>
        )}

        {/* Player */}
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            'bg-slate-950/60 border border-slate-800/60'
          )}
        >
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={togglePlay}
            disabled={isLoading}
            className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
            aria-label={isPlaying ? t('media.pause') : t('media.play')}
            data-testid="audio-play-button"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <WaveformCanvas
              peaks={post.waveformData}
              progress={progress}
              onSeek={handleSeek}
              reducedMotion={reducedMotion}
            />
          </div>

          <div
            className="text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap"
            aria-live="polite"
          >
            {formatDuration(currentTime)} / {formatDuration(post.durationSec)}
          </div>
        </div>

        {/* Audio element (hidden) */}
        <audio
          ref={audioRef}
          src={post.audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
          data-testid="audio-element"
        >
          <track kind="captions" />
        </audio>

        {/* LGPD — Indicador de transcrição redigida */}
        {post.transcriptionRedacted && (
          <div
            className="flex items-start gap-2 p-2.5 rounded-md bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200"
            role="status"
            data-testid="audio-pii-indicator"
          >
            <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              {t('media.transcriptionPiiRedacted')}
            </span>
          </div>
        )}

        {/* Transcrição colapsável */}
        {showTranscription && post.transcription && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setTranscriptionOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] py-2"
              aria-expanded={transcriptionOpen}
              aria-controls={`transcription-${post.id}`}
              data-testid="audio-transcription-toggle"
            >
              {transcriptionOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {t('media.transcription')}
            </button>
            {transcriptionOpen && (
              <p
                id={`transcription-${post.id}`}
                className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-slate-950/40 border border-slate-800/40"
              >
                {post.transcription}
              </p>
            )}
          </div>
        )}

        {/* Footer — duration + volume icon hint */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(post.durationSec)}</span>
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <Volume2 className="w-3 h-3" />
            <span className="sr-only">{t('media.volume')}</span>
          </div>
        </div>

        {/* Reaction (opcional) */}
        {onReact && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onReact(post.id)}
            className="min-h-[44px] text-xs text-slate-400 hover:text-amber-300"
            data-testid="audio-react"
          >
            {t('media.sendAxé')}
          </Button>
        )}

        {devUserId && (
          <span className="sr-only">dev:{devUserId}</span>
        )}
      </CardContent>
    </Card>
  );
}

export default AudioPost;

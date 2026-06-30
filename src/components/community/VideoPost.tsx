'use client';

// ============================================================================
// VideoPost — Card de post multimídia com vídeo curto (< 60s)
// ============================================================================
// HTML5 <video> com controles custom (sem native UI). Chapters
// clicáveis, poster com play overlay, transcrição colapsável,
// badges de tradição + entidades.
//
// LGPD: indica transcrição redigida. Mobile-first, autoplay off,
// prefers-reduced-motion respeitado.
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, ChevronDown, ChevronUp,
  Shield, Sparkles, Clock, Loader2, Film,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/w94/media-posts';
import type { VideoPost as VideoPostType } from '@/lib/w94/media-posts';

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
// VideoPost — main component
// ============================================================================

export interface VideoPostProps {
  post: VideoPostType;
  onReact?: (postId: string) => void;
  showTranscription?: boolean;
  devUserId?: string;
}

export function VideoPost({
  post, onReact, showTranscription = true, devUserId,
}: VideoPostProps) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Muted by default (autoplay-safe)
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptionOpen, setTranscriptionOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
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

  // Listeners do <video>
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onEnded = () => setIsPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      try {
        await v.play();
        setHasStarted(true);
      } catch (err) {
        console.warn('[VideoPost] play() rejeitado:', err);
      }
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const requestFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    if (typeof c.requestFullscreen === 'function') {
      void c.requestFullscreen().catch(() => {
        // user denied or unsupported — silent
      });
    }
  }, []);

  const handleChapterClick = useCallback(
    (startSec: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = startSec;
      setCurrentTime(startSec);
      if (v.paused) {
        void v.play().catch(() => {});
      }
    },
    []
  );

  const progress = post.durationSec > 0
    ? Math.min(1, currentTime / post.durationSec)
    : 0;

  const tradition = post.sacredMetadata?.tradition;
  const entities = post.sacredMetadata?.entities ?? [];
  const chapters = post.chapters ?? [];

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Video container — relative for overlay controls */}
        <div
          ref={containerRef}
          className="relative w-full bg-slate-950 aspect-video"
          data-testid="video-container"
        >
          <video
            ref={videoRef}
            src={post.videoUrl}
            poster={post.posterUrl}
            className="w-full h-full object-cover"
            playsInline
            muted={isMuted}
            preload="metadata"
            crossOrigin="anonymous"
            aria-label={post.title}
            data-testid="video-element"
          >
            {post.transcription && (
              <track kind="captions" />
            )}
          </video>

          {/* Poster + play overlay (mostrado antes de iniciar) */}
          {!hasStarted && !isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading}
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent',
                'transition-opacity',
                reducedMotion ? '' : 'hover:from-slate-950/60 active:scale-95'
              )}
              aria-label={t('media.play')}
              data-testid="video-play-overlay"
            >
              {isLoading ? (
                <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-amber-500/90 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                    <Play className="w-10 h-10 text-slate-950 ml-1" />
                  </div>
                  <span className="text-xs text-slate-200 font-medium">
                    {formatDuration(post.durationSec)}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* Bottom controls (custom) — só visíveis durante playback ou após start */}
          {hasStarted && (
            <div
              className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-slate-950/95 to-transparent flex items-center gap-2"
              data-testid="video-controls"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="min-h-[44px] min-w-[44px] h-9 w-9 text-white hover:bg-white/10"
                aria-label={isPlaying ? t('media.pause') : t('media.play')}
                data-testid="video-play-button"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* Progress bar */}
              <div
                className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const frac = Math.max(0, Math.min(1, x / rect.width));
                  const v = videoRef.current;
                  if (v) {
                    v.currentTime = frac * post.durationSec;
                    setCurrentTime(frac * post.durationSec);
                  }
                }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                aria-label={t('media.videoProgress')}
              >
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <span className="text-xs font-mono text-slate-300 tabular-nums">
                {formatDuration(currentTime)}/{formatDuration(post.durationSec)}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="min-h-[44px] min-w-[44px] h-9 w-9 text-white hover:bg-white/10"
                aria-label={isMuted ? t('media.unmute') : t('media.mute')}
                data-testid="video-mute-button"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={requestFullscreen}
                className="min-h-[44px] min-w-[44px] h-9 w-9 text-white hover:bg-white/10 hidden sm:flex"
                aria-label={t('media.fullscreen')}
                data-testid="video-fullscreen-button"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Header — title + author */}
          <div className="space-y-1">
            <h3
              className="text-base sm:text-lg font-semibold text-slate-100 leading-snug flex items-start gap-2"
              data-testid="video-post-title"
            >
              <Film className="w-4 h-4 mt-1 flex-shrink-0 text-amber-400" />
              {post.title}
            </h3>
            <p className="text-xs text-slate-500">
              {t('media.videoBy', { author: post.authorId } as Record<string, string | number>)}
            </p>
          </div>

          {/* Sacred metadata badges */}
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

          {/* Chapters — clique para pular */}
          {chapters.length > 0 && (
            <div className="space-y-1.5" data-testid="video-chapters">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t('media.chapters')}
              </p>
              <ul className="space-y-1">
                {chapters.map((c) => {
                  const active = currentTime >= c.startSec &&
                    (chapters[chapters.indexOf(c) + 1]?.startSec ?? Infinity) > currentTime;
                  return (
                    <li key={`${c.startSec}-${c.index}`}>
                      <button
                        type="button"
                        onClick={() => handleChapterClick(c.startSec)}
                        className={cn(
                          'w-full text-left min-h-[44px] px-3 py-2 rounded-md text-sm transition-colors',
                          'flex items-center gap-2',
                          active
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                            : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/70 border border-slate-800/60'
                        )}
                        aria-label={`${t('media.jumpTo')} ${formatDuration(c.startSec)}: ${c.title}`}
                      >
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="font-mono text-xs">{formatDuration(c.startSec)}</span>
                        <span className="truncate">{c.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* LGPD — transcrição redigida */}
          {post.transcriptionRedacted && (
            <div
              className="flex items-start gap-2 p-2.5 rounded-md bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200"
              role="status"
              data-testid="video-pii-indicator"
            >
              <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{t('media.transcriptionPiiRedacted')}</span>
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
                aria-controls={`video-transcription-${post.id}`}
                data-testid="video-transcription-toggle"
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
                  id={`video-transcription-${post.id}`}
                  className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-slate-950/40 border border-slate-800/40"
                >
                  {post.transcription}
                </p>
              )}
            </div>
          )}

          {/* Reaction button */}
          {onReact && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onReact(post.id)}
              className="min-h-[44px] text-xs text-slate-400 hover:text-amber-300"
              data-testid="video-react"
            >
              {t('media.sendAxé')}
            </Button>
          )}

          {devUserId && <span className="sr-only">dev:{devUserId}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoPost;

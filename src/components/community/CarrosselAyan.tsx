'use client';

// ============================================================================
// CarrosselAyan — Carrossel de Ayan (sequência narrativa 3-5 segments)
// ============================================================================
// "Ayan" = movimento em Iorubá. Inspirado em "carrossel" do Instagram mas
// com identidade própria do ciclo 94 (não é algoritmo, é jornada).
//
// Suporta swipe (touch), arrow keys (desktop), autoplay-toggle (LGPD-friendly,
// off by default — usuário precisa consentir explicitamente).
//
// Cada segment é AudioPost OU VideoPost (sub-componentes).
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Play, Pause, Sparkles, Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Switch nao exportado pelo shadcn/ui aqui — usamos MiniSwitch inline
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/w94/media-posts';
import type {
  CarrosselAyanPost, MediaSegment,
} from '@/lib/w94/media-posts';
import { AudioPost } from './AudioPost';
import { VideoPost } from './VideoPost';

// ============================================================================
// MiniSwitch — toggle binario inline (shadcn/ui nao exporta Switch aqui)
// ============================================================================

function MiniSwitch({
  id, checked, onCheckedChange, 'aria-label': ariaLabel,
}: {
  id?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'min-h-[44px] min-w-[44px] h-6 w-11 rounded-full p-0.5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
        checked ? 'bg-amber-500' : 'bg-slate-700'
      )}
    >
      <span
        className={cn(
          'block h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

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

// ============================================================================
// SegmentRenderer — dispatch para AudioPost ou VideoPost
// ============================================================================

interface SegmentRendererProps {
  segment: MediaSegment;
  onReact?: (id: string) => void;
}

function SegmentRenderer({ segment, onReact }: SegmentRendererProps) {
  if (segment.kind === 'audio') {
    return <AudioPost post={segment} onReact={onReact} />;
  }
  if (segment.kind === 'video') {
    return <VideoPost post={segment} onReact={onReact} />;
  }
  // text não deveria aparecer em carrossel (discriminated union narrowing)
  return null;
}

// ============================================================================
// CarrosselAyan — main component
// ============================================================================

export interface CarrosselAyanProps {
  post: CarrosselAyanPost;
  onReact?: (postId: string) => void;
  devUserId?: string;
}

export function CarrosselAyan({ post, onReact, devUserId }: CarrosselAyanProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false); // LGPD: off by default
  const [reducedMotion, setReducedMotion] = useState(false);
  const totalSegments = post.segments.length;

  // Detecta prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Scroll to active segment on index change
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const child = scroller.children[activeIndex] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex, reducedMotion]);

  // Autoplay: avança segmentos a cada 8s (LGPD: requer opt-in)
  useEffect(() => {
    if (!autoplay) return;
    if (activeIndex >= totalSegments - 1) return;
    const timer = setTimeout(() => {
      setActiveIndex((i) => Math.min(totalSegments - 1, i + 1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [autoplay, activeIndex, totalSegments]);

  // IntersectionObserver para detectar segment ativo
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            const idx = Array.from(scroller.children).indexOf(e.target as HTMLElement);
            if (idx >= 0) setActiveIndex(idx);
          }
        }
      },
      { root: scroller, threshold: 0.5 }
    );
    for (const child of Array.from(scroller.children)) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [totalSegments]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(totalSegments - 1, i + 1));
  }, [totalSegments]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(totalSegments - 1);
      }
    },
    [goPrev, goNext, totalSegments]
  );

  // Touch handlers para swipe (já coberto pelo scroll-snap, mas mantemos
  // para sinalizar intent de avançar/retroceder)
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
      const delta = touchStartX.current - endX;
      if (Math.abs(delta) > 40) {
        if (delta > 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
    },
    [goNext, goPrev]
  );

  const totalDuration = post.segments.reduce(
    (acc, s) => acc + s.durationSec,
    0
  );

  return (
    <Card
      className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={post.title}
      data-testid="carrossel-container"
    >
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <h3
              className="text-base sm:text-lg font-semibold text-slate-100 leading-snug flex-1"
              data-testid="carrossel-title"
            >
              {post.title}
            </h3>
            {post.commonTradition && (
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30 text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {TRADITION_LABELS[post.commonTradition]}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-3 h-3" />
            {t('media.carrosselMeta', {
              count: totalSegments,
              duration: formatDuration(totalDuration),
            } as Record<string, string | number>)}
          </p>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="min-h-[44px] min-w-[44px] h-10 w-10 text-slate-300 hover:text-amber-300 disabled:opacity-30"
              aria-label={t('media.prevSegment')}
              data-testid="carrossel-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goNext}
              disabled={activeIndex === totalSegments - 1}
              className="min-h-[44px] min-w-[44px] h-10 w-10 text-slate-300 hover:text-amber-300 disabled:opacity-30"
              aria-label={t('media.nextSegment')}
              data-testid="carrossel-next"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Segment indicator dots */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label={t('media.segments')}
          >
            {post.segments.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`${t('media.segment')} ${idx + 1} / ${totalSegments}`}
                data-testid={`carrossel-dot-${idx}`}
                className={cn(
                  'min-h-[44px] min-w-[44px] h-10 w-10 flex items-center justify-center rounded-full transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
                  idx === activeIndex
                    ? 'text-amber-300'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <span
                  className={cn(
                    'block rounded-full transition-all',
                    idx === activeIndex
                      ? 'h-2.5 w-2.5 bg-amber-400'
                      : 'h-2 w-2 bg-slate-600'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Autoplay toggle (LGPD: opt-in) */}
          <div className="flex items-center gap-2">
            {autoplay ? (
              <Pause className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-400" />
            )}
            <label
              htmlFor={`carrossel-autoplay-${post.id}`}
              className="text-xs text-slate-400 cursor-pointer select-none"
            >
              {t('media.autoplay')}
            </label>
            <MiniSwitch
              id={`carrossel-autoplay-${post.id}`}
              checked={autoplay}
              onCheckedChange={setAutoplay}
              aria-label={t('media.autoplay')}
              data-testid="carrossel-autoplay"
            />
          </div>
        </div>

        {/* Horizontal scrollable carousel */}
        <div
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            'flex gap-4 overflow-x-auto snap-x snap-mandatory',
            'pb-2 -mx-1 px-1',
            'scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent',
            reducedMotion ? '' : 'scroll-smooth'
          )}
          style={{ scrollbarWidth: 'thin' }}
          aria-live="polite"
        >
          {post.segments.map((segment, idx) => (
            <div
              key={segment.id}
              className="flex-shrink-0 w-full sm:w-[90%] md:w-[80%] snap-center"
              aria-hidden={idx !== activeIndex}
            >
              <SegmentRenderer segment={segment} onReact={onReact} />
            </div>
          ))}
        </div>

        {/* Reaction */}
        {onReact && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onReact(post.id)}
            className="min-h-[44px] text-xs text-slate-400 hover:text-amber-300"
            data-testid="carrossel-react"
          >
            {t('media.sendAxé')}
          </Button>
        )}

        {devUserId && <span className="sr-only">dev:{devUserId}</span>}
      </CardContent>
    </Card>
  );
}

export default CarrosselAyan;

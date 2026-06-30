/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — WaveformCanvas (client component)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Canvas-based waveform renderer.
 *
 * - Peaks are ≤200 floats (passed from generateWaveformPeaks)
 * - progressRatio (0..1) overlays the played region in a different color
 * - Click + keyboard arrow scrubbing if `onScrub` provided
 * - Resizes with container via ResizeObserver
 *
 * Canvas API + useRef pattern (cycle 85 lesson):
 *   - HTMLAudioElement.currentTime drives the canvas redraw on rAF
 *   - requestAnimationFrame is throttled when the audio is paused
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface WaveformCanvasProps {
  /** Peaks as floats in [0,1] */
  peaks: readonly number[];
  /** 0..1 — how much of the waveform has been played */
  progressRatio: number;
  /** Optional scrub callback — receives 0..1 position */
  onScrub?: (positionRatio: number) => void;
  /** Height in px (default 64) */
  height?: number;
  /** Width — fixed pixels or "100%" */
  width?: number | string;
  /** ARIA label for the canvas (a11y landmark) */
  ariaLabel?: string;
  /** Forwarded className */
  className?: string;
  /** Color of played peaks */
  playedColor?: string;
  /** Color of unplayed peaks */
  restingColor?: string;
}

const FALLBACK_HEIGHT = 64;

export function WaveformCanvas({
  peaks,
  progressRatio,
  onScrub,
  height = FALLBACK_HEIGHT,
  width = '100%',
  ariaLabel = 'Forma de onda',
  className,
  playedColor = 'oklch(0.55 0.18 270)',
  restingColor = 'oklch(0.78 0.05 270)',
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const ratio = useMemo(() => {
    return Number.isFinite(progressRatio) ? Math.max(0, Math.min(1, progressRatio)) : 0;
  }, [progressRatio]);

  // Render waveform into the 2D canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = (globalThis.devicePixelRatio || 1);
    const cssWidth = canvas.clientWidth || canvas.width || 1;
    const cssHeight = canvas.clientHeight || canvas.height || 1;
    const targetW = Math.max(1, Math.floor(cssWidth * dpr));
    const targetH = Math.max(1, Math.floor(cssHeight * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.clearRect(0, 0, targetW, targetH);

    if (!peaks || peaks.length === 0) {
      return;
    }

    const binCount = peaks.length;
    const binWidth = targetW / binCount;
    const baselineY = targetH / 2;
    const drawableHeight = targetH * 0.92;

    for (let i = 0; i < binCount; i++) {
      const v = peaks[i] ?? 0;
      const barHeight = Math.max(1, v * drawableHeight);
      const x = Math.floor(i * binWidth);
      const w = Math.max(1, Math.floor(binWidth) - 1);
      const y = Math.floor(baselineY - barHeight / 2);
      const h = Math.ceil(barHeight);
      const fillRatio = i / Math.max(1, binCount - 1);
      ctx.fillStyle = fillRatio <= ratio ? playedColor : restingColor;
      ctx.fillRect(x, y, w, h);
    }

    // Playhead marker
    const playheadX = Math.floor(targetW * ratio);
    ctx.fillStyle = playedColor;
    ctx.fillRect(playheadX, 0, 2, targetH);
  }, [peaks, ratio, playedColor, restingColor]);

  // Throttle redraws to rAF
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      render();
      raf = 0;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [render]);

  // Resize observer
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => {
      render();
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [render]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!onScrub) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const next = rect.width <= 0 ? 0 : Math.max(0, Math.min(1, x / rect.width));
      onScrub(next);
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    },
    [onScrub],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!onScrub) return;
      if (e.buttons !== 1) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const next = rect.width <= 0 ? 0 : Math.max(0, Math.min(1, x / rect.width));
      onScrub(next);
    },
    [onScrub],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (!onScrub) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onScrub(Math.max(0, ratio - 0.05));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onScrub(Math.min(1, ratio + 0.05));
      } else if (e.key === 'Home') {
        e.preventDefault();
        onScrub(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onScrub(1);
      }
    },
    [onScrub, ratio],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn('relative w-full overflow-hidden rounded bg-muted/30', className)}
      style={{ height }}
      data-testid="waveform-wrapper"
    >
      <canvas
        ref={canvasRef}
        role={onScrub ? 'slider' : 'img'}
        tabIndex={onScrub ? 0 : -1}
        aria-label={ariaLabel}
        aria-valuenow={onScrub ? Math.round(ratio * 100) : undefined}
        aria-valuemin={onScrub ? 0 : undefined}
        aria-valuemax={onScrub ? 100 : undefined}
        aria-disabled={!onScrub}
        data-testid="waveform-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        className="block h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      />
    </div>
  );
}

export default WaveformCanvas;

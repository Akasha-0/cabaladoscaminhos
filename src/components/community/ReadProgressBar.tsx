'use client';

// ============================================================================
// ReadProgressBar — barra fina top, sticky
// ============================================================================
// Indicador visual de progresso de leitura + track-and-send ao backend.
// Estratégia:
//   - Observa scroll do container/window via requestAnimationFrame
//   - Calcula percentRead = (scrollY - articleTop) / articleHeight
//   - Faz POST /api/posts/[id]/read a cada 5% de progresso (throttle)
//   - A barra é fixed no topo, 2px, com gradiente âmbar
//
// Mobile-first: usa position: sticky no topo do article (não fixed), para
// evitar sobreposição com headers. O wrapper do post é quem decide se
// quer sticky ou fixed — passamos `mode="sticky"|"fixed"`.
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ReadProgressBarProps {
  postId: string;
  /**
   * ID do elemento article/content cujo scroll é medido. Default: mede
   * o document.documentElement (página inteira).
   */
  articleSelector?: string;
  /**
   * Modo visual:
   *  - 'sticky' (default) → gruda no topo do article (não cobre header)
   *  - 'fixed' → fixed no topo da viewport
   */
  mode?: 'sticky' | 'fixed';
  /**
   * Se true, faz POST ao backend para registrar progresso. Default: true.
   */
  track?: boolean;
  className?: string;
}

const TRACK_EVERY_PERCENT = 5; // throttle: só envia a cada 5%
const MIN_PERCENT_TO_TRACK = 10; // só começa a registrar a partir de 10%

export function ReadProgressBar({
  postId,
  articleSelector,
  mode = 'sticky',
  track = true,
  className,
}: ReadProgressBarProps) {
  const [percent, setPercent] = useState(0);
  const lastTrackedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return;

    let article: HTMLElement | null = null;
    if (articleSelector) {
      article = document.querySelector(articleSelector) as HTMLElement | null;
    }

    let computed: number;
    if (article) {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      const scrolled = Math.max(0, viewportBottom - articleTop);
      computed = articleHeight > 0 ? (scrolled / articleHeight) * 100 : 0;
    } else {
      // Página inteira
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const viewport = window.innerHeight;
      const scrollable = Math.max(1, docHeight - viewport);
      computed = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
    }

    const clamped = Math.min(100, Math.max(0, Math.round(computed)));
    setPercent(clamped);

    // Throttle tracking: envia quando passa a cada 5% (e >= 10%)
    if (
      track &&
      clamped >= MIN_PERCENT_TO_TRACK &&
      clamped - lastTrackedRef.current >= TRACK_EVERY_PERCENT
    ) {
      lastTrackedRef.current = clamped;
      // Fire-and-forget (não bloqueia UI)
      void fetch(`/api/posts/${postId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentRead: clamped }),
        keepalive: true,
      }).catch(() => {
        // Silencioso — best-effort
      });
    }
  }, [articleSelector, postId, track]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    };
    // Mede imediatamente
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [measure]);

  // Garante 100% ao desmontar (última leitura completa)
  useEffect(() => {
    return () => {
      if (!track) return;
      // Best-effort final ping
      void fetch(`/api/posts/${postId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentRead: 100 }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [postId, track]);

  const positionClass =
    mode === 'fixed' ? 'fixed top-0 left-0 right-0 z-40' : 'sticky top-0';

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura"
      className={cn(
        positionClass,
        'h-[3px] w-full bg-slate-800/40 overflow-hidden',
        className
      )}
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-[width] duration-150 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

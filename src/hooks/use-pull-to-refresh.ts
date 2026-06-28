'use client';

/**
 * usePullToRefresh — gesture nativo de pull-to-refresh sem libs.
 * ----------------------------------------------------------------------------
 * Detecta scroll no topo + drag para baixo + release, dispara onRefresh.
 *
 * Princípios:
 *   - Pointer events (touch + mouse unified)
 *   - Threshold: 80px de drag, ou velocity alta (>0.5 px/ms)
 *   - Só ativa se container scrollTop === 0 (evita conflito com scroll normal)
 *   - Respeita prefers-reduced-motion
 *   - SSR-safe
 *
 * Uso:
 *   const { pullProps, pullDistance, isRefreshing } = usePullToRefresh({
 *     onRefresh: async () => { await fetchData(); },
 *     threshold: 80,
 *   });
 *   return <div {...pullProps} ref={containerRef}>...</div>;
 *
 * Refs:
 *   - Google Material guidelines: 80px threshold
 *   - iOS HIG: rubber-band scroll (resistente)
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_THRESHOLD = 80;
const DEFAULT_VELOCITY_THRESHOLD = 0.5; // px/ms
const DEFAULT_MAX_PULL = 140; // cap visual

export interface UsePullToRefreshOptions {
  /** Async callback ao soltar (deve resolver quando refresh termina) */
  onRefresh: () => Promise<void> | void;
  /** Distância em px para disparar (default: 80) */
  threshold?: number;
  /** Velocidade em px/ms para disparar mesmo abaixo do threshold (default: 0.5) */
  velocityThreshold?: number;
  /** Distância máxima visual de drag (default: 140) */
  maxPull?: number;
  /** Se true, desativa o gesture (default: detecta prefers-reduced-motion) */
  disabled?: boolean;
}

export interface PullToRefreshState {
  /** Distância atual do drag em px (0 = sem pull) */
  pullDistance: number;
  /** True durante fetch do onRefresh */
  isRefreshing: boolean;
  /** Props para spread no container scrollável */
  pullProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
}

interface DragState {
  startY: number;
  startT: number;
  lastY: number;
  lastT: number;
  active: boolean;
  pointerId: number;
}

export function usePullToRefresh(options: UsePullToRefreshOptions): PullToRefreshState {
  const {
    onRefresh,
    threshold = DEFAULT_THRESHOLD,
    velocityThreshold = DEFAULT_VELOCITY_THRESHOLD,
    maxPull = DEFAULT_MAX_PULL,
    disabled,
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Espelha dragRef.current?.active para evitar ler refs em render
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const rafRef = useRef<number | null>(null);

  // Detecta prefers-reduced-motion (desativa pull automático)
  const reducedMotion = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const onChange = () => {
      reducedMotion.current = mq.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDisabled = disabled ?? reducedMotion.current;

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      // Pequeno delay para evitar flick
      setTimeout(() => {
        setPullDistance(0);
        setIsRefreshing(false);
      }, 250);
    }
  }, [onRefresh]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isDisabled || isRefreshing) return;
      if (!e.isPrimary) return;

      // Pointer down só em pointer tipo touch (evita conflito com mouse drag de seleção)
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;

      const target = e.currentTarget as HTMLElement;
      containerRef.current = target;

      // Só inicia drag se container está no topo (scrollTop === 0)
      const scrollTop = target.scrollTop ?? target.parentElement?.scrollTop ?? 0;
      if (scrollTop > 0) return;

      dragRef.current = {
        startY: e.clientY,
        startT: e.timeStamp,
        lastY: e.clientY,
        lastT: e.timeStamp,
        active: true,
        pointerId: e.pointerId,
      };
      setIsDragging(true);

      target.setPointerCapture(e.pointerId);
    },
    [isDisabled, isRefreshing],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active || drag.pointerId !== e.pointerId) return;

      const dy = e.clientY - drag.startY;
      if (dy <= 0) {
        // Scroll para cima: sem ação (deixa o scroll normal acontecer)
        setPullDistance(0);
        return;
      }

      // Rubber-band: resistência aumenta quadraticamente após threshold
      const resistance = dy <= threshold ? 1 : 1 + (dy - threshold) / (maxPull - threshold);
      const damped = dy / resistance;
      const clamped = Math.min(damped, maxPull);

      drag.lastY = e.clientY;
      drag.lastT = e.timeStamp;

      // RAF throttle para performance
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPullDistance(clamped);
      });
    },
    [threshold, maxPull],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active || drag.pointerId !== e.pointerId) return;

      const target = e.currentTarget as HTMLElement;
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // Silencioso se pointer não estiver capturado
      }

      const dy = drag.lastY - drag.startY;
      const dt = Math.max(1, drag.lastT - drag.startT);
      const velocity = dy / dt;

      const shouldRefresh = dy >= threshold || velocity >= velocityThreshold;

      dragRef.current = null;
      setIsDragging(false);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (shouldRefresh && !isRefreshing) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }
    },
    [threshold, velocityThreshold, isRefreshing, triggerRefresh],
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active || drag.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setPullDistance(0);
    },
    [],
  );

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    pullDistance,
    isRefreshing,
    pullProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      style: {
        // Indicador visual durante drag (transform suave)
        transform: pullDistance > 0 || isRefreshing ? `translateY(${pullDistance}px)` : undefined,
        transition: isRefreshing
          ? 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'
          : isDragging
          ? 'none'
          : 'transform 250ms cubic-bezier(0.2, 0, 0, 1)',
        willChange: 'transform',
        touchAction: 'pan-y', // Permite scroll vertical mas bloqueia horizontal (evita pull lateral)
      },
    },
  };
}

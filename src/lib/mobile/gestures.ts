'use client';

// ============================================================================
// MOBILE GESTURE HOOKS — Wave 38
// ============================================================================
// Hooks reutilizáveis para detecção de gestos touch/mouse nativos sem libs.
//
// Composable primitives (3) + utility (1):
//   - useSwipe(direction): swipe horizontal/vertical com threshold + tempo
//   - useLongPress(callback, delay): context menu / quote trigger
//   - usePullToRefreshLite: variant leve que delega a lib/hooks/use-pull-to-refresh
//   - prefersReducedMotion(): media query helper
//
// Princípios:
//   - Pointer events unificam touch + mouse (não usamos touch events)
//   - SSR-safe (typeof window checks)
//   - Respeita prefers-reduced-motion
//   - Não interfere com scroll vertical natural (checa direction)
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Constantes
// ============================================================================

const DEFAULT_SWIPE_THRESHOLD = 50;       // px mínima para considerar swipe
const DEFAULT_SWIPE_RESTRAINT = 75;       // px máxima no eixo perpendicular
const DEFAULT_SWIPE_ALLOWED_TIME = 600;   // ms máximo entre touchstart e touchend
const DEFAULT_LONG_PRESS_DELAY = 500;     // ms hold para disparar long-press
const DEFAULT_LONG_PRESS_MOVE_TOLERANCE = 10; // px tolerância de drift

// ============================================================================
// prefersReducedMotion
// ============================================================================

/**
 * Hook que retorna se o user tem prefers-reduced-motion: reduce ativo.
 * SSR-safe: retorna false no server.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    // Safari < 14 usa addListener
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  return reduced;
}

// ============================================================================
// useSwipe
// ============================================================================

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Distância mínima em px (default: 50) */
  threshold?: number;
  /** Distância máxima permitida no eixo perpendicular (default: 75) */
  restraint?: number;
  /** Tempo máximo entre start e end em ms (default: 600) */
  allowedTime?: number;
  /** Se true, desativa o gesture */
  disabled?: boolean;
}

/**
 * Detecta swipes em qualquer direção via pointer events.
 * Spread o retorno no elemento alvo: <div {...handlers}>.
 *
 * @example
 *   const handlers = useSwipe({
 *     onSwipeLeft: () => delete(),
 *     onSwipeRight: () => archive(),
 *   });
 *   return <div {...handlers}>Item</div>;
 */
export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = DEFAULT_SWIPE_THRESHOLD,
    restraint = DEFAULT_SWIPE_RESTRAINT,
    allowedTime = DEFAULT_SWIPE_ALLOWED_TIME,
    disabled = false,
  } = options;

  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      startX.current = e.clientX;
      startY.current = e.clientY;
      startTime.current = Date.now();
    },
    [disabled],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const dt = Date.now() - startTime.current;

      if (dt > allowedTime) return;

      // Horizontal swipe: dx dominante
      if (Math.abs(dx) >= threshold && Math.abs(dy) <= restraint) {
        if (dx > 0) onSwipeRight?.();
        else onSwipeLeft?.();
        return;
      }

      // Vertical swipe: dy dominante
      if (Math.abs(dy) >= threshold && Math.abs(dx) <= restraint) {
        if (dy > 0) onSwipeDown?.();
        else onSwipeUp?.();
      }
    },
    [disabled, threshold, restraint, allowedTime, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown],
  );

  return {
    onPointerDown,
    onPointerUp,
  };
}

// ============================================================================
// useLongPress
// ============================================================================

export interface UseLongPressOptions {
  onLongPress: (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => void;
  /** Delay em ms antes de disparar (default: 500) */
  delay?: number;
  /** Tolerância de movimento em px antes de cancelar (default: 10) */
  moveTolerance?: number;
  /** Se true, desativa o gesture */
  disabled?: boolean;
}

/**
 * Dispara callback ao segurar touch/mouse por `delay` ms sem mover.
 * Cancela se usuário mover mais que `moveTolerance` ou soltar antes.
 *
 * @example
 *   const longPress = useLongPress({
 *     onLongPress: () => openQuoteMenu(),
 *   });
 *   return <div {...longPress}>Post</div>;
 */
export function useLongPress(options: UseLongPressOptions) {
  const { onLongPress, delay = DEFAULT_LONG_PRESS_DELAY, moveTolerance = DEFAULT_LONG_PRESS_MOVE_TOLERANCE, disabled = false } = options;
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(false);
    startPos.current = null;
  }, []);

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      setIsPressed(true);
      startPos.current = { x: e.clientX, y: e.clientY };
      timerRef.current = setTimeout(() => {
        // Criar evento sintético com clientX/Y originais
        onLongPress(e as unknown as React.PointerEvent);
        clear();
      }, delay);
    },
    [disabled, delay, onLongPress, clear],
  );

  const move = useCallback(
    (e: React.PointerEvent) => {
      if (!isPressed || !startPos.current) return;
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > moveTolerance || dy > moveTolerance) {
        clear();
      }
    },
    [isPressed, moveTolerance, clear],
  );

  const end = useCallback(() => {
    clear();
  }, [clear]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
    isPressed,
  };
}

// ============================================================================
// usePullToRefreshLite — wrapper de compat
// ============================================================================

/**
 * Re-export do hook use-pull-to-refresh existente para API unificada
 * em `src/lib/mobile/gestures.ts`. Não duplica implementação — apenas
 * re-exporta para que devs importem tudo de um lugar coerente.
 *
 * @example
 *   import { usePullToRefreshLite } from '@/lib/mobile/gestures';
 *   const { pullProps, pullDistance, isRefreshing } = usePullToRefreshLite({
 *     onRefresh: async () => { await refetch(); },
 *   });
 */
export { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

// ============================================================================
// useOnlineStatus (re-export de convenience)
// ============================================================================

export { useOnlineStatus } from '@/hooks/useOnlineStatus';

// ============================================================================
// Gesture device capability detection
// ============================================================================

/**
 * Retorna true se o device provavelmente é touch-primary (mobile/tablet).
 * Não é 100% preciso — `pointer: coarse` é a heurística padrão.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsTouch(mq.matches);
    const update = () => setIsTouch(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  return isTouch;
}

// ============================================================================
// useViewportHeight — para fullscreen mobile com iOS keyboard
// ============================================================================

/**
 * Hook que retorna a altura do visual viewport (excluindo teclado virtual
 * no iOS). Use em containers fullscreen em mobile.
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return window.innerHeight;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      // VisualViewport API é a forma correta para iOS
      const vv = window.visualViewport;
      setHeight(vv?.height ?? window.innerHeight);
    };
    update();
    window.addEventListener('resize', update);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update);
      return () => {
        window.removeEventListener('resize', update);
        window.visualViewport?.removeEventListener('resize', update);
      };
    }
    return () => window.removeEventListener('resize', update);
  }, []);

  return height;
}
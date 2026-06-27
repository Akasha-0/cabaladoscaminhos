'use client';

// ============================================================================
// USE SWIPE — Detecção de gestos de swipe horizontal
// ============================================================================
// Uso:
//   const swipeHandlers = useSwipe({
//     onSwipeLeft: () => delete(),
//     onSwipeRight: () => archive(),
//     threshold: 80,
//   });
//   <div {...swipeHandlers}>...</div>
// ============================================================================

import { useRef, useCallback, useEffect } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Distância mínima (px) para disparar. Default: 50 */
  threshold?: number;
  /** Distância máxima permitida na direção perpendicular. Default: 100 */
  restraint?: number;
  /** Tempo máximo permitido para o gesto. Default: 300ms */
  allowedTime?: number;
  /** Desabilitar detecção. Default: false */
  disabled?: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipe(options: SwipeOptions): SwipeHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    restraint = 100,
    allowedTime = 600,
    disabled = false,
  } = options;

  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    tracking.current = true;
  }, [disabled]);

  const onTouchMove = useCallback((_e: React.TouchEvent) => {
    // No-op aqui — apenas tracking é feito no touchEnd
    // Poderíamos adicionar visual feedback aqui no futuro
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !tracking.current) return;
    tracking.current = false;

    const touch = e.changedTouches[0];
    const distX = touch.clientX - startX.current;
    const distY = touch.clientY - startY.current;
    const elapsedTime = Date.now() - startTime.current;

    if (elapsedTime > allowedTime) return;

    const absX = Math.abs(distX);
    const absY = Math.abs(distY);

    // Horizontal swipe (predominante)
    if (absX >= threshold && absY <= restraint) {
      if (distX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
      return;
    }

    // Vertical swipe
    if (absY >= threshold && absX <= restraint) {
      if (distY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }
  }, [disabled, threshold, restraint, allowedTime, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Cleanup caso componente desmonte durante tracking
  useEffect(() => {
    return () => {
      tracking.current = false;
    };
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// ============================================================================
// USE LONG PRESS — Detecção de long press
// ============================================================================

interface LongPressOptions {
  onLongPress: () => void;
  /** Tempo até disparar (ms). Default: 500 */
  delay?: number;
  /** Disparar também em click normal. Default: false */
  shouldPreventDefault?: boolean;
}

interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useLongPress(options: LongPressOptions): LongPressHandlers {
  const { onLongPress, delay = 500, shouldPreventDefault = true } = options;

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  const start = useCallback(() => {
    triggered.current = false;
    timeout.current = setTimeout(() => {
      triggered.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  return {
    onMouseDown: (e: React.MouseEvent) => {
      if (shouldPreventDefault) e.preventDefault();
      start();
    },
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => {
      if (shouldPreventDefault) e.preventDefault();
      start();
    },
    onTouchEnd: () => {
      // Se não disparou long press, deixa click normal processar
      clear();
    },
  };
}

// ============================================================================
// USE PULL TO REFRESH
// ============================================================================

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  /** Distância para disparar (px). Default: 80 */
  threshold?: number;
  /** Resistência ao puxar (1 = sem resistência). Default: 2.5 */
  resistance?: number;
  /** Container ref para escutar scroll. Se undefined, usa window */
  containerRef?: React.RefObject<HTMLElement>;
  /** Disabled state */
  disabled?: boolean;
}

interface PullToRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function usePullToRefresh(options: PullToRefreshOptions): PullToRefreshReturn {
  const {
    onRefresh,
    threshold = 80,
    resistance = 2.5,
    disabled = false,
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const tracking = useRef(false);

  const isAtTop = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    // Verifica se o scroll está no topo (window ou container)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return scrollTop <= 0;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    if (!isAtTop()) return;
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  }, [disabled, isRefreshing, isAtTop]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!tracking.current || disabled || isRefreshing) return;
    if (!isAtTop()) {
      // Saiu do topo durante o gesto
      tracking.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Aplica resistência
      const adjusted = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(adjusted);

      // Previne scroll nativo durante pull-down
      if (adjusted > 10) {
        e.preventDefault();
      }
    }
  }, [disabled, isRefreshing, isAtTop, resistance, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (!tracking.current) return;
    tracking.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    isPulling: tracking.current && pullDistance > 0,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}

// Re-export React state
import { useState } from 'react';
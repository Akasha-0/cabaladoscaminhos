'use client';

/**
 * useHaptic — feedback tátil (vibração) em devices móveis.
 * ----------------------------------------------------------------------------
 * Usa navigator.vibrate() quando disponível. Silenciosamente no-op em
 * desktop ou quando API nao suportada.
 *
 * Refs:
 *   - MDN Vibration API: https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [20, 50, 30],
  warning: [30, 50, 30],
  error: [50, 30, 50, 30, 50],
};

export interface UseHapticOptions {
  /** Se false, desativa feedback mesmo em devices que suportam. */
  enabled?: boolean;
}

export function useHaptic(options: UseHapticOptions = {}) {
  const { enabled = true } = options;

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const trigger = useCallback(
    (pattern: HapticPattern = 'light') => {
      if (!enabled || !isSupported) return;
      try {
        navigator.vibrate(PATTERNS[pattern]);
      } catch {
        // Silencioso em devices que falham
      }
    },
    [enabled, isSupported],
  );

  return {
    /** Dispara pattern de vibracao. */
    trigger,
    /** Atalhos semânticos. */
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    /** Se a API esta disponivel no device. */
    isSupported,
  };
}
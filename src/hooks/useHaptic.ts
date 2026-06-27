'use client';

// ============================================================================
// USE HAPTIC — Wrapper para Vibration API + iOS WebKit fallback
// ============================================================================
// Compatibilidade:
// - iOS Safari: navigator.vibrate (iOS 13+ em PWAs instalados)
// - Android Chrome: navigator.vibrate
// - Outros: no-op silencioso
// ============================================================================

import { useCallback, useEffect, useState } from 'react';

export type HapticPattern =
  | 'light'      // 10ms - toque de botão
  | 'medium'     // 20ms - seleção
  | 'heavy'      // 30ms - ação importante
  | 'success'    // [10, 50, 10] - confirmação
  | 'warning'    // [20, 50, 20] - alerta
  | 'error'      // [30, 50, 30, 50, 30] - erro
  | 'selection'  // [5] - mudança de tab
  | 'impact';    // [15] - impacto físico

const PATTERN_MAP: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 50, 20],
  error: [30, 50, 30, 50, 30],
  selection: 5,
  impact: 15,
};

interface UseHapticReturn {
  trigger: (pattern?: HapticPattern) => void;
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'akasha_haptic_enabled';

export function useHaptic(): UseHapticReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabledState] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verifica suporte
    const supported = 'vibrate' in navigator;
    setIsSupported(supported);

    // Carrega preferência
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsEnabledState(stored === 'true');
      }
    } catch {
      // Ignore
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Ignore
    }
  }, []);

  const trigger = useCallback((pattern: HapticPattern = 'light') => {
    if (typeof window === 'undefined') return;
    if (!isSupported || !isEnabled) return;

    const patternValue = PATTERN_MAP[pattern];

    try {
      navigator.vibrate(patternValue);
    } catch (err) {
      // Silently fail em browsers que não suportam
      console.debug('[Haptic] Failed:', err);
    }
  }, [isSupported, isEnabled]);

  return { trigger, isSupported, isEnabled, setEnabled };
}

// ============================================================================
// STANDALONE — Para uso fora de componentes
// ============================================================================
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (typeof window === 'undefined') return;
  if (!('vibrate' in navigator)) return;

  try {
    if (localStorage.getItem(STORAGE_KEY) === 'false') return;
    navigator.vibrate(PATTERN_MAP[pattern]);
  } catch {
    // Ignore
  }
}
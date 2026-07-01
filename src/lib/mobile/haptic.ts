'use client';

// ============================================================================
// HAPTIC UTILITY — Wave 38
// ============================================================================
// Wrapper não-hook sobre navigator.vibrate() para uso em event handlers
// imperativos (sem precisar do hook useHaptic). Use este módulo quando
// precisa disparar vibração fora de componente React (ex: Service Worker
// message handlers, scripts de tracking).
//
// Padrões vibration API:
//   - navigator.vibrate(ms): uma vibração única
//   - navigator.vibrate([ms, gap, ms, ...]): pattern com pausas
//   - navigator.vibrate(0): cancela vibração em curso
//
// Compatibilidade:
//   - Chrome Android ✓
//   - Safari iOS (PWA instalado) ⚠️  — só funciona após user gesture
//   - Firefox ❌
//   - Desktop ❌
//
// LGPD: este módulo NÃO coleta dados — é puramente um trigger de feedback
// tátil local. Sem telemetria.
// ============================================================================

export type HapticPatternName =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'double-tap';

const PATTERNS: Record<HapticPatternName, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  selection: 5,
  success: [20, 50, 30],
  warning: [30, 50, 30],
  error: [50, 30, 50, 30, 50],
  'double-tap': [10, 80, 10],
};

let enabledCache: boolean | null = null;

/**
 * Verifica se Vibration API está disponível no runtime atual.
 * Cacheia o resultado para evitar lookups repetidos.
 */
export function isHapticSupported(): boolean {
  if (enabledCache !== null) return enabledCache;
  enabledCache =
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function';
  return enabledCache;
}

/**
 * Reseta o cache de capability. Útil em testes.
 */
export function resetHapticCache(): void {
  enabledCache = null;
}

/**
 * Dispara vibração com padrão nomeado. Silenciosamente no-op em devices
 * sem suporte. Respeita prefers-reduced-motion.
 *
 * @param pattern Nome do padrão (light/medium/heavy/selection/success/warning/error/double-tap)
 *                ou número custom (ms ou array pattern).
 * @param options.enabled Override individual (default: true)
 * @param options.respectReducedMotion Default: true — desativa em prefers-reduced-motion
 */
export function haptic(
  pattern: HapticPatternName | number | number[] = 'light',
  options: {
    enabled?: boolean;
    respectReducedMotion?: boolean;
  } = {},
): boolean {
  const { enabled = true, respectReducedMotion = true } = options;

  if (!enabled) return false;
  if (!isHapticSupported()) return false;

  if (respectReducedMotion && typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
  }

  let value: number | number[];
  if (typeof pattern === 'string') {
    value = PATTERNS[pattern];
  } else {
    value = pattern;
  }

  try {
    return navigator.vibrate(value);
  } catch {
    return false;
  }
}

/**
 * Cancela qualquer vibração em curso. Wrapper para navigator.vibrate(0).
 */
export function cancelHaptic(): void {
  if (!isHapticSupported()) return;
  try {
    navigator.vibrate(0);
  } catch {
    // Silencioso
  }
}

/**
 * Retorna a lista de padrões disponíveis (útil para debug/testes).
 */
export function getHapticPatterns(): readonly HapticPatternName[] {
  return Object.keys(PATTERNS) as HapticPatternName[];
}

/**
 * Constantes exportadas para uso em testes/Storybook.
 */
export const HAPTIC_PATTERNS = PATTERNS;
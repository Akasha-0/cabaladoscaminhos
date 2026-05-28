/**
 * Reduced motion utilities
 * Respects user preferences for reduced motion via prefers-reduced-motion
 */

/**
 * Reduced motion preference detection
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if animations should be skipped based on user preferences
 */
export function shouldReduceMotion(): boolean {
  return prefersReducedMotion();
}

/**
 * Reduced motion CSS styles
 * Use this to conditionally apply animation styles
 */
export const reducedMotionStyles = '';

/**
 * Get animation duration respecting reduced motion preferences
 */
export function getAnimationDuration(defaultDuration: string): string {
  if (shouldReduceMotion()) {
    return '0.01ms';
  }
  return defaultDuration;
}
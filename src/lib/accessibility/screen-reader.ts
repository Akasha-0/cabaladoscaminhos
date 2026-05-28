/**
 * Screen reader support utilities for accessibility
 * @file screen-reader.ts
 * @lintdisable
 */

// Browser screen reader detection state
const screenReaderCallbacks: Set<() => void> = new Set();

// Check if screen reader is likely active using heuristics
function detectScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for common screen reader indicators
  const indicators = [
    // NVDA and JAWS often set aria-live regions aggressively
    document.querySelector('[aria-live]'),
    // Focus management patterns typical of screen readers
    document.hasFocus(),
  ];

  // Reduced motion preference (screen readers respect this)
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  return indicators.some(Boolean) || prefersReducedMotion;
}

/**
 * Check if screen reader support is available
 */
export function supportScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Use simple detection heuristics
    return detectScreenReader();
  } catch {
    return false;
  }
}

/**
 * Announce a message to screen readers via aria-live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  // Find or create live region
  let liveRegion = document.getElementById('sr-announcer');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'sr-announcer';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(liveRegion);
  }

  // Update priority if changed
  liveRegion.setAttribute('aria-live', priority);

  // Clear and set message (two-step for reliable announcement)
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    liveRegion!.textContent = message;
  });
}

/**
 * Subscribe to screen reader detection changes
 */
export function onScreenReaderChange(callback: () => void): () => void {
  screenReaderCallbacks.add(callback);

  return () => {
    screenReaderCallbacks.delete(callback);
  };
}

/**
 * Notify subscribers of screen reader state change
 */
function notifyScreenReaderChange(): void {
  detectScreenReader();
  screenReaderCallbacks.forEach((cb) => cb());
}

// Initialize detection on load and visibility changes
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      notifyScreenReaderChange();
    }
  });

  // Initial detection with slight delay for DOM readiness
  setTimeout(notifyScreenReaderChange, 100);
}

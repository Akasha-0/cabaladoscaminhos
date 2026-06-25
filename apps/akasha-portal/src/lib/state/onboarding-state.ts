/**
 * onboarding-state.ts — Wave 13.1 FirstTimeTour
 *
 * Persists whether the new-user onboarding tour has been completed.
 *
 * Trigger contract (per Wave 13.1 plan §13.1):
 *   - The tour appears if `akasha.onboarding.completed` !== 'true' in localStorage.
 *   - The tour is marked complete the FIRST time the user either:
 *       (a) picks an emotional state (ansioso | centrado | perdido | curioso)
 *           via the StatePicker, OR
 *       (b) taps "Pular" on step 1.
 *   - The flag is sticky — once set, it stays for the lifetime of the browser
 *     profile. We intentionally do NOT auto-reset on logout; the tour is
 *     scoped to "first-time experience", not "first-time per session".
 *
 * Why a separate flag from `akasha.emotionalState`:
 *   - The picker can be skipped (Pular por agora) without the emotional
 *     state being set. We still want to consider onboarding "done" so the
 *     user isn't pestered every visit.
 *   - Conversely, a returning user might have an old/stale state but never
 *     have seen the tour (e.g. Wave 9.1 user upgrading to Wave 13.1).
 *     We treat the flag as authoritative — if it's not 'true', show the
 *     tour (one screen, then dismiss).
 *
 * SSR safety:
 *   - All `localStorage` access is guarded. The hook returns `completed: false`
 *     on the first render and only resolves client-side after mount. This
 *     keeps React hydration stable — the tour never appears on the server.
 *
 * Single source of truth: this file. Components MUST import from here.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export const ONBOARDING_STORAGE_KEY = 'akasha.onboarding.completed';

function readFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    // localStorage may be disabled (private mode quota, etc.). Treat as
    // "not yet completed" — the tour will be shown on next mount.
    return false;
  }
}

function writeFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // Ignore quota / disabled storage — the tour simply won't re-trigger,
    // which is the desired safe behaviour.
  }
}

function clearFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Imperative API (for non-React callers; tests too)
// ─────────────────────────────────────────────────────────────────────────────

export function isOnboardingCompleted(): boolean {
  return readFlag();
}

export function markOnboardingCompleted(): void {
  writeFlag();
}

export function resetOnboarding(): void {
  clearFlag();
}

// ─────────────────────────────────────────────────────────────────────────────
// React hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseOnboardingReturn {
  /**
   * `true` once we've resolved the localStorage flag on the client. Until
   * then the consumer should not render the tour (or should render a
   * skeleton) — see `MeuDiaHub` for the canonical pattern.
   */
  hydrated: boolean;
  /**
   * `true` if the user has finished (or skipped) the tour before. When
   * `false` on first paint, the tour should be shown.
   */
  completed: boolean;
  /**
   * Mark the tour as completed. Safe to call from anywhere — idempotent.
   */
  markCompleted: () => void;
  /**
   * Clear the flag. Used by tests + the dev "Replay onboarding" affordance
   * (out of scope for Wave 13.1, but the hook leaves room for it).
   */
  reset: () => void;
}

/**
 * useOnboarding — canonical consumer for the tour visibility flag.
 *
 * Mirrors the SSR-safe pattern of `useEmotionalState`:
 *   - First render returns `{ hydrated: false, completed: false }` so the
 *     server-rendered HTML matches the first client paint (no hydration
 *     mismatch). The tour is rendered behind a `hydrated` gate.
 *   - After mount, we read localStorage and resolve.
 *   - `markCompleted` writes the flag, then triggers a re-render via a
 *     version bump so the tour disappears on the same tick.
 */
export function useOnboarding(): UseOnboardingReturn {
  const [completed, setCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Bump-key: incrementing this after a mutation forces a re-read so
  // consumers that depend on `completed` stay fresh without recomputing
  // on every render. Mirrors `useEmotionalState`.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setCompleted(readFlag());
    setHydrated(true);
  }, [version]);

  const markCompleted = useCallback(() => {
    writeFlag();
    setVersion((v) => v + 1);
  }, []);

  const reset = useCallback(() => {
    clearFlag();
    setVersion((v) => v + 1);
  }, []);

  return { hydrated, completed, markCompleted, reset };
}
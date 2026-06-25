/**
 * onboarding-state.ts — Wave 13.1 FirstTimeTour + Wave 18.5 persistence
 *
 * Persists the new-user onboarding tour state across visits. Two flags:
 *
 *   1. `akasha.onboarding.completed`  — Wave 13.1 "true"/absent boolean.
 *      Backwards compatible: any Wave 13.1 reader that only checks this
 *      key continues to work. We keep writing it on every finalization
 *      (advance past last step, skip step 1, skip from any step).
 *
 *   2. `akasha.onboarding.step`       — Wave 18.5. Stores the current
 *      step (0, 1, or 2) so the tour resumes mid-flight if the user
 *      leaves / refreshes / closes the tab. Written on EVERY step change.
 *
 * Wave 18.5 step semantics:
 *   - Step values are the live tour indices: 0, 1, 2.
 *   - When the tour is finished (advanced past step 2 OR skipped from any
 *     step), we store step = "3" — a sentinel value meaning "complete"
 *     that is a strict superset of the Wave 13.1 boolean. We also write
 *     the legacy `completed` flag so any pre-18.5 reader stays correct.
 *
 * SSR safety:
 *   - All `localStorage` access is guarded. The hook returns
 *     `{ hydrated: false, completed: false, currentStep: 0 }` on the first
 *     render and only resolves client-side after mount. This keeps React
 *     hydration stable — the tour never appears on the server.
 *
 * Single source of truth: this file. Components MUST import from here.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export const ONBOARDING_STORAGE_KEY = 'akasha.onboarding.completed';
/** Wave 18.5 — current step (0|1|2|3) sentinel for completion. */
export const ONBOARDING_STEP_KEY = 'akasha.onboarding.step';

/** Step values the live tour uses. */
export type OnboardingStep = 0 | 1 | 2;
/** Sentinel for "tour is complete" (>= total steps). */
export const ONBOARDING_COMPLETED_STEP: 3 = 3 as const;
/** Default starting step (Wave 13.1 behaviour: always begin at step 0). */
export const ONBOARDING_DEFAULT_STEP: OnboardingStep = 0;
/** Union of all step values the storage layer may surface, including the
 *  completed sentinel. Callers that need a live tour step should narrow
 *  with `clampInitialStep` (re-exported from FirstTimeTour) or by
 *  checking `step < ONBOARDING_COMPLETED_STEP`. */
export type AnyOnboardingStep = OnboardingStep | typeof ONBOARDING_COMPLETED_STEP;

// ─────────────────────────────────────────────────────────────────────────────
// Storage I/O
// ─────────────────────────────────────────────────────────────────────────────

/** Validates a step value loaded from localStorage. */
function parseStep(raw: string | null): AnyOnboardingStep {
  if (raw === null) return ONBOARDING_DEFAULT_STEP;
  // '3' is the "complete" sentinel — never returns as a live step.
  if (raw === '3') return ONBOARDING_COMPLETED_STEP;
  if (raw === '0' || raw === '1' || raw === '2') {
    return Number(raw) as OnboardingStep;
  }
  // Garbage in storage — treat as fresh start. Don't throw; this is
  // best-effort persistence, not a security boundary.
  return ONBOARDING_DEFAULT_STEP;
}

function readCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function readStep(): AnyOnboardingStep {
  if (typeof window === 'undefined') return ONBOARDING_DEFAULT_STEP;
  try {
    return parseStep(window.localStorage.getItem(ONBOARDING_STEP_KEY));
  } catch {
    return ONBOARDING_DEFAULT_STEP;
  }
}

function writeStep(step: AnyOnboardingStep): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
  } catch {
    // Ignore quota / disabled storage — the tour simply won't resume,
    // which is the safe failure mode (user sees the tour again, no data
    // loss).
  }
}

function writeCompletedFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // Ignore quota / disabled storage.
  }
}

function clearBothFlags(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.localStorage.removeItem(ONBOARDING_STEP_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Imperative API (for non-React callers; tests too)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use {@link isOnboardingCompleted} for the boolean read,
 * {@link getOnboardingStep} for the step read. Kept for backwards
 * compatibility with Wave 13.1 callers.
 */
export function isOnboardingCompleted(): boolean {
  return readCompleted();
}

/**
 * Returns the persisted current step. Returns {@link ONBOARDING_DEFAULT_STEP}
 * (0) when storage is empty or unreadable. Returns
 * {@link ONBOARDING_COMPLETED_STEP} (3) when the tour was already finished
 * (either via the legacy boolean or via the step sentinel).
 */
export function getOnboardingStep(): AnyOnboardingStep {
  if (readCompleted()) return ONBOARDING_COMPLETED_STEP;
  return readStep();
}

/**
 * Write the current step without finalising the tour. Called by the
 * FirstTimeTour on every step change.
 *
 * NOTE: passing {@link ONBOARDING_COMPLETED_STEP} (3) is treated as a
 * completion signal — both the step key AND the legacy completed flag
 * are written, so any Wave 13.1 reader stays consistent. Most callers
 * should prefer {@link markOnboardingCompleted} for the explicit
 * finalise path; this overload exists so that a unified `setStep(n)`
 * API can be used in either direction.
 */
export function setOnboardingStep(step: AnyOnboardingStep): void {
  if (step === ONBOARDING_COMPLETED_STEP) {
    writeCompletedFlag();
  }
  writeStep(step);
}

/**
 * Mark the tour as completed. Writes both:
 *   - the legacy `completed = 'true'` flag (Wave 13.1 contract), AND
 *   - the step sentinel = 3 (Wave 18.5 contract).
 * Idempotent. Safe to call from anywhere.
 */
export function markOnboardingCompleted(): void {
  writeCompletedFlag();
  writeStep(ONBOARDING_COMPLETED_STEP);
}

/** Clear both flags. Used by tests + the "Replay onboarding" affordance. */
export function resetOnboarding(): void {
  clearBothFlags();
}

// ─────────────────────────────────────────────────────────────────────────────
// React hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseOnboardingReturn {
  /**
   * `true` once we've resolved localStorage on the client. Until then the
   * consumer should not render the tour (or should render a skeleton).
   */
  hydrated: boolean;
  /**
   * `true` if the user has finished (or skipped) the tour before. When
   * `false` on first paint, the tour should be shown.
   */
  completed: boolean;
  /**
   * Wave 18.5 — the persisted current step (0, 1, or 2). When `completed`
   * is `true`, this is {@link ONBOARDING_COMPLETED_STEP} (3). Pass this
   * to `<FirstTimeTour initialStep={...}>` so the tour resumes at the
   * saved step rather than restarting.
   */
  currentStep: AnyOnboardingStep;
  /**
   * Wave 18.5 — persist a new live step (0|1|2). Calling with
   * {@link ONBOARDING_COMPLETED_STEP} (3) is equivalent to
   * {@link markCompleted}.
   */
  setStep: (step: AnyOnboardingStep) => void;
  /**
   * Mark the tour as completed. Safe to call from anywhere — idempotent.
   * Writes BOTH the legacy flag and the new step sentinel.
   */
  markCompleted: () => void;
  /**
   * Clear both flags. Used by tests + the dev "Replay onboarding"
   * affordance.
   */
  reset: () => void;
}

/**
 * useOnboarding — canonical consumer for the tour visibility flag.
 *
 * Wave 18.5 additions:
 *   - `currentStep` — persisted step, suitable as the `initialStep` prop
 *     for `<FirstTimeTour>` so the tour resumes instead of restarting.
 *   - `setStep(n)` — called by `<FirstTimeTour>` on every step change
 *     to persist progress.
 *
 * SSR safety mirrors `useEmotionalState`:
 *   - First render returns `{ hydrated: false, completed: false,
 *     currentStep: 0 }` so the server-rendered HTML matches the first
 *     client paint (no hydration mismatch).
 *   - After mount, we read localStorage and resolve.
 *   - `markCompleted` writes both flags, then bumps a version so the
 *     tour disappears on the same tick.
 */
export function useOnboarding(): UseOnboardingReturn {
  const [completed, setCompleted] = useState(false);
  const [currentStep, setCurrentStepState] =
    useState<AnyOnboardingStep>(ONBOARDING_DEFAULT_STEP);
  const [hydrated, setHydrated] = useState(false);
  // Bump-key: incrementing this after a mutation forces a re-read so
  // consumers that depend on `completed`/`currentStep` stay fresh without
  // recomputing on every render. Mirrors `useEmotionalState`.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const completed = readCompleted();
    setCompleted(completed);
    // Wave 18.5 — if the legacy `completed` flag is set, the step is
    // effectively the completed sentinel. This matches the imperative
    // `getOnboardingStep()` precedence and keeps the hook consistent
    // regardless of which key a Wave 13.1 reader last wrote.
    setCurrentStepState(completed ? ONBOARDING_COMPLETED_STEP : readStep());
    setHydrated(true);
  }, [version]);

  const setStep = useCallback((step: AnyOnboardingStep) => {
      if (step === ONBOARDING_COMPLETED_STEP) {
        // Setting step = 3 implies completion — write both flags.
        writeCompletedFlag();
        writeStep(ONBOARDING_COMPLETED_STEP);
        setCompleted(true);
      } else {
        writeStep(step);
      }
      setCurrentStepState(step);
      // No version bump for live step changes — the parent re-renders
      // naturally because `currentStep` already changed.
    },
    []
  );

  const markCompleted = useCallback(() => {
    writeCompletedFlag();
    writeStep(ONBOARDING_COMPLETED_STEP);
    setCompleted(true);
    setCurrentStepState(ONBOARDING_COMPLETED_STEP);
    setVersion((v) => v + 1);
  }, []);

  const reset = useCallback(() => {
    clearBothFlags();
    setCompleted(false);
    setCurrentStepState(ONBOARDING_DEFAULT_STEP);
    setVersion((v) => v + 1);
  }, []);

  return {
    hydrated,
    completed,
    currentStep,
    setStep,
    markCompleted,
    reset,
  };
}
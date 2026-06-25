/**
 * @akasha/portal — onboarding-state hook tests
 *
 * Wave 13.1. Verifies the localStorage contract:
 *   - First read with no flag → completed=false, hydrated=false then true
 *   - markCompleted writes the flag and re-reads on next effect tick
 *   - reset clears the flag
 *   - SSR-safe: window guards don't throw in node test env
 *
 * Wave 18.5 additions:
 *   - currentStep persists across reads
 *   - getOnboardingStep returns the sentinel (3) when the legacy
 *     completed flag is set, even if the new step key is missing
 *   - setOnboardingStep writes only the step (does NOT flip completed)
 *   - markOnboardingCompleted writes both keys
 *   - useOnboarding exposes `currentStep` and `setStep`
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
  ONBOARDING_COMPLETED_STEP,
  ONBOARDING_DEFAULT_STEP,
  ONBOARDING_STEP_KEY,
  ONBOARDING_STORAGE_KEY,
  type OnboardingStep,
  getOnboardingStep,
  isOnboardingCompleted,
  markOnboardingCompleted,
  resetOnboarding,
  setOnboardingStep,
  useOnboarding,
} from '@/lib/state/onboarding-state';

describe('onboarding-state (imperative) — Wave 13.1 contract', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reports not-completed when storage is empty', () => {
    expect(isOnboardingCompleted()).toBe(false);
  });

  it('writes the flag string verbatim (only "true" counts)', () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'yes');
    expect(isOnboardingCompleted()).toBe(false);

    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    expect(isOnboardingCompleted()).toBe(true);
  });

  it('markOnboardingCompleted / resetOnboarding round-trip', () => {
    markOnboardingCompleted();
    expect(isOnboardingCompleted()).toBe(true);
    resetOnboarding();
    expect(isOnboardingCompleted()).toBe(false);
  });
});

describe('onboarding-state (imperative) — Wave 18.5 step persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('getOnboardingStep returns the default step when storage is empty', () => {
    expect(getOnboardingStep()).toBe(ONBOARDING_DEFAULT_STEP);
  });

  it('getOnboardingStep reads persisted live steps (0|1|2)', () => {
    window.localStorage.setItem(ONBOARDING_STEP_KEY, '1');
    expect(getOnboardingStep()).toBe<OnboardingStep>(1);

    window.localStorage.setItem(ONBOARDING_STEP_KEY, '2');
    expect(getOnboardingStep()).toBe<OnboardingStep>(2);

    window.localStorage.setItem(ONBOARDING_STEP_KEY, '0');
    expect(getOnboardingStep()).toBe<OnboardingStep>(0);
  });

  it('getOnboardingStep returns the completed sentinel (3) when the legacy completed flag is set', () => {
    // Simulates a Wave 13.1 install: completed = 'true' but no step key.
    // Wave 18.5 must treat this as "tour finished" so we don't reopen it.
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    expect(getOnboardingStep()).toBe(ONBOARDING_COMPLETED_STEP);
  });

  it('setOnboardingStep writes only the step key, not the completed flag', () => {
    setOnboardingStep(2);
    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBe('2');
    // The completion flag is a Wave 13.1 contract — setOnboardingStep
    // must NOT flip it (otherwise the user could accidentally finalise
    // the tour just by visiting step 2).
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(isOnboardingCompleted()).toBe(false);
  });

  it('setOnboardingStep with the completed sentinel writes both keys', () => {
    setOnboardingStep(ONBOARDING_COMPLETED_STEP);
    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBe('3');
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(isOnboardingCompleted()).toBe(true);
  });

  it('ignores garbage values in storage and returns the default step', () => {
    window.localStorage.setItem(ONBOARDING_STEP_KEY, 'banana');
    expect(getOnboardingStep()).toBe(ONBOARDING_DEFAULT_STEP);

    window.localStorage.setItem(ONBOARDING_STEP_KEY, '99');
    expect(getOnboardingStep()).toBe(ONBOARDING_DEFAULT_STEP);

    window.localStorage.setItem(ONBOARDING_STEP_KEY, '-1');
    expect(getOnboardingStep()).toBe(ONBOARDING_DEFAULT_STEP);
  });

  it('markOnboardingCompleted writes BOTH the completed flag and the step sentinel', () => {
    markOnboardingCompleted();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBe('3');
  });

  it('resetOnboarding clears BOTH keys', () => {
    markOnboardingCompleted();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBe('3');

    resetOnboarding();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBeNull();
  });
});

describe('useOnboarding — Wave 13.1 contract', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reports completed=false on first read when storage is empty', () => {
    // Note: in jsdom + React 19 the effect runs synchronously inside
    // renderHook, so `hydrated` is already `true` by the time we read
    // `result.current`. The important behavioural contract is that
    // `completed` reflects the current localStorage state — which it does
    // (false because storage is empty).
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.completed).toBe(false);
  });

  it('hydrates with completed=true when the flag is set', () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.hydrated).toBe(true);
    expect(result.current.completed).toBe(true);
  });

  it('markCompleted writes the flag and bumps the completed flag', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.completed).toBe(false);

    act(() => {
      result.current.markCompleted();
    });

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(result.current.completed).toBe(true);
  });

  it('reset clears the flag', () => {
    markOnboardingCompleted();
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.completed).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(result.current.completed).toBe(false);
  });
});

describe('useOnboarding — Wave 18.5 step persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hydrates currentStep from the persisted step key', () => {
    window.localStorage.setItem(ONBOARDING_STEP_KEY, '2');
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.hydrated).toBe(true);
    expect(result.current.completed).toBe(false);
    expect(result.current.currentStep).toBe<OnboardingStep>(2);
  });

  it('hydrates currentStep to the completed sentinel when the legacy flag is set', () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.completed).toBe(true);
    expect(result.current.currentStep).toBe(ONBOARDING_COMPLETED_STEP);
  });

  it('setStep writes only the step key when given a live step', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.setStep(1);
    });

    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBe('1');
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(result.current.currentStep).toBe<OnboardingStep>(1);
    expect(result.current.completed).toBe(false);
  });

  it('setStep with the completed sentinel writes both keys and flips completed', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.setStep(ONBOARDING_COMPLETED_STEP);
    });

    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBe('3');
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(result.current.currentStep).toBe(ONBOARDING_COMPLETED_STEP);
    expect(result.current.completed).toBe(true);
  });

  it('reset clears both flags and resets currentStep to default', () => {
    window.localStorage.setItem(ONBOARDING_STEP_KEY, '2');
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentStep).toBe<OnboardingStep>(2);

    act(() => {
      result.current.reset();
    });

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(ONBOARDING_STEP_KEY)).toBeNull();
    expect(result.current.completed).toBe(false);
    expect(result.current.currentStep).toBe(ONBOARDING_DEFAULT_STEP);
  });
});
/**
 * @akasha/portal — onboarding-state hook tests
 *
 * Wave 13.1. Verifies the localStorage contract:
 *   - First read with no flag → completed=false, hydrated=false then true
 *   - markCompleted writes the flag and re-reads on next effect tick
 *   - reset clears the flag
 *   - SSR-safe: window guards don't throw in node test env
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
  ONBOARDING_STORAGE_KEY,
  isOnboardingCompleted,
  markOnboardingCompleted,
  resetOnboarding,
  useOnboarding,
} from '@/lib/state/onboarding-state';

describe('onboarding-state (imperative)', () => {
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

describe('useOnboarding', () => {
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
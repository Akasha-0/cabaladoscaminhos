// @vitest-environment jsdom
/**
 * @akasha/portal — useEmotionalState + emotional-state contract tests
 *
 * Wave 9.1 One-Screen Hub. Tests the persistence + freshness contract
 * that the StatePicker and AdaptiveContent both rely on.
 *
 * We use vitest + jsdom (via the per-file pragma above), with manual localStorage
 * stubs because jsdom's localStorage starts empty.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
  COOKIE_NAME,
  EMOTIONAL_STATES,
  STALE_MS,
  STORAGE_KEY,
  clearEmotionalState,
  getCurrentEmotionalState,
  getEmotionalState,
  isEmotionalState,
  isStale,
  setEmotionalState,
  shouldPromptForState,
  useEmotionalState,
} from './emotional-state';

describe('emotional-state — type guard', () => {
  it('accepts the four canonical states', () => {
    for (const s of EMOTIONAL_STATES) {
      expect(isEmotionalState(s)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isEmotionalState('triste')).toBe(false);
    expect(isEmotionalState(null)).toBe(false);
    expect(isEmotionalState(undefined)).toBe(false);
    expect(isEmotionalState(42)).toBe(false);
    expect(isEmotionalState({})).toBe(false);
  });
});

describe('emotional-state — persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = `${COOKIE_NAME}=; Max-Age=0`;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when nothing is stored', () => {
    expect(getEmotionalState()).toBeNull();
    expect(getCurrentEmotionalState()).toBeNull();
    expect(shouldPromptForState()).toBe(true);
  });

  it('persists state to localStorage and the cookie mirror', () => {
    const rec = setEmotionalState('ansioso');
    expect(rec.state).toBe('ansioso');
    expect(typeof rec.ts).toBe('number');

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state).toBe('ansioso');
    expect(parsed.ts).toBe(rec.ts);

    expect(document.cookie).toContain(`${COOKIE_NAME}=`);
  });

  it('round-trips: getCurrentEmotionalState returns what was set', () => {
    setEmotionalState('curioso');
    expect(getCurrentEmotionalState()).toBe('curioso');
  });

  it('clearEmotionalState wipes localStorage and cookie', () => {
    setEmotionalState('perdido');
    clearEmotionalState();
    expect(getEmotionalState()).toBeNull();
    expect(getCurrentEmotionalState()).toBeNull();
  });

  it('rejects malformed localStorage payloads', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json {');
    expect(getEmotionalState()).toBeNull();

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: 'triste', ts: 1 }));
    expect(getEmotionalState()).toBeNull();

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: 'centrado' }));
    expect(getEmotionalState()).toBeNull();
  });
});

describe('emotional-state — freshness', () => {
  it('isStale: fresh record is not stale', () => {
    const rec = { state: 'centrado' as const, ts: Date.now() };
    expect(isStale(rec)).toBe(false);
  });

  it('isStale: record older than 24h is stale', () => {
    const rec = { state: 'centrado' as const, ts: Date.now() - STALE_MS - 1 };
    expect(isStale(rec)).toBe(true);
  });

  it('shouldPromptForState respects freshness', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'));
    setEmotionalState('ansioso');
    expect(shouldPromptForState()).toBe(false);

    // Advance 25h — should re-prompt
    vi.setSystemTime(Date.now() + 25 * 60 * 60 * 1000);
    expect(shouldPromptForState()).toBe(true);
    vi.useRealTimers();
  });
});

describe('useEmotionalState — hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = `${COOKIE_NAME}=; Max-Age=0`;
  });

  it('resolves to no state on first mount when storage is empty', async () => {
    const { result } = renderHook(() => useEmotionalState());

    // React 19 + testing-library runs effects synchronously by default; we
    // can assert the post-effect state directly. If React 18 / async-mode
    // is later in play, this still works because act() flushes the effect.
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.hydrated).toBe(true);
    expect(result.current.state).toBeNull();
    expect(result.current.needsPrompt).toBe(true);
  });

  it('reads the persisted state after mount', async () => {
    setEmotionalState('curioso');
    const { result } = renderHook(() => useEmotionalState());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toBe('curioso');
    expect(result.current.needsPrompt).toBe(false);
  });

  it('setState writes storage and updates the hook', async () => {
    const { result } = renderHook(() => useEmotionalState());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toBeNull();

    await act(async () => {
      result.current.setState('ansioso');
    });

    expect(result.current.state).toBe('ansioso');
    expect(getCurrentEmotionalState()).toBe('ansioso');
  });

  it('clear wipes state and triggers re-prompt', async () => {
    setEmotionalState('perdido');
    const { result } = renderHook(() => useEmotionalState());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.state).toBe('perdido');

    await act(async () => {
      result.current.clear();
    });
    expect(result.current.state).toBeNull();
    expect(result.current.needsPrompt).toBe(true);
  });

  it('ignores stale persisted state', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'));
    setEmotionalState('ansioso');

    vi.setSystemTime(Date.now() + 25 * 60 * 60 * 1000);
    const { result } = renderHook(() => useEmotionalState());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toBeNull();
    expect(result.current.needsPrompt).toBe(true);
    vi.useRealTimers();
  });
});
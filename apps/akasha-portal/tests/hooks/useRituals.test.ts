import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRituals } from '@/hooks/useRituals';

describe('useRituals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  it('returns rituais array', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(result.current.rituais).toBeInstanceOf(Array);
  });

  it('returns completions array', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(result.current.completions).toBeInstanceOf(Array);
  });

  it('returns streaks map', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(result.current.streaks).toBeInstanceOf(Map);
  });

  it('returns loading boolean', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('returns error (null or string)', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
  });

  it('returns stats object with numeric fields', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(result.current.stats).toHaveProperty('totalCompletions');
    expect(result.current.stats).toHaveProperty('completionsToday');
    expect(result.current.stats).toHaveProperty('completionsThisWeek');
    expect(result.current.stats).toHaveProperty('completionsThisMonth');
  });

  it('has completeRitual function', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.completeRitual).toBe('function');
  });

  it('has undoCompletion function', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.undoCompletion).toBe('function');
  });

  it('has refreshRituais function', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.refreshRituais).toBe('function');
  });

  it('has refreshCompletions function', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.refreshCompletions).toBe('function');
  });

  it('has refetch function', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.refetch).toBe('function');
  });

  it('has isCompletedToday function', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(typeof result.current.isCompletedToday).toBe('function');
  });

  it('isCompletedToday returns boolean for any input', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    const val = result.current.isCompletedToday('test-id');
    expect(typeof val).toBe('boolean');
  });

  it('completeRitual is async function', async () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    const returnVal = result.current.completeRitual('ritual-1');
    expect(returnVal instanceof Promise).toBe(true);
    // Clean up pending
    returnVal.catch(() => {});
  });

  it('undoCompletion is async function', async () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    const returnVal = result.current.undoCompletion('ritual-1', new Date().toISOString());
    expect(returnVal instanceof Promise).toBe(true);
    returnVal.catch(() => {});
  });

  it('refreshRituais is async function', async () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    const returnVal = result.current.refreshRituais();
    expect(returnVal instanceof Promise).toBe(true);
    returnVal.catch(() => {});
  });

  it('refreshCompletions is async function', async () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    const returnVal = result.current.refreshCompletions();
    expect(returnVal instanceof Promise).toBe(true);
    returnVal.catch(() => {});
  });

  it('accepts userId option without errors', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false, userId: 'user-123' }));
    expect(result.current).toBeDefined();
    expect(result.current.rituais).toBeDefined();
  });

  it('accepts autoRefresh false option', () => {
    const { result } = renderHook(() => useRituals({ autoRefresh: false }));
    expect(result.current.loading).toBeDefined();
  });
});
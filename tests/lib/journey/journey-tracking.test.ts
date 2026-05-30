import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { trackProgress, getProgress, clearProgress } from '../../../src/lib/journey/journey-tracking';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('journey-tracking', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('trackProgress stores data and getProgress retrieves it', () => {
    trackProgress('journey-1', { step: 1, completed: true });
    const progress = getProgress('journey-1');
    expect(progress).not.toBeNull();
    expect(progress?.step).toBe(1);
    expect(progress?.completed).toBe(true);
  });

  it('getProgress returns null for unknown journey', () => {
    const progress = getProgress('unknown-id');
    expect(progress).toBeNull();
  });

  it('clearProgress removes specific journey', () => {
    trackProgress('journey-1', { step: 1 });
    trackProgress('journey-2', { step: 2 });
    clearProgress('journey-1');
    expect(getProgress('journey-1')).toBeNull();
    expect(getProgress('journey-2')).not.toBeNull();
  });
});

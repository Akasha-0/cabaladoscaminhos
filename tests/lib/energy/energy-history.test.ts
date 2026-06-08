import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getHistory, addToHistory, clearHistory } from '@/lib/energy/energy-history';

const STORAGE_KEY = 'energy-history';

describe('energy-history', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return mockStorage[key] ?? null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete mockStorage[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};
  });

  describe('getHistory', () => {
    it('returns empty array when no history exists', () => {
      expect(getHistory()).toEqual([]);
    });

    it('returns parsed history from localStorage', () => {
      const snapshots = [
        { timestamp: 1000, data: { foo: 'bar' } },
        { timestamp: 2000, data: { baz: 42 } },
      ];
      mockStorage[STORAGE_KEY] = JSON.stringify(snapshots);

      const result = getHistory();

      expect(result).toEqual(snapshots);
      expect(result).toHaveLength(2);
    });

    it('returns empty array on JSON parse error', () => {
      mockStorage[STORAGE_KEY] = 'not valid json';

      expect(getHistory()).toEqual([]);
    });

    it('returns empty array when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('storage unavailable');
      });

      expect(getHistory()).toEqual([]);
    });
  });

  describe('addToHistory', () => {
    it('adds entry with timestamp to empty history', () => {
      const before = Date.now();
      addToHistory({ value: 1 });
      const after = Date.now();

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);

      expect(stored).toHaveLength(1);
      expect(stored[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(stored[0].timestamp).toBeLessThanOrEqual(after);
      expect(stored[0].data).toEqual({ value: 1 });
    });

    it('prepends new entry to existing history', () => {
      const existing = [
        { timestamp: 1000, data: 'old' },
      ];
      mockStorage[STORAGE_KEY] = JSON.stringify(existing);

      const before = Date.now();
      addToHistory('new');
      const after = Date.now();

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);

      expect(stored).toHaveLength(2);
      expect(stored[0].data).toBe('new');
      expect(stored[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(stored[0].timestamp).toBeLessThanOrEqual(after);
      expect(stored[1].data).toBe('old');
    });

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('storage unavailable');
      });

      expect(() => addToHistory({})).not.toThrow();
    });
  });

  describe('clearHistory', () => {
    it('removes energy-history from localStorage', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify([{ timestamp: 1, data: 'x' }]);

      clearHistory();

      expect(mockStorage[STORAGE_KEY]).toBeUndefined();
    });

    it('does not throw when key does not exist', () => {
      expect(() => clearHistory()).not.toThrow();
    });

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw new Error('storage unavailable');
      });

      expect(() => clearHistory()).not.toThrow();
    });
  });
});
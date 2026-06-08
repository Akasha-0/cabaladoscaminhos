import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { trackProgress, getProgress, clearProgress } from '@/lib/alignment/alignment-tracking';

const STORAGE_KEY = 'alignment_progress';

const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.data[key];
  }),
};

vi.stubGlobal('localStorage', mockLocalStorage);

describe('alignment-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.data = {};
  });

  afterEach(() => {
    mockLocalStorage.data = {};
  });

  describe('trackProgress', () => {
    it('creates a new progress entry when none exists for stageId', () => {
      const result = trackProgress('stage-1', { foo: 'bar' });

      expect(result.stageId).toBe('stage-1');
      expect(result.completed).toBe(true);
      expect(result.metadata).toEqual({ foo: 'bar' });
      expect(result.lastUpdated).toBeDefined();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('stage-1')
      );
    });

    it('updates existing progress entry for same stageId', () => {
      trackProgress('stage-1', { version: 1 });
      const before = mockLocalStorage.data[STORAGE_KEY];
      const beforeCount = JSON.parse(before).progress.length;

      const result = trackProgress('stage-1', { version: 2 });
      const after = mockLocalStorage.data[STORAGE_KEY];
      const afterCount = JSON.parse(after).progress.length;

      expect(result.metadata).toEqual({ version: 2 });
      expect(beforeCount).toBe(afterCount);
      expect(afterCount).toBe(1);
    });

    it('stores multiple different stageIds', () => {
      trackProgress('stage-1');
      trackProgress('stage-2');
      trackProgress('stage-3');

      const stored = JSON.parse(mockLocalStorage.data[STORAGE_KEY]);
      expect(stored.progress).toHaveLength(3);
    });

    it('sets completed to true', () => {
      const result = trackProgress('stage-1');
      expect(result.completed).toBe(true);
    });
  });

  describe('getProgress', () => {
    it('returns null when no progress exists', () => {
      const result = getProgress('nonexistent');
      expect(result).toBeNull();
    });

    it('returns progress entry for existing stageId', () => {
      trackProgress('stage-1', { key: 'value' });

      const result = getProgress('stage-1');

      expect(result).not.toBeNull();
      expect(result?.stageId).toBe('stage-1');
      expect(result?.metadata).toEqual({ key: 'value' });
      expect(result?.completed).toBe(true);
    });

    it('returns null when storage contains unrelated data', () => {
      mockLocalStorage.data[STORAGE_KEY] = JSON.stringify({ progress: [], version: 1 });

      const result = getProgress('stage-1');
      expect(result).toBeNull();
    });

    it('handles corrupted storage gracefully', () => {
      mockLocalStorage.data[STORAGE_KEY] = 'not valid json {{{';

      const result = getProgress('stage-1');
      expect(result).toBeNull();
    });

    it('returns the most recent entry when multiple exist', () => {
      trackProgress('stage-1', { n: 1 });
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
      trackProgress('stage-1', { n: 2 });
      vi.useRealTimers();

      const result = getProgress('stage-1');
      expect(result?.metadata).toEqual({ n: 2 });
    });
  });

  describe('clearProgress', () => {
    it('clears all progress when no stageId is provided', () => {
      trackProgress('stage-1');
      trackProgress('stage-2');
      trackProgress('stage-3');

      clearProgress();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(getProgress('stage-1')).toBeNull();
      expect(getProgress('stage-2')).toBeNull();
    });

    it('clears only specific stageId when provided', () => {
      trackProgress('stage-1');
      trackProgress('stage-2');
      trackProgress('stage-3');

      clearProgress('stage-2');

      expect(getProgress('stage-1')).not.toBeNull();
      expect(getProgress('stage-2')).toBeNull();
      expect(getProgress('stage-3')).not.toBeNull();
    });

    it('does not throw when clearing nonexistent stageId', () => {
      expect(() => clearProgress('nonexistent')).not.toThrow();
    });

    it('clears are idempotent', () => {
      trackProgress('stage-1');
      clearProgress('stage-1');
      clearProgress('stage-1');
      expect(getProgress('stage-1')).toBeNull();
    });
  });

  describe('localStorage errors', () => {
    it('handles setItem throwing quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => trackProgress('stage-1')).not.toThrow();
    });

    it('handles getItem returning malformed JSON', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('broken{');

      expect(() => getProgress('stage-1')).not.toThrow();
      expect(getProgress('stage-1')).toBeNull();
    });
  });
});

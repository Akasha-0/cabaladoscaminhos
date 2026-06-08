import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { trackProgress, getProgress, clearProgress } from '@/lib/wisdom/wisdom-tracking';

describe('WisdomTracking', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('trackProgress', () => {
    it('should create a progress entry with completed true', () => {
      const result = trackProgress('insight-1');
      expect(result.insightId).toBe('insight-1');
      expect(result.completed).toBe(true);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should store progress entry in localStorage', () => {
      trackProgress('insight-1');
      const stored = localStorage.getItem('wisdom_progress');
      expect(stored).not.toBeNull();
      const data = JSON.parse(stored!);
      expect(data.progress).toHaveLength(1);
      expect(data.progress[0].insightId).toBe('insight-1');
    });

    it('should include metadata when provided', () => {
      const metadata = { category: 'tarot', score: 42 };
      const result = trackProgress('insight-2', metadata);
      expect(result.metadata).toEqual(metadata);
    });

    it('should update existing entry instead of creating duplicate', () => {
      trackProgress('insight-1', { version: 1 });
      trackProgress('insight-1', { version: 2 });
      const stored = localStorage.getItem('wisdom_progress');
      const data = JSON.parse(stored!);
      expect(data.progress).toHaveLength(1);
      expect(data.progress[0].metadata).toEqual({ version: 2 });
    });

    it('should set version to 1 in stored data', () => {
      trackProgress('insight-1');
      const stored = localStorage.getItem('wisdom_progress');
      const data = JSON.parse(stored!);
      expect(data.version).toBe(1);
    });
  });

  describe('getProgress', () => {
    it('should return null for non-existent insight', () => {
      const result = getProgress('non-existent');
      expect(result).toBeNull();
    });

    it('should return progress entry for existing insight', () => {
      trackProgress('insight-1');
      const result = getProgress('insight-1');
      expect(result).not.toBeNull();
      expect(result!.insightId).toBe('insight-1');
      expect(result!.completed).toBe(true);
    });

    it('should return latest entry when multiple exist', () => {
      trackProgress('insight-1', { iteration: 1 });
      trackProgress('insight-1', { iteration: 2 });
      const result = getProgress('insight-1');
      expect(result!.metadata).toEqual({ iteration: 2 });
    });
  });

  describe('clearProgress', () => {
    it('should clear all progress when no insightId provided', () => {
      trackProgress('insight-1');
      trackProgress('insight-2');
      clearProgress();
      const stored = localStorage.getItem('wisdom_progress');
      expect(stored).toBeNull();
    });

    it('should clear only specific insight when insightId provided', () => {
      trackProgress('insight-1');
      trackProgress('insight-2');
      clearProgress('insight-1');
      const result = getProgress('insight-1');
      expect(result).toBeNull();
      const remaining = getProgress('insight-2');
      expect(remaining).not.toBeNull();
    });

    it('should handle clearing non-existent insight gracefully', () => {
      expect(() => clearProgress('non-existent')).not.toThrow();
    });
  });

  describe('server-side rendering', () => {
    it('should not throw when trackProgress called without window', () => {
      // Simulates SSR environment where window is undefined
      const originalWindow = global.window;
      // @ts-expect-error - testing SSR behavior
      delete global.window;
      expect(() => trackProgress('insight-ssr')).not.toThrow();
      global.window = originalWindow;
    });

    it('should return empty progress on server', () => {
      // @ts-expect-error - testing SSR behavior
      delete global.window;
      expect(() => getProgress('insight-ssr')).not.toThrow();
      global.window = global.window || {};
    });
  });
});

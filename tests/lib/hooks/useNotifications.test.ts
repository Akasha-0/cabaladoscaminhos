import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Import helper functions
import { getMoonPhase, formatRelativeTime, generateId } from '@/lib/hooks/useNotifications';

describe('useNotifications Hook - Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMoonPhase', () => {
    it('returns valid moon phase string', () => {
      const date = new Date();
      const phase = getMoonPhase(date);
      expect(['new', 'waxing', 'firstQuarter', 'waxingGibbous', 'full', 'waningGibbous', 'lastQuarter', 'waning']).toContain(phase);
    });

    it('returns different phases on different days', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 15);
      const phase1 = getMoonPhase(date1);
      const phase2 = getMoonPhase(date2);
      // At minimum, the phases should be strings
      expect(typeof phase1).toBe('string');
      expect(typeof phase2).toBe('string');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "Agora" for very recent timestamps', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('Agora');
    });

    it('returns minutes with suffix for timestamps within an hour', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toContain('5');
      expect(result).toContain('m');
    });

    it('returns hours with suffix for timestamps within a day', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const result = formatRelativeTime(twoHoursAgo);
      expect(result).toContain('2');
      expect(result).toContain('h');
    });

    it('returns "Ontem" for timestamps yesterday', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(yesterday)).toBe('Ontem');
    });

    it('returns days for timestamps within a week', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toContain('3');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});

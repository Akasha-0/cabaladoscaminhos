import { describe, it, expect } from 'vitest';
import { getReadingHistory } from '@/lib/divination/reading-history';

describe('divination/reading-history', () => {
  describe('getReadingHistory', () => {
    it('returns array', () => {
      const history = getReadingHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });
});

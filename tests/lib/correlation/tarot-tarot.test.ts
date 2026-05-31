import { describe, it, expect } from 'vitest';
import { getTarotTarot, getAllTarotPaths, TAROT_TAROT_MAPPINGS } from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown arcano', () => {
      const result = getTarotTarot('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(20);
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should have valid arcano values', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(mapping.arcano).toBeTruthy();
        expect(mapping.related_arcano).toBeTruthy();
      });
    });

    it('should have valid path types', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(['sequential', 'tree_path', 'archetypal']).toContain(mapping.path_type);
      });
    });
  });
});

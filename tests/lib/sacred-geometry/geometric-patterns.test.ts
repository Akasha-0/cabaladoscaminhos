import { describe, it, expect } from 'vitest';
import { getPatterns, getPatternById, getPatternsByCategory, getPatternsBySefirot, getPatternsByChakra, getPatternCategories, getMetatronRelations, getAllElements, getAllSefirots, getAllChakras } from '@/lib/sacred-geometry/geometric-patterns';

describe('sacred-geometry/geometric-patterns', () => {
  describe('getPatterns', () => {
    it('returns all patterns', () => {
      const patterns = getPatterns();
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('each pattern has required fields', () => {
      for (const p of getPatterns()) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.category).toBeTruthy();
      }
    });
  });

  describe('getPatternById', () => {
    it('finds pattern by id', () => {
      const patterns = getPatterns();
      if (patterns.length > 0) {
        const found = getPatternById(patterns[0].id);
        expect(found).toBeDefined();
      }
    });

    it('returns undefined for unknown id', () => {
      expect(getPatternById('nonexistent')).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    it('returns patterns for platonic category', () => {
      const patterns = getPatternsByCategory('platonic');
      for (const p of patterns) {
        expect(p.category).toBe('platonic');
      }
    });
  });

  describe('getPatternsBySefirot', () => {
    it('returns patterns for a sefirot', () => {
      const patterns = getPatternsBySefirot('Kether');
      for (const p of patterns) {
        expect(p.sefirots).toContain('Kether');
      }
    });
  });

  describe('getPatternsByChakra', () => {
    it('returns patterns for chakra 1', () => {
      const patterns = getPatternsByChakra(1);
      for (const p of patterns) {
        expect(p.chakras).toContain(1);
      }
    });
  });

  describe('getPatternCategories', () => {
    it('returns all pattern categories', () => {
      const cats = getPatternCategories();
      expect(cats).toContain('platonic');
      expect(cats).toContain('spiral');
    });
  });

  describe('getMetatronRelations', () => {
    it('returns metatron relations', () => {
      const rels = getMetatronRelations();
      expect(rels.length).toBeGreaterThan(0);
    });
  });

  describe('getAllElements', () => {
    it('returns 5 elements', () => {
      expect(getAllElements()).toHaveLength(5);
    });
  });

  describe('getAllSefirots', () => {
    it('returns 10 sefirots', () => {
      expect(getAllSefirots()).toHaveLength(10);
    });
  });

  describe('getAllChakras', () => {
    it('returns 7 chakras', () => {
      expect(getAllChakras()).toHaveLength(7);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getPathsByType,
  getRelatedArcano,
  areArcanosRelated,
  getMappingsByNumber,
  getAllArcanos,
  TAROT_TAROT_MAPPINGS,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return mappings for O Louco', () => {
      const mappings = getTarotTarot('O Louco');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings[0].arcano).toBe('O Louco');
    });

    it('should return empty array for unknown arcano', () => {
      const mappings = getTarotTarot('NonExistent');
      expect(mappings).toEqual([]);
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const paths = getAllTarotPaths();
      expect(paths.length).toBeGreaterThan(20);
    });
  });

  describe('getPathsByType', () => {
    it('should return sequential paths', () => {
      const paths = getPathsByType('sequential');
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((p) => expect(p.path_type).toBe('sequential'));
    });

    it('should return tree_path mappings', () => {
      const paths = getPathsByType('tree_path');
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((p) => expect(p.path_type).toBe('tree_path'));
    });

    it('should return archetypal pairs', () => {
      const paths = getPathsByType('archetypal');
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((p) => expect(p.path_type).toBe('archetypal'));
    });
  });

  describe('getRelatedArcano', () => {
    it('should return related arcano for O Louco', () => {
      const related = getRelatedArcano('O Louco');
      expect(related).toBe('O Mago');
    });

    it('should return null for unknown arcano', () => {
      const related = getRelatedArcano('NonExistent');
      expect(related).toBeNull();
    });
  });

  describe('areArcanosRelated', () => {
    it('should return true for related arcanos', () => {
      expect(areArcanosRelated('O Louco', 'O Mago')).toBe(true);
    });

    it('should return false for unrelated arcanos', () => {
      expect(areArcanosRelated('O Sol', 'O Diabo')).toBe(false);
    });
  });

  describe('getMappingsByNumber', () => {
    it('should return mappings for card number 0', () => {
      const mappings = getMappingsByNumber(0);
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('should return mappings for card number 21', () => {
      const mappings = getMappingsByNumber(21);
      expect(mappings.length).toBeGreaterThan(0);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all unique arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('O Mundo');
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should have valid arcano names', () => {
      TAROT_TAROT_MAPPINGS.forEach((m) => {
        expect(m.arcano).toBeTruthy();
        expect(m.related_arcano).toBeTruthy();
      });
    });

    it('should have valid card numbers (0-21)', () => {
      TAROT_TAROT_MAPPINGS.forEach((m) => {
        expect(m.numero_carta).toBeGreaterThanOrEqual(0);
        expect(m.numero_carta).toBeLessThanOrEqual(21);
      });
    });

    it('should have spiritual meaning for all mappings', () => {
      TAROT_TAROT_MAPPINGS.forEach((m) => {
        expect(m.spiritual_meaning.length).toBeGreaterThan(0);
      });
    });
  });
});

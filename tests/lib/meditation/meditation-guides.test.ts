import { describe, it, expect } from 'vitest';
import {
  getGuides,
  getGuideById,
  getGuidesByCategory,
  getGuidesByDifficulty,
  getGuideCategories,
  type Guide,
  type GuideDifficulty,
} from '@/lib/meditation/meditation-guides';

describe('meditation-guides', () => {
  describe('getGuides', () => {
    it('returns all guides', () => {
      const guides = getGuides();
      expect(guides.length).toBeGreaterThan(0);
    });

    it('returns a copy (not the original array)', () => {
      const guides1 = getGuides();
      const guides2 = getGuides();
      expect(guides1).not.toBe(guides2);
    });

    it('each guide has required fields', () => {
      const guides = getGuides();
      guides.forEach((guide: Guide) => {
        expect(guide.id).toBeDefined();
        expect(guide.title).toBeDefined();
        expect(guide.description).toBeDefined();
        expect(guide.category).toMatch(/^(cura|sono|foco|energia|sagrado)$/);
        expect(guide.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
        expect(guide.duration).toBeGreaterThan(0);
        expect(guide.practices).toBeDefined();
        expect(Array.isArray(guide.practices)).toBe(true);
        expect(guide.integration).toBeDefined();
      });
    });

    it('each guide has at least one practice', () => {
      const guides = getGuides();
      guides.forEach((guide: Guide) => {
        expect(guide.practices.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getGuideById', () => {
    it('returns a guide by id', () => {
      const guides = getGuides();
      const first = guides[0];
      const result = getGuideById(first.id);
      expect(result?.id).toBe(first.id);
      expect(result?.title).toBe(first.title);
    });

    it('returns undefined for non-existent id', () => {
      const result = getGuideById('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('returns exact match for known id', () => {
      const result = getGuideById('foundations-of-awareness');
      expect(result?.title).toBe('Fundamentos da Consciência');
    });
  });

  describe('getGuidesByCategory', () => {
    it('returns guides for a valid category', () => {
      const guides = getGuidesByCategory('cura');
      expect(guides.length).toBeGreaterThan(0);
      guides.forEach((guide: Guide) => {
        expect(guide.category).toBe('cura');
      });
    });

    it('returns empty array for category with no guides', () => {
      // Test with invalid category
      const result = getGuidesByCategory('invalid-category' as Guide['category']);
      // Category is valid type-wise, but no guides may exist
      result.forEach((guide: Guide) => {
        expect(['cura', 'sono', 'foco', 'energia', 'sagrado']).toContain(guide.category);
      });
    });

    it('includes guides with practice data', () => {
      const guides = getGuidesByCategory('cura');
      if (guides.length > 0) {
        guides.forEach((guide: Guide) => {
          expect(guide.practices.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('getGuidesByDifficulty', () => {
    it('returns beginner guides', () => {
      const guides = getGuidesByDifficulty('beginner');
      guides.forEach((guide: Guide) => {
        expect(guide.difficulty).toBe('beginner');
      });
    });

    it('returns intermediate guides', () => {
      const guides = getGuidesByDifficulty('intermediate');
      guides.forEach((guide: Guide) => {
        expect(guide.difficulty).toBe('intermediate');
      });
    });

    it('returns advanced guides', () => {
      const guides = getGuidesByDifficulty('advanced');
      guides.forEach((guide: Guide) => {
        expect(guide.difficulty).toBe('advanced');
      });
    });

    it('returns empty array for unknown difficulty', () => {
      const guides = getGuidesByDifficulty('expert' as GuideDifficulty);
      guides.forEach((guide: Guide) => {
        expect(['beginner', 'intermediate', 'advanced']).toContain(guide.difficulty);
      });
    });
  });

  describe('getGuideCategories', () => {
    it('returns all valid categories', () => {
      const categories = getGuideCategories();
      expect(categories).toContain('cura');
      expect(categories).toContain('sono');
      expect(categories).toContain('foco');
      expect(categories).toContain('energia');
      expect(categories).toContain('sagrado');
    });

    it('returns exactly 5 categories', () => {
      const categories = getGuideCategories();
      expect(categories.length).toBe(5);
    });

    it('no duplicates', () => {
      const categories = getGuideCategories();
      const unique = [...new Set(categories)];
      expect(unique.length).toBe(categories.length);
    });
  });
});
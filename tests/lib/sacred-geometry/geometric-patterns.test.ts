import { describe, it, expect } from 'vitest';
import { 
  getPatterns, 
  getPatternById, 
  getPatternsByCategory, 
  getPatternCategories,
  getMetatronRelations,
  getAllElements,
  getAllSefirots,
  getAllChakras
} from '../../../src/lib/sacred-geometry/geometric-patterns';

describe('geometric-patterns', () => {
  it('getPatterns returns array of patterns', () => {
    const patterns = getPatterns();
    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('each pattern has required fields', () => {
    const patterns = getPatterns();
    const pattern = patterns[0];
    expect(pattern).toHaveProperty('id');
    expect(pattern).toHaveProperty('name');
    expect(pattern).toHaveProperty('category');
    expect(pattern).toHaveProperty('sefirots');
    expect(pattern).toHaveProperty('chakras');
  });

  it('getPatternById finds pattern by id', () => {
    const patterns = getPatterns();
    const pattern = patterns[0];
    const found = getPatternById(pattern.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(pattern.id);
  });

  it('getPatternsByCategory filters correctly', () => {
    const platonicPatterns = getPatternsByCategory('platonic');
    expect(platonicPatterns.every(p => p.category === 'platonic')).toBe(true);
  });

  it('getPatternCategories returns all 5 categories', () => {
    const categories = getPatternCategories();
    expect(categories).toContain('platonic');
    expect(categories).toContain('stellar');
    expect(categories).toContain('flower');
    expect(categories).toContain('knot');
    expect(categories).toContain('spiral');
  });

  it('getAllSefirots returns 10 sephiroth', () => {
    const sefirots = getAllSefirots();
    expect(sefirots.length).toBe(10);
    expect(sefirots).toContain('Kether');
    expect(sefirots).toContain('Malkuth');
  });

  it('getAllChakras returns7 chakras', () => {
    const chakras = getAllChakras();
    expect(chakras.length).toBe(7);
    expect(chakras).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

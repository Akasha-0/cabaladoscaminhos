import { describe, it, expect } from 'vitest';
import { categories } from '@/lib/affirmations/categories';

describe('affirmations/categories', () => {
  it('has categories', () => {
    expect(Object.keys(categories).length).toBeGreaterThan(0);
  });
  it('each category has affirmations', () => {
    for (const [cat, affirmations] of Object.entries(categories)) {
      expect(Array.isArray(affirmations)).toBe(true);
    }
  });
});

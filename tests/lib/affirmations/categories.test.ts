import { describe, it, expect } from 'vitest';
import { getCategories, getAffirmationsByCategory } from '@/lib/affirmations/categories';
describe('affirmations/categories', () => {
  it('has categories', () => {
    expect(getCategories().length).toBeGreaterThan(0);
  });
  it('getAffirmationsByCategory returns array', () => {
    for (const cat of getCategories()) {
      expect(Array.isArray(getAffirmationsByCategory(cat))).toBe(true);
    }
  });
});

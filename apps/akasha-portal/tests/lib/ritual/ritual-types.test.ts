import { describe, it, expect } from 'vitest';
import { getTypes, getCategories } from '../../../src/lib/ritual/ritual-types';

describe('ritual-types', () => {
  it('getTypes returns array of ritual type definitions', () => {
    const types = getTypes();
    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBeGreaterThan(0);
  });

  it('each type has required fields', () => {
    const types = getTypes();
    const type = types[0];
    expect(type).toHaveProperty('category');
    expect(type).toHaveProperty('label');
    expect(type).toHaveProperty('description');
  });

  it('getCategories returns all 8 ritual categories', () => {
    const categories = getCategories();
    expect(categories).toContain('protection');
    expect(categories).toContain('prosperity');
    expect(categories).toContain('love');
    expect(categories).toContain('healing');
    expect(categories).toContain('clarity');
    expect(categories).toContain('transformation');
    expect(categories).toContain('manifestation');
    expect(categories).toContain('release');
  });
});

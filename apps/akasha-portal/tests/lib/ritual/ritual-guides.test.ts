import { describe, it, expect } from 'vitest';
import { getGuides, getGuideByCategory } from '../../../src/lib/ritual/ritual-guides';

describe('ritual-guides', () => {
  it('getGuides returns array of guides', () => {
    const guides = getGuides();
    expect(Array.isArray(guides)).toBe(true);
    expect(guides.length).toBeGreaterThan(0);
  });

  it('each guide has required fields', () => {
    const guides = getGuides();
    const guide = guides[0];
    expect(guide).toHaveProperty('categoria');
    expect(guide).toHaveProperty('nome');
    expect(guide).toHaveProperty('proposito');
    expect(guide).toHaveProperty('passos');
    expect(guide).toHaveProperty('elementos');
    expect(guide).toHaveProperty('cuidados');
    expect(guide).toHaveProperty('horarios');
  });

  it('getGuideByCategory returns guide for valid category', () => {
    const guide = getGuideByCategory('protection');
    expect(guide).toBeDefined();
    expect(guide?.categoria).toBe('protection');
  });

  it('getGuideByCategory returns undefined for invalid category', () => {
    const guide = getGuideByCategory('manifestation');
    expect(guide).toBeUndefined();
  });
});

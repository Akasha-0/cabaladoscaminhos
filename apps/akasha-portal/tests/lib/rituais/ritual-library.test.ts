import { describe, it, expect } from 'vitest';
import { getRituals, getRitualById, getRitualsByCategory, getRitualsByOrixa } from '@/lib/rituais/ritual-library';

describe('ritual-library', () => {
  it('getRituals returns array of rituals', () => {
    const rituals = getRituals();
    expect(Array.isArray(rituals)).toBe(true);
    expect(rituals.length).toBeGreaterThan(0);
  });

  it('each ritual has required fields', () => {
    const rituals = getRituals();
    const ritual = rituals[0];
    expect(ritual).toHaveProperty('id');
    expect(ritual).toHaveProperty('nome');
    expect(ritual).toHaveProperty('categoria');
  });

  it('getRitualById returns ritual for valid id', () => {
    const rituals = getRituals();
    const ritual = getRitualById(rituals[0].id);
    expect(ritual).toBeDefined();
    expect(ritual?.id).toBe(rituals[0].id);
  });

  it('getRitualById returns undefined for invalid id', () => {
    const ritual = getRitualById('non-existent-id');
    expect(ritual).toBeUndefined();
  });

  it('getRitualsByCategory returns array', () => {
    const rituals = getRitualsByCategory('protection');
    expect(Array.isArray(rituals)).toBe(true);
    rituals.forEach(r => {
      expect(r.categoria).toBe('protection');
    });
  });
});
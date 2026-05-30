import { describe, it, expect } from 'vitest';
import { calculateHarmony, ELEMENT_HARMONIES } from '~/lib/elements/harmony';

describe('harmony', () => {
  it('should calculate harmony between water and fire', () => {
    const result = calculateHarmony('water', 'fire');
    expect(result).toBeDefined();
    expect(result.score).toBeLessThan(0);
    expect(result.quality).toBe('dissonant');
  });

  it('should calculate harmony between water and air', () => {
    const result = calculateHarmony('water', 'air');
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.quality).toBe('resonant');
  });

  it('should provide pre-computed element harmonies', () => {
    expect(ELEMENT_HARMONIES.length).toBe(6);
  });
});

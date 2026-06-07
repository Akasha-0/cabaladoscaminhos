import { describe, it, expect } from 'vitest';
import { getData, ELEMENT_DATASET } from '@/lib/elements/element-data';

describe('element-data', () => {
  it('should return element dataset', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(4);
  });

  it('should have fire, water, air, earth elements', () => {
    const data = getData();
    const types = data.map((e) => e.type);
    expect(types).toContain('fire');
    expect(types).toContain('water');
    expect(types).toContain('air');
    expect(types).toContain('earth');
  });
});

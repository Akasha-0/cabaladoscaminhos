import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/breath/breath-data';

describe('breath-data', () => {
  it('returns array of breath exercises', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each exercise has required fields', () => {
    const data = getData();
    const exercise = data[0];
    expect(exercise).toHaveProperty('id');
    expect(exercise).toHaveProperty('name');
    expect(exercise).toHaveProperty('inhale');
    expect(exercise).toHaveProperty('exhale');
  });

  it('relaxing breath uses4-7-8 pattern', () => {
    const data = getData();
    const relaxing = data.find((e) => e.id === 'relaxing');
    expect(relaxing).toBeDefined();
    expect(relaxing?.inhale).toBe(4);
    expect(relaxing?.hold1).toBe(7);
    expect(relaxing?.exhale).toBe(8);
  });
});

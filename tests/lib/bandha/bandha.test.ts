import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/bandha/bandha-data';
import { performPractice } from '@/lib/bandha/bandha-practice';

describe('bandha', () => {
  it('getData returns bandha array', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('bandha items have required properties', () => {
    const bandha = getData()[0];
    expect(bandha).toHaveProperty('id');
    expect(bandha).toHaveProperty('name');
    expect(bandha).toHaveProperty('type');
    expect(bandha.type).toBe('bandha');
  });

  it('performPractice returns practice result', () => {
    const result = performPractice({ name: 'mula-bandha' });
    expect(result).toHaveProperty('name');
    expect(result.name).toBe('mula-bandha');
  });
});
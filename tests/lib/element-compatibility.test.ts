import { describe, it, expect } from 'vitest';
import { calculateCompatibility } from '@/lib/compatibility/element-compatibility';

describe('element-compatibility', () => {
  it('calculateCompatibility returns result', () => {
    const result = calculateCompatibility('fire', 'fire');
    expect(typeof result).toBe('object');
  });

  it('result has score and compatible', () => {
    const result = calculateCompatibility('fire', 'air');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('compatible');
    expect(result).toHaveProperty('elementResults');
  });

  it('fire and air are compatible', () => {
    const result = calculateCompatibility('fire', 'air');
    expect(result.compatible).toBe(true);
  });
});
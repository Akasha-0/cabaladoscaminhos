import { describe, it, expect } from 'vitest';
import { calculateCompatibility } from '@/lib/matching/compatibility';

describe('matching/compatibility', () => {
  it('is a function', () => {
    expect(typeof calculateCompatibility).toBe('function');
  });
});

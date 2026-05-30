import { describe, it, expect } from 'vitest';
import { getTypes } from '@/lib/healing/healing-types';

describe('healing/healing-types', () => {
  it('returns data', () => {
    const data = getTypes();
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
  });
});

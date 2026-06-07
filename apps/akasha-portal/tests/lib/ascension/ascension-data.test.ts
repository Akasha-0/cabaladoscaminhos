import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/ascension/ascension-data';

describe('ascension/ascension-data', () => {
  it('returns data', () => {
    const data = getData();
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
  });
});

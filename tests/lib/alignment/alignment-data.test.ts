import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/alignment/alignment-data';

describe('alignment/alignment-data', () => {
  it('returns data', () => {
    const data = getData();
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/merkabah/merkabah-data';

describe('merkabah/merkabah-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

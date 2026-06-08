import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oviasi-data';

describe('orixa/oviasi-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

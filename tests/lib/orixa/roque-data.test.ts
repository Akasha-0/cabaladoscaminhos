import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/roque-data';

describe('orixa/roque-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

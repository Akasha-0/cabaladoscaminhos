import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/shango-data';

describe('orixa/shango-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

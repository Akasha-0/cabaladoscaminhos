import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/comunidade-data';

describe('orixa/comunidade-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

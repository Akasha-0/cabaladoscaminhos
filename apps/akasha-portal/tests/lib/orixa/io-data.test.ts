import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/io-data';

describe('orixa/io-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

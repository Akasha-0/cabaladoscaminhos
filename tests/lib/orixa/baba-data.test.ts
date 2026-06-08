import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/baba-data';

describe('orixa/baba-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

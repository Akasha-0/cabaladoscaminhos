import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/meditacao-data';

describe('orixa/meditacao-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

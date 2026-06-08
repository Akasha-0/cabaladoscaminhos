import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxaguia-data';

describe('orixa/oxaguia-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

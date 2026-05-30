import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/osetura-meji-data';

describe('orixa/osetura-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

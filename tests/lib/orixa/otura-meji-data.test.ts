import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/otura-meji-data';

describe('orixa/otura-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

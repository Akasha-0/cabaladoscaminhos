import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/irosun-meji-data';

describe('orixa/irosun-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ikate-meji-data';

describe('orixa/ikate-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ikoyun-data';

describe('orixa/ikoyun-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

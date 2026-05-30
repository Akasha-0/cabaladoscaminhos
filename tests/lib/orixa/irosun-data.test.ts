import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/irosun-data';

describe('orixa/irosun-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

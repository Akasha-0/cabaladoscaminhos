import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oja-data';

describe('orixa/oja-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

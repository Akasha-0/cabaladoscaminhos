import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/yemoja-data';

describe('orixa/yemoja-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

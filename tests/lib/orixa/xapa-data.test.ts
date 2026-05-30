import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/xapa-data';

describe('orixa/xapa-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

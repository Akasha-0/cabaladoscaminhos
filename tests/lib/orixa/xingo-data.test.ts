import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/xingo-data';

describe('orixa/xingo-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

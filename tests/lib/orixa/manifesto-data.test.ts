import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/manifesto-data';

describe('orixa/manifesto-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/vovochico-data';

describe('orixa/vovochico-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

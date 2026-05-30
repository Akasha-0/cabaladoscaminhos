import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ossaim-data';

describe('orixa/ossaim-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

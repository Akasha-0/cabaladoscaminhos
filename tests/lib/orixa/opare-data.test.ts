import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/opare-data';

describe('orixa/opare-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

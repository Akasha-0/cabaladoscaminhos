import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/okanle-data';

describe('orixa/okanle-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

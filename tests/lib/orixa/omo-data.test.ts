import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/omo-data';

describe('orixa/omo-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

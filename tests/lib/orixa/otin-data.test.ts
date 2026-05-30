import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/otin-data';

describe('orixa/otin-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/opor-data';

describe('orixa/opor-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

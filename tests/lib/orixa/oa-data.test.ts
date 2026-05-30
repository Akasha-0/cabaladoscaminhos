import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oa-data';

describe('orixa/oa-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

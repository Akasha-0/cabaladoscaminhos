import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ara-data';

describe('orixa/ara-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

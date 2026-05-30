import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ozulum-data';

describe('orixa/ozulum-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

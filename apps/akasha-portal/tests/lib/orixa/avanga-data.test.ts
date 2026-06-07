import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/avanga-data';

describe('orixa/avanga-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

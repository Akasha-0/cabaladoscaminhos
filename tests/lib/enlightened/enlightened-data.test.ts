import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/enlightened/enlightened-data';

describe('enlightened/enlightened-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

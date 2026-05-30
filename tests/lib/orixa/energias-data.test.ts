import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/energias-data';

describe('orixa/energias-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

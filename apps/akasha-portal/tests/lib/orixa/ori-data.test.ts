import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ori-data';

describe('orixa/ori-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

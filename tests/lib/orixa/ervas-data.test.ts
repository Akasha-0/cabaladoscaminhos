import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ervas-data';

describe('orixa/ervas-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

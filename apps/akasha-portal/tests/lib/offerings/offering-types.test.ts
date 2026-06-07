import { describe, it, expect } from 'vitest';
import { getTypes } from '@/lib/offerings/offering-types';

describe('offerings/offering-types', () => {
  it('has data', () => {
    expect(getTypes()).toBeDefined();
  });
});

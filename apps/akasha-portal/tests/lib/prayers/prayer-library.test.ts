import { describe, it, expect } from 'vitest';
import { getPrayers } from '@/lib/prayers/prayer-library';

describe('prayers/prayer-library', () => {
  it('has data', () => {
    expect(getPrayers()).toBeDefined();
  });
});

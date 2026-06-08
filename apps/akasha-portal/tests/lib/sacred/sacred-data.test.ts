import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/sacred/sacred-data';

describe('sacred/sacred-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

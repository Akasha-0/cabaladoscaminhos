import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/soul/soul-data';

describe('soul/soul-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

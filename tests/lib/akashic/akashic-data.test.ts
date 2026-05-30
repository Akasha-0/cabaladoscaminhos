import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/akashic/akashic-data';

describe('akashic/akashic-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

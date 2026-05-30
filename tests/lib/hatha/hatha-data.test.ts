import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/hatha/hatha-data';

describe('hatha/hatha-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

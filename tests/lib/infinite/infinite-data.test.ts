import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/infinite/infinite-data';

describe('infinite/infinite-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

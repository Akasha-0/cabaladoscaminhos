import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/awareness/awareness-data';

describe('awareness/awareness-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

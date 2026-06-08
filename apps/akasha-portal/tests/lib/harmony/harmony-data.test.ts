import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/harmony/harmony-data';

describe('harmony/harmony-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

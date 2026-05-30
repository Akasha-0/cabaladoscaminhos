import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oba-data';

describe('orixa/oba-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

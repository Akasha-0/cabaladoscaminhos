import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/obatala-data';

describe('orixa/obatala-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

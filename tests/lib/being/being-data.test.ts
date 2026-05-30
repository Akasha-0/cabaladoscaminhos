import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/being/being-data';

describe('being/being-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

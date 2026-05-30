import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/odi-meji-data';

describe('orixa/odi-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

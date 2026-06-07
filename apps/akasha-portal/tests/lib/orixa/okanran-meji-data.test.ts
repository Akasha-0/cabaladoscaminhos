import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/okanran-meji-data';

describe('orixa/okanran-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

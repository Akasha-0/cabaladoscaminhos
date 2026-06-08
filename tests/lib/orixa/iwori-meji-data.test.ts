import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/iwori-meji-data';

describe('orixa/iwori-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

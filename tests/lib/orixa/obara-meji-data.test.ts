import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/obara-meji-data';

describe('orixa/obara-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

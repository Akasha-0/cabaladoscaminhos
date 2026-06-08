import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ika-meji-data';

describe('orixa/ika-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

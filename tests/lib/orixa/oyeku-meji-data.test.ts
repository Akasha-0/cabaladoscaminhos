import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oyeku-meji-data';

describe('orixa/oyeku-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

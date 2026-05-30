import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ogbe-meji-data';

describe('orixa/ogbe-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

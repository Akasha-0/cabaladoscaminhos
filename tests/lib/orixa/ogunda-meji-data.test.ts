import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ogunda-meji-data';

describe('orixa/ogunda-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

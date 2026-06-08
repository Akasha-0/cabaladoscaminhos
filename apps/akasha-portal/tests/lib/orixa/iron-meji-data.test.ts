import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/iron-meji-data';

describe('orixa/iron-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

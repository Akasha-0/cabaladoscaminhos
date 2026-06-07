import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/alumia-data';

describe('orixa/alumia-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

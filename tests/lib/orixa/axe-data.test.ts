import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/axe-data';

describe('orixa/axe-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

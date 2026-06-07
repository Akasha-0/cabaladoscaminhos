import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/eru-data';

describe('orixa/eru-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

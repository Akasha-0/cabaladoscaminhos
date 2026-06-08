import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/aguas-data';

describe('orixa/aguas-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

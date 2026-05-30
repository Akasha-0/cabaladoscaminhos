import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/abita-data';

describe('orixa/abita-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

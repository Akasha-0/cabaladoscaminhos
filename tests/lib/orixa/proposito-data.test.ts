import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/proposito-data';

describe('orixa/proposito-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

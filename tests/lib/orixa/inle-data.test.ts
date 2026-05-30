import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/inle-data';

describe('orixa/inle-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

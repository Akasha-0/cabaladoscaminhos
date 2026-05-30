import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxosse-data';

describe('orixa/oxosse-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

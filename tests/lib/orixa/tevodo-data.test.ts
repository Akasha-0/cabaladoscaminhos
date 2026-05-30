import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/tevodo-data';

describe('orixa/tevodo-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

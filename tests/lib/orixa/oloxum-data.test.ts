import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oloxum-data';

describe('orixa/oloxum-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

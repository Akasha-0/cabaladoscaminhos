import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oya-data';

describe('orixa/oya-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

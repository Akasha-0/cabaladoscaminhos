import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/missao-data';

describe('orixa/missao-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

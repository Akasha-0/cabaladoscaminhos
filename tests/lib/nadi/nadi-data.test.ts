import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/nadi/nadi-data';

describe('nadi/nadi-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

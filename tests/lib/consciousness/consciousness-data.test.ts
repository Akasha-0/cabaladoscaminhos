import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/consciousness/consciousness-data';

describe('consciousness/consciousness-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

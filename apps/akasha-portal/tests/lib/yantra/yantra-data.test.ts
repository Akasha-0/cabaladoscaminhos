import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/yantra/yantra-data';

describe('yantra/yantra-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

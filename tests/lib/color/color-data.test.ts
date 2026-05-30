import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/color/color-data';

describe('color/color-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

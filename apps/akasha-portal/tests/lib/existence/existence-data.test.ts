import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/existence/existence-data';

describe('existence/existence-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

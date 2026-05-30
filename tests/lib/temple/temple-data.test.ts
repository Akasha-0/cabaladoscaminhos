import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/temple/temple-data';

describe('temple/temple-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

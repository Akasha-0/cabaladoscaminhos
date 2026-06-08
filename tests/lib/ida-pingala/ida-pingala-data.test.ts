import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/ida-pingala/ida-pingala-data';

describe('ida-pingala/ida-pingala-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

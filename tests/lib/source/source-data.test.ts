import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/source/source-data';

describe('source/source-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

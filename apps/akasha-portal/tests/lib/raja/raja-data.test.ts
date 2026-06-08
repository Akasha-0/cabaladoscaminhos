import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/raja/raja-data';

describe('raja/raja-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

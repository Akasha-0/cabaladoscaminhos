import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/truth/truth-data';

describe('truth/truth-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

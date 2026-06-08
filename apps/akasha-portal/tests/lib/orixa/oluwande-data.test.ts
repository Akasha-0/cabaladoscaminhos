import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oluwande-data';

describe('orixa/oluwande-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

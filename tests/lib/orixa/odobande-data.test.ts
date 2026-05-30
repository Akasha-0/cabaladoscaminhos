import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/odobande-data';

describe('orixa/odobande-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/logun-data';

describe('orixa/logun-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

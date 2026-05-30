import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/awakening/awakening-tracking';

describe('awakening/awakening-tracking', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/kriya/kriya-data';

describe('kriya/kriya-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

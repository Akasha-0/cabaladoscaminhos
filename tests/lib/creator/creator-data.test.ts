import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/creator/creator-data';

describe('creator/creator-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

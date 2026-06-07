import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/free-will/free-will-data';

describe('free-will/free-will-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

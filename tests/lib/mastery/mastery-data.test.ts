import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/mastery/mastery-data';

describe('mastery/mastery-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

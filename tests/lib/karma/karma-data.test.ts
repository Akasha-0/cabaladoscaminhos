import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/karma/karma-data';

describe('karma/karma-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/dosha/dosha-data';

describe('dosha/dosha-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

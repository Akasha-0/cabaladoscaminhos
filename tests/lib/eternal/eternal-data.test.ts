import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/eternal/eternal-data';

describe('eternal/eternal-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

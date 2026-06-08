import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/logbara-meji-data';

describe('orixa/logbara-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

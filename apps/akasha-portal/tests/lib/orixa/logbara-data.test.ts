import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/logbara-data';

describe('orixa/logbara-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

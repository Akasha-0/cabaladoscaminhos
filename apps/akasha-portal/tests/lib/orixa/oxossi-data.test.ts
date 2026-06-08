import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxossi-data';

describe('orixa/oxossi-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

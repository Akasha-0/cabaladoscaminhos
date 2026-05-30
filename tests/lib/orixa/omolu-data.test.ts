import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/omolu-data';

describe('orixa/omolu-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

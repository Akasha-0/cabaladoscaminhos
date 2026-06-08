import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/audio-data';

describe('orixa/audio-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

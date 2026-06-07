import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/obaluaye-data';

describe('orixa/obaluaye-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

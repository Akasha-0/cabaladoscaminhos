import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/email-data';

describe('orixa/email-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

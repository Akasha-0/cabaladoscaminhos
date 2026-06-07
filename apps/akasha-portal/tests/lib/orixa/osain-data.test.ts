import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/osain-data';

describe('orixa/osain-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

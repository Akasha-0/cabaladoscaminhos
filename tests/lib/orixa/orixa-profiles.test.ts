import { describe, it, expect } from 'vitest';
import { getProfiles } from '@/lib/orixa/orixa-profiles';

describe('orixa/orixa-profiles', () => {
  it('has profiles', () => {
    expect(getProfiles()).toBeDefined();
  });
});

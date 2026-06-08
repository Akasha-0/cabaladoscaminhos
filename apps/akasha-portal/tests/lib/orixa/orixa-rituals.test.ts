import { describe, it, expect } from 'vitest';
import { getRituals } from '@/lib/orixa/orixa-rituals';

describe('orixa/orixa-rituals', () => {
  it('has rituals', () => {
    expect(getRituals()).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/assinatura-data';

describe('orixa/assinatura-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

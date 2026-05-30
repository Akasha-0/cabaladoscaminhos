import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/pagamento-data';

describe('orixa/pagamento-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

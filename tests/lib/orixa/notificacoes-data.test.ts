import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/notificacoes-data';

describe('orixa/notificacoes-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});

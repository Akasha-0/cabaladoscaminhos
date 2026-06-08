import { describe, it, expect } from 'vitest';
import { getAspectMeaning } from '@/lib/astrologia/aspect-meanings';
import type { AspectoTipo } from '@/lib/astrologia/tipos';

describe('astrologia/aspect-meanings', () => {
  const tipos: AspectoTipo[] = ['conjunção', 'sextil', 'quadratura', 'trino', 'oposição'];

  it('getAspectMeaning returns conjunção', () => {
    const a = getAspectMeaning('conjunção');
    expect(a.nome).toBe('Conjunção');
    expect(a.simbolo).toBe('☌');
  });

  it('getAspectMeaning returns sextil', () => {
    const a = getAspectMeaning('sextil');
    expect(a.nome).toBe('Sextil');
    expect(a.simbolo).toBe('⚹');
  });

  it('getAspectMeaning returns quadratura', () => {
    const a = getAspectMeaning('quadratura');
    expect(a.nome).toBe('Quadratura');
    expect(a.simbolo).toBe('□');
  });

  it('getAspectMeaning returns trino', () => {
    const a = getAspectMeaning('trino');
    expect(a.nome).toBe('Trino');
    expect(a.simbolo).toBe('△');
  });

  it('getAspectMeaning returns oposição', () => {
    const a = getAspectMeaning('oposição');
    expect(a.nome).toBe('Oposição');
    expect(a.simbolo).toBe('☍');
  });

  it('each aspect has natureza and descricao', () => {
    for (const t of tipos) {
      const a = getAspectMeaning(t);
      expect(a.natureza).toBeTruthy();
      expect(a.descricao.length).toBeGreaterThan(10);
    }
  });

  it('each aspect has symbol', () => {
    for (const t of tipos) {
      const a = getAspectMeaning(t);
      expect(a.simbolo.length).toBeGreaterThan(0);
    }
  });
});

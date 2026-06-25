import { describe, it, expect } from 'vitest';
import { compileIChingPrimitives } from './iching-primitives';

describe('compileIChingPrimitives', () => {
  it('returns an empty object when passed an empty base', () => {
    const result = compileIChingPrimitives({});
    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('maps a single hexagrama entry to its primitive contributions', () => {
    const base = {
      1: {
        primitivos: [
          {
            primitivo: 'Integracao' as const,
            intensidade: 8,
            polaridade: 'luz' as const,
            fonte: 'I Ching — Hexagrama 1',
          },
          {
            primitivo: 'Movimento' as const,
            intensidade: 9,
            polaridade: 'luz' as const,
            fonte: 'I Ching — Hexagrama 1',
          },
        ],
      },
    };

    const result = compileIChingPrimitives(base);

    expect(result).toHaveProperty('1');
    expect(result[1]).toHaveLength(2);
    expect(result[1][0]).toMatchObject({
      primitivo: 'Integracao',
      intensidade: 8,
      polaridade: 'luz',
      fonte: 'I Ching — Hexagrama 1',
    });
    expect(result[1][1]).toMatchObject({
      primitivo: 'Movimento',
      intensidade: 9,
      polaridade: 'luz',
    });
  });

  it('maps numeric keys from Object.entries correctly', () => {
    const base = {
      42: {
        primitivos: [
          {
            primitivo: 'Expressao' as const,
            intensidade: 7,
            polaridade: 'ambas' as const,
            fonte: 'I Ching — Hexagrama 42',
          },
        ],
      },
    };

    const result = compileIChingPrimitives(base);

    // Number(num) conversion inside compileIChingPrimitives ensures numeric key
    expect(Object.keys(result)).toContain('42');
    expect(result).toHaveProperty('42');
    expect(result[42][0].intensidade).toBe(7);
    expect(result[42][0].polaridade).toBe('ambas');
  });

  it('handles a hexagrama with zero primitivos (empty array)', () => {
    const base = {
      99: {
        primitivos: [],
      },
    };

    const result = compileIChingPrimitives(base);

    expect(result).toHaveProperty('99');
    expect(result[99]).toEqual([]);
  });
});

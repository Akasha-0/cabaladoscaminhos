import { describe, it, expect } from 'vitest';
import { compileIChingPrimitives } from './iching-primitives';
import type { HexagramaBase } from './iching-base-data';

type HexagramaBaseMap = Record<number, HexagramaBase>;

describe('compileIChingPrimitives', () => {
  it('compiles a single hexagrama with one primitivo', () => {
    const base: HexagramaBaseMap = {
      1: {
        primitivos: [
          {
            primitivo: 'Transformacao',
            intensidade: 10,
            polaridade: 'luz',
            fonte: 'Wilhelm/Baynes 1976, hexagrama 1',
          },
        ],
      },
    };

    const result = compileIChingPrimitives(base);

    expect(result).toHaveProperty('1');
    expect(result[1]).toHaveLength(1);
    expect(result[1][0]).toEqual({
      primitivo: 'Transformacao',
      intensidade: 10,
      polaridade: 'luz',
      fonte: 'Wilhelm/Baynes 1976, hexagrama 1',
    });
  });

  it('compiles a hexagrama with multiple primitivos', () => {
    const base: HexagramaBaseMap = {
      26: {
        primitivos: [
          { primitivo: 'Expansao', intensidade: 9, polaridade: 'luz', fonte: 'hex 26' },
          { primitivo: 'Ordem', intensidade: 8, polaridade: 'ambas', fonte: 'hex 26' },
        ],
      },
    };

    const result = compileIChingPrimitives(base);

    expect(result[26]).toHaveLength(2);
    expect(result[26][0].primitivo).toBe('Expansao');
    expect(result[26][1].primitivo).toBe('Ordem');
    expect(result[26][1].polaridade).toBe('ambas');
  });

  it('returns empty record for empty input', () => {
    const result = compileIChingPrimitives({});
    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles hexagrama with no primitivos (empty array)', () => {
    const base: HexagramaBaseMap = {
      99: { primitivos: [] },
    };

    const result = compileIChingPrimitives(base);

    expect(result).toHaveProperty('99');
    expect(result[99]).toEqual([]);
  });

  it('coerces numeric key to string index (JS Object semantics)', () => {
    const base: HexagramaBaseMap = {
      42: {
        primitivos: [
          { primitivo: 'Integracao', intensidade: 7, polaridade: 'sombra', fonte: 'test' },
        ],
      },
    };

    const result = compileIChingPrimitives(base);

    // Object.fromEntries always creates string keys; numeric 42 becomes "42"
    expect(result).toHaveProperty('42');
    expect(result[42]).toHaveLength(1);
    expect(result['42']).toHaveLength(1);
  });
});

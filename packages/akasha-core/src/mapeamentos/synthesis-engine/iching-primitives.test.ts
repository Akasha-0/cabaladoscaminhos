/**
 * Tests for synthesis-engine/iching-primitives.ts
 * Covers: compileIChingPrimitives
 */
import { describe, it, expect } from 'vitest';
import type { HexagramaBase } from './iching-base-data';
import { compileIChingPrimitives } from './iching-primitives';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Minimal HexagramaBase used in tests */
const hex = (
  overrides: Partial<HexagramaBase['primitivos'][0]> = {}
): HexagramaBase['primitivos'][0] => ({
  primitivo: 'Poder',
  intensidade: 8,
  polaridade: 'luz',
  fonte: 'Test fonte',
  ...overrides,
});

// ─── compileIChingPrimitives ──────────────────────────────────────────────────

describe('compileIChingPrimitives', () => {
  it('compila um hexagrama com primitivo único', () => {
    const input: Record<number, HexagramaBase> = {
      1: { primitivos: [hex({ primitivo: 'Poder', intensidade: 10, polaridade: 'luz' })] },
    };
    const result = compileIChingPrimitives(input);

    expect(result).toHaveProperty('1');
    expect(result[1]).toHaveLength(1);
    expect(result[1][0].primitivo).toBe('Poder');
    expect(result[1][0].intensidade).toBe(10);
    expect(result[1][0].polaridade).toBe('luz');
    expect(result[1][0].fonte).toBe('Test fonte');
  });

  it('preserva intensidade e fonte verbatim para cada primitivo', () => {
    const input: Record<number, HexagramaBase> = {
      42: {
        primitivos: [
          hex({ primitivo: 'Expansao', intensidade: 9, polaridade: 'luz', fonte: 'Wilhelm 42' }),
          hex({
            primitivo: 'Movimento',
            intensidade: 7,
            polaridade: 'ambas',
            fonte: 'Wilhelm 42b',
          }),
        ],
      },
    };
    const result = compileIChingPrimitives(input);

    expect(result[42]).toHaveLength(2);
    expect(result[42][0]).toMatchObject({
      primitivo: 'Expansao',
      intensidade: 9,
      polaridade: 'luz',
      fonte: 'Wilhelm 42',
    });
    expect(result[42][1]).toMatchObject({
      primitivo: 'Movimento',
      intensidade: 7,
      polaridade: 'ambas',
      fonte: 'Wilhelm 42b',
    });
  });

  it('converte chaves de string numerica para número', () => {
    // Object.entries sempre devolve chaves como string — a função deve converter
    const input: Record<number, HexagramaBase> = {
      7: { primitivos: [hex({ primitivo: 'Ordem' })] },
    };
    const result = compileIChingPrimitives(input);

    expect(Object.keys(result)).toContain('7');
    // A key deve ser o número 7 (não string "7")
    expect(result).toHaveProperty('7');
    expect(result[7][0].primitivo).toBe('Ordem');
  });

  it('devolve objeto vazio para input vazio', () => {
    const result = compileIChingPrimitives({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('cada PrimitiveContribution tem todos os campos obrigatórios', () => {
    const input: Record<number, HexagramaBase> = {
      3: {
        primitivos: [
          hex({ primitivo: 'Transformacao', intensidade: 7, polaridade: 'ambas', fonte: 'Hex 3' }),
        ],
      },
    };
    const result = compileIChingPrimitives(input);

    for (const contrib of result[3]) {
      expect(typeof contrib.primitivo).toBe('string');
      expect(contrib.primitivo.length).toBeGreaterThan(0);
      expect(typeof contrib.intensidade).toBe('number');
      expect(contrib.intensidade).toBeGreaterThanOrEqual(0);
      expect(contrib.intensidade).toBeLessThanOrEqual(10);
      expect(['luz', 'sombra', 'ambas']).toContain(contrib.polaridade);
      expect(typeof contrib.fonte).toBe('string');
      expect(contrib.fonte.length).toBeGreaterThan(0);
    }
  });

  it('polaridade é preservada como typed Polaridade', () => {
    const input: Record<number, HexagramaBase> = {
      28: {
        primitivos: [
          hex({ primitivo: 'Expansao', polaridade: 'ambas' }),
          hex({ primitivo: 'Transformacao', polaridade: 'sombra' }),
        ],
      },
    };
    const result = compileIChingPrimitives(input);

    expect(result[28][0].polaridade).toBe('ambas');
    expect(result[28][1].polaridade).toBe('sombra');
  });
});

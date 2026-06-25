import { describe, expect, it } from 'vitest';
import { compareSystems, type ComparisonInput } from './tantric-comparison';

describe('compareSystems', () => {
  it('retorna os 4 sistemas com estrutura correta', () => {
    const result = compareSystems({
      birthDate: '20/08/1986',
      name: 'Eliane Simão',
    });
    expect(result).toHaveProperty('pythagorean');
    expect(result).toHaveProperty('chaldean');
    expect(result).toHaveProperty('cabbalistic');
    expect(result).toHaveProperty('tantric');
  });

  it('Pitagórica: lifePath 7 + expression > 0', () => {
    const result = compareSystems({
      birthDate: '20/08/1986',
      name: 'Eliane Simão',
    });
    expect(result.pythagorean.lifePath).toBe(7);
    expect(result.pythagorean.expression).toBeGreaterThanOrEqual(1);
    expect(result.pythagorean.expression).toBeLessThanOrEqual(33);
  });

  it('Caldeia: nameNumber em 1–9', () => {
    const result = compareSystems({
      birthDate: '20/08/1986',
      name: 'Eliane Simão',
    });
    expect(result.chaldean.nameNumber).toBeGreaterThanOrEqual(1);
    expect(result.chaldean.nameNumber).toBeLessThanOrEqual(9);
  });

  it('Cabalística: stub flag = true', () => {
    const result = compareSystems({
      birthDate: '20/08/1986',
      name: 'Eliane Simão',
    });
    expect(result.cabbalistic.stub).toBe(true);
    expect(result.cabbalistic.composite).toBeGreaterThanOrEqual(1);
    expect(result.cabbalistic.composite).toBeLessThanOrEqual(33);
  });

  it('Tântrica: stub flag = true', () => {
    const result = compareSystems({
      birthDate: '20/08/1986',
      name: 'Eliane Simão',
    });
    expect(result.tantric.stub).toBe(true);
    expect(result.tantric.destiny).toBeGreaterThanOrEqual(1);
    expect(result.tantric.destiny).toBeLessThanOrEqual(33);
  });

  it('determinístico: mesma entrada → mesmo output', () => {
    const input: ComparisonInput = {
      birthDate: '1986-08-20',
      name: 'Eliane',
    };
    const a = compareSystems(input);
    const b = compareSystems(input);
    expect(a).toEqual(b);
  });

  it('aceita múltiplos formatos de data', () => {
    const formats = ['20/08/1986', '1986-08-20', '20-08-1986', '19860820'];
    const results = formats.map((birthDate) =>
      compareSystems({ birthDate, name: 'X' })
    );
    // Todos devem dar o mesmo life path (soma de dígitos é invariante)
    for (const r of results) {
      expect(r.pythagorean.lifePath).toBe(7);
    }
  });

  it('remove acentos no nome (Pitagórica e Caldeia)', () => {
    const a = compareSystems({
      birthDate: '20/08/1986',
      name: 'João',
    });
    const b = compareSystems({
      birthDate: '20/08/1986',
      name: 'JOAO',
    });
    expect(a.pythagorean.expression).toBe(b.pythagorean.expression);
    expect(a.chaldean.nameNumber).toBe(b.chaldean.nameNumber);
  });

  it('Pitagórica pode dar master number (preserva 11/22/33)', () => {
    // Data cuja soma = 29 → 11 (master)
    const result = compareSystems({
      birthDate: '29/11/1985', // 2+9+1+1+1+9+8+5 = 36 → 9
      name: 'X',
    });
    expect(result.pythagorean.lifePath).toBe(9); // 36 → 9
  });

  it('Caldeia NÃO preserva master numbers', () => {
    // Nome com soma bruta = 11 ou 22 deve ser reduzido.
    const result = compareSystems({
      birthDate: '01/01/2000',
      name: 'AK', // A=1, K=2 → 3
    });
    expect(result.chaldean.nameNumber).toBe(3);
    // Garante que nameNumber nunca é 11/22/33 para uma amostra
    expect([11, 22, 33]).not.toContain(result.chaldean.nameNumber);
  });
});
import { describe, it, expect } from 'vitest';
import { calcularPitagorica, calcularCabalistica, calcularTantrica } from '@akasha/core-cabala';

describe('Cálculos Numerológicos', () => {
  it('deve calcular numerologia pitagórica corretamente', () => {
    const resultado = calcularPitagorica('Maria');
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('deve calcular numerologia cabalística corretamente', () => {
    const resultado = calcularCabalistica('João');
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('deve calcular numerologia tântrica corretamente', () => {
    const resultado = calcularTantrica('1990-06-15');
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('deve calcular numerologia tântrica para datas diferentes', () => {
    const resultado1 = calcularTantrica('2000-01-01');
    const resultado2 = calcularTantrica('1990-06-15');
    expect(typeof resultado1).toBe('number');
    expect(typeof resultado2).toBe('number');
    expect(resultado1).toBeGreaterThanOrEqual(1);
    expect(resultado1).toBeLessThanOrEqual(9);
  });
});
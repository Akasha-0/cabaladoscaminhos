import { describe, it, expect } from 'vitest';
import { calcularPosicao, calcularCasas } from '@/lib/astrologia/swiss-ephemeris';

describe('Swiss Ephemeris', () => {
  it('deve calcular posição do Sol', () => {
    const data = new Date('2000-01-01T12:00:00Z');
    const posicao = calcularPosicao('sol', data);

    expect(posicao.longitude).toBeGreaterThan(0);
    expect(posicao.longitude).toBeLessThan(360);
  });

  it('deve calcular casas para São Paulo', () => {
    const data = new Date('1990-05-15T10:30:00Z');
    const resultado = calcularCasas(data, -23.55, -46.63);

    expect(resultado.casas).toHaveLength(12);
    expect(resultado.ascendente).toBeGreaterThan(0);
    expect(resultado.mediumCoeli).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';

describe('Posições Planetárias', () => {
  it('deve calcular mapa natal completo', () => {
    const data = new Date('1990-05-15');
    const resultado = calcularMapaNatal(data, '10:30', -23.55, -46.63);

    expect(resultado.planeta.sol).toBeDefined();
    expect(resultado.planeta.lua).toBeDefined();
    expect(resultado.casas).toHaveLength(12);
    expect(resultado.ascendente).toBeGreaterThan(0);
  });

  it('deve calcular aspectos', () => {
    const data = new Date('1990-05-15');
    const mapa = calcularMapaNatal(data, '10:30', -23.55, -46.63);

    const posicoes = Object.values(mapa.planeta);
    const aspectos = calcularAspectos(posicoes);

    expect(Array.isArray(aspectos)).toBe(true);
  });
});
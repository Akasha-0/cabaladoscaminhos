import { describe, it, expect } from 'vitest';
import { detectarCanais } from '../canais';
import type { CentroEnergetico, Canal } from '../types';

describe('core-pilar6/canais — detectarCanais', () => {
  it('retorna array vazio se menos de 2 centros', () => {
    expect(detectarCanais([])).toEqual([]);
    expect(detectarCanais(['inspiracao'])).toEqual([]);
  });

  it('retorna até 36 canais para 9 centros', () => {
    const todos9: CentroEnergetico[] = [
      'inspiracao', 'mental', 'manifestacao', 'identidade', 'vontade',
      'emocoes', 'vitalidade', 'sobrevivencia', 'fundamentacao',
    ];
    const canais: Canal[] = detectarCanais(todos9);
    expect(canais.length).toBeLessThanOrEqual(36);
  });

  it('cada canal tem 2 portas entre 1-64', () => {
    const canais = detectarCanais(['inspiracao', 'mental']);
    canais.forEach((c) => {
      expect(c.portaA).toBeGreaterThanOrEqual(1);
      expect(c.portaA).toBeLessThanOrEqual(64);
      expect(c.portaB).toBeGreaterThanOrEqual(1);
      expect(c.portaB).toBeLessThanOrEqual(64);
    });
  });
});

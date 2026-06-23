import { describe, it, expect } from 'vitest';
import { detectarCentros, CENTROS_ENERGETICOS } from '../centros';
import type { CentroEnergetico, PilaresDados } from '../types';

function pilares(): PilaresDados {
  return {
    cabala: {} as any,
    astrologia: { sol_signo: 'aries', asc_signo: 'aries', lua_signo: 'aries' } as any,
    tantrica: {} as any,
    odu: { odu_principal: '1', odu_secundario: null, fonte: 'Ifá' } as any,
    iching: {} as any,
  };
}

describe('core-pilar6/centros — detectarCentros', () => {
  it('expõe 9 centros universalistas (não hindu chakras)', () => {
    expect(CENTROS_ENERGETICOS).toHaveLength(9);
    const tipos = CENTROS_ENERGETICOS.map((c) => c.centro);
    expect(tipos).toEqual([
      'inspiracao',
      'mental',
      'manifestacao',
      'identidade',
      'vontade',
      'emocoes',
      'vitalidade',
      'sobrevivencia',
      'fundamentacao',
    ]);
  });

  it('detectarCentros retorna array (Wave 4 stub)', () => {
    const centros: CentroEnergetico[] = detectarCentros(pilares());
    expect(Array.isArray(centros)).toBe(true);
    const tipos = CENTROS_ENERGETICOS.map((c) => c.centro);
    centros.forEach((c) => {
      expect(tipos).toContain(c);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { calcular } from '../calcular';
import type { PilaresDados, MandalaCaminho } from '../types';

const mcBase: MandalaCaminho = {
  zeladorId: 'z1',
  caminhanteId: 'c1',
  caminhadaId: 'cam1',
  centroVitalidadeAtivo: true,
  nascimentoIso: '1990-01-01',
};

function pilares(odu_principal: string, asc_signo: string | null): PilaresDados {
  return {
    cabala: {} as any,
    astrologia: { sol_signo: 'aries', asc_signo, lua_signo: 'aries' } as any,
    tantrica: {} as any,
    odu: { odu_principal, odu_secundario: null, fonte: 'Ifá' } as any,
    iching: {} as any,
  };
}

describe('core-pilar6/calcular — integration', () => {
  it('retorna Pilar6Resultado completo', () => {
    const mc = { ...mcBase, autoridadeMC: 'emocional' } as any;
    const r = calcular(pilares('1', 'aries'), mc);
    expect(r.tipo).toBeDefined();
    expect(r.estrategia).toBeDefined();
    expect(r.centrosDefinidos).toBeInstanceOf(Array);
    expect(r.canais).toBeInstanceOf(Array);
    expect(r.versaoCalculo).toBe('v1');
    expect(r.calculadoEm).toBeInstanceOf(Date);
  });

  it('graceful degradation sem autoridadeMC (autoridade null)', () => {
    const r = calcular(pilares('1', 'taurus'), mcBase);
    expect(r.autoridade).toBeNull();
  });
});

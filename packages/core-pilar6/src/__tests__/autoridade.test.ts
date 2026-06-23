import { describe, it, expect } from 'vitest';
import { detectarAutoridade } from '../autoridade';
import type { MandalaCaminho, AutoridadeEnergetica } from '../types';

const mcBase: MandalaCaminho = {
  zeladorId: 'z1',
  caminhanteId: 'c1',
  caminhadaId: 'cam1',
  centroVitalidadeAtivo: true,
  nascimentoIso: '1990-01-01',
};

describe('core-pilar6/autoridade — detectarAutoridade', () => {
  it('retorna null se autoridadeMC não fornecida (delegação Wave 3 boundary)', () => {
    expect(detectarAutoridade(mcBase)).toBeNull();
  });

  it('retorna autoridadeMC quando fornecida', () => {
    const mc = { ...mcBase, autoridadeMC: 'emocional' } as any;
    expect(detectarAutoridade(mc)).toBe('emocional');
  });

  it('aceita todas as 6 autoridades do D-041', () => {
    const valid: AutoridadeEnergetica[] = [
      'emocional', 'sacral', 'esplenica', 'cardiaca', 'identidade', 'lunar',
    ];
    for (const a of valid) {
      const mc = { ...mcBase, autoridadeMC: a } as any;
      expect(detectarAutoridade(mc)).toBe(a);
    }
  });
});

/**
 * F-220: 4 Temperamentos — tests
 */

import { describe, it, expect } from 'vitest';
import {
  TEMPERAMENTOS,
  TEMPERAMENTO_PILAR_MAP,
  TEMPERAMENTO_CARACTERISTICAS,
  isTemperamento,
  inferirTemperamentoAtual,
  type Temperamento,
} from './temperaments';

describe('F-220: 4 Temperamentos Gregos', () => {
  it('TEMPERAMENTOS tem exatamente 4 entradas', () => {
    expect(TEMPERAMENTOS.length).toBe(4);
    expect(TEMPERAMENTOS).toEqual(
      expect.arrayContaining(['sanguineo', 'colerico', 'melancolico', 'fleumatico']),
    );
  });

  it('cada temperamento tem mapping Pilar+Camada+Elemento', () => {
    for (const t of TEMPERAMENTOS) {
      const m = TEMPERAMENTO_PILAR_MAP[t];
      expect(m.pilar).toBeTruthy();
      expect(['D', 'S', 'Z', 'V']).toContain(m.camada);
      expect(m.elemento).toBeTruthy();
    }
  });

  it('cada temperamento tem características gregas', () => {
    for (const t of TEMPERAMENTOS) {
      const c = TEMPERAMENTO_CARACTERISTICAS[t];
      expect(c.humor).toBeTruthy();
      expect(c.qualidade).toMatch(/quente|frio/);
      expect(c.orgao).toBeTruthy();
      expect(c.estacao).toBeTruthy();
      expect(c.tracos.length).toBeGreaterThan(2);
    }
  });

  it('isTemperamento valida corretamente', () => {
    expect(isTemperamento('sanguineo')).toBe(true);
    expect(isTemperamento('foo')).toBe(false);
    expect(isTemperamento(null)).toBe(false);
    expect(isTemperamento(undefined)).toBe(false);
    expect(isTemperamento(42)).toBe(false);
  });

  it('inferirTemperamentoAtual: primavera = sanguíneo', () => {
    expect(inferirTemperamentoAtual(new Date('2026-04-15'))).toBe('sanguineo');
  });

  it('inferirTemperamentoAtual: verão = colérico', () => {
    expect(inferirTemperamentoAtual(new Date('2026-07-15'))).toBe('colerico');
  });

  it('inferirTemperamentoAtual: outono = melancólico', () => {
    expect(inferirTemperamentoAtual(new Date('2026-10-15'))).toBe('melancolico');
  });

  it('inferirTemperamentoAtual: inverno = fleumático', () => {
    expect(inferirTemperamentoAtual(new Date('2026-01-15'))).toBe('fleumatico');
  });

  it('nomenclatura PT-BR (R-019 D2): sanguineo/colerico/melancolico/fleumatico', () => {
    const names: Temperamento[] = ['sanguineo', 'colerico', 'melancolico', 'fleumatico'];
    expect(TEMPERAMENTOS).toEqual(names);
  });
});

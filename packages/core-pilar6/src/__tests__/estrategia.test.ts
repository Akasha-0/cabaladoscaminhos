import { describe, it, expect } from 'vitest';
import { detectarEstrategia } from '../estrategia';

describe('core-pilar6/estrategia — detectarEstrategia', () => {
  it('mapeia iniciador → esperar_convite', () => {
    expect(detectarEstrategia('iniciador')).toBe('esperar_convite');
  });
  it('mapeia guia → informar', () => {
    expect(detectarEstrategia('guia')).toBe('informar');
  });
  it('mapeia iniciador_aberto → iniciar', () => {
    expect(detectarEstrategia('iniciador_aberto')).toBe('iniciar');
  });
  it('mapeia refletor → esperar_ciclo_lunar', () => {
    expect(detectarEstrategia('refletor')).toBe('esperar_ciclo_lunar');
  });
});

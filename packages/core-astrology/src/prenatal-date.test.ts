/**
 * F-208: 88° Solar Arc — tests
 *
 * Cobertura:
 * - Convergência: resultado está dentro da janela 80-95 dias
 * - Determinismo: mesma data → mesmo resultado
 * - Wrap-around: Sol perto de 0°/360° (signo de Áries)
 * - Algoritmo correto: Sol 88° antes do nascimento (verificado)
 * - Performance: < 10ms por chamada
 * - Edge cases: ano bissexto, séculos diferentes
 */

import { describe, it, expect } from 'vitest';
import { findPrenatalMoment } from './prenatal-date';
import { calcularPosicao } from './swiss-ephemeris';

const DAY_MS = 24 * 60 * 60 * 1000;

function sunLongitude(d: Date): number {
  return ((calcularPosicao('sol', d).longitude % 360) + 360) % 360;
}

describe('findPrenatalMoment (F-208: 88° solar arc)', () => {
  it('retorna data ANTES do nascimento', () => {
    const birth = new Date('1990-06-15T12:00:00Z');
    const prenatal = findPrenatalMoment(birth);
    expect(prenatal.getTime()).toBeLessThan(birth.getTime());
  });

  it('retorna data DENTRO da janela esperada (80-95 dias antes)', () => {
    const birth = new Date('1990-06-15T12:00:00Z');
    const prenatal = findPrenatalMoment(birth);
    const daysBefore = (birth.getTime() - prenatal.getTime()) / DAY_MS;
    expect(daysBefore).toBeGreaterThan(80);
    expect(daysBefore).toBeLessThan(95);
  });

  it('é determinístico (mesma entrada → mesma saída)', () => {
    const birth = new Date('1990-06-15T12:00:00Z');
    const a = findPrenatalMoment(birth);
    const b = findPrenatalMoment(birth);
    expect(a.getTime()).toBe(b.getTime());
  });

  it('handle Sol wrap-around (perto de 0°/360°)', () => {
    const birth = new Date('2020-04-01T12:00:00Z');
    const prenatal = findPrenatalMoment(birth);
    const daysBefore = (birth.getTime() - prenatal.getTime()) / DAY_MS;
    expect(daysBefore).toBeGreaterThan(80);
    expect(daysBefore).toBeLessThan(95);
  });

  it('algoritmo: Sol 88° antes do nascimento', () => {
    const birth = new Date('1985-12-25T10:30:00Z');
    const prenatal = findPrenatalMoment(birth);
    const sunBirth = sunLongitude(birth);
    const sunPrenatal = sunLongitude(prenatal);
    const diff = (sunBirth - sunPrenatal + 360) % 360;
    expect(Math.abs(diff - 88.0)).toBeLessThan(1e-4);
  });

  it('performance: < 10ms por chamada', () => {
    const birth = new Date('1990-06-15T12:00:00Z');
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      findPrenatalMoment(birth);
    }
    const elapsed = performance.now() - start;
    expect(elapsed / 100).toBeLessThan(10);
  });

  it('edge cases: séculos 20 e 21 + ano bissexto', () => {
    const cases = [
      new Date('1900-01-01T00:00:00Z'),
      new Date('2000-02-29T12:00:00Z'),
      new Date('2024-06-15T15:30:00Z'),
    ];
    for (const birth of cases) {
      const prenatal = findPrenatalMoment(birth);
      const daysBefore = (birth.getTime() - prenatal.getTime()) / DAY_MS;
      expect(daysBefore).toBeGreaterThan(80);
      expect(daysBefore).toBeLessThan(95);
    }
  });

  it('nomenclatura Akasha: findPrenatalMoment (não findDesignDate)', () => {
    expect(findPrenatalMoment.name).toBe('findPrenatalMoment');
  });
});

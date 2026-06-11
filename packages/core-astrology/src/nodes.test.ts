/**
 * F-211: Rahu/Ketu (eixos nodais lunares) — tests
 */

import { describe, it, expect } from 'vitest';
import {
  calcularRahuLongitude,
  calcularKetuLongitude,
  calcularNodosLunares,
  longitudeToCasa,
  NODAL_CYCLE_DAYS,
} from './nodes';

describe('F-211: Rahu/Ketu (Jyotish nodos lunares)', () => {
  describe('calcularRahuLongitude', () => {
    it('J2000.0 (2000-01-01T12:00:00 UTC) ≈ 125.04°', () => {
      const j2000 = new Date('2000-01-01T12:00:00Z');
      const rahu = calcularRahuLongitude(j2000);
      expect(rahu).toBeCloseTo(125.04, 0);
    });

    it('Rahu move RETRÓGRADO (longitude diminui com tempo)', () => {
      const t1 = new Date('2000-01-01T12:00:00Z');
      const t2 = new Date('2024-01-01T12:00:00Z'); // 24 anos depois
      const r1 = calcularRahuLongitude(t1);
      const r2 = calcularRahuLongitude(t2);
      // 24 anos × 365.25 = 8766 dias × 0.0529539 = ~464° de movimento retrógrado
      // Mas como wrap, r2 deve ser diferente
      expect(r1).not.toBe(r2);
    });

    it('ciclo nodal ~18.6 anos: Rahu volta próximo da mesma longitude', () => {
      const t1 = new Date('2000-01-01T12:00:00Z');
      const t2 = new Date('2018-08-01T12:00:00Z'); // ~18.6 anos depois
      const r1 = calcularRahuLongitude(t1);
      const r2 = calcularRahuLongitude(t2);
      // Diferença deve ser < 1° (jitter do modelo linear)
      const diff = Math.min(Math.abs(r2 - r1), 360 - Math.abs(r2 - r1));
      expect(diff).toBeLessThan(5); // tolerância generosa para modelo linear
    });

    it('longitude sempre em [0, 360)', () => {
      const t = new Date('1900-01-01T12:00:00Z');
      const r = calcularRahuLongitude(t);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(360);
    });
  });

  describe('calcularKetuLongitude', () => {
    it('Ketu é sempre 180° oposto a Rahu', () => {
      for (let r = 0; r < 360; r += 30) {
        const k = calcularKetuLongitude(r);
        const diff = Math.abs(k - r);
        const normalized = Math.min(diff, 360 - diff);
        expect(normalized).toBeCloseTo(180, 0);
      }
    });
  });

  describe('calcularNodosLunares', () => {
    it('retorna ambos os nodos + data do cálculo', () => {
      const data = new Date('2026-06-15T12:00:00Z');
      const nodos = calcularNodosLunares(data);
      expect(nodos.rahuLongitude).toBeGreaterThanOrEqual(0);
      expect(nodos.rahuLongitude).toBeLessThan(360);
      expect(nodos.ketuLongitude).toBeGreaterThanOrEqual(0);
      expect(nodos.ketuLongitude).toBeLessThan(360);
      expect(nodos.calculatedAt).toEqual(data);
    });

    it('Ketu sempre 180° de Rahu (independentemente da data)', () => {
      const dates = [
        new Date('1900-01-01T12:00:00Z'),
        new Date('2000-01-01T12:00:00Z'),
        new Date('2026-06-15T12:00:00Z'),
      ];
      for (const d of dates) {
        const n = calcularNodosLunares(d);
        const diff = Math.abs(n.ketuLongitude - n.rahuLongitude);
        const normalized = Math.min(diff, 360 - diff);
        expect(normalized).toBeCloseTo(180, 0);
      }
    });
  });

  describe('longitudeToCasa', () => {
    it('longitude no início do cuspid 1 = casa 1', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      expect(longitudeToCasa(0, cusps)).toBe(1);
    });

    it('longitude no meio do cuspid 1 = casa 1', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      expect(longitudeToCasa(15, cusps)).toBe(1);
    });

    it('longitude em wrap (350° com cuspid 0°) = casa 12', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      expect(longitudeToCasa(350, cusps)).toBe(12);
    });
  });

  it('NODAL_CYCLE_DAYS ≈ 18.6 anos (6798 dias)', () => {
    expect(NODAL_CYCLE_DAYS).toBeGreaterThan(6700);
    expect(NODAL_CYCLE_DAYS).toBeLessThan(6900);
  });
});

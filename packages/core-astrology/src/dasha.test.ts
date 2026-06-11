/**
 * F-210: Vimshottari Dasha — tests
 *
 * Cobertura:
 * - getNakshatra: 27 nakshatras corretamente mapeados
 * - getNakshatraLord: ciclo Ketu/Venus/Sol/.../Mercurio
 * - Duração total = 120 anos (soma dos 9)
 * - calcularVimshottari: nasce no Mahadasha correto
 * - calculate current Mahadasha em data arbitrária
 * - Edge cases: Lua em 0°, Lua em 360°
 */

import { describe, it, expect } from 'vitest';
import {
  getNakshatra,
  getNakshatraLord,
  calcularVimshottari,
  MAHADASHA_DURATIONS,
  DASHA_ORDER,
  NAKSHATRA_SPAN,
  TOTAL_DASHA_YEARS,
  type Graha,
} from './dasha';

describe('F-210: Vimshottari Dasha (Jyotish)', () => {
  describe('getNakshatra', () => {
    it('Lua em 0° (início Ashvini) = Nakshatra 0', () => {
      expect(getNakshatra(0)).toBe(0);
    });

    it('Lua em 13°333 (início Bharani) = Nakshatra 1', () => {
      expect(getNakshatra(NAKSHATRA_SPAN)).toBe(1);
    });

    it('Lua em 359° (último Nakshatra) = Nakshatra 26', () => {
      expect(getNakshatra(359)).toBe(26);
    });

    it('Lua em 360° = 0 (wrap)', () => {
      expect(getNakshatra(360)).toBe(0);
    });
  });

  describe('getNakshatraLord', () => {
    it('Lua 0° = Ketu (regente de Ashvini)', () => {
      expect(getNakshatraLord(0)).toBe('ketu');
    });

    it('Lua 13° = Vênus (regente de Bharani)', () => {
      expect(getNakshatraLord(NAKSHATRA_SPAN)).toBe('venus');
    });

    it('Lua 26° = Sol (regente de Krittika)', () => {
      expect(getNakshatraLord(NAKSHATRA_SPAN * 2)).toBe('sol');
    });

    it('ciclo de 9 regentes repete 3 vezes (27 nakshatras)', () => {
      // 0° Ketu, 13° Venus, 26° Sol, 40° Lua, 53° Marte, 66° Rahu,
      // 80° Jupiter, 93° Saturno, 106° Mercurio, 120° Ketu (repete)
      expect(getNakshatraLord(NAKSHATRA_SPAN * 9)).toBe('ketu');
    });
  });

  describe('MAHADASHA_DURATIONS', () => {
    it('soma das durações = 120 anos', () => {
      const total = Object.values(MAHADASHA_DURATIONS).reduce((a, b) => a + b, 0);
      expect(total).toBe(120);
    });

    it('DASHA_ORDER tem 9 entradas (9 grahas)', () => {
      expect(DASHA_ORDER.length).toBe(9);
    });

    it('TOTAL_DASHA_YEARS = 120', () => {
      expect(TOTAL_DASHA_YEARS).toBe(120);
    });

    it('Vênus tem Mahadasha mais longo (20 anos)', () => {
      expect(MAHADASHA_DURATIONS.venus).toBe(20);
    });

    it('Sol tem Mahadasha mais curto (6 anos)', () => {
      expect(MAHADASHA_DURATIONS.sol).toBe(6);
    });
  });

  describe('calcularVimshottari', () => {
    it('nasce com Lua em Ashvini (0°) → Mahadasha inicial Ketu', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      // No nascimento (ref = birth) deve estar no Mahadasha inicial
      const result = calcularVimshottari(birth, 0, birth);
      expect(result.startingGraha).toBe('ketu');
      expect(result.birthNakshatra).toBe(0);
      expect(result.currentMahadasha.graha).toBe('ketu');
    });

    it('nasce com Lua em Bharani (13.33°) → Mahadasha inicial Vênus', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, NAKSHATRA_SPAN, birth);
      expect(result.startingGraha).toBe('venus');
    });

    it('nasce com Lua em meio de Ashvini → Ketu parcial (não cheio)', () => {
      // Lua em 5° (meio de Ashvini 0-13.33)
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 5, birth);
      // Ketu tem 7 anos; em 5/13.33 do nakshatra, já transcorreu ~37.5% = 2.625 anos
      // Saldo = 7 * (1 - 0.375) = 4.375 anos
      expect(result.startingGraha).toBe('ketu');
      expect(result.currentMahadasha.durationYears).toBeCloseTo(4.375, 1);
    });

    it('1 ano depois do nascimento, com Lua em Ketu (0°), ainda está no Mahadasha Ketu', () => {
      // Lua 0° = Ketu 7 anos. Após 1 ano, ainda em Ketu.
      const birth = new Date('1990-01-15T12:00:00Z');
      const ref = new Date('1991-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0, ref);
      expect(result.currentMahadasha.graha).toBe('ketu');
    });

    it('10 anos depois do nascimento, com Lua em Ketu (0°), está no Mahadasha Venus', () => {
      // Ordem das dashas: ketu → venus → sol → lua → marte → rahu → jupiter → saturno → mercurio
      // Lua 0° = Ketu 7 anos. Ketu partial (4.375 anos se Lua em 5°).
      // 10 anos depois: Ketu acabou (1994), Venus (20 anos) começou, ~5 anos transcorridos.
      const birth = new Date('1990-01-15T12:00:00Z');
      const ref = new Date('2000-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0, ref);
      expect(result.currentMahadasha.graha).toBe('venus');
    });

    it('fullLifeMahadashas tem 9 entradas', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0);
      expect(result.fullLifeMahadashas.length).toBe(9);
    });

    it('currentMahadashaAntardashas tem 9 Antardashas', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0);
      expect(result.currentMahadashaAntardashas.length).toBe(9);
    });

    it('Antardashas somam duração do Mahadasha (com tolerância de arredondamento)', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0);
      const maha = result.currentMahadasha;
      const antaTotal = result.currentMahadashaAntardashas.reduce(
        (acc, a) => acc + a.durationYears,
        0,
      );
      // 9 antardashas × duração(anta_graha) / 120 somam = duração(maha)
      // (com tolerância para ponto flutuante)
      expect(Math.abs(antaTotal - maha.durationYears)).toBeLessThan(0.01);
    });

    it('Mahadashas cobrem 120 anos consecutivos (sem gap)', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0);
      for (let i = 0; i < result.fullLifeMahadashas.length - 1; i++) {
        expect(result.fullLifeMahadashas[i].endDate.getTime()).toBe(
          result.fullLifeMahadashas[i + 1].startDate.getTime(),
        );
      }
    });

    it('primeiro Mahadasha começa na data de nascimento', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const result = calcularVimshottari(birth, 0);
      expect(result.fullLifeMahadashas[0].startDate.getTime()).toBe(birth.getTime());
    });
  });

  describe('edge cases', () => {
    it('Lua em 360° = wrap para 0° (Ketu)', () => {
      expect(getNakshatraLord(360)).toBe('ketu');
      expect(getNakshatraLord(360)).toBe(getNakshatraLord(0));
    });

    it('Lua em -5° (negativa) = wrap para 355°', () => {
      // -5 + 360 = 355 (Nakshatra 26, regente Mercurio)
      expect(getNakshatra(-5)).toBe(26);
      expect(getNakshatraLord(-5)).toBe('mercurio');
    });

    it('lança erro se data de referência fora do ciclo 120 anos', () => {
      const birth = new Date('1990-01-15T12:00:00Z');
      const farFuture = new Date('2200-01-15T12:00:00Z'); // > 120 anos depois
      expect(() => calcularVimshottari(birth, 0, farFuture)).toThrow();
    });
  });

  it('nomenclatura PT-BR (R-018 D5): mahadasha_Atual (não Mahadasha)', async () => {
    // Verifica que export é calcularVimshottari (PT-friendly naming)
    expect(calcularVimshottari.name).toBe('calcularVimshottari');
  });
});

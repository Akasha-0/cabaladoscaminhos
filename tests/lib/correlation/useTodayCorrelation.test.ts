/**
 * useTodayCorrelation Tests
 * Verifies the unified spiritual correlation hook and helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  getTodayCorrelation,
  getCorrelationByDayIndex,
  getWeekCorrelations,
  useTodayCorrelation,
  type TodayCorrelation,
} from '@/lib/correlation/useTodayCorrelation';

describe('useTodayCorrelation', () => {
  // ─── getTodayCorrelation: structure ───────────────────────────────────────
  describe('getTodayCorrelation', () => {
    it('returns an object with all required top-level fields', () => {
      const corr = getTodayCorrelation();
      expect(corr).toHaveProperty('dayName');
      expect(corr).toHaveProperty('dayNamePt');
      expect(corr).toHaveProperty('dayIndex');
      expect(corr).toHaveProperty('orixa');
      expect(corr).toHaveProperty('orixas');
      expect(corr).toHaveProperty('chakra');
      expect(corr).toHaveProperty('chakraSanskrit');
      expect(corr).toHaveProperty('chakras');
      expect(corr).toHaveProperty('chakraElement');
      expect(corr).toHaveProperty('planeta');
      expect(corr).toHaveProperty('planetas');
      expect(corr).toHaveProperty('elemento');
      expect(corr).toHaveProperty('elementEmoji');
      expect(corr).toHaveProperty('sefirah');
      expect(corr).toHaveProperty('sephirot');
      expect(corr).toHaveProperty('primaryColor');
      expect(corr).toHaveProperty('secondaryColor');
      expect(corr).toHaveProperty('numerologia');
      expect(corr).toHaveProperty('numeroMisticismo');
      expect(corr).toHaveProperty('frequenciasElemento');
      expect(corr).toHaveProperty('frequenciaPrimaria');
      expect(corr).toHaveProperty('odu');
      expect(corr).toHaveProperty('oduNumero');
      expect(corr).toHaveProperty('oduNome');
      expect(corr).toHaveProperty('lua');
      expect(corr).toHaveProperty('poliedro');
      expect(corr).toHaveProperty('atuacaoRitual');
      expect(corr).toHaveProperty('mystery');
    });

    it('returns arrays with at least one element for multi-value fields', () => {
      const corr = getTodayCorrelation();
      expect(corr.orixas.length).toBeGreaterThan(0);
      expect(corr.chakras.length).toBeGreaterThan(0);
      expect(corr.planetas.length).toBeGreaterThan(0);
      expect(corr.sephirot.length).toBeGreaterThan(0);
      expect(corr.numerologia.cabalistic.length).toBeGreaterThan(0);
      expect(corr.frequenciasElemento.length).toBeGreaterThan(0);
    });

    it('lua has valid phase, name, energy, and ritualType', () => {
      const corr = getTodayCorrelation();
      expect(['new', 'waxing', 'full', 'waning']).toContain(corr.lua.phase);
      expect(typeof corr.lua.name).toBe('string');
      expect(typeof corr.lua.energy).toBe('string');
      expect(typeof corr.lua.ritualType).toBe('string');
    });

    it('numeroMisticismo has expected structure for numbers 1-13', () => {
      const corr = getTodayCorrelation();
      expect(typeof corr.numeroMisticismo.numero).toBe('number');
      expect(typeof corr.numeroMisticismo.significado).toBe('string');
      expect(typeof corr.numeroMisticismo.sephirah_correspondente).toBe('string');
      expect(typeof corr.numeroMisticismo.orixa_associado).toBe('string');
      expect(typeof corr.numeroMisticismo.elemento).toBe('string');
      expect(typeof corr.numeroMisticismo.planeta_regente).toBe('string');
      expect(typeof corr.numeroMisticismo.energia_caracteristica).toBe('string');
    });

    it('chakraElement is null when no match is found', () => {
      // This test verifies the field exists and can be null-safe
      const corr = getTodayCorrelation();
      // chakraElement may be null only if chakra name lookup fails
      if (corr.chakraElement !== null) {
        expect(corr.chakraElement).toHaveProperty('chakra');
        expect(corr.chakraElement).toHaveProperty('elemento_primario');
      }
    });

    it('poliedro is valid when present', () => {
      const corr = getTodayCorrelation();
      if (corr.poliedro !== null) {
        expect(typeof corr.poliedro.poliedro).toBe('string');
        expect(typeof corr.poliedro.chakra).toBe('string');
        expect(corr.poliedro.faces).toBeGreaterThanOrEqual(0);
      }
    });

    it('frequenciaPrimaria references a frequency within SOLFEGGIO range', () => {
      const corr = getTodayCorrelation();
      if (corr.frequenciaPrimaria !== null) {
        expect(corr.frequenciaPrimaria.frequencia).toBeGreaterThanOrEqual(396);
        expect(corr.frequenciaPrimaria.frequencia).toBeLessThanOrEqual(963);
      }
    });
  });

  // ─── getTodayCorrelation: day-specific correlations ─────────────────────────
  describe('getTodayCorrelation – specific days via date parameter', () => {
    it('returns domingo (dayIndex 0) with Sol as planet', () => {
      const sunday = getTodayCorrelation(new Date('2026-06-07')); // confirmed Sunday
      expect(sunday.dayIndex).toBe(0);
      expect(sunday.planeta).toBe('Sol');
    });

    it('returns segunda (dayIndex 1) with Omolu/Obaluaê as orixa', () => {
      const monday = getTodayCorrelation(new Date('2026-06-08')); // confirmed Monday
      expect(monday.dayIndex).toBe(1);
      expect(monday.orixa).toContain('Omolu');
    });

    it('returns terca (dayIndex 2) with Iansa as orixa', () => {
      const tuesday = getTodayCorrelation(new Date('2026-06-09')); // confirmed Tuesday
      expect(tuesday.dayIndex).toBe(2);
      expect(tuesday.orixa).toContain('Iansã');
    });

    it('returns quarta (dayIndex 3) with Xango and Mercúrio', () => {
      const wednesday = getTodayCorrelation(new Date('2026-06-10')); // confirmed Wednesday
      expect(wednesday.dayIndex).toBe(3);
      expect(wednesday.orixa).toBe('Xangô');
      expect(wednesday.planeta).toBe('Mercúrio');
    });

    it('returns quinta (dayIndex 4) with Oxóssi and Júpiter', () => {
      const thursday = getTodayCorrelation(new Date('2026-06-11')); // confirmed Thursday
      expect(thursday.dayIndex).toBe(4);
      expect(thursday.orixa).toBe('Oxóssi');
      expect(thursday.planeta).toBe('Júpiter');
    });

    it('returns sexta (dayIndex 5) with Oxalá and Vênus', () => {
      const friday = getTodayCorrelation(new Date('2026-06-12')); // confirmed Friday
      expect(friday.dayIndex).toBe(5);
      expect(friday.orixa).toBe('Oxalá');
      expect(friday.planeta).toBe('Vênus');
    });

    it('returns sabado (dayIndex 6) with Oxum/Iemanjá and Saturno', () => {
      const saturday = getTodayCorrelation(new Date('2026-06-13')); // confirmed Saturday
      expect(saturday.dayIndex).toBe(6);
      expect(saturday.orixa).toContain('Oxum');
      expect(saturday.planetas).toContain('Saturno');
    });
  });

  // ─── Odu Ifá integration ──────────────────────────────────────────────────
  describe('getTodayCorrelation – Odu Ifá integration', () => {
    it('oduNumero is a valid number 1-16 on every day', () => {
      const days = [
        new Date('2026-06-07'), // domingo
        new Date('2026-06-08'), // segunda
        new Date('2026-06-09'), // terça
        new Date('2026-06-10'), // quarta
        new Date('2026-06-11'), // quinta
        new Date('2026-06-12'), // sexta
        new Date('2026-06-13'), // sábado
      ];
      for (const date of days) {
        const corr = getTodayCorrelation(date);
        if (corr.oduNumero !== null) {
          expect(corr.oduNumero).toBeGreaterThanOrEqual(1);
          expect(corr.oduNumero).toBeLessThanOrEqual(16);
        }
        expect(corr.oduNome).toBeTruthy();
      }
    });

    it('oduNome is non-null when oduNumero is present', () => {
      const corr = getTodayCorrelation();
      if (corr.oduNumero !== null) {
        expect(corr.oduNome).toBeTruthy();
      }
    });

    it('odu mappings are consistent with day-odu module', () => {
      // Domingo → Obará (6) / EjiOníle (8)
      const domingo = getTodayCorrelation(new Date('2026-06-07'));
      expect(domingo.oduNumero).toBe(6);
      expect(domingo.oduNome).toBe('Obará');

      // Segunda → Okaran (1) / Obará (6)
      const segunda = getTodayCorrelation(new Date('2026-06-08'));
      expect(segunda.oduNumero).toBe(1);
      expect(segunda.oduNome).toBe('Okaran');
    });
  });

  // ─── Element correlations ──────────────────────────────────────────────────
  describe('getTodayCorrelation – element correlations', () => {
    it('element field matches one of the five elements', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
      const corr = getTodayCorrelation();
      expect(validElements).toContain(corr.elemento);
    });

    it('elementEmoji is a non-empty string', () => {
      const corr = getTodayCorrelation();
      expect(corr.elementEmoji.length).toBeGreaterThan(0);
    });

    it('frequenciasElemento contains frequencies matching the element', () => {
      const corr = getTodayCorrelation();
      for (const freq of corr.frequenciasElemento) {
        expect(freq.elemento).toBe(corr.elemento);
      }
    });
  });

  // ─── Chakra correlations ──────────────────────────────────────────────────
  describe('getTodayCorrelation – chakra correlations', () => {
    it('chakra is a non-empty string present in chakras array', () => {
      const corr = getTodayCorrelation();
      expect(corr.chakra.length).toBeGreaterThan(0);
      expect(corr.chakras).toContain(corr.chakra);
    });

    it('chakraSanskrit is non-empty when chakraElement is present', () => {
      const corr = getTodayCorrelation();
      expect(corr.chakraSanskrit.length).toBeGreaterThan(0);
      if (corr.chakraElement !== null) {
        expect(corr.chakraSanskrit).toMatch(/^(Muladhara|Svadhisthana|Manipura|Anahata|Vishuddha|Ajna|Sahasrara)$/);
      }
    });

    it('numerologia.tantric.value is between 1 and 13', () => {
      const corr = getTodayCorrelation();
      expect(corr.numerologia.tantric.value).toBeGreaterThanOrEqual(1);
      expect(corr.numerologia.tantric.value).toBeLessThanOrEqual(13);
    });
  });

  // ─── getCorrelationByDayIndex ──────────────────────────────────────────────
  describe('getCorrelationByDayIndex', () => {
    it('returns a valid TodayCorrelation for each day index 0-6', () => {
      for (let i = 0; i < 7; i++) {
        const corr = getCorrelationByDayIndex(i);
        expect(corr.dayIndex).toBe(i);
        expect(corr.dayName.length).toBeGreaterThan(0);
        expect(corr.orixa.length).toBeGreaterThan(0);
        expect(corr.elemento.length).toBeGreaterThan(0);
      }
    });

    it('throws RangeError for dayIndex outside 0-6', () => {
      expect(() => getCorrelationByDayIndex(-1)).toThrow(RangeError);
      expect(() => getCorrelationByDayIndex(7)).toThrow(RangeError);
    });

    it('produces the same result as getTodayCorrelation for the same day-of-week', () => {
      const byIndex = getCorrelationByDayIndex(0);
      const byDate = getTodayCorrelation(new Date('2026-06-07'));
      expect(byIndex.dayIndex).toBe(byDate.dayIndex);
      expect(byIndex.orixa).toBe(byDate.orixa);
      expect(byIndex.elemento).toBe(byDate.elemento);
    });
  });

  // ─── getWeekCorrelations ───────────────────────────────────────────────────
  describe('getWeekCorrelations', () => {
    it('returns exactly 7 correlations', () => {
      const week = getWeekCorrelations();
      expect(week).toHaveLength(7);
    });

    it('covers all day indices 0 through 6', () => {
      const week = getWeekCorrelations();
      const indices = week.map((d) => d.dayIndex);
      expect(indices).toContain(0);
      expect(indices).toContain(1);
      expect(indices).toContain(2);
      expect(indices).toContain(3);
      expect(indices).toContain(4);
      expect(indices).toContain(5);
      expect(indices).toContain(6);
    });

    it('every entry has a valid mystery and atuacaoRitual', () => {
      const week = getWeekCorrelations();
      for (const corr of week) {
        expect(corr.mystery.length).toBeGreaterThan(0);
        expect(corr.atuacaoRitual.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Color fields ──────────────────────────────────────────────────────────
  describe('getTodayCorrelation – color fields', () => {
    it('primaryColor and secondaryColor are valid hex color strings', () => {
      const hexPattern = /^#[0-9a-fA-F]{6}$/;
      const corr = getTodayCorrelation();
      expect(corr.primaryColor).toMatch(hexPattern);
      expect(corr.secondaryColor).toMatch(hexPattern);
    });
  });

  // ─── Sefirot ───────────────────────────────────────────────────────────────
  describe('getTodayCorrelation – sephirot', () => {
    it('sephirot array contains at least one sefirah', () => {
      const corr = getTodayCorrelation();
      expect(corr.sephirot.length).toBeGreaterThan(0);
      expect(corr.sefirah.length).toBeGreaterThan(0);
    });
  });
});

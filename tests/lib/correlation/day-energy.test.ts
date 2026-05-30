import { describe, it, expect } from 'vitest';
import {
  getDayEnergy,
  getAllDayEnergies,
  getDayName,
  getDayNameEn,
  getPrimaryOrixa,
  getRulingPlanets,
  getIdealMoonPhases,
  getSephirot,
  type DayEnergy,
  type MoonPhase,
} from '@/lib/correlation/day-energy';

describe('day-energy', () => {
  // ─── getDayEnergy: all 7 days ────────────────────────────────────────────
  describe('getDayEnergy', () => {
    it('returns Monday (0) with correct Orixás and chakras', () => {
      const monday = getDayEnergy(0);
      expect(monday.dayNamePt).toBe('Segunda-feira');
      expect(monday.dayNameEn).toBe('Monday');
      expect(monday.orixas).toContain('Omolu');
      expect(monday.orixas).toContain('Exu');
      expect(monday.chakras).toContain('1º Básico (Muladhara)');
      expect(monday.chakras).toContain('6º Frontal (Ajna)');
      expect(monday.planetas).toContain('Lua');
      expect(monday.planetas).toContain('Saturno');
      expect(monday.sephirot).toContain('Malkuth');
      expect(monday.sephirot).toContain('Yesod');
      expect(monday.numeros.tantric.value).toBe(2);
      expect(monday.numeros.cabalistic).toContain(2);
      expect(monday.numeros.cabalistic).toContain(4);
    });

    it('returns Tuesday (1) with correct Orixás and chakras', () => {
      const tuesday = getDayEnergy(1);
      expect(tuesday.dayNamePt).toBe('Terça-feira');
      expect(tuesday.dayNameEn).toBe('Tuesday');
      expect(tuesday.orixas).toContain('Iansã');
      expect(tuesday.orixas).toContain('Ogum');
      expect(tuesday.chakras).toContain('2º Sacro (Svadhisthana)');
      expect(tuesday.planetas).toContain('Marte');
      expect(tuesday.planetas).toContain('Plutão');
      expect(tuesday.sephirot).toContain('Geburah');
      expect(tuesday.numeros.tantric.value).toBe(5);
      expect(tuesday.tarotArcanos).toContain('XVI - A Torre (The Tower)');
    });

    it('returns Wednesday (2) with correct Orixás and chakras', () => {
      const wednesday = getDayEnergy(2);
      expect(wednesday.dayNamePt).toBe('Quarta-feira');
      expect(wednesday.dayNameEn).toBe('Wednesday');
      expect(wednesday.orixas).toContain('Xangô');
      expect(wednesday.orixas).toContain('Iansã');
      expect(wednesday.chakras).toContain('3º Plexo Solar (Manipura)');
      expect(wednesday.planetas).toContain('Mercúrio');
      expect(wednesday.sephirot).toContain('Hod');
      expect(wednesday.numeros.tantric.value).toBe(4);
      expect(wednesday.tarotArcanos).toContain('I - O Mago (The Magician)');
    });

    it('returns Thursday (3) with correct Orixás and chakras', () => {
      const thursday = getDayEnergy(3);
      expect(thursday.dayNamePt).toBe('Quinta-feira');
      expect(thursday.dayNameEn).toBe('Thursday');
      expect(thursday.orixas).toContain('Oxóssi');
      expect(thursday.chakras).toContain('4º Cardíaco (Anahata)');
      expect(thursday.planetas).toContain('Júpiter');
      expect(thursday.sephirot).toContain('Chesed');
      expect(thursday.numeros.tantric.value).toBe(7);
      expect(thursday.tarotArcanos).toContain('V - O Hierofante (The Hierophant)');
    });

    it('returns Friday (4) with correct Orixás and chakras', () => {
      const friday = getDayEnergy(4);
      expect(friday.dayNamePt).toBe('Sexta-feira');
      expect(friday.dayNameEn).toBe('Friday');
      expect(friday.orixas).toContain('Oxalá');
      expect(friday.chakras).toContain('7º Coronário (Sahasrara)');
      expect(friday.planetas).toContain('Vênus');
      expect(friday.sephirot).toContain('Kether');
      expect(friday.numeros.tantric.value).toBe(1);
      expect(friday.numeros.tantric.meaning).toContain('Alma');
      expect(friday.tarotArcanos).toContain('IV - O Imperador (The Emperor)');
    });

    it('returns Saturday (5) with correct Orixás and chakras', () => {
      const saturday = getDayEnergy(5);
      expect(saturday.dayNamePt).toBe('Sábado');
      expect(saturday.dayNameEn).toBe('Saturday');
      expect(saturday.orixas).toContain('Oxum');
      expect(saturday.orixas).toContain('Iemanjá');
      expect(saturday.chakras).toContain('4º Cardíaco (Anahata)');
      expect(saturday.chakras).toContain('6º Frontal (Ajna)');
      expect(saturday.planetas).toContain('Saturno');
      expect(saturday.planetas).toContain('Urano');
      expect(saturday.sephirot).toContain('Binah');
      expect(saturday.sephirot).toContain('Tiphereth');
      expect(saturday.numeros.tantric.value).toBe(3);
      expect(saturday.tarotArcanos).toContain('III - A Imperatriz (The Empress)');
    });

    it('returns Sunday (6) with correct Orixás and chakras', () => {
      const sunday = getDayEnergy(6);
      expect(sunday.dayNamePt).toBe('Domingo');
      expect(sunday.dayNameEn).toBe('Sunday');
      expect(sunday.orixas).toContain('Xangô');
      expect(sunday.chakras).toContain('3º Plexo Solar (Manipura)');
      expect(sunday.planetas).toContain('Sol');
      expect(sunday.sephirot).toContain('Tiphereth');
      expect(sunday.numeros.tantric.value).toBe(9);
      expect(sunday.tarotArcanos).toContain('XIX - O Sol (The Sun)');
    });

    it('throws RangeError for negative day', () => {
      expect(() => getDayEnergy(-1)).toThrow(RangeError);
    });

    it('throws RangeError for day > 6', () => {
      expect(() => getDayEnergy(7)).toThrow(RangeError);
    });

    it('throws RangeError with descriptive message', () => {
      expect(() => getDayEnergy(10)).toThrow(
        /dia must be between 0 \(Monday\) and 6 \(Sunday\)/
      );
    });

    it('returns a new object (does not mutate source)', () => {
      const day1 = getDayEnergy(0);
      const day2 = getDayEnergy(0);
      day2.orixas.push('Test');
      expect(day1.orixas).not.toContain('Test');
    });
  });

  // ─── getAllDayEnergies ────────────────────────────────────────────────────
  describe('getAllDayEnergies', () => {
    it('returns exactly 7 entries', () => {
      const all = getAllDayEnergies();
      expect(all).toHaveLength(7);
    });

    it('starts with Monday and ends with Sunday', () => {
      const all = getAllDayEnergies();
      expect(all[0].dayNamePt).toBe('Segunda-feira');
      expect(all[6].dayNamePt).toBe('Domingo');
    });

    it('each entry has a unique dayOfWeek', () => {
      const all = getAllDayEnergies();
      const days = all.map(d => d.dayOfWeek);
      expect(new Set(days)).toHaveLength(7);
    });

    it('matches getDayEnergy for each index', () => {
      for (let i = 0; i <= 6; i++) {
        expect(getAllDayEnergies()[i]).toEqual(getDayEnergy(i));
      }
    });
  });

  // ─── getDayName / getDayNameEn ─────────────────────────────────────────────
  describe('day name helpers', () => {
    it('getDayName returns Portuguese names', () => {
      expect(getDayName(0)).toBe('Segunda-feira');
      expect(getDayName(1)).toBe('Terça-feira');
      expect(getDayName(2)).toBe('Quarta-feira');
      expect(getDayName(3)).toBe('Quinta-feira');
      expect(getDayName(4)).toBe('Sexta-feira');
      expect(getDayName(5)).toBe('Sábado');
      expect(getDayName(6)).toBe('Domingo');
    });

    it('getDayNameEn returns English names', () => {
      expect(getDayNameEn(0)).toBe('Monday');
      expect(getDayNameEn(1)).toBe('Tuesday');
      expect(getDayNameEn(2)).toBe('Wednesday');
      expect(getDayNameEn(3)).toBe('Thursday');
      expect(getDayNameEn(4)).toBe('Friday');
      expect(getDayNameEn(5)).toBe('Saturday');
      expect(getDayNameEn(6)).toBe('Sunday');
    });
  });

  // ─── getPrimaryOrixa ──────────────────────────────────────────────────────
  describe('getPrimaryOrixa', () => {
    it('returns the first Orixá for each day', () => {
      expect(getPrimaryOrixa(0)).toBe('Omolu');
      expect(getPrimaryOrixa(1)).toBe('Iansã');
      expect(getPrimaryOrixa(2)).toBe('Xangô');
      expect(getPrimaryOrixa(3)).toBe('Oxóssi');
      expect(getPrimaryOrixa(4)).toBe('Oxalá');
      expect(getPrimaryOrixa(5)).toBe('Oxum');
      expect(getPrimaryOrixa(6)).toBe('Xangô');
    });
  });

  // ─── getRulingPlanets ─────────────────────────────────────────────────────
  describe('getRulingPlanets', () => {
    it('returns a copy of the planets array', () => {
      const planets = getRulingPlanets(0);
      planets.push('Test');
      expect(getRulingPlanets(0)).not.toContain('Test');
    });

    it('returns correct planets per day', () => {
      expect(getRulingPlanets(0)).toContain('Lua');
      expect(getRulingPlanets(0)).toContain('Saturno');
      expect(getRulingPlanets(1)).toContain('Marte');
      expect(getRulingPlanets(1)).toContain('Plutão');
      expect(getRulingPlanets(2)).toEqual(['Mercúrio']);
      expect(getRulingPlanets(3)).toEqual(['Júpiter']);
      expect(getRulingPlanets(4)).toEqual(['Vênus']);
      expect(getRulingPlanets(5)).toContain('Saturno');
      expect(getRulingPlanets(5)).toContain('Urano');
      expect(getRulingPlanets(6)).toEqual(['Sol']);
    });
  });

  // ─── getIdealMoonPhases ────────────────────────────────────────────────────
  describe('getIdealMoonPhases', () => {
    it('returns valid MoonPhase values', () => {
      const validPhases: MoonPhase[] = [
        'Lua Nova',
        'Lua Crescente',
        'Lua Cheia',
        'Lua Minguante',
        'Lua Nova / Crescente',
        'Lua Crescente / Cheia',
        'Lua Cheia / Crescente',
        'Lua Minguante / Nova',
      ];
      for (let i = 0; i <= 6; i++) {
        const phases = getIdealMoonPhases(i);
        phases.forEach(p => expect(validPhases).toContain(p));
      }
    });

    it('Monday has Lua Minguante and Lua Nova', () => {
      const phases = getIdealMoonPhases(0);
      expect(phases).toContain('Lua Minguante');
      expect(phases).toContain('Lua Nova');
    });

    it('Saturday has Lua Cheia', () => {
      const phases = getIdealMoonPhases(5);
      expect(phases).toContain('Lua Cheia');
    });

    it('returns a copy (immutable)', () => {
      const phases = getIdealMoonPhases(0);
      phases.push('Test Phase' as MoonPhase);
      expect(getIdealMoonPhases(0)).not.toContain('Test Phase');
    });
  });

  // ─── getSephirot ──────────────────────────────────────────────────────────
  describe('getSephirot', () => {
    it('returns a copy of the sephirot array', () => {
      const sephirot = getSephirot(0);
      sephirot.push('Test');
      expect(getSephirot(0)).not.toContain('Test');
    });

    it('each day has valid Kabbalistic sephirot', () => {
      const validSephirot = [
        'Kether', 'Chokhmah', 'Binah', 'Chesed',
        'Geburah', 'Tiphereth', 'Netzach', 'Hod',
        'Yesod', 'Malkuth',
      ];
      for (let i = 0; i <= 6; i++) {
        const sephirot = getSephirot(i);
        sephirot.forEach(s => {
          expect(validSephirot).toContain(s);
        });
      }
    });

    it('Monday has Malkuth and Yesod', () => {
      const sephirot = getSephirot(0);
      expect(sephirot).toContain('Malkuth');
      expect(sephirot).toContain('Yesod');
    });
  });

  // ─── Integration: DayEnergy shape ────────────────────────────────────────
  describe('DayEnergy interface completeness', () => {
    it('every day has a non-empty atuacaoRitual', () => {
      for (let i = 0; i <= 6; i++) {
        const day = getDayEnergy(i);
        expect(day.atuacaoRitual.length).toBeGreaterThan(10);
      }
    });

    it('every day has at least one tarot arcano', () => {
      for (let i = 0; i <= 6; i++) {
        const day = getDayEnergy(i);
        expect(day.tarotArcanos.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('every day has at least one moon phase', () => {
      for (let i = 0; i <= 6; i++) {
        const day = getDayEnergy(i);
        expect(day.fasesLua.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('numeros.tantric has a non-empty meaning', () => {
      for (let i = 0; i <= 6; i++) {
        const day = getDayEnergy(i);
        expect(day.numeros.tantric.meaning.length).toBeGreaterThan(5);
      }
    });

    it('cabalistic array has exactly 2 numbers per day', () => {
      for (let i = 0; i <= 6; i++) {
        const day = getDayEnergy(i);
        expect(day.numeros.cabalistic).toHaveLength(2);
      }
    });
  });
});
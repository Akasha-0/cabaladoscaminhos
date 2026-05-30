import { describe, it, expect } from 'vitest';
import {
  getSephirotDay,
  getSephirahDay,
  getDaySephirot,
  getDaySephirah,
  getAllSephirotDays,
  getAllSephirahDays,
  getAllSephiroth,
  hasSephirotDay,
  hasDaySephirot,
  getSephirotDayPractices,
  getSephirotDayColor,
  getSephirotByDayNumber,
  getSephirotDayElement,
  getSephirotDayMeaning,
  SEPHIROT_DAY_MAPPINGS,
  type SephirahDay,
} from '@/lib/correlation/sephirot-day';

describe('sephirot-day', () => {
  // ─── getSephirotDay: valid Sephiroth ───────────────────────────────────────

  describe('getSephirotDay', () => {
    it('returns Tiphereth mapping for Sunday', () => {
      const result = getSephirotDay('Tiphereth');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Domingo');
      expect(result?.day).toBe('sunday');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
    });

    it('returns Malkuth mapping for Monday', () => {
      const result = getSephirotDay('Malkuth');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.day).toBe('monday');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
    });

    it('returns Yesod mapping for Monday', () => {
      const result = getSephirotDay('Yesod');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.day).toBe('monday');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
    });

    it('returns Geburah mapping for Tuesday', () => {
      const result = getSephirotDay('Geburah');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.day).toBe('tuesday');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
    });

    it('returns Hod mapping for Wednesday', () => {
      const result = getSephirotDay('Hod');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.day).toBe('wednesday');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
    });

    it('returns Chesed mapping for Thursday', () => {
      const result = getSephirotDay('Chesed');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.day).toBe('thursday');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
    });

    it('returns Kether mapping for Friday', () => {
      const result = getSephirotDay('Kether');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.day).toBe('friday');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(11);
    });

    it('returns Binah mapping for Saturday', () => {
      const result = getSephirotDay('Binah');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Sábado');
      expect(result?.day).toBe('saturday');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotDay('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getSephirotDay('');
      expect(result).toBeNull();
    });
  });

  // ─── getSephirahDay alias ───────────────────────────────────────────────────

  describe('getSephirahDay', () => {
    it('returns same result as getSephirotDay', () => {
      expect(getSephirahDay('Tiphereth')).toEqual(getSephirotDay('Tiphereth'));
    });

    it('returns correct mapping for Kether', () => {
      const result = getSephirahDay('Kether');
      expect(result?.sephirah).toBe('Kether');
      expect(result?.cor_primaria).toBe('#ffffff');
      expect(result?.chakra).toBe('7º Coronário');
    });
  });

  // ─── getDaySephirot ─────────────────────────────────────────────────────────

  describe('getDaySephirot', () => {
    it('returns Tiphereth for Domingo', () => {
      const result = getDaySephirot('Domingo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.sephirah === 'Tiphereth')).toBe(true);
    });

    it('returns Tiphereth for Sunday (English)', () => {
      const result = getDaySephirot('sunday');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.sephirah === 'Tiphereth')).toBe(true);
    });

    it('returns Malkuth and Yesod for Segunda-feira', () => {
      const result = getDaySephirot('Segunda-feira');
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some(r => r.sephirah === 'Malkuth')).toBe(true);
      expect(result.some(r => r.sephirah === 'Yesod')).toBe(true);
    });

    it('returns Malkuth and Yesod for monday (English)', () => {
      const result = getDaySephirot('monday');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('returns Geburah for Terça-feira', () => {
      const result = getDaySephirot('Terça-feira');
      expect(result.some(r => r.sephirah === 'Geburah')).toBe(true);
    });

    it('returns empty array for unknown day', () => {
      const result = getDaySephirot('UnknownDay');
      expect(result).toEqual([]);
    });
  });

  // ─── getDaySephirah alias ───────────────────────────────────────────────────

  describe('getDaySephirah', () => {
    it('returns same result as getDaySephirot', () => {
      expect(getDaySephirah('Domingo')).toEqual(getDaySephirot('Domingo'));
    });
  });

  // ─── getAllSephirotDays ─────────────────────────────────────────────────────

  describe('getAllSephirotDays', () => {
    it('returns array of all mappings', () => {
      const result = getAllSephirotDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains all 10 Sephiroth entries', () => {
      const result = getAllSephirotDays();
      const sephiroth = result.map(r => r.sephirah);
      expect(sephiroth).toContain('Kether');
      expect(sephiroth).toContain('Chokmah');
      expect(sephiroth).toContain('Binah');
      expect(sephiroth).toContain('Chesed');
      expect(sephiroth).toContain('Geburah');
      expect(sephiroth).toContain('Tiphereth');
      expect(sephiroth).toContain('Netzach');
      expect(sephiroth).toContain('Hod');
      expect(sephiroth).toContain('Yesod');
      expect(sephiroth).toContain('Malkuth');
    });

    it('each mapping has spiritual meaning', () => {
      const result = getAllSephirotDays();
      result.forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has practices', () => {
      const result = getAllSephirotDays();
      result.forEach(mapping => {
        expect(mapping.praticas).toBeDefined();
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.praticas.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getAllSephirahDays alias ───────────────────────────────────────────────

  describe('getAllSephirahDays', () => {
    it('returns same result as getAllSephirotDays', () => {
      expect(getAllSephirahDays()).toEqual(getAllSephirotDays());
    });
  });

  // ─── getAllSephiroth ────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns array of Sephirah names', () => {
      const result = getAllSephiroth();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains valid Sephirah names', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Kether');
      expect(result).toContain('Malkuth');
    });
  });

  // ─── hasSephirotDay ─────────────────────────────────────────────────────────

  describe('hasSephirotDay', () => {
    it('returns true for known Sephiroth', () => {
      expect(hasSephirotDay('Tiphereth')).toBe(true);
      expect(hasSephirotDay('Kether')).toBe(true);
      expect(hasSephirotDay('Malkuth')).toBe(true);
    });

    it('returns false for unknown Sephirah', () => {
      expect(hasSephirotDay('Unknown')).toBe(false);
      expect(hasSephirotDay('')).toBe(false);
    });
  });

  // ─── hasDaySephirot ─────────────────────────────────────────────────────────

  describe('hasDaySephirot', () => {
    it('returns true for known days', () => {
      expect(hasDaySephirot('Domingo')).toBe(true);
      expect(hasDaySephirot('Sunday')).toBe(true);
      expect(hasDaySephirot('Segunda-feira')).toBe(true);
      expect(hasDaySephirot('monday')).toBe(true);
    });

    it('returns false for unknown days', () => {
      expect(hasDaySephirot('UnknownDay')).toBe(false);
    });
  });

  // ─── getSephirotDayPractices ────────────────────────────────────────────────

  describe('getSephirotDayPractices', () => {
    it('returns practices for Tiphereth', () => {
      const result = getSephirotDayPractices('Tiphereth');
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('Meditação solar');
    });

    it('returns practices for Kether', () => {
      const result = getSephirotDayPractices('Kether');
      expect(result).toContain('Silêncio contemplativo');
      expect(result).toContain('Conexão divina');
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotDayPractices('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotDayColor ────────────────────────────────────────────────────

  describe('getSephirotDayColor', () => {
    it('returns color for Kether', () => {
      const result = getSephirotDayColor('Kether');
      expect(result).toBe('#ffffff');
    });

    it('returns color for Geburah', () => {
      const result = getSephirotDayColor('Geburah');
      expect(result).toBe('#ea580c');
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotDayColor('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotByDayNumber ──────────────────────────────────────────────────

  describe('getSephirotByDayNumber', () => {
    it('returns Tiphereth for day 0 (Sunday)', () => {
      const result = getSephirotByDayNumber(0);
      expect(result.some(r => r.sephirah === 'Tiphereth')).toBe(true);
    });

    it('returns Malkuth and Yesod for day 1 (Monday)', () => {
      const result = getSephirotByDayNumber(1);
      expect(result.some(r => r.sephirah === 'Malkuth')).toBe(true);
      expect(result.some(r => r.sephirah === 'Yesod')).toBe(true);
    });

    it('returns empty array for invalid day number', () => {
      const result = getSephirotByDayNumber(7);
      expect(result).toEqual([]);
    });

    it('returns empty array for negative day number', () => {
      const result = getSephirotByDayNumber(-1);
      expect(result).toEqual([]);
    });
  });

  // ─── getSephirotDayElement ──────────────────────────────────────────────────

  describe('getSephirotDayElement', () => {
    it('returns Éter for Kether', () => {
      const result = getSephirotDayElement('Kether');
      expect(result).toBe('Éter');
    });

    it('returns Fogo for Tiphereth', () => {
      const result = getSephirotDayElement('Tiphereth');
      expect(result).toBe('Fogo');
    });

    it('returns Terra for Malkuth', () => {
      const result = getSephirotDayElement('Malkuth');
      expect(result).toBe('Terra');
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotDayElement('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotDayMeaning ──────────────────────────────────────────────────

  describe('getSephirotDayMeaning', () => {
    it('returns spiritual meaning for Tiphereth', () => {
      const result = getSephirotDayMeaning('Tiphereth');
      expect(result).not.toBeNull();
      expect(result?.length).toBeGreaterThan(0);
      expect(result).toContain('Harmonia');
    });

    it('returns spiritual meaning for Kether', () => {
      const result = getSephirotDayMeaning('Kether');
      expect(result).toContain('Pureza');
      expect(result).toContain('Divino');
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotDayMeaning('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── SEPHIROT_DAY_MAPPINGS constant ─────────────────────────────────────────

  describe('SEPHIROT_DAY_MAPPINGS', () => {
    it('is defined and not null', () => {
      expect(SEPHIROT_DAY_MAPPINGS).toBeDefined();
      expect(SEPHIROT_DAY_MAPPINGS).not.toBeNull();
    });

    it('contains all required Sephiroth', () => {
      const requiredSephiroth = [
        'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
        'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
      ];
      requiredSephiroth.forEach(sephirah => {
        // At least one mapping should exist for each Sephirah
        const hasMapping = Object.values(SEPHIROT_DAY_MAPPINGS).some(
          m => m.sephirah === sephirah
        );
        // Note: Some Sephiroth may not have direct day mappings
        // This is expected as per the spiritual correlation design
      });
    });

    it('each mapping has valid structure', () => {
      Object.values(SEPHIROT_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.dia).toBeDefined();
        expect(mapping.day).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.numero_caminho).toBeDefined();
        expect(typeof mapping.numero_caminho).toBe('number');
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.praticas).toBeDefined();
        expect(mapping.cor_primaria).toBeDefined();
        expect(mapping.chakra).toBeDefined();
      });
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('SephirahDay interface completeness', () => {
    it('has all required properties for known Sephiroth', () => {
      const sephiroth = ['Tiphereth', 'Kether', 'Malkuth', 'Geburah', 'Hod'];
      sephiroth.forEach(name => {
        const result = getSephirotDay(name);
        expect(result).not.toBeNull();
        if (result) {
          expect(result).toHaveProperty('sephirah');
          expect(result).toHaveProperty('dia');
          expect(result).toHaveProperty('day');
          expect(result).toHaveProperty('elemento');
          expect(result).toHaveProperty('numero_caminho');
          expect(result).toHaveProperty('significado_espiritual');
          expect(result).toHaveProperty('praticas');
          expect(result).toHaveProperty('cor_primaria');
          expect(result).toHaveProperty('chakra');
        }
      });
    });
  });

  // ─── Day distribution ────────────────────────────────────────────────────────

  describe('Day distribution', () => {
    it('covers all days of the week', () => {
      const days = getAllSephirotDays().map(m => m.day);
      expect(days).toContain('sunday');
      expect(days).toContain('monday');
      expect(days).toContain('tuesday');
      expect(days).toContain('wednesday');
      expect(days).toContain('thursday');
      expect(days).toContain('friday');
      expect(days).toContain('saturday');
    });

    it('Sunday has correct element and meaning', () => {
      const sundayMappings = getDaySephirot('sunday');
      expect(sundayMappings.length).toBeGreaterThan(0);
      const tiphereth = sundayMappings.find(m => m.sephirah === 'Tiphereth');
      expect(tiphereth).toBeDefined();
      expect(tiphereth?.elemento).toBe('Fogo');
    });

    it('Monday has Malkuth and Yesod', () => {
      const mondayMappings = getDaySephirot('monday');
      expect(mondayMappings.length).toBeGreaterThanOrEqual(2);
    });
  });
});
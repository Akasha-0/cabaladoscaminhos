import { describe, it, expect } from 'vitest';
import {
  getDayElement,
  getElementDay,
  getAllDayElements,
  getElementFromDay,
  getChakraFromDay,
  getAffirmationFromDay,
  getSpiritualThemeFromDay,
  getDaysByElement,
  getAllDays,
  getPlanetFromDay,
  getActivitiesFromDay,
  DAY_ELEMENT_MAP,
  TODOS_DIAS,
  TODOS_ELEMENTOS,
  type DayElementMapping,
  type DiaSemana,
  type ChakraName,
} from '@/lib/correlation/day-element';

describe('DayElement Correlation', () => {
  // ─── DAY_ELEMENT_MAP: all 7 days ─────────────────────────────────────────

  describe('DAY_ELEMENT_MAP', () => {
    it('contains all 7 days of the week', () => {
      expect(Object.keys(DAY_ELEMENT_MAP)).toHaveLength(7);
    });

    it('maps Domingo to Fogo with Anahata chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Domingo'];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.chakra).toBe('Anahata');
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.dia).toBe('Domingo');
    });

    it('maps Segunda-feira to Água with Svadhisthana chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Segunda-feira'];
      expect(mapping.elemento).toBe('Água');
      expect(mapping.chakra).toBe('Svadhisthana');
      expect(mapping.planeta).toBe('Lua');
    });

    it('maps Terça-feira to Fogo with Manipura chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Terça-feira'];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.chakra).toBe('Manipura');
      expect(mapping.planeta).toBe('Marte');
    });

    it('maps Quarta-feira to Ar with Vishuddha chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Quarta-feira'];
      expect(mapping.elemento).toBe('Ar');
      expect(mapping.chakra).toBe('Vishuddha');
      expect(mapping.planeta).toBe('Mercúrio');
    });

    it('maps Quinta-feira to Fogo with Anahata chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Quinta-feira'];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.chakra).toBe('Anahata');
      expect(mapping.planeta).toBe('Júpiter');
    });

    it('maps Sexta-feira to Terra with Svadhisthana chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Sexta-feira'];
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.chakra).toBe('Svadhisthana');
      expect(mapping.planeta).toBe('Vênus');
    });

    it('maps Sábado to Terra with Muladhara chakra', () => {
      const mapping = DAY_ELEMENT_MAP['Sábado'];
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.chakra).toBe('Muladhara');
      expect(mapping.planeta).toBe('Saturno');
    });

    it('includes spiritual meaning for each day', () => {
      for (const mapping of Object.values(DAY_ELEMENT_MAP)) {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.tema).toBeDefined();
        expect(mapping.significado_espiritual.emocional).toBeDefined();
        expect(mapping.significado_espiritual.mental).toBeDefined();
        expect(mapping.significado_espiritual.fisico).toBeDefined();
      }
    });

    it('includes affirmation for each day', () => {
      for (const mapping of Object.values(DAY_ELEMENT_MAP)) {
        expect(mapping.affirmation).toBeDefined();
        expect(typeof mapping.affirmation).toBe('string');
        expect(mapping.affirmation.length).toBeGreaterThan(0);
      }
    });

    it('includes activities for each day', () => {
      for (const mapping of Object.values(DAY_ELEMENT_MAP)) {
        expect(mapping.atividades).toBeDefined();
        expect(Array.isArray(mapping.atividades)).toBe(true);
        expect(mapping.atividades.length).toBeGreaterThan(0);
      }
    });

    it('includes secondary chakra where defined', () => {
      const mapping = DAY_ELEMENT_MAP['Domingo'];
      expect(mapping.chakraSecundario).toBeDefined();
      expect(mapping.chakraSecundario).toBe('Manipura');
    });

    it('includes null secondary chakra where appropriate', () => {
      const mapping = DAY_ELEMENT_MAP['Quinta-feira'];
      expect(mapping.chakraSecundario).toBeNull();
    });
  });

  // ─── getDayElement: lookup by day ────────────────────────────────────────

  describe('getDayElement', () => {
    it('returns mapping for Portuguese day names', () => {
      const result = getDayElement('Domingo');
      expect(result).not.toBeNull();
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for English day names', () => {
      const result = getDayElement('Sunday');
      expect(result).not.toBeNull();
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for abbreviations', () => {
      const result = getDayElement('dom');
      expect(result).not.toBeNull();
      expect(result?.elemento).toBe('Fogo');
    });

    it('handles case insensitivity', () => {
      const upper = getDayElement('DOMINGO');
      const lower = getDayElement('domingo');
      expect(upper?.elemento).toBe(lower?.elemento);
    });

    it('handles whitespace variations', () => {
      const result = getDayElement('  Segunda-feira  ');
      expect(result).not.toBeNull();
      expect(result?.elemento).toBe('Água');
    });

    it('returns null for invalid day names', () => {
      expect(getDayElement('InvalidDay')).toBeNull();
      expect(getDayElement('')).toBeNull();
      expect(getDayElement(null as unknown as string)).toBeNull();
      expect(getDayElement(undefined as unknown as string)).toBeNull();
    });

    it('handles day with hyphen variation (terca)', () => {
      const result = getDayElement('terca-feira');
      expect(result).not.toBeNull();
      expect(result?.elemento).toBe('Fogo');
    });

    it('handles day with accent variation (sabado)', () => {
      const result = getDayElement('sabado');
      expect(result).not.toBeNull();
      expect(result?.elemento).toBe('Terra');
    });
  });

  // ─── getElementDay: lookup by element ────────────────────────────────────

  describe('getElementDay', () => {
    it('returns day for Fogo element', () => {
      const result = getElementDay('Fogo');
      expect(result).not.toBeNull();
    });

    it('returns day for Água element', () => {
      const result = getElementDay('Água');
      expect(result).not.toBeNull();
      expect(DAY_ELEMENT_MAP[result as DiaSemana]?.elemento).toBe('Água');
    });

    it('returns day for Ar element', () => {
      const result = getElementDay('Ar');
      expect(result).not.toBeNull();
      expect(DAY_ELEMENT_MAP[result as DiaSemana]?.elemento).toBe('Ar');
    });

    it('returns day for Terra element', () => {
      const result = getElementDay('Terra');
      expect(result).not.toBeNull();
      expect(DAY_ELEMENT_MAP[result as DiaSemana]?.elemento).toBe('Terra');
    });

    it('handles case insensitivity for elements', () => {
      const upper = getElementDay('FOGO');
      const lower = getElementDay('fogo');
      expect(upper).toBe(lower);
    });

    it('handles whitespace variations', () => {
      const result = getElementDay('  Fogo  ');
      expect(result).not.toBeNull();
    });

    it('handles accent variations (agua)', () => {
      const result = getElementDay('agua');
      expect(result).not.toBeNull();
    });

    it('returns null for invalid elements', () => {
      expect(getElementDay('InvalidElement')).toBeNull();
      expect(getElementDay('')).toBeNull();
      expect(getElementDay(null as unknown as string)).toBeNull();
    });
  });

  // ─── getAllDayElements: all mappings ────────────────────────────────────

  describe('getAllDayElements', () => {
    it('returns all 7 day-element mappings', () => {
      const result = getAllDayElements();
      expect(result).toHaveLength(7);
    });

    it('returns array (not object)', () => {
      const result = getAllDayElements();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains all day names', () => {
      const result = getAllDayElements();
      const names = result.map((r) => r.dia);
      expect(names).toContain('Domingo');
      expect(names).toContain('Segunda-feira');
      expect(names).toContain('Terça-feira');
      expect(names).toContain('Quarta-feira');
      expect(names).toContain('Quinta-feira');
      expect(names).toContain('Sexta-feira');
      expect(names).toContain('Sábado');
    });

    it('each mapping has all required fields', () => {
      const result = getAllDayElements();
      for (const mapping of result) {
        expect(mapping.dia).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.planeta).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.affirmation).toBeDefined();
        expect(mapping.atividades).toBeDefined();
      }
    });
  });

  // ─── getElementFromDay ───────────────────────────────────────────────────

  describe('getElementFromDay', () => {
    it('returns element for valid day', () => {
      expect(getElementFromDay('Domingo')).toBe('Fogo');
      expect(getElementFromDay('Segunda-feira')).toBe('Água');
      expect(getElementFromDay('Terça-feira')).toBe('Fogo');
      expect(getElementFromDay('Quarta-feira')).toBe('Ar');
      expect(getElementFromDay('Quinta-feira')).toBe('Fogo');
      expect(getElementFromDay('Sexta-feira')).toBe('Terra');
      expect(getElementFromDay('Sábado')).toBe('Terra');
    });

    it('handles English day names', () => {
      expect(getElementFromDay('Sunday')).toBe('Fogo');
      expect(getElementFromDay('Monday')).toBe('Água');
    });

    it('returns null for invalid day', () => {
      expect(getElementFromDay('InvalidDay')).toBeNull();
      expect(getElementFromDay('')).toBeNull();
    });
  });

  // ─── getChakraFromDay ───────────────────────────────────────────────────

  describe('getChakraFromDay', () => {
    it('returns chakra for valid day', () => {
      expect(getChakraFromDay('Domingo')).toBe('Anahata');
      expect(getChakraFromDay('Segunda-feira')).toBe('Svadhisthana');
      expect(getChakraFromDay('Terça-feira')).toBe('Manipura');
      expect(getChakraFromDay('Quarta-feira')).toBe('Vishuddha');
      expect(getChakraFromDay('Quinta-feira')).toBe('Anahata');
      expect(getChakraFromDay('Sexta-feira')).toBe('Svadhisthana');
      expect(getChakraFromDay('Sábado')).toBe('Muladhara');
    });

    it('returns null for invalid day', () => {
      expect(getChakraFromDay('InvalidDay')).toBeNull();
    });
  });

  // ─── getAffirmationFromDay ──────────────────────────────────────────────

  describe('getAffirmationFromDay', () => {
    it('returns affirmation for valid day', () => {
      const result = getAffirmationFromDay('Domingo');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns null for invalid day', () => {
      expect(getAffirmationFromDay('InvalidDay')).toBeNull();
    });

    it('returns different affirmations for different days', () => {
      const domingo = getAffirmationFromDay('Domingo');
      const segunda = getAffirmationFromDay('Segunda-feira');
      expect(domingo).not.toBe(segunda);
    });
  });

  // ─── getSpiritualThemeFromDay ────────────────────────────────────────────

  describe('getSpiritualThemeFromDay', () => {
    it('returns spiritual theme for valid day', () => {
      const result = getSpiritualThemeFromDay('Domingo');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
    });

    it('returns null for invalid day', () => {
      expect(getSpiritualThemeFromDay('InvalidDay')).toBeNull();
    });

    it('returns meaningful themes', () => {
      expect(getSpiritualThemeFromDay('Domingo')).toContain('Propósito');
      expect(getSpiritualThemeFromDay('Segunda-feira')).toContain('Cura');
    });
  });

  // ─── getDaysByElement ───────────────────────────────────────────────────

  describe('getDaysByElement', () => {
    it('returns days for Fogo element', () => {
      const result = getDaysByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Fogo')).toBe(true);
    });

    it('returns days for Água element', () => {
      const result = getDaysByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Água')).toBe(true);
    });

    it('returns days for Ar element', () => {
      const result = getDaysByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Ar')).toBe(true);
    });

    it('returns days for Terra element', () => {
      const result = getDaysByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Terra')).toBe(true);
    });

    it('handles case insensitivity', () => {
      const upper = getDaysByElement('FOGO');
      const lower = getDaysByElement('fogo');
      expect(upper.length).toBe(lower.length);
    });

    it('returns empty array for invalid element', () => {
      expect(getDaysByElement('InvalidElement')).toEqual([]);
      expect(getDaysByElement('')).toEqual([]);
    });
  });

  // ─── getAllDays ─────────────────────────────────────────────────────────

  describe('getAllDays', () => {
    it('returns all 7 days', () => {
      const result = getAllDays();
      expect(result).toHaveLength(7);
    });

    it('returns array of DiaSemana', () => {
      const result = getAllDays();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains all expected day names', () => {
      const result = getAllDays();
      expect(result).toContain('Domingo');
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quarta-feira');
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });
  });

  // ─── getPlanetFromDay ───────────────────────────────────────────────────

  describe('getPlanetFromDay', () => {
    it('returns planet for valid day', () => {
      expect(getPlanetFromDay('Domingo')).toBe('Sol');
      expect(getPlanetFromDay('Segunda-feira')).toBe('Lua');
      expect(getPlanetFromDay('Terça-feira')).toBe('Marte');
      expect(getPlanetFromDay('Quarta-feira')).toBe('Mercúrio');
      expect(getPlanetFromDay('Quinta-feira')).toBe('Júpiter');
      expect(getPlanetFromDay('Sexta-feira')).toBe('Vênus');
      expect(getPlanetFromDay('Sábado')).toBe('Saturno');
    });

    it('returns null for invalid day', () => {
      expect(getPlanetFromDay('InvalidDay')).toBeNull();
    });
  });

  // ─── getActivitiesFromDay ───────────────────────────────────────────────

  describe('getActivitiesFromDay', () => {
    it('returns activities for valid day', () => {
      const result = getActivitiesFromDay('Domingo');
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns null for invalid day', () => {
      expect(getActivitiesFromDay('InvalidDay')).toBeNull();
    });

    it('returns meaningful activities for each day', () => {
      for (const dia of ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']) {
        const activities = getActivitiesFromDay(dia);
        expect(activities).not.toBeNull();
      }
    });
  });

  // ─── TODOS_DIAS constant ───────────────────────────────────────────────

  describe('TODOS_DIAS', () => {
    it('contains 7 days', () => {
      expect(TODOS_DIAS).toHaveLength(7);
    });

    it('contains all expected days', () => {
      expect(TODOS_DIAS).toContain('Domingo');
      expect(TODOS_DIAS).toContain('Segunda-feira');
      expect(TODOS_DIAS).toContain('Terça-feira');
      expect(TODOS_DIAS).toContain('Quarta-feira');
      expect(TODOS_DIAS).toContain('Quinta-feira');
      expect(TODOS_DIAS).toContain('Sexta-feira');
      expect(TODOS_DIAS).toContain('Sábado');
    });
  });

  // ─── TODOS_ELEMENTOS constant ──────────────────────────────────────────

  describe('TODOS_ELEMENTOS', () => {
    it('contains 4 elements', () => {
      expect(TODOS_ELEMENTOS).toHaveLength(4);
    });

    it('contains all classical elements', () => {
      expect(TODOS_ELEMENTOS).toContain('Fogo');
      expect(TODOS_ELEMENTOS).toContain('Água');
      expect(TODOS_ELEMENTOS).toContain('Ar');
      expect(TODOS_ELEMENTOS).toContain('Terra');
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('exports DayElementMapping type', () => {
      const mapping: DayElementMapping = {
        dia: 'Domingo',
        elemento: 'Fogo',
        chakra: 'Anahata',
        chakraSecundario: null,
        planeta: 'Sol',
        significado_espiritual: {
          tema: 'Test',
          emocional: 'Test',
          mental: 'Test',
          fisico: 'Test',
        },
        affirmation: 'Test',
        atividades: ['Test'],
      };
      expect(mapping.dia).toBeDefined();
    });

    it('exports DiaSemana type', () => {
      const dia: DiaSemana = 'Domingo';
      expect(dia).toBeDefined();
    });

    it('exports ChakraName type', () => {
      const chakra: ChakraName = 'Anahata';
      expect(chakra).toBeDefined();
    });
  });

  // ─── Default export ────────────────────────────────────────────────────

  describe('Default export', () => {
    it('exports all required functions', async () => {
      const module = await import('@/lib/correlation/day-element');
      const defaultExport = module.default;

      expect(defaultExport.getDayElement).toBeDefined();
      expect(defaultExport.getElementDay).toBeDefined();
      expect(defaultExport.getAllDayElements).toBeDefined();

      expect(typeof defaultExport.getDayElement).toBe('function');
      expect(typeof defaultExport.getElementDay).toBe('function');
      expect(typeof defaultExport.getAllDayElements).toBe('function');
    });

    it('default export matches named exports', async () => {
      const module = await import('@/lib/correlation/day-element');
      const defaultExport = module.default;

      expect(defaultExport.getDayElement('Domingo')).toEqual(getDayElement('Domingo'));
      expect(defaultExport.getAllDayElements()).toEqual(getAllDayElements());
    });
  });

  // ─── Consistency checks ─────────────────────────────────────────────────

  describe('Consistency checks', () => {
    it('TODOS_DIAS matches DAY_ELEMENT_MAP keys', () => {
      const mapKeys = Object.keys(DAY_ELEMENT_MAP).sort();
      const todosDiasSorted = [...TODOS_DIAS].sort();
      expect(mapKeys).toEqual(todosDiasSorted);
    });

    it('getAllDays returns same count as map', () => {
      expect(getAllDays().length).toBe(Object.keys(DAY_ELEMENT_MAP).length);
    });

    it('getDayElement and getElementFromDay are consistent', () => {
      for (const dia of ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']) {
        const mapping = getDayElement(dia);
        expect(mapping?.elemento).toBe(getElementFromDay(dia));
      }
    });

    it('each day has unique element or shares with others', () => {
      const elementDays: Record<string, number> = {};
      for (const mapping of Object.values(DAY_ELEMENT_MAP)) {
        elementDays[mapping.elemento] = (elementDays[mapping.elemento] || 0) + 1;
      }
      // Fogo appears 3 times (Domingo, Terça-feira, Quinta-feira)
      // Água appears 1 time (Segunda-feira)
      // Ar appears 1 time (Quarta-feira)
      // Terra appears 2 times (Sexta-feira, Sábado)
      expect(elementDays['Fogo']).toBe(3);
      expect(elementDays['Água']).toBe(1);
      expect(elementDays['Ar']).toBe(1);
      expect(elementDays['Terra']).toBe(2);
    });

    it('each day has valid chakra', () => {
      const validChakras: ChakraName[] = ['Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna', 'Sahasrara'];
      for (const mapping of Object.values(DAY_ELEMENT_MAP)) {
        expect(validChakras).toContain(mapping.chakra);
        if (mapping.chakraSecundario) {
          expect(validChakras).toContain(mapping.chakraSecundario);
        }
      }
    });
  });
});
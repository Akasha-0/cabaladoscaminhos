/**
 * Day-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDayChakra,
  getChakraDay,
  getAllDayChakras,
  getChakraNumberDay,
  getColorByDay,
  getDaySpiritualMeaning,
  getDayRitualPractices,
  getDayKeywords,
  getDayIndex,
  getDayEnglishName,
  getDaysForChakra,
  getAllDays,
  DAY_CHAKRA_MAP,
} from '@/lib/correlation/day-chakra';

describe('Day-Chakra Correlation', () => {
  describe('getDayChakra', () => {
    it('should return Vishuddha (5º Laríngeo) for Domingo (Sunday)', () => {
      const result = getDayChakra('Domingo');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_numero).toBe('5º Laríngeo');
      expect(result?.dia_en).toBe('Sunday');
      expect(result?.indice).toBe(0);
      expect(result?.cor).toBe('Laranja');
    });

    it('should return Muladhara (1º Básico) for Segunda-feira (Monday)', () => {
      const result = getDayChakra('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_numero).toBe('1º Básico (Raiz)');
      expect(result?.dia_en).toBe('Monday');
      expect(result?.indice).toBe(1);
      expect(result?.cor).toBe('Vermelho');
    });

    it('should return Svadhisthana (2º Sacral) for Terça-feira (Tuesday)', () => {
      const result = getDayChakra('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_numero).toBe('2º Sacral (Esplênico)');
      expect(result?.dia_en).toBe('Tuesday');
      expect(result?.indice).toBe(2);
      expect(result?.cor).toBe('Laranja');
    });

    it('should return Manipura (3º Plexo Solar) for Quarta-feira (Wednesday)', () => {
      const result = getDayChakra('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe('3º Plexo Solar');
      expect(result?.dia_en).toBe('Wednesday');
      expect(result?.indice).toBe(3);
      expect(result?.cor).toBe('Amarelo');
    });

    it('should return Anahata (4º Cardíaco) for Quinta-feira (Thursday)', () => {
      const result = getDayChakra('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe('4º Cardíaco (Coração)');
      expect(result?.dia_en).toBe('Thursday');
      expect(result?.indice).toBe(4);
      expect(result?.cor).toBe('Verde');
    });

    it('should return Sahasrara (7º Coronário) for Sexta-feira (Friday)', () => {
      const result = getDayChakra('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_numero).toBe('7º Coronário (Coroa)');
      expect(result?.dia_en).toBe('Friday');
      expect(result?.indice).toBe(5);
      expect(result?.cor).toBe('Roxo / Branco');
    });

    it('should return Anahata (4º Cardíaco) for Sábado (Saturday)', () => {
      const result = getDayChakra('Sábado');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe('4º Cardíaco (Coração)');
      expect(result?.dia_en).toBe('Saturday');
      expect(result?.indice).toBe(6);
      expect(result?.cor).toBe('Verde / Rosa');
    });

    it('should return undefined for invalid day name', () => {
      const result = getDayChakra('DiaInvalido');
      expect(result).toBeUndefined();
    });
  });

  describe('getChakraDay', () => {
    it('should return Vishuddha for Domingo', () => {
      const result = getChakraDay('Domingo');
      expect(result).toBe('Vishuddha');
    });

    it('should return Muladhara for Segunda-feira', () => {
      const result = getChakraDay('Segunda-feira');
      expect(result).toBe('Muladhara');
    });

    it('should return Svadhisthana for Terça-feira', () => {
      const result = getChakraDay('Terça-feira');
      expect(result).toBe('Svadhisthana');
    });

    it('should return Manipura for Quarta-feira', () => {
      const result = getChakraDay('Quarta-feira');
      expect(result).toBe('Manipura');
    });

    it('should return Anahata for both Quinta-feira and Sábado', () => {
      const quintaResult = getChakraDay('Quinta-feira');
      const sabadoResult = getChakraDay('Sábado');
      expect(quintaResult).toBe('Anahata');
      expect(sabadoResult).toBe('Anahata');
    });

    it('should return Sahasrara for Sexta-feira', () => {
      const result = getChakraDay('Sexta-feira');
      expect(result).toBe('Sahasrara');
    });

    it('should return undefined for invalid day', () => {
      const result = getChakraDay('InvalidDay');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllDayChakras', () => {
    it('should return all seven day-chakra mappings', () => {
      const result = getAllDayChakras();
      expect(result).toBeDefined();
      expect(result.length).toBe(7);
    });

    it('should include all seven days', () => {
      const result = getAllDayChakras();
      const days = result.map(m => m.dia);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });

    it('should include all expected chakras', () => {
      const result = getAllDayChakras();
      const chakras = result.map(m => m.chakra);
      expect(chakras).toContain('Vishuddha');
      expect(chakras).toContain('Muladhara');
      expect(chakras).toContain('Svadhisthana');
      expect(chakras).toContain('Manipura');
      expect(chakras).toContain('Anahata');
      expect(chakras).toContain('Sahasrara');
    });
  });

  describe('getAllDays', () => {
    it('should return all seven day names', () => {
      const result = getAllDays();
      expect(result).toBeDefined();
      expect(result.length).toBe(7);
      expect(result).toContain('Domingo');
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quarta-feira');
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });
  });

  describe('getChakraNumberDay', () => {
    it('should return correct chakra number for each day', () => {
      expect(getChakraNumberDay('Domingo')).toBe('5º Laríngeo');
      expect(getChakraNumberDay('Segunda-feira')).toBe('1º Básico (Raiz)');
      expect(getChakraNumberDay('Terça-feira')).toBe('2º Sacral (Esplênico)');
      expect(getChakraNumberDay('Quarta-feira')).toBe('3º Plexo Solar');
      expect(getChakraNumberDay('Quinta-feira')).toBe('4º Cardíaco (Coração)');
      expect(getChakraNumberDay('Sexta-feira')).toBe('7º Coronário (Coroa)');
      expect(getChakraNumberDay('Sábado')).toBe('4º Cardíaco (Coração)');
    });

    it('should return undefined for invalid day', () => {
      expect(getChakraNumberDay('Invalid')).toBeUndefined();
    });
  });

  describe('getColorByDay', () => {
    it('should return correct colors', () => {
      expect(getColorByDay('Domingo')).toBe('Laranja');
      expect(getColorByDay('Segunda-feira')).toBe('Vermelho');
      expect(getColorByDay('Terça-feira')).toBe('Laranja');
      expect(getColorByDay('Quarta-feira')).toBe('Amarelo');
      expect(getColorByDay('Quinta-feira')).toBe('Verde');
      expect(getColorByDay('Sexta-feira')).toBe('Roxo / Branco');
      expect(getColorByDay('Sábado')).toBe('Verde / Rosa');
    });

    it('should return undefined for invalid day', () => {
      expect(getColorByDay('Invalid')).toBeUndefined();
    });
  });

  describe('getDaySpiritualMeaning', () => {
    it('should return spiritual meaning for each day', () => {
      const domingo = getDaySpiritualMeaning('Domingo');
      expect(domingo).toBeDefined();
      expect(domingo).toContain('garganta');
      expect(domingo).toContain('comunicação');

      const segunda = getDaySpiritualMeaning('Segunda-feira');
      expect(segunda).toBeDefined();
      expect(segunda).toContain('básico');
      expect(segunda).toContain('aterramento');

      const sexta = getDaySpiritualMeaning('Sexta-feira');
      expect(sexta).toBeDefined();
      expect(sexta).toContain('coroa');
      expect(sexta).toContain('iluminação');
    });

    it('should return undefined for invalid day', () => {
      expect(getDaySpiritualMeaning('Invalid')).toBeUndefined();
    });
  });

  describe('getDayRitualPractices', () => {
    it('should return array of ritual practices for each day', () => {
      const domingo = getDayRitualPractices('Domingo');
      expect(domingo).toBeDefined();
      expect(Array.isArray(domingo)).toBe(true);
      expect(domingo!.length).toBeGreaterThan(0);

      const sexta = getDayRitualPractices('Sexta-feira');
      expect(sexta).toBeDefined();
      expect(Array.isArray(sexta)).toBe(true);
      expect(sexta!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDayRitualPractices('Invalid')).toBeUndefined();
    });
  });

  describe('getDayKeywords', () => {
    it('should return array of keywords for each day', () => {
      const segunda = getDayKeywords('Segunda-feira');
      expect(segunda).toBeDefined();
      expect(Array.isArray(segunda)).toBe(true);
      expect(segunda).toContain('aterramento');

      const sexta = getDayKeywords('Sexta-feira');
      expect(sexta).toBeDefined();
      expect(Array.isArray(sexta)).toBe(true);
      expect(sexta).toContain('iluminação');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayKeywords('Invalid')).toBeUndefined();
    });
  });

  describe('getDayIndex', () => {
    it('should return correct indices (0=Domingo, 6=Sábado)', () => {
      expect(getDayIndex('Domingo')).toBe(0);
      expect(getDayIndex('Segunda-feira')).toBe(1);
      expect(getDayIndex('Terça-feira')).toBe(2);
      expect(getDayIndex('Quarta-feira')).toBe(3);
      expect(getDayIndex('Quinta-feira')).toBe(4);
      expect(getDayIndex('Sexta-feira')).toBe(5);
      expect(getDayIndex('Sábado')).toBe(6);
    });

    it('should return undefined for invalid day', () => {
      expect(getDayIndex('Invalid')).toBeUndefined();
    });
  });

  describe('getDayEnglishName', () => {
    it('should return correct English names', () => {
      expect(getDayEnglishName('Domingo')).toBe('Sunday');
      expect(getDayEnglishName('Segunda-feira')).toBe('Monday');
      expect(getDayEnglishName('Terça-feira')).toBe('Tuesday');
      expect(getDayEnglishName('Quarta-feira')).toBe('Wednesday');
      expect(getDayEnglishName('Quinta-feira')).toBe('Thursday');
      expect(getDayEnglishName('Sexta-feira')).toBe('Friday');
      expect(getDayEnglishName('Sábado')).toBe('Saturday');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayEnglishName('Invalid')).toBeUndefined();
    });
  });

  describe('getDaysForChakra', () => {
    it('should return days associated with Muladhara', () => {
      const days = getDaysForChakra('Muladhara');
      expect(days).toContain('Segunda-feira');
    });

    it('should return days associated with Svadhisthana', () => {
      const days = getDaysForChakra('Svadhisthana');
      expect(days).toContain('Terça-feira');
    });

    it('should return days associated with Manipura', () => {
      const days = getDaysForChakra('Manipura');
      expect(days).toContain('Quarta-feira');
    });

    it('should return days associated with Anahata (Quinta and Sábado)', () => {
      const days = getDaysForChakra('Anahata');
      expect(days.length).toBe(2);
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sábado');
    });

    it('should return days associated with Vishuddha', () => {
      const days = getDaysForChakra('Vishuddha');
      expect(days).toContain('Domingo');
    });

    it('should return days associated with Sahasrara', () => {
      const days = getDaysForChakra('Sahasrara');
      expect(days).toContain('Sexta-feira');
    });

    it('should return empty array for unknown chakra', () => {
      const days = getDaysForChakra('UnknownChakra');
      expect(days).toEqual([]);
    });

    it('should handle Portuguese number format input', () => {
      const days = getDaysForChakra('1º Básico');
      expect(days).toContain('Segunda-feira');
    });
  });

  describe('DAY_CHAKRA_MAP constant', () => {
    it('should have mappings for all seven days', () => {
      const dayNames = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
      ];
      dayNames.forEach(dayName => {
        expect(DAY_CHAKRA_MAP[dayName as keyof typeof DAY_CHAKRA_MAP]).toBeDefined();
      });
    });

    it('should have proper spiritual meaning for each day', () => {
      const dayNames = Object.keys(DAY_CHAKRA_MAP) as (keyof typeof DAY_CHAKRA_MAP)[];
      dayNames.forEach(dayName => {
        const mapping = DAY_CHAKRA_MAP[dayName];
        expect(mapping.significado_espiritual).toBeDefined();
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should have proper color for each day', () => {
      const dayNames = Object.keys(DAY_CHAKRA_MAP) as (keyof typeof DAY_CHAKRA_MAP)[];
      dayNames.forEach(dayName => {
        const mapping = DAY_CHAKRA_MAP[dayName];
        expect(mapping.cor).toBeDefined();
        expect(typeof mapping.cor).toBe('string');
      });
    });
  });

  describe('Spiritual meaning consistency', () => {
    it('should have throat chakra (Vishuddha) associated with Domingo for communication', () => {
      const domingo = getDayChakra('Domingo');
      expect(domingo?.chakra).toBe('Vishuddha');
      expect(domingo?.significado_espiritual).toContain('comunicação');
      expect(domingo?.palavras_chave).toContain('comunicação');
    });

    it('should have root chakra (Muladhara) associated with Segunda-feira for grounding', () => {
      const segunda = getDayChakra('Segunda-feira');
      expect(segunda?.chakra).toBe('Muladhara');
      expect(segunda?.significado_espiritual).toContain('aterramento');
      expect(segunda?.palavras_chave).toContain('aterramento');
    });

    it('should have crown chakra (Sahasrara) associated with Sexta-feira for spirituality', () => {
      const sexta = getDayChakra('Sexta-feira');
      expect(sexta?.chakra).toBe('Sahasrara');
      expect(sexta?.significado_espiritual).toContain('iluminação');
      expect(sexta?.palavras_chave).toContain('iluminação');
    });
  });
});
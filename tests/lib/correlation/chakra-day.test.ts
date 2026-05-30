/**
 * Chakra-Day Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getChakraDay,
  getDayChakra,
  getAllChakraDays,
  getPrimaryChakraForDay,
  getDaysForChakra,
  CHAKRA_DAY_MAPPINGS,
} from '@/lib/correlation/chakra-day';

describe('Chakra-Day Correlation', () => {
  describe('getChakraDay', () => {
    it('should return Muladhara (1º Básico) for Monday', () => {
      const result = getChakraDay('Muladhara');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Muladhara');
      expect(result[0].dia_semana_pt).toBe('Segunda-feira');
      expect(result[0].dia_semana_en).toBe('Monday');
      expect(result[0].elemento).toBe('Terra');
    });

    it('should return Svadhisthana (2º Sacro) for Tuesday', () => {
      const result = getChakraDay('Svadhisthana');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Svadhisthana');
      expect(result[0].dia_semana_pt).toBe('Terça-feira');
      expect(result[0].dia_semana_en).toBe('Tuesday');
      expect(result[0].elemento).toBe('Água');
    });

    it('should return Manipura (3º Plexo Solar) for Wednesday', () => {
      const result = getChakraDay('Manipura');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Manipura');
      expect(result[0].dia_semana_pt).toBe('Quarta-feira');
      expect(result[0].dia_semana_en).toBe('Wednesday');
      expect(result[0].elemento).toBe('Fogo');
    });

    it('should return Anahata (4º Cardíaco) for Thursday and Saturday', () => {
      const result = getChakraDay('Anahata');
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.map(m => m.dia_semana_pt)).toContain('Quinta-feira');
      expect(result.map(m => m.dia_semana_pt)).toContain('Sábado');
    });

    it('should return Sahasrara (7º Coronário) for Friday', () => {
      const result = getChakraDay('Sahasrara');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Sahasrara');
      expect(result[0].dia_semana_pt).toBe('Sexta-feira');
      expect(result[0].dia_semana_en).toBe('Friday');
      expect(result[0].elemento).toBe('Éter');
    });

    it('should return Vishuddha (5º Laríngeo) for Sunday', () => {
      const result = getChakraDay('Vishuddha');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Vishuddha');
      expect(result[0].dia_semana_pt).toBe('Domingo');
      expect(result[0].dia_semana_en).toBe('Sunday');
      expect(result[0].elemento).toBe('Ar');
    });

    it('should return Ajna (6º Frontal) for Monday and Saturday', () => {
      const result = getChakraDay('Ajna');
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.map(m => m.dia_semana_pt)).toContain('Segunda-feira');
      expect(result.map(m => m.dia_semana_pt)).toContain('Sábado');
    });

    it('should accept chakra number format as input', () => {
      const result = getChakraDay('1º Básico');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Muladhara');
    });

    it('should be case-insensitive', () => {
      const result = getChakraDay('MANIPURA');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Manipura');
    });

    it('should return empty array for unknown chakra', () => {
      const result = getChakraDay('Unknown Chakra');
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('getDayChakra', () => {
    it('should return Monday chakras (Segunda-feira)', () => {
      const result = getDayChakra('Segunda-feira');
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.map(m => m.chakra)).toContain('Muladhara');
      expect(result.map(m => m.chakra)).toContain('Ajna');
    });

    it('should return Tuesday chakra (Terça-feira)', () => {
      const result = getDayChakra('Terça-feira');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Svadhisthana');
    });

    it('should return Wednesday chakra (Quarta-feira)', () => {
      const result = getDayChakra('Quarta-feira');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Manipura');
    });

    it('should return Thursday chakra (Quinta-feira)', () => {
      const result = getDayChakra('Quinta-feira');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Anahata');
    });

    it('should return Friday chakra (Sexta-feira)', () => {
      const result = getDayChakra('Sexta-feira');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Sahasrara');
    });

    it('should return Saturday chakras (Sábado)', () => {
      const result = getDayChakra('Sábado');
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.map(m => m.chakra)).toContain('Anahata');
      expect(result.map(m => m.chakra)).toContain('Ajna');
    });

    it('should return Sunday chakra (Domingo)', () => {
      const result = getDayChakra('Domingo');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Vishuddha');
    });

    it('should handle negative day index', () => {
      const result = getDayChakra(-1);
      // -1 normalized to 6 (Sunday/Domingo)
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Vishuddha');
    });

    it('should handle day index > 6', () => {
      const result = getDayChakra(8);
      // 8 % 7 = 1 (Tuesday/Terça-feira)
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].chakra).toBe('Svadhisthana');
    });

    it('should return empty array for invalid day name', () => {
      const result = getDayChakra('DiaInvalido' as any);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('getAllChakraDays', () => {
    it('should return all chakra-day mappings', () => {
      const result = getAllChakraDays();
      expect(result).toBeDefined();
      expect(result.length).toBe(9); // 9 total: 1(Mon)+1(Tue)+1(Wed)+1(Thu)+1(Fri)+2(Sat)+2(Sun) = 9
    });

    it('should include all seven days', () => {
      const result = getAllChakraDays();
      const days = result.map(m => m.dia_semana_pt);
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
      expect(days).toContain('Domingo');
    });

    it('should include all seven chakras', () => {
      const result = getAllChakraDays();
      const chakras = result.map(m => m.chakra);
      expect(chakras).toContain('Muladhara');
      expect(chakras).toContain('Svadhisthana');
      expect(chakras).toContain('Manipura');
      expect(chakras).toContain('Anahata');
      expect(chakras).toContain('Vishuddha');
      expect(chakras).toContain('Ajna');
      expect(chakras).toContain('Sahasrara');
    });
  });

  describe('getPrimaryChakraForDay', () => {
    it('should return primary chakra for Monday (Segunda-feira)', () => {
      const result = getPrimaryChakraForDay('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.elemento).toBe('Terra');
    });

    it('should return primary chakra for Friday (Sexta-feira)', () => {
      const result = getPrimaryChakraForDay('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.elemento).toBe('Éter');
    });

    it('should return null for invalid day name', () => {
      const result = getPrimaryChakraForDay('DiaInvalido' as any);
      // Invalid day name returns null (no mapping)
      expect(result).toBeNull();
    });
  });

  describe('getDaysForChakra', () => {
    it('should return same as getChakraDay', () => {
      const byName = getChakraDay('Muladhara');
      const byFunc = getDaysForChakra('Muladhara');
      expect(byFunc).toEqual(byName);
    });
  });

  describe('CHAKRA_DAY_MAPPINGS constant', () => {
    it('should have mappings for all seven days', () => {
      const dayNames = [
        'Segunda-feira', // 0
        'Terça-feira',   // 1
        'Quarta-feira', // 2
        'Quinta-feira', // 3
        'Sexta-feira',   // 4
        'Sábado',       // 5
        'Domingo',      // 6
      ];
      dayNames.forEach(dayName => {
        const hasMapping = Object.values(CHAKRA_DAY_MAPPINGS).some(
          mappings => mappings.some(m => m.dia_semana_pt === dayName)
        );
        expect(hasMapping).toBe(true);
      });
    });

    it('should have proper element associations', () => {
      // Segunda-feira (0) - Terra
      const segundaMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Segunda-feira')
      );
      expect(segundaMappings).toBeDefined();
      expect(segundaMappings[0].elemento).toBe('Terra');

      // Terça-feira (1) - Água
      const tercaMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Terça-feira')
      );
      expect(tercaMappings).toBeDefined();
      expect(tercaMappings[0].elemento).toBe('Água');

      // Quarta-feira (2) - Fogo
      const quartaMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Quarta-feira')
      );
      expect(quartaMappings).toBeDefined();
      expect(quartaMappings[0].elemento).toBe('Fogo');

      // Quinta-feira (3) - Ar
      const quintaMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Quinta-feira')
      );
      expect(quintaMappings).toBeDefined();
      expect(quintaMappings[0].elemento).toBe('Ar');

      // Sexta-feira (4) - Éter
      const sextaMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Sexta-feira')
      );
      expect(sextaMappings).toBeDefined();
      expect(sextaMappings[0].elemento).toBe('Éter');

      // Sábado (5) - Ar
      const sabadoMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Sábado')
      );
      expect(sabadoMappings).toBeDefined();
      expect(sabadoMappings[0].elemento).toBe('Ar');

      // Domingo (6) - Ar
      const domingoMappings = Object.values(CHAKRA_DAY_MAPPINGS).find(
        mappings => mappings.some(m => m.dia_semana_pt === 'Domingo')
      );
      expect(domingoMappings).toBeDefined();
      expect(domingoMappings[0].elemento).toBe('Ar');
    });

    it('should have spiritual meaning for each mapping', () => {
      const allMappings = getAllChakraDays();
      allMappings.forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.descricao).toBeDefined();
        expect(mapping.significado_espiritual.qualidade).toBeDefined();
        expect(mapping.significado_espiritual.energia).toBeDefined();
      });
    });

    it('should have ritual practices for each mapping', () => {
      const allMappings = getAllChakraDays();
      allMappings.forEach(mapping => {
        expect(mapping.praticas_rituais).toBeDefined();
        expect(mapping.praticas_rituais.tipo).toBeDefined();
        expect(mapping.praticas_rituais.descricao).toBeDefined();
        expect(mapping.praticas_rituais.elementos).toBeDefined();
      });
    });
  });

  describe('Spiritual meaning consistency', () => {
    it('should have meaningful descriptions for each day-chakra pair', () => {
      const allMappings = getAllChakraDays();
      allMappings.forEach(mapping => {
        expect(mapping.significado_espiritual.descricao.length).toBeGreaterThan(10);
      });
    });

    it('should have proper quality descriptions', () => {
      const allMappings = getAllChakraDays();
      allMappings.forEach(mapping => {
        expect(mapping.significado_espiritual.qualidade.length).toBeGreaterThan(0);
      });
    });

    it('should have ritual practice descriptions', () => {
      const allMappings = getAllChakraDays();
      allMappings.forEach(mapping => {
        expect(mapping.praticas_rituais.descricao.length).toBeGreaterThan(10);
      });
    });

    it('should have ritual elements arrays', () => {
      const allMappings = getAllChakraDays();
      allMappings.forEach(mapping => {
        expect(mapping.praticas_rituais.elementos.length).toBeGreaterThan(0);
      });
    });
  });
});
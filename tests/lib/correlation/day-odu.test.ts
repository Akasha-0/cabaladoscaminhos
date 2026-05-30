/**
 * Day-Odú Ifá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDayOdu,
  getOduDay,
  getAllDayOdus,
  getAllDays,
  hasDayOdu,
  getDayByOduNumber,
  getAllOduNumbers,
  getDaysByOduNumber,
  DAY_ODU_MAPPINGS,
  type DayOduMapping,
} from '@/lib/correlation/day-odu';

describe('Day-Odú Ifá Correlation', () => {
  // ─── getDayOdu: valid days ──────────────────────────────────────────────────

  describe('getDayOdu', () => {
    it('should return Monday (Segunda-feira) with Okaran/Obará', () => {
      const result = getDayOdu('Segunda-feira');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.odu_principal.numero).toBe(1);
      expect(result?.odu_principal.nome).toBe('Okaran');
      expect(result?.odu_secundario?.numero).toBe(6);
      expect(result?.odu_secundario?.nome).toBe('Obará');
      expect(result?.alinhamento_energetico).toBe('Quente / Densa');
    });

    it('should return Tuesday (Terça-feira) with Odi/Ejilsebora', () => {
      const result = getDayOdu('Terça-feira');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.odu_principal.numero).toBe(7);
      expect(result?.odu_principal.nome).toBe('Odi');
      expect(result?.odu_secundario?.numero).toBe(12);
      expect(result?.odu_secundario?.nome).toBe('Ejilsebora');
      expect(result?.alinhamento_energetico).toBe('Quente / Ígnea');
    });

    it('should return Wednesday (Quarta-feira) with Obará/Ejilsebora', () => {
      const result = getDayOdu('Quarta-feira');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.odu_principal.numero).toBe(6);
      expect(result?.odu_principal.nome).toBe('Obará');
      expect(result?.odu_secundario?.numero).toBe(12);
      expect(result?.odu_secundario?.nome).toBe('Ejilsebora');
      expect(result?.alinhamento_energetico).toBe('Quente / Radiante');
    });

    it('should return Thursday (Quinta-feira) with Irosun/Oxé', () => {
      const result = getDayOdu('Quinta-feira');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.odu_principal.numero).toBe(4);
      expect(result?.odu_principal.nome).toBe('Irosun');
      expect(result?.odu_secundario?.numero).toBe(5);
      expect(result?.odu_secundario?.nome).toBe('Oxé');
      expect(result?.alinhamento_energetico).toBe('Fria / Expansiva');
    });

    it('should return Friday (Sexta-feira) with EjiOníle/Alafia', () => {
      const result = getDayOdu('Sexta-feira');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.odu_principal.numero).toBe(8);
      expect(result?.odu_principal.nome).toBe('EjiOníle');
      expect(result?.odu_secundario?.numero).toBe(16);
      expect(result?.odu_secundario?.nome).toBe('Alafia');
      expect(result?.alinhamento_energetico).toBe('Fria / Magnética');
    });

    it('should return Saturday (Sábado) with Oxé/Ossá', () => {
      const result = getDayOdu('Sábado');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Sábado');
      expect(result?.odu_principal.numero).toBe(5);
      expect(result?.odu_principal.nome).toBe('Oxé');
      expect(result?.odu_secundario?.numero).toBe(9);
      expect(result?.odu_secundario?.nome).toBe('Ossá');
      expect(result?.alinhamento_energetico).toBe('Fria / Magnética');
    });

    it('should return Sunday (Domingo) with Obará/EjiOníle', () => {
      const result = getDayOdu('Domingo');
      expect(result).not.toBeNull();
      expect(result?.dia).toBe('Domingo');
      expect(result?.odu_principal.numero).toBe(6);
      expect(result?.odu_principal.nome).toBe('Obará');
      expect(result?.odu_secundario?.numero).toBe(8);
      expect(result?.odu_secundario?.nome).toBe('EjiOníle');
      expect(result?.alinhamento_energetico).toBe('Quente / Radiante');
    });

    it('should return null for invalid day', () => {
      expect(getDayOdu('InvalidDay')).toBeNull();
      expect(getDayOdu('')).toBeNull();
      expect(getDayOdu('Someday')).toBeNull();
    });
  });

  // ─── getOduDay: reverse lookup ────────────────────────────────────────────

  describe('getOduDay', () => {
    it('should return Monday for Okaran', () => {
      expect(getOduDay('Okaran')).toBe('Segunda-feira');
    });

    it('should return Monday for Obará (secondary)', () => {
      expect(getOduDay('Obará')).toBe('Segunda-feira');
    });

    it('should return Tuesday for Odi', () => {
      expect(getOduDay('Odi')).toBe('Terça-feira');
    });

    it('should return Tuesday for Ejilsebora', () => {
      expect(getOduDay('Ejilsebora')).toBe('Terça-feira');
    });

    it('should return Wednesday for Obará', () => {
      expect(getOduDay('Obará')).toBe('Quarta-feira');
    });

    it('should return Thursday for Irosun', () => {
      expect(getOduDay('Irosun')).toBe('Quinta-feira');
    });

    it('should return Thursday for Oxé', () => {
      expect(getOduDay('Oxé')).toBe('Quinta-feira');
    });

    it('should return Friday for EjiOníle', () => {
      expect(getOduDay('EjiOníle')).toBe('Sexta-feira');
    });

    it('should return Friday for Alafia', () => {
      expect(getOduDay('Alafia')).toBe('Sexta-feira');
    });

    it('should return Saturday for Oxé', () => {
      expect(getOduDay('Oxé')).toBe('Sábado');
    });

    it('should return Saturday for Ossá', () => {
      expect(getOduDay('Ossá')).toBe('Sábado');
    });

    it('should return Sunday for Obará', () => {
      expect(getOduDay('Obará')).toBe('Domingo');
    });

    it('should return Sunday for EjiOníle', () => {
      expect(getOduDay('EjiOníle')).toBe('Domingo');
    });

    it('should return null for unknown Odu', () => {
      expect(getOduDay('UnknownOdu')).toBeNull();
      expect(getOduDay('')).toBeNull();
    });
  });

  // ─── getAllDayOdus ─────────────────────────────────────────────────────────

  describe('getAllDayOdus', () => {
    it('should return all 7 day mappings', () => {
      const result = getAllDayOdus();
      expect(result).toHaveLength(7);
    });

    it('should include all required properties for each mapping', () => {
      const result = getAllDayOdus();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('odu_principal');
        expect(mapping).toHaveProperty('odu_principal.numero');
        expect(mapping).toHaveProperty('odu_principal.nome');
        expect(mapping).toHaveProperty('alinhamento_energetico');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('associacoes_rituais');
        expect(mapping).toHaveProperty('associacoes_rituais.ebos');
        expect(mapping).toHaveProperty('associacoes_rituais.elementos');
        expect(mapping).toHaveProperty('associacoes_rituais.direcoes');
        expect(mapping).toHaveProperty('associacoes_rituais.cores');
        expect(mapping).toHaveProperty('associacoes_rituais.orixas_relacionados');
      }
    });

    it('should have valid Odu numbers (1-16)', () => {
      const result = getAllDayOdus();
      for (const mapping of result) {
        expect(mapping.odu_principal.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.odu_principal.numero).toBeLessThanOrEqual(16);
        if (mapping.odu_secundario) {
          expect(mapping.odu_secundario.numero).toBeGreaterThanOrEqual(1);
          expect(mapping.odu_secundario.numero).toBeLessThanOrEqual(16);
        }
      }
    });
  });

  // ─── getAllDays ────────────────────────────────────────────────────────────

  describe('getAllDays', () => {
    it('should return all 7 days', () => {
      const result = getAllDays();
      expect(result).toHaveLength(7);
    });

    it('should contain all days of the week in Portuguese', () => {
      const result = getAllDays();
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quarta-feira');
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
      expect(result).toContain('Domingo');
    });
  });

  // ─── hasDayOdu ─────────────────────────────────────────────────────────────

  describe('hasDayOdu', () => {
    it('should return true for valid days', () => {
      expect(hasDayOdu('Segunda-feira')).toBe(true);
      expect(hasDayOdu('Terça-feira')).toBe(true);
      expect(hasDayOdu('Quarta-feira')).toBe(true);
      expect(hasDayOdu('Quinta-feira')).toBe(true);
      expect(hasDayOdu('Sexta-feira')).toBe(true);
      expect(hasDayOdu('Sábado')).toBe(true);
      expect(hasDayOdu('Domingo')).toBe(true);
    });

    it('should return false for invalid days', () => {
      expect(hasDayOdu('InvalidDay')).toBe(false);
      expect(hasDayOdu('')).toBe(false);
    });
  });

  // ─── getDayByOduNumber ─────────────────────────────────────────────────────

  describe('getDayByOduNumber', () => {
    it('should return Segunda-feira for Odu number 1 (Okaran)', () => {
      const result = getDayByOduNumber(1);
      expect(result?.dia).toBe('Segunda-feira');
    });

    it('should return Terça-feira for Odu number 7 (Odi)', () => {
      const result = getDayByOduNumber(7);
      expect(result?.dia).toBe('Terça-feira');
    });

    it('should return Quarta-feira for Odu number 6 (Obará)', () => {
      const result = getDayByOduNumber(6);
      expect(result?.dia).toBe('Quarta-feira');
    });

    it('should return Quinta-feira for Odu number 4 (Irosun)', () => {
      const result = getDayByOduNumber(4);
      expect(result?.dia).toBe('Quinta-feira');
    });

    it('should return Sexta-feira for Odu number 8 (EjiOníle)', () => {
      const result = getDayByOduNumber(8);
      expect(result?.dia).toBe('Sexta-feira');
    });

    it('should return Sexta-feira for Odu number 16 (Alafia)', () => {
      const result = getDayByOduNumber(16);
      expect(result?.dia).toBe('Sexta-feira');
    });

    it('should return Sábado for Odu number 5 (Oxé)', () => {
      const result = getDayByOduNumber(5);
      expect(result?.dia).toBe('Sábado');
    });

    it('should return null for Odu number not in mapping', () => {
      expect(getDayByOduNumber(99)).toBeNull();
    });
  });

  // ─── getAllOduNumbers ──────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return unique Odu numbers sorted', () => {
      const result = getAllOduNumbers();
      expect(result).toEqual([1, 4, 5, 6, 7, 8, 9, 12, 16]);
      expect(result).toEqual([...result].sort((a, b) => a - b));
    });

    it('should have 9 unique Odu numbers for 7 days', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(9);
    });
  });

  // ─── getDaysByOduNumber ────────────────────────────────────────────────────

  describe('getDaysByOduNumber', () => {
    it('should return Segunda-feira for Odu number 1', () => {
      const result = getDaysByOduNumber(1);
      expect(result).toContain('Segunda-feira');
    });

    it('should return both Quinta-feira and Sábado for Odu number 5 (Oxé)', () => {
      const result = getDaysByOduNumber(5);
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sábado');
    });

    it('should return empty array for unknown Odu number', () => {
      const result = getDaysByOduNumber(99);
      expect(result).toHaveLength(0);
    });
  });

  // ─── DAY_ODU_MAPPINGS constant ─────────────────────────────────────────────

  describe('DAY_ODU_MAPPINGS', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(DAY_ODU_MAPPINGS)).toBe(true);
    });

    it('should have 7 day entries', () => {
      expect(Object.keys(DAY_ODU_MAPPINGS)).toHaveLength(7);
    });

    it('should have non-empty spiritual significance for all days', () => {
      for (const mapping of Object.values(DAY_ODU_MAPPINGS)) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('should have at least one ebo for each day', () => {
      for (const mapping of Object.values(DAY_ODU_MAPPINGS)) {
        expect(mapping.associacoes_rituais.ebos.length).toBeGreaterThan(0);
      }
    });

    it('should have associated Orixás for each day', () => {
      for (const mapping of Object.values(DAY_ODU_MAPPINGS)) {
        expect(mapping.associacoes_rituais.orixas_relacionados.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Interface completeness ────────────────────────────────────────────────

  describe('DayOduMapping interface completeness', () => {
    it('should have all required properties', () => {
      const mapping = getDayOdu('Segunda-feira');
      expect(mapping).toHaveProperty('dia');
      expect(mapping).toHaveProperty('odu_principal');
      expect(mapping).toHaveProperty('odu_principal.numero');
      expect(mapping).toHaveProperty('odu_principal.nome');
      expect(mapping).toHaveProperty('odu_secundario');
      expect(mapping).toHaveProperty('alinhamento_energetico');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('associacoes_rituais');
    });

    it('should have valid alinhamento_energetico values', () => {
      const result = getAllDayOdus();
      const validAlignments = ['Quente / Densa', 'Quente / Ígnea', 'Quente / Radiante', 'Fria / Expansiva', 'Fria / Magnética'];
      for (const mapping of result) {
        expect(validAlignments).toContain(mapping.alinhamento_energetico);
      }
    });
  });

  // ─── Default export ────────────────────────────────────────────────────────

  describe('default export', () => {
    it('should export all required functions', async () => {
      const module = await import('@/lib/correlation/day-odu');
      expect(module.default).toBeDefined();
      expect(typeof module.default.getDayOdu).toBe('function');
      expect(typeof module.default.getOduDay).toBe('function');
      expect(typeof module.default.getAllDayOdus).toBe('function');
      expect(typeof module.default.getAllDays).toBe('function');
      expect(typeof module.default.hasDayOdu).toBe('function');
      expect(typeof module.default.getDayByOduNumber).toBe('function');
      expect(typeof module.default.getAllOduNumbers).toBe('function');
      expect(typeof module.default.getDaysByOduNumber).toBe('function');
      expect(module.default.DAY_ODU_MAPPINGS).toBeDefined();
    });
  });
});
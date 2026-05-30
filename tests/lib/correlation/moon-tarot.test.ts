import { describe, it, expect } from 'vitest';
import {
  getMoonTarot,
  getTarotMoon,
  getArcanoByPhase,
  getCardNumberByPhase,
  getPhaseByNumber,
  getAllMoonTarots,
  getAvailablePhases,
  getAllArcanos,
  getElementByPhase,
  getSpiritualMeaning,
  hasMoonTarot,
  getConexaoByPhase,
  getRitualByPhase,
  MOON_TAROT_MAPPINGS,
} from '@/lib/correlation/moon-tarot';

describe('Moon-Tarot Correlation', () => {
  // ─── getMoonTarot ─────────────────────────────────────────────────────────────
  describe('getMoonTarot', () => {
    it('should return complete mapping for lua-nova', () => {
      const mapping = getMoonTarot('lua-nova');
      expect(mapping).not.toBeNull();
      expect(mapping?.fase).toBe('lua-nova');
      expect(mapping?.nome_fase).toBe('Lua Nova');
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.elemento_primario).toBe('Éter');
    });

    it('should return complete mapping for lua-cheia', () => {
      const mapping = getMoonTarot('lua-cheia');
      expect(mapping).not.toBeNull();
      expect(mapping?.fase).toBe('lua-cheia');
      expect(mapping?.nome_fase).toBe('Lua Cheia');
      expect(mapping?.arcano).toBe('A Lua');
      expect(mapping?.numero_carta).toBe(18);
      expect(mapping?.elemento_primario).toBe('Água');
    });

    it('should return complete mapping for lua-velha', () => {
      const mapping = getMoonTarot('lua-velha');
      expect(mapping).not.toBeNull();
      expect(mapping?.fase).toBe('lua-velha');
      expect(mapping?.nome_fase).toBe('Lua Velha');
      expect(mapping?.arcano).toBe('A Morte');
      expect(mapping?.numero_carta).toBe(13);
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonTarot('LUA-NOVA');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
      const mapping = getMoonTarot('LUA-CHEIA');
      expect(mapping).not.toBeNull();
      expect(mapping?.fase).toBe('lua-cheia');
    });

    it('should return null for invalid phase', () => {
      expect(getMoonTarot('invalid-phase')).toBeNull();
      expect(getMoonTarot('')).toBeNull();
    });

    it('should include all required properties', () => {
      const mapping = getMoonTarot('lua-crescente');
      expect(mapping).toHaveProperty('fase');
      expect(mapping).toHaveProperty('nome_fase');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('elemento_primario');
      expect(mapping).toHaveProperty('elementos_secundarios');
      expect(mapping).toHaveProperty('conexao');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('ritual');
    });

    it('should have valid ritual properties', () => {
      const mapping = getMoonTarot('lua-nova');
      expect(mapping?.ritual).toHaveProperty('meditacao');
      expect(mapping?.ritual).toHaveProperty('rituais');
      expect(mapping?.ritual).toHaveProperty('cores');
      expect(mapping?.ritual).toHaveProperty('cristais');
      expect(Array.isArray(mapping?.ritual.meditacao)).toBe(true);
      expect(Array.isArray(mapping?.ritual.rituais)).toBe(true);
      expect(Array.isArray(mapping?.ritual.cores)).toBe(true);
      expect(Array.isArray(mapping?.ritual.cristais)).toBe(true);
    });
  });

  // ─── getTarotMoon ────────────────────────────────────────────────────────────
  describe('getTarotMoon', () => {
    it('should return lua-nova for O Louco', () => {
      expect(getTarotMoon('O Louco')).toBe('lua-nova');
    });

    it('should return lua-cheia for A Lua', () => {
      expect(getTarotMoon('A Lua')).toBe('lua-cheia');
    });

    it('should return lua-velha for A Morte', () => {
      expect(getTarotMoon('A Morte')).toBe('lua-velha');
    });

    it('should return lua-crescente for A Sacerdotisa', () => {
      expect(getTarotMoon('A Sacerdotisa')).toBe('lua-crescente');
    });

    it('should return quarto-crescente for O Carro', () => {
      expect(getTarotMoon('O Carro')).toBe('quarto-crescente');
    });

    it('should return quarto-minguante for A Torre', () => {
      expect(getTarotMoon('A Torre')).toBe('quarto-minguante');
    });

    it('should return lua-minguante for A Justiça', () => {
      expect(getTarotMoon('A Justiça')).toBe('lua-minguante');
    });

    it('should return quarto-descrescente for O Eremita', () => {
      expect(getTarotMoon('O Eremita')).toBe('quarto-descrescente');
    });

    it('should handle whitespace variations', () => {
      expect(getTarotMoon('O Louco ')).toBe('lua-nova');
      expect(getTarotMoon(' O Louco')).toBe('lua-nova');
    });

    it('should return null for invalid arcano', () => {
      expect(getTarotMoon('Invalid Arcano')).toBeNull();
      expect(getTarotMoon('')).toBeNull();
    });
  });

  // ─── getArcanoByPhase ────────────────────────────────────────────────────────
  describe('getArcanoByPhase', () => {
    it('should return arcano for each phase', () => {
      expect(getArcanoByPhase('lua-nova')).toBe('O Louco');
      expect(getArcanoByPhase('lua-crescente')).toBe('A Sacerdotisa');
      expect(getArcanoByPhase('quarto-crescente')).toBe('O Carro');
      expect(getArcanoByPhase('lua-cheia')).toBe('A Lua');
      expect(getArcanoByPhase('quarto-minguante')).toBe('A Torre');
      expect(getArcanoByPhase('lua-minguante')).toBe('A Justiça');
      expect(getArcanoByPhase('quarto-descrescente')).toBe('O Eremita');
      expect(getArcanoByPhase('lua-velha')).toBe('A Morte');
    });

    it('should return null for invalid phase', () => {
      expect(getArcanoByPhase('invalid')).toBeNull();
    });
  });

  // ─── getCardNumberByPhase ───────────────────────────────────────────────────
  describe('getCardNumberByPhase', () => {
    it('should return correct card numbers', () => {
      expect(getCardNumberByPhase('lua-nova')).toBe(0);
      expect(getCardNumberByPhase('lua-crescente')).toBe(2);
      expect(getCardNumberByPhase('quarto-crescente')).toBe(7);
      expect(getCardNumberByPhase('lua-cheia')).toBe(18);
      expect(getCardNumberByPhase('quarto-minguante')).toBe(16);
      expect(getCardNumberByPhase('lua-minguante')).toBe(11);
      expect(getCardNumberByPhase('quarto-descrescente')).toBe(9);
      expect(getCardNumberByPhase('lua-velha')).toBe(13);
    });

    it('should return null for invalid phase', () => {
      expect(getCardNumberByPhase('invalid')).toBeNull();
    });
  });

  // ─── getPhaseByNumber ───────────────────────────────────────────────────────
  describe('getPhaseByNumber', () => {
    it('should return phase for each card number', () => {
      expect(getPhaseByNumber(0)).toBe('lua-nova');
      expect(getPhaseByNumber(2)).toBe('lua-crescente');
      expect(getPhaseByNumber(7)).toBe('quarto-crescente');
      expect(getPhaseByNumber(18)).toBe('lua-cheia');
      expect(getPhaseByNumber(16)).toBe('quarto-minguante');
      expect(getPhaseByNumber(11)).toBe('lua-minguante');
      expect(getPhaseByNumber(9)).toBe('quarto-descrescente');
      expect(getPhaseByNumber(13)).toBe('lua-velha');
    });

    it('should return null for invalid number', () => {
      expect(getPhaseByNumber(99)).toBeNull();
      expect(getPhaseByNumber(-1)).toBeNull();
    });
  });

  // ─── getAllMoonTarots ───────────────────────────────────────────────────────
  describe('getAllMoonTarots', () => {
    it('should return array of all mappings', () => {
      const all = getAllMoonTarots();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(8);
    });

    it('should return all required phases', () => {
      const all = getAllMoonTarots();
      const phases = all.map((m) => m.fase);
      expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('quarto-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('quarto-minguante');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
    });

    it('should have unique phases', () => {
      const all = getAllMoonTarots();
      const phases = all.map((m) => m.fase);
      const uniquePhases = new Set(phases);
      expect(uniquePhases.size).toBe(phases.length);
    });

    it('should have unique arcanos', () => {
      const all = getAllMoonTarots();
      const arcanos = all.map((m) => m.arcano);
      const uniqueArcanos = new Set(arcanos);
      expect(uniqueArcanos.size).toBe(arcanos.length);
    });

    it('should have all arcano numbers from 0-18 range', () => {
      const all = getAllMoonTarots();
      const numbers = all.map((m) => m.numero_carta).sort((a, b) => a - b);
      expect(numbers).toEqual([0, 2, 7, 9, 11, 13, 16, 18]);
    });
  });

  // ─── getAvailablePhases ─────────────────────────────────────────────────────
  describe('getAvailablePhases', () => {
    it('should return all 8 phases', () => {
      const phases = getAvailablePhases();
      expect(phases.length).toBe(8);
    });

    it('should return FaseLua type values', () => {
      const phases = getAvailablePhases();
      const expectedPhases: FaseLua[] = [
        'lua-nova',
        'lua-crescente',
        'quarto-crescente',
        'lua-cheia',
        'quarto-minguante',
        'lua-minguante',
        'quarto-descrescente',
        'lua-velha',
      ];
      expect(phases).toEqual(expectedPhases);
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────
  describe('getAllArcanos', () => {
    it('should return all 8 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos.length).toBe(8);
    });

    it('should contain expected arcanos', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('A Morte');
    });

    it('should have unique values', () => {
      const arcanos = getAllArcanos();
      const unique = new Set(arcanos);
      expect(unique.size).toBe(arcanos.length);
    });
  });

  // ─── getElementByPhase ──────────────────────────────────────────────────────
  describe('getElementByPhase', () => {
    it('should return element for valid phases', () => {
      expect(getElementByPhase('lua-nova')).toBe('Éter');
      expect(getElementByPhase('lua-crescente')).toBe('Água');
      expect(getElementByPhase('quarto-crescente')).toBe('Fogo');
      expect(getElementByPhase('lua-cheia')).toBe('Água');
      expect(getElementByPhase('quarto-minguante')).toBe('Fogo');
      expect(getElementByPhase('lua-minguante')).toBe('Ar');
      expect(getElementByPhase('quarto-descrescente')).toBe('Terra');
      expect(getElementByPhase('lua-velha')).toBe('Água');
    });

    it('should return null for invalid phase', () => {
      expect(getElementByPhase('invalid')).toBeNull();
    });
  });

  // ─── getSpiritualMeaning ────────────────────────────────────────────────────
  describe('getSpiritualMeaning', () => {
    it('should return spiritual meaning for valid phases', () => {
      const meaning = getSpiritualMeaning('lua-nova');
      expect(meaning).not.toBeNull();
      expect(typeof meaning).toBe('string');
      expect(meaning!.length).toBeGreaterThan(10);
    });

    it('should return null for invalid phase', () => {
      expect(getSpiritualMeaning('invalid')).toBeNull();
    });

    it('should contain meaningful spiritual content', () => {
      const meaning = getSpiritualMeaning('lua-cheia');
      expect(meaning!.toLowerCase()).toContain('ilus');
      expect(meaning!.toLowerCase()).toContain('inconsciente');
    });
  });

  // ─── hasMoonTarot ───────────────────────────────────────────────────────────
  describe('hasMoonTarot', () => {
    it('should return true for valid phases', () => {
      expect(hasMoonTarot('lua-nova')).toBe(true);
      expect(hasMoonTarot('lua-cheia')).toBe(true);
      expect(hasMoonTarot('lua-velha')).toBe(true);
    });

    it('should return false for invalid phases', () => {
      expect(hasMoonTarot('invalid')).toBe(false);
      expect(hasMoonTarot('')).toBe(false);
    });
  });

  // ─── getConexaoByPhase ──────────────────────────────────────────────────────
  describe('getConexaoByPhase', () => {
    it('should return connection description for valid phases', () => {
      const conexao = getConexaoByPhase('lua-nova');
      expect(conexao).not.toBeNull();
      expect(typeof conexao).toBe('string');
      expect(conexao!.length).toBeGreaterThan(20);
    });

    it('should return null for invalid phase', () => {
      expect(getConexaoByPhase('invalid')).toBeNull();
    });
  });

  // ─── getRitualByPhase ──────────────────────────────────────────────────────
  describe('getRitualByPhase', () => {
    it('should return ritual guidance for valid phases', () => {
      const ritual = getRitualByPhase('lua-nova');
      expect(ritual).not.toBeNull();
      expect(ritual).toHaveProperty('meditacao');
      expect(ritual).toHaveProperty('rituais');
      expect(ritual).toHaveProperty('cores');
      expect(ritual).toHaveProperty('cristais');
    });

    it('should return null for invalid phase', () => {
      expect(getRitualByPhase('invalid')).toBeNull();
    });

    it('should have arrays with content', () => {
      const ritual = getRitualByPhase('lua-cheia');
      expect(ritual!.meditacao.length).toBeGreaterThan(0);
      expect(ritual!.rituais.length).toBeGreaterThan(0);
      expect(ritual!.cores.length).toBeGreaterThan(0);
      expect(ritual!.cristais.length).toBeGreaterThan(0);
    });
  });

  // ─── MOON_TAROT_MAPPINGS Structure ─────────────────────────────────────────
  describe('MOON_TAROT_MAPPINGS structure', () => {
    it('should have all 8 phases defined', () => {
      expect(Object.keys(MOON_TAROT_MAPPINGS).length).toBe(8);
    });

    it('should have valid phase names', () => {
      const phases = Object.keys(MOON_TAROT_MAPPINGS);
      phases.forEach((fase) => {
        expect(fase).toMatch(/^(lua|quarto)/);
      });
    });

    it('should have valid card numbers (0-21 range)', () => {
      const mappings = Object.values(MOON_TAROT_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });

    it('should have valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter', 'Lua'];
      const mappings = Object.values(MOON_TAROT_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento_primario);
        mapping.elementos_secundarios.forEach((elem) => {
          expect(validElements).toContain(elem);
        });
      });
    });

    it('should have valid nome_fase values', () => {
      const mappings = Object.values(MOON_TAROT_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(mapping.nome_fase.length).toBeGreaterThan(3);
        expect(mapping.nome_fase).toMatch(/(Lua|Quarto)/);
      });
    });

    it('should have espiritual meaning with adequate length', () => {
      const mappings = Object.values(MOON_TAROT_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(50);
      });
    });

    it('should have conexao descriptions with adequate length', () => {
      const mappings = Object.values(MOON_TAROT_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(mapping.conexao.length).toBeGreaterThan(30);
      });
    });
  });

  // ─── Round-trip consistency ─────────────────────────────────────────────────
  describe('Round-trip consistency', () => {
    it('should return consistent results for phase to arcano and back', () => {
      const phases = getAvailablePhases();
      phases.forEach((fase) => {
        const mapping = getMoonTarot(fase);
        expect(mapping).not.toBeNull();
        const reversePhase = getTarotMoon(mapping!.arcano);
        expect(reversePhase).toBe(fase);
      });
    });

    it('should return consistent results for arcano to phase and back', () => {
      const arcanos = getAllArcanos();
      arcanos.forEach((arcano) => {
        const phase = getTarotMoon(arcano);
        expect(phase).not.toBeNull();
        const reverseArcano = getArcanoByPhase(phase!);
        expect(reverseArcano).toBe(arcano);
      });
    });
  });

  // ─── Moon Phase Cycle Integrity ────────────────────────────────────────────
  describe('Moon phase cycle integrity', () => {
    it('should follow the lunar cycle order', () => {
      const phases = getAvailablePhases();
      const expectedOrder = [
        'lua-nova',
        'lua-crescente',
        'quarto-crescente',
        'lua-cheia',
        'quarto-minguante',
        'lua-minguante',
        'quarto-descrescente',
        'lua-velha',
      ];
      expect(phases).toEqual(expectedOrder);
    });

    it('should have growing energy from nova to cheia', () => {
      const newMoon = getMoonTarot('lua-nova');
      const crescent = getMoonTarot('lua-crescente');
      const quarter = getMoonTarot('quarto-crescente');
      const full = getMoonTarot('lua-cheia');

      expect(newMoon!.numero_carta).toBe(0);
      expect(crescent!.numero_carta).toBe(2);
      expect(quarter!.numero_carta).toBe(7);
      expect(full!.numero_carta).toBe(18);
    });

    it('should have declining energy from cheia to old', () => {
      const full = getMoonTarot('lua-cheia');
      const quarterDown = getMoonTarot('quarto-minguante');
      const waning = getMoonTarot('lua-minguante');
      const lastQuarter = getMoonTarot('quarto-descrescente');
      const old = getMoonTarot('lua-velha');

      expect(full!.numero_carta).toBe(18);
      expect(quarterDown!.numero_carta).toBe(16);
      expect(waning!.numero_carta).toBe(11);
      expect(lastQuarter!.numero_carta).toBe(9);
      expect(old!.numero_carta).toBe(13);
    });
  });

  // ─── Element Distribution ───────────────────────────────────────────────────
  describe('Element distribution', () => {
    it('should have primary element for each phase', () => {
      const all = getAllMoonTarots();
      all.forEach((mapping) => {
        expect(mapping.elemento_primario).toBeTruthy();
      });
    });

    it('should have secondary elements for each phase', () => {
      const all = getAllMoonTarots();
      all.forEach((mapping) => {
        expect(Array.isArray(mapping.elementos_secundarios)).toBe(true);
        expect(mapping.elementos_secundarios.length).toBeGreaterThan(0);
      });
    });

    it('should have diverse element distribution', () => {
      const all = getAllMoonTarots();
      const primaryElements = all.map((m) => m.elemento_primario);
      const uniqueElements = new Set(primaryElements);
      expect(uniqueElements.size).toBeGreaterThanOrEqual(4);
    });
  });

  // ─── Ritual Completeness ────────────────────────────────────────────────────
  describe('Ritual completeness', () => {
    it('should have meditation practices for all phases', () => {
      const all = getAllMoonTarots();
      all.forEach((mapping) => {
        expect(mapping.ritual.meditacao.length).toBeGreaterThan(0);
      });
    });

    it('should have rituals for all phases', () => {
      const all = getAllMoonTarots();
      all.forEach((mapping) => {
        expect(mapping.ritual.rituais.length).toBeGreaterThan(0);
      });
    });

    it('should have colors for all phases', () => {
      const all = getAllMoonTarots();
      all.forEach((mapping) => {
        expect(mapping.ritual.cores.length).toBeGreaterThan(0);
      });
    });

    it('should have crystals for all phases', () => {
      const all = getAllMoonTarots();
      all.forEach((mapping) => {
        expect(mapping.ritual.cristais.length).toBeGreaterThan(0);
      });
    });
  });
});
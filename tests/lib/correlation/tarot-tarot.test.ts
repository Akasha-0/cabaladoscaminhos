import { describe, it, expect } from 'vitest';
import {
  getTarotTarotByNumber,
  getTarotTarotByArcano,
  getAllTarotTarots,
  hasTarotTarot,
  getTarotTarotByElement,
  getTarotTarotByOrixa,
  getTarotTarotBySephirah,
  getTarotTarotByChakra,
  getComplementaryArcano,
  getAmplifiedArcano,
  getShadowArcano,
  getAllArcanos,
  getAllArcanoNumbers,
  TAROT_TAROT_MAP,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarotByNumber: valid numbers ─────────────────────────────────────

  describe('getTarotTarotByNumber', () => {
    it('returns mapping for card 0 (O Louco)', () => {
      const result = getTarotTarotByNumber(0);
      expect(result.arcano).toBe('O Louco');
      expect(result.numero_carta).toBe(0);
      expect(result.elemento).toBe('Ar');
    });

    it('returns mapping for card 1 (O Mago)', () => {
      const result = getTarotTarotByNumber(1);
      expect(result.arcano).toBe('O Mago');
      expect(result.numero_carta).toBe(1);
    });

    it('returns mapping for card 21 (O Mundo)', () => {
      const result = getTarotTarotByNumber(21);
      expect(result.arcano).toBe('O Mundo');
      expect(result.numero_carta).toBe(21);
      expect(result.elemento).toBe('Terra');
    });

    it('throws for number -1', () => {
      expect(() => getTarotTarotByNumber(-1)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });

    it('throws for number 22', () => {
      expect(() => getTarotTarotByNumber(22)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });

    it('throws for non-integer numbers', () => {
      expect(() => getTarotTarotByNumber(5.5)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });
  });

  // ─── getTarotTarotByArcano ───────────────────────────────────────────────────

  describe('getTarotTarotByArcano', () => {
    it('returns mapping for O Louco', () => {
      const result = getTarotTarotByArcano('O Louco');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(0);
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotTarotByArcano('O Mago');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(1);
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotTarotByArcano('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(21);
    });

    it('returns null for non-existent arcano', () => {
      expect(getTarotTarotByArcano('Non Existent Card')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getTarotTarotByArcano('o louco')).not.toBeNull();
      expect(getTarotTarotByArcano('O LOUCO')).not.toBeNull();
      expect(getTarotTarotByArcano('O Louco')).not.toBeNull();
    });
  });

  // ─── getAllTarotTarots ────────────────────────────────────────────────────────

  describe('getAllTarotTarots', () => {
    it('returns array with all 22 mappings', () => {
      const results = getAllTarotTarots();
      expect(results).toHaveLength(22);
    });

    it('returns mappings sorted by numero_carta', () => {
      const results = getAllTarotTarots();
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].numero_carta).toBeLessThan(results[i + 1].numero_carta);
      }
    });

    it('includes first and last arcano', () => {
      const results = getAllTarotTarots();
      const arcanoNames = results.map((r) => r.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('each mapping has all required fields', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('energia_oposta');
        expect(mapping).toHaveProperty('energia_amplificada');
        expect(mapping).toHaveProperty('sombra_integrada');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('arquétipo');
        expect(mapping).toHaveProperty('orixá');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('lição_espiritual');
        expect(mapping).toHaveProperty('afirmação');
        expect(mapping).toHaveProperty('palavras_chave');
      }
    });
  });

  // ─── hasTarotTarot ───────────────────────────────────────────────────────────

  describe('hasTarotTarot', () => {
    it('returns true for valid numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(hasTarotTarot(i)).toBe(true);
      }
    });

    it('returns false for number -1', () => {
      expect(hasTarotTarot(-1)).toBe(false);
    });

    it('returns false for number 22', () => {
      expect(hasTarotTarot(22)).toBe(false);
    });

    it('returns false for number 100', () => {
      expect(hasTarotTarot(100)).toBe(false);
    });
  });

  // ─── getTarotTarotByElement ───────────────────────────────────────────────────

  describe('getTarotTarotByElement', () => {
    it('returns mappings for Água element', () => {
      const results = getTarotTarotByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Água')).toBe(true);
    });

    it('returns mappings for Terra element', () => {
      const results = getTarotTarotByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Terra')).toBe(true);
    });

    it('returns mappings for Fogo element', () => {
      const results = getTarotTarotByElement('Fogo');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Fogo')).toBe(true);
    });

    it('returns mappings for Ar element', () => {
      const results = getTarotTarotByElement('Ar');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Ar')).toBe(true);
    });

    it('returns empty array for non-existent element', () => {
      const results = getTarotTarotByElement('Non Existent');
      expect(results).toHaveLength(0);
    });
  });

  // ─── getTarotTarotByOrixa ─────────────────────────────────────────────────────

  describe('getTarotTarotByOrixa', () => {
    it('returns mappings for Iemanjá', () => {
      const results = getTarotTarotByOrixa('Iemanjá');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.orixá.toLowerCase().includes('iemanjá'))).toBe(true);
    });

    it('returns mappings for Ogum', () => {
      const results = getTarotTarotByOrixa('Ogum');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns mappings for Oxalá', () => {
      const results = getTarotTarotByOrixa('Oxalá');
      expect(results.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const upper = getTarotTarotByOrixa('OXUM');
      const lower = getTarotTarotByOrixa('oxum');
      expect(upper.length).toBe(lower.length);
    });

    it('returns empty array for non-existent orixá', () => {
      const results = getTarotTarotByOrixa('Non Existent');
      expect(results).toHaveLength(0);
    });
  });

  // ─── getTarotTarotBySephirah ─────────────────────────────────────────────────

  describe('getTarotTarotBySephirah', () => {
    it('returns mappings for Tiphereth', () => {
      const results = getTarotTarotBySephirah('Tiphereth');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.sephirah.toLowerCase() === 'tiphereth')).toBe(true);
    });

    it('returns mappings for Malkuth', () => {
      const results = getTarotTarotBySephirah('Malkuth');
      expect(results.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const upper = getTarotTarotBySephirah('TIPHERETH');
      const lower = getTarotTarotBySephirah('tiphereth');
      expect(upper.length).toBe(lower.length);
    });

    it('returns empty array for non-existent sephirah', () => {
      const results = getTarotTarotBySephirah('Non Existent');
      expect(results).toHaveLength(0);
    });
  });

  // ─── getTarotTarotByChakra ────────────────────────────────────────────────────

  describe('getTarotTarotByChakra', () => {
    it('returns mappings for 4º Cardíaco', () => {
      const results = getTarotTarotByChakra('4º Cardíaco');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.chakra.includes('Cardíaco'))).toBe(true);
    });

    it('returns mappings for 7º Coronário', () => {
      const results = getTarotTarotByChakra('7º Coronário');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns mappings by partial match', () => {
      const results = getTarotTarotByChakra('Coronário');
      expect(results.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const upper = getTarotTarotByChakra('CARDÍACO');
      const lower = getTarotTarotByChakra('cardíaco');
      expect(upper.length).toBe(lower.length);
    });

    it('returns empty array for non-existent chakra', () => {
      const results = getTarotTarotByChakra('Non Existent');
      expect(results).toHaveLength(0);
    });
  });

  // ─── getComplementaryArcano ──────────────────────────────────────────────────

  describe('getComplementaryArcano', () => {
    it('returns complementary arcano for O Louco', () => {
      const result = getComplementaryArcano(0);
      expect(result.arcano).toBe('O Mundo');
      expect(result.numero_carta).toBe(21);
      expect(result.razão).toBeTruthy();
    });

    it('returns complementary arcano for O Mago', () => {
      const result = getComplementaryArcano(1);
      expect(result.arcano).toBe('A Alta Sacerdotisa');
      expect(result.numero_carta).toBe(2);
    });

    it('returns complementary arcano for O Mundo', () => {
      const result = getComplementaryArcano(21);
      expect(result.arcano).toBe('O Louco');
      expect(result.numero_carta).toBe(0);
    });
  });

  // ─── getAmplifiedArcano ──────────────────────────────────────────────────────

  describe('getAmplifiedArcano', () => {
    it('returns amplified arcano for O Louco', () => {
      const result = getAmplifiedArcano(0);
      expect(result.arcano).toBe('O Mago');
      expect(result.numero_carta).toBe(1);
      expect(result.razão).toBeTruthy();
    });

    it('returns amplified arcano for O Mago', () => {
      const result = getAmplifiedArcano(1);
      expect(result.arcano).toBe('A Imperatriz');
      expect(result.numero_carta).toBe(2);
    });

    it('returns amplified arcano for O Mundo', () => {
      const result = getAmplifiedArcano(21);
      expect(result.arcano).toBe('A Roda da Fortuna');
      expect(result.numero_carta).toBe(10);
    });
  });

  // ─── getShadowArcano ─────────────────────────────────────────────────────────

  describe('getShadowArcano', () => {
    it('returns shadow arcano for O Louco', () => {
      const result = getShadowArcano(0);
      expect(result.arcano).toBe('A Torre');
      expect(result.numero_carta).toBe(16);
      expect(result.razão).toBeTruthy();
    });

    it('returns shadow arcano for O Mago', () => {
      const result = getShadowArcano(1);
      expect(result.arcano).toBe('O Diabo');
      expect(result.numero_carta).toBe(15);
    });

    it('returns shadow arcano for O Mundo', () => {
      const result = getShadowArcano(21);
      expect(result.arcano).toBe('O Eremita');
      expect(result.numero_carta).toBe(9);
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array with all 22 arcano names', () => {
      const results = getAllArcanos();
      expect(results).toHaveLength(22);
    });

    it('includes expected arcano names', () => {
      const results = getAllArcanos();
      expect(results).toContain('O Louco');
      expect(results).toContain('O Mago');
      expect(results).toContain('A Imperatriz');
      expect(results).toContain('O Mundo');
    });

    it('is sorted by card number', () => {
      const results = getAllArcanos();
      expect(results[0]).toBe('O Louco');
      expect(results[21]).toBe('O Mundo');
    });
  });

  // ─── getAllArcanoNumbers ─────────────────────────────────────────────────────

  describe('getAllArcanoNumbers', () => {
    it('returns array with numbers 0-21', () => {
      const results = getAllArcanoNumbers();
      expect(results).toHaveLength(22);
    });

    it('contains all valid card numbers', () => {
      const results = getAllArcanoNumbers();
      expect(results).toContain(0);
      expect(results).toContain(1);
      expect(results).toContain(21);
    });

    it('is sorted in ascending order', () => {
      const results = getAllArcanoNumbers();
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i]).toBeLessThan(results[i + 1]);
      }
    });
  });

  // ─── TAROT_TAROT_MAP constant ──────────────────────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('has 22 entries (0-21)', () => {
      expect(Object.keys(TAROT_TAROT_MAP)).toHaveLength(22);
    });

    it('each entry has energia_oposta, energia_amplificada, sombra_integrada', () => {
      for (let i = 0; i <= 21; i++) {
        const mapping = TAROT_TAROT_MAP[i];
        expect(mapping.energia_oposta).toBeDefined();
        expect(mapping.energia_amplificada).toBeDefined();
        expect(mapping.sombra_integrada).toBeDefined();

        expect(mapping.energia_oposta.arcano).toBeTruthy();
        expect(mapping.energia_oposta.numero_carta).toBeDefined();
        expect(mapping.energia_oposta.razão).toBeTruthy();

        expect(mapping.energia_amplificada.arcano).toBeTruthy();
        expect(mapping.energia_amplificada.numero_carta).toBeDefined();
        expect(mapping.energia_amplificada.razão).toBeTruthy();

        expect(mapping.sombra_integrada.arcano).toBeTruthy();
        expect(mapping.sombra_integrada.numero_carta).toBeDefined();
        expect(mapping.sombra_integrada.razão).toBeTruthy();
      }
    });

    it('palavras_chave arrays are not empty', () => {
      for (let i = 0; i <= 21; i++) {
        const mapping = TAROT_TAROT_MAP[i];
        expect(mapping.palavras_chave.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all arcano have spiritual meaning', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('all arcano have archetype', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.arquétipo).toBeTruthy();
        expect(mapping.arquétipo.length).toBeGreaterThan(0);
      }
    });

    it('all arcano have spiritual lesson', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.lição_espiritual.length).toBeGreaterThan(5);
      }
    });

    it('all arcano have affirmation', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.afirmação.length).toBeGreaterThan(5);
        expect(mapping.afirmação.toLowerCase()).toContain('eu');
      }
    });

    it('all arcano have associated orixá', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.orixá).toBeTruthy();
        expect(mapping.orixá.length).toBeGreaterThan(0);
      }
    });

    it('all arcano have associated sephirah', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.sephirah.length).toBeGreaterThan(0);
      }
    });

    it('all arcano have chakra alignment', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.chakra.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Arcano journey consistency ─────────────────────────────────────────────

  describe('Arcano journey consistency', () => {
    it('O Louco relates to O Mundo (complementary)', () => {
      const louco = getTarotTarotByNumber(0);
      const mundo = getTarotTarotByNumber(21);
      expect(louco.energia_oposta.arcano).toBe('O Mundo');
      expect(mundo.energia_oposta.arcano).toBe('O Louco');
    });

    it('O Mago relates to A Alta Sacerdotisa (complementary)', () => {
      const mago = getTarotTarotByNumber(1);
      const sacerdotisa = getTarotTarotByNumber(2);
      expect(mago.energia_oposta.arcano).toBe('A Alta Sacerdotisa');
      expect(sacerdotisa.energia_oposta.arcano).toBe('A Alta Sacerdotisa');
    });

    it('A Imperatriz relates to O Imperador (complementary)', () => {
      const imperatriz = getTarotTarotByNumber(3);
      const imperador = getTarotTarotByNumber(4);
      expect(imperatriz.energia_oposta.arcano).toBe('O Imperador');
      expect(imperador.energia_oposta.arcano).toBe('A Imperatriz');
    });

    it('O Sol relates to A Lua (complementary)', () => {
      const sol = getTarotTarotByNumber(19);
      const lua = getTarotTarotByNumber(18);
      expect(sol.energia_oposta.arcano).toBe('A Lua');
      expect(lua.energia_oposta.arcano).toBe('O Sol');
    });
  });

  // ─── Default export ─────────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports all required functions', async () => {
      const module = await import('@/lib/correlation/tarot-tarot');
      const def = module.default;

      expect(def.getTarotTarotByNumber).toBeDefined();
      expect(def.getTarotTarotByArcano).toBeDefined();
      expect(def.getAllTarotTarots).toBeDefined();
      expect(def.hasTarotTarot).toBeDefined();
      expect(def.getTarotTarotByElement).toBeDefined();
      expect(def.getTarotTarotByOrixa).toBeDefined();
      expect(def.getTarotTarotBySephirah).toBeDefined();
      expect(def.getTarotTarotByChakra).toBeDefined();
      expect(def.getComplementaryArcano).toBeDefined();
      expect(def.getAmplifiedArcano).toBeDefined();
      expect(def.getShadowArcano).toBeDefined();
      expect(def.getAllArcanos).toBeDefined();
      expect(def.getAllArcanoNumbers).toBeDefined();
      expect(def.TAROT_TAROT_MAP).toBeDefined();
    });
  });
});
import { describe, it, expect } from 'vitest';
import {
  getOduSephirah,
  getSephirahOdu,
  getAllOduSephirahs,
  getAllOduNames,
  hasOduSephirah,
  getOduByNumber,
  getSephirahByOduNumber,
  ODU_SEPHIROT_MAPPINGS,
  type OduSephirah,
  getOduSephirot,
  getSephirotOdu,
  getAllOduSephiroth,
} from '@/lib/correlation/odu-sephirot';

describe('odu-sephirot', () => {
  // ─── getOduSephirah: valid Odus ─────────────────────────────────────────────

  describe('getOduSephirah', () => {
    it('returns Okaran (1) mapping with Malkuth', () => {
      const result = getOduSephirah('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.odu_nome).toBe('Okaran');
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.alinhamento_energetico).toBe('Quente / Densa');
      expect(result!.dia_semana).toBe('Segunda-feira');
    });

    it('returns Irosun (4) mapping with Chesed', () => {
      const result = getOduSephirah('Irosun');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(4);
      expect(result!.odu_nome).toBe('Irosun');
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.alinhamento_energetico).toBe('Fria / Expansiva');
    });

    it('returns Oxé (5) mapping with Tiphereth', () => {
      const result = getOduSephirah('Oxe');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(5);
      expect(result!.odu_nome).toBe('Oxé');
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.alinhamento_energetico).toBe('Fria / Expansiva');
    });

    it('returns Obará (6) mapping with Netzach', () => {
      const result = getOduSephirah('Obara');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(6);
      expect(result!.odu_nome).toBe('Obará');
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.alinhamento_energetico).toBe('Quente / Radiante');
    });

    it('returns Odi (7) mapping with Hod', () => {
      const result = getOduSephirah('Odi');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(7);
      expect(result!.odu_nome).toBe('Odi');
      expect(result!.sephirah).toBe('Hod');
      expect(result!.alinhamento_energetico).toBe('Quente / Ígnea');
    });

    it('returns EjiOníle (8) mapping with Yesod', () => {
      const result = getOduSephirah('EjiOnile');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(8);
      expect(result!.odu_nome).toBe('EjiOníle');
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.alinhamento_energetico).toBe('Fria / Magnética');
    });

    it('returns Alafia (16) mapping with Kether', () => {
      const result = getOduSephirah('Alafia');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(16);
      expect(result!.odu_nome).toBe('Alafia');
      expect(result!.sephirah).toBe('Kether');
      expect(result!.alinhamento_energetico).toBe('Ar / Luz');
      expect(result!.dia_semana).toBe('Sexta-feira');
    });

    it('returns Ejilsebora (12) mapping with Hod', () => {
      const result = getOduSephirah('Ejilsebora');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(12);
      expect(result!.odu_nome).toBe('Ejilsebora');
      expect(result!.sephirah).toBe('Hod');
    });

    it('returns null for unknown Odu', () => {
      expect(getOduSephirah('UnknownOdu')).toBeNull();
      expect(getOduSephirah('TestOdu')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getOduSephirah('')).toBeNull();
    });

    it('returns null for case-sensitive mismatches', () => {
      expect(getOduSephirah('okaran')).toBeNull();
      expect(getOduSephirah('OKARAN')).toBeNull();
      expect(getOduSephirah('irosun')).toBeNull();
    });
  });

  // ─── getSephirahOdu: reverse lookup ────────────────────────────────────────

  describe('getSephirahOdu', () => {
    it('returns Malkuth for Okaran (1)', () => {
      const result = getSephirahOdu();
      expect(result['Malkuth']).toBeDefined();
      expect(result['Malkuth'].odu_numero).toBe(1);
      expect(result['Malkuth'].odu_nome).toBe('Okaran');
    });

    it('returns Binah for Ejiokô (2)', () => {
      const result = getSephirahOdu();
      expect(result['Binah']).toBeDefined();
      expect(result['Binah'].odu_numero).toBe(2);
      expect(result['Binah'].odu_nome).toBe('Ejiokô');
    });

    it('returns Kether for Alafia (16)', () => {
      const result = getSephirahOdu();
      expect(result['Kether']).toBeDefined();
      expect(result['Kether'].odu_numero).toBe(16);
      expect(result['Kether'].odu_nome).toBe('Alafia');
    });

    it('returns Tiphereth for Oxé (5)', () => {
      const result = getSephirahOdu();
      expect(result['Tiphereth']).toBeDefined();
      expect(result['Tiphereth'].odu_numero).toBe(5);
      expect(result['Tiphereth'].odu_nome).toBe('Oxé');
    });

    it('returns all 10 Sephiroth with their Odus', () => {
      const result = getSephirahOdu();
      const sephiroth = Object.keys(result);
      expect(sephiroth).toContain('Kether');
      expect(sephiroth).toContain('Binah');
      expect(sephiroth).toContain('Chesed');
      expect(sephiroth).toContain('Geburah');
      expect(sephiroth).toContain('Tiphereth');
      expect(sephiroth).toContain('Netzach');
      expect(sephiroth).toContain('Hod');
      expect(sephiroth).toContain('Yesod');
      expect(sephiroth).toContain('Malkuth');
      expect(sephiroth.length).toBeGreaterThanOrEqual(8);
    });
  });

  // ─── getAllOduSephirahs ─────────────────────────────────────────────────────

  describe('getAllOduSephirahs', () => {
    it('returns all 16 Odu-Sephirah mappings', () => {
      const result = getAllOduSephirahs();
      expect(result).toHaveLength(16);
    });

    it('contains all Odu numbers from 1 to 16', () => {
      const result = getAllOduSephirahs();
      const numeros = result.map((m) => m.odu_numero).sort((a, b) => a - b);
      expect(numeros).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });

    it('contains Okaran with number 1', () => {
      const result = getAllOduSephirahs();
      const okaran = result.find((m) => m.odu_numero === 1);
      expect(okaran).toBeDefined();
      expect(okaran!.odu_nome).toBe('Okaran');
      expect(okaran!.sephirah).toBe('Malkuth');
    });

    it('contains Alafia with number 16', () => {
      const result = getAllOduSephirahs();
      const alafia = result.find((m) => m.odu_numero === 16);
      expect(alafia).toBeDefined();
      expect(alafia!.odu_nome).toBe('Alafia');
      expect(alafia!.sephirah).toBe('Kether');
    });
  });

  // ─── getAllOduNames ─────────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('returns all 16 Odu names sorted by number', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('returns names in correct order', () => {
      const result = getAllOduNames();
      expect(result[0]).toBe('Okaran');
      expect(result[1]).toBe('Ejiokô');
      expect(result[2]).toBe('Etaogundá');
      expect(result[3]).toBe('Irosun');
    });

    it('includes all major Odu names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Irosun');
      expect(result).toContain('Oxé');
      expect(result).toContain('Obará');
      expect(result).toContain('Odi');
      expect(result).toContain('EjiOníle');
      expect(result).toContain('Alafia');
    });
  });

  // ─── hasOduSephirah ─────────────────────────────────────────────────────────

  describe('hasOduSephirah', () => {
    it('returns true for valid Odu names', () => {
      expect(hasOduSephirah('Okaran')).toBe(true);
      expect(hasOduSephirah('Irosun')).toBe(true);
      expect(hasOduSephirah('Oxe')).toBe(true);
      expect(hasOduSephirah('Alafia')).toBe(true);
    });

    it('returns false for invalid Odu names', () => {
      expect(hasOduSephirah('InvalidOdu')).toBe(false);
      expect(hasOduSephirah('Test')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasOduSephirah('')).toBe(false);
    });

    it('returns false for case-sensitive mismatches', () => {
      expect(hasOduSephirah('okaran')).toBe(false);
      expect(hasOduSephirah('ALAFIA')).toBe(false);
    });
  });

  // ─── getOduByNumber ─────────────────────────────────────────────────────────

  describe('getOduByNumber', () => {
    it('returns Okaran for number 1', () => {
      const result = getOduByNumber(1);
      expect(result).not.toBeNull();
      expect(result!.odu_nome).toBe('Okaran');
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('returns Ejiokô for number 2', () => {
      const result = getOduByNumber(2);
      expect(result).not.toBeNull();
      expect(result!.odu_nome).toBe('Ejiokô');
      expect(result!.sephirah).toBe('Binah');
    });

    it('returns Irosun for number 4', () => {
      const result = getOduByNumber(4);
      expect(result).not.toBeNull();
      expect(result!.odu_nome).toBe('Irosun');
      expect(result!.sephirah).toBe('Chesed');
    });

    it('returns Oxé for number 5', () => {
      const result = getOduByNumber(5);
      expect(result).not.toBeNull();
      expect(result!.odu_nome).toBe('Oxé');
      expect(result!.sephirah).toBe('Tiphereth');
    });

    it('returns Alafia for number 16', () => {
      const result = getOduByNumber(16);
      expect(result).not.toBeNull();
      expect(result!.odu_nome).toBe('Alafia');
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns null for out of range numbers', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(17)).toBeNull();
      expect(getOduByNumber(-1)).toBeNull();
      expect(getOduByNumber(100)).toBeNull();
    });
  });

  // ─── getSephirahByOduNumber ─────────────────────────────────────────────────

  describe('getSephirahByOduNumber', () => {
    it('returns Malkuth for Odu number 1', () => {
      expect(getSephirahByOduNumber(1)).toBe('Malkuth');
    });

    it('returns Binah for Odu number 2', () => {
      expect(getSephirahByOduNumber(2)).toBe('Binah');
    });

    it('returns Kether for Odu number 16', () => {
      expect(getSephirahByOduNumber(16)).toBe('Kether');
    });

    it('returns Tiphereth for Odu number 5', () => {
      expect(getSephirahByOduNumber(5)).toBe('Tiphereth');
    });

    it('returns null for invalid Odu numbers', () => {
      expect(getSephirahByOduNumber(0)).toBeNull();
      expect(getSephirahByOduNumber(17)).toBeNull();
      expect(getSephirahByOduNumber(-5)).toBeNull();
    });
  });

  // ─── ODU_SEPHIROT_MAPPINGS constant ─────────────────────────────────────────

  describe('ODU_SEPHIROT_MAPPINGS', () => {
    it('is an object with all 16 Odu entries', () => {
      expect(typeof ODU_SEPHIROT_MAPPINGS).toBe('object');
      expect(Object.keys(ODU_SEPHIROT_MAPPINGS)).toHaveLength(16);
    });

    it('contains spiritual significance for each Odu', () => {
      for (const mapping of Object.values(ODU_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('contains path connections for each Odu', () => {
      for (const mapping of Object.values(ODU_SEPHIROT_MAPPINGS)) {
        expect(mapping.conexoes_caminho).toBeDefined();
        expect(typeof mapping.conexoes_caminho.numero_caminho).toBe('number');
        expect(typeof mapping.conexoes_caminho.letra_hebraica).toBe('string');
        expect(Array.isArray(mapping.conexoes_caminho.sephirot_relacionadas)).toBe(true);
      }
    });

    it('contains all Sephiroth correctly assigned', () => {
      const sephiroth = Object.values(ODU_SEPHIROT_MAPPINGS).map((m) => m.sephirah);
      expect(sephiroth).toContain('Kether');
      expect(sephiroth).toContain('Binah');
      expect(sephiroth).toContain('Chesed');
      expect(sephiroth).toContain('Geburah');
      expect(sephiroth).toContain('Tiphereth');
      expect(sephiroth).toContain('Netzach');
      expect(sephiroth).toContain('Hod');
      expect(sephiroth).toContain('Yesod');
      expect(sephiroth).toContain('Malkuth');
    });

    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODU_SEPHIROT_MAPPINGS)).toBe(true);
    });
  });

  // ─── Interface completeness ──────────────────────────────────────────────────

  describe('OduSephirah interface completeness', () => {
    it('has all required fields for Okaran mapping', () => {
      const mapping = getOduSephirah('Okaran');
      expect(mapping).not.toBeNull();

      expect(typeof mapping!.odu_numero).toBe('number');
      expect(typeof mapping!.odu_nome).toBe('string');
      expect(typeof mapping!.sephirah).toBe('string');
      expect(typeof mapping!.alinhamento_energetico).toBe('string');
      expect(typeof mapping!.significado_espiritual).toBe('string');
      expect(typeof mapping!.conexoes_caminho).toBe('object');
      expect(typeof mapping!.dia_semana).toBe('string');

      expect(typeof mapping!.conexoes_caminho.numero_caminho).toBe('number');
      expect(typeof mapping!.conexoes_caminho.letra_hebraica).toBe('string');
      expect(typeof mapping!.conexoes_caminho.posicao).toBe('string');
      expect(Array.isArray(mapping!.conexoes_caminho.sephirot_relacionadas)).toBe(true);
    });

    it('has Hebrew letters for all paths', () => {
      const mappings = getAllOduSephirahs();
      for (const mapping of mappings) {
        expect(mapping.conexoes_caminho.letra_hebraica.length).toBeGreaterThan(0);
      }
    });

    it('has valid path numbers (1-22 or 32)', () => {
      const mappings = getAllOduSephirahs();
      for (const mapping of mappings) {
        expect(mapping.conexoes_caminho.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(mapping.conexoes_caminho.numero_caminho).toBeLessThanOrEqual(32);
      }
    });

    it('has day of week for all Odu', () => {
      const mappings = getAllOduSephirahs();
      for (const mapping of mappings) {
        expect(mapping.dia_semana.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Cross-correlation consistency ──────────────────────────────────────────

  describe('Cross-correlation consistency', () => {
    it('Okaran (1) maps to Malkuth (base of Tree)', () => {
      const okaran = getOduSephirah('Okaran');
      expect(okaran!.sephirah).toBe('Malkuth');
      expect(okaran!.conexoes_caminho.posicao).toContain('Malkuth');
    });

    it('Alafia (16) maps to Kether (crown)', () => {
      const alafia = getOduSephirah('Alafia');
      expect(alafia!.sephirah).toBe('Kether');
      expect(alafia!.conexoes_caminho.posicao).toContain('Kether');
    });

    it('Oxé (5) center of Tree maps to Tiphereth', () => {
      const oxe = getOduSephirah('Oxe');
      expect(oxe!.sephirah).toBe('Tiphereth');
      expect(oxe!.conexoes_caminho.posicao).toContain('Centro');
    });

    it('EjiOníle (8) foundation maps to Yesod', () => {
      const ejionile = getOduSephirah('EjiOnile');
      expect(ejionile!.sephirah).toBe('Yesod');
      expect(ejionile!.conexoes_caminho.posicao).toContain('Fundação');
    });

    it('getSephirahOdu returns correct reverse mapping for Kether', () => {
      const reverse = getSephirahOdu();
      expect(reverse['Kether'].odu_numero).toBe(16);
      expect(reverse['Kether'].odu_nome).toBe('Alafia');
    });
  });

  // ─── Default export ─────────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports all required functions', async () => {
      const mod = await import('@/lib/correlation/odu-sephirot');
      expect(typeof mod.default).toBe('object');
      expect(typeof mod.getOduSephirah).toBe('function');
      expect(typeof mod.getSephirahOdu).toBe('function');
      expect(typeof mod.getAllOduSephirahs).toBe('function');
      expect(typeof mod.getAllOduNames).toBe('function');
      expect(typeof mod.hasOduSephirah).toBe('function');
      expect(typeof mod.getOduByNumber).toBe('function');
      expect(typeof mod.getSephirahByOduNumber).toBe('function');
      expect(typeof mod.ODU_SEPHIROT_MAPPINGS).toBe('object');
    });
    it('default exports match named exports', async () => {
      const mod = await import('@/lib/correlation/odu-sephirot');
      expect(mod.default.getOduSephirah).toBe(mod.getOduSephirah);
      expect(mod.default.getSephirahOdu).toBe(mod.getSephirahOdu);
      expect(mod.default.getAllOduSephirahs).toBe(mod.getAllOduSephirahs);
      // Assignment-required exports
      expect(mod.default.getOduSephirot).toBe(mod.getOduSephirot);
      expect(mod.default.getSephirotOdu).toBe(mod.getSephirotOdu);
      expect(mod.default.getAllOduSephiroth).toBe(mod.getAllOduSephiroth);
    });
  });
});
// ─── Assignment-required Exports (Sephirot naming) ─────────────────────────────
describe('getOduSephirot', () => {
  it('returns Okaran mapping with Malkuth', () => {
    const result = getOduSephirot('Okaran');
    expect(result).not.toBeNull();
    expect(result!.sephirah).toBe('Malkuth');
  });
  it('returns null for unknown Odu', () => {
    expect(getOduSephirot('Unknown')).toBeNull();
  });
  it('returns same result as getOduSephirah', () => {
    expect(getOduSephirot('Okaran')).toEqual(getOduSephirah('Okaran'));
    expect(getOduSephirot('Irosun')).toEqual(getOduSephirah('Irosun'));
  });
});
describe('getSephirotOdu', () => {
  it('returns reverse mapping with Malkuth', () => {
    const result = getSephirotOdu();
    expect(result['Malkuth']).toBeDefined();
    expect(result['Malkuth'].odu_nome).toBe('Okaran');
  });
  it('returns same result as getSephirahOdu', () => {
    expect(getSephirotOdu()).toEqual(getSephirahOdu());
  });
});
describe('getAllOduSephiroth', () => {
  it('returns array of 16 Odu-Sephirah mappings', () => {
    const result = getAllOduSephiroth();
    expect(result).toHaveLength(16);
  });
  it('returns same result as getAllOduSephirahs', () => {
    expect(getAllOduSephiroth()).toEqual(getAllOduSephirahs());
  });
  it('contains all expected Odu entries', () => {
    const result = getAllOduSephiroth();
    const names = result.map((m) => m.odu_nome);
    expect(names).toContain('Okaran');
    expect(names).toContain('Alafia');
  });
});
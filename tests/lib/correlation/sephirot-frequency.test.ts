import { describe, it, expect } from 'vitest';
import {
  getSephirotFrequency,
  getFrequencySephirot,
  getAllSephirotFrequencies,
  getAllSephiroth,
  hasSephirotFrequency,
  getChakraBySephirah,
  getElementBySephirah,
  getSephirothByFrequency,
  getAllFrequencies,
  SOLFEGGIO_FREQUENCIES,
  SEPHIROT_FREQUENCY_MAPPINGS,
  type SephirotFrequency,
} from '@/lib/correlation/sephirot-frequency';

describe('sephirot-frequency', () => {
  // ─── getSephirotFrequency: valid Sephiroth ─────────────────────────────────

  describe('getSephirotFrequency', () => {
    it('returns Kether mapping with 963 Hz frequency', () => {
      const result = getSephirotFrequency('Kether');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.frequencia).toBe(963);
      expect(result!.elemento).toBe('Éter');
      expect(result!.chakra_numero).toBe(7);
    });

    it('returns Chokmah mapping with 852 Hz frequency', () => {
      const result = getSephirotFrequency('Chokmah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.frequencia).toBe(852);
      expect(result!.elemento).toBe('Éter');
      expect(result!.chakra_numero).toBe(6);
    });

    it('returns Binah mapping with 741 Hz frequency', () => {
      const result = getSephirotFrequency('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.frequencia).toBe(741);
      expect(result!.elemento).toBe('Ar');
      expect(result!.chakra_numero).toBe(6);
    });

    it('returns Chesed mapping with 639 Hz frequency', () => {
      const result = getSephirotFrequency('Chesed');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.frequencia).toBe(639);
      expect(result!.elemento).toBe('Água');
      expect(result!.chakra_numero).toBe(4);
    });

    it('returns Geburah mapping with 417 Hz frequency', () => {
      const result = getSephirotFrequency('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.frequencia).toBe(417);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.chakra_numero).toBe(3);
    });

    it('returns Tiphereth mapping with 528 Hz frequency', () => {
      const result = getSephirotFrequency('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.frequencia).toBe(528);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.chakra_numero).toBe(4);
    });

    it('returns Netzach mapping with 639 Hz frequency', () => {
      const result = getSephirotFrequency('Netzach');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.frequencia).toBe(639);
      expect(result!.elemento).toBe('Água');
      expect(result!.chakra_numero).toBe(4);
    });

    it('returns Hod mapping with 741 Hz frequency', () => {
      const result = getSephirotFrequency('Hod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.frequencia).toBe(741);
      expect(result!.elemento).toBe('Ar');
      expect(result!.chakra_numero).toBe(5);
    });

    it('returns Yesod mapping with 396 Hz frequency', () => {
      const result = getSephirotFrequency('Yesod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.frequencia).toBe(396);
      expect(result!.elemento).toBe('Água');
      expect(result!.chakra_numero).toBe(2);
    });

    it('returns Malkuth mapping with 396 Hz frequency', () => {
      const result = getSephirotFrequency('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.frequencia).toBe(396);
      expect(result!.elemento).toBe('Terra');
      expect(result!.chakra_numero).toBe(1);
    });

    it('returns null for unknown sephirah', () => {
      const result = getSephirotFrequency('Unknown');
      expect(result).toBeNull();
    });

    it('is case-sensitive', () => {
      const result = getSephirotFrequency('kether');
      expect(result).toBeNull();
    });
  });

  // ─── getFrequencySephirot ──────────────────────────────────────────────────

  describe('getFrequencySephirot', () => {
    it('returns Kether for 963 Hz', () => {
      expect(getFrequencySephirot(963)).toBe('Kether');
    });

    it('returns Chokmah for 852 Hz', () => {
      expect(getFrequencySephirot(852)).toBe('Chokmah');
    });

    it('returns Binah for 741 Hz', () => {
      expect(getFrequencySephirot(741)).toBe('Binah');
    });

    it('returns Chesed for 639 Hz', () => {
      expect(getFrequencySephirot(639)).toBe('Chesed');
    });

    it('returns Geburah for 417 Hz', () => {
      expect(getFrequencySephirot(417)).toBe('Geburah');
    });

    it('returns Tiphereth for 528 Hz', () => {
      expect(getFrequencySephirot(528)).toBe('Tiphereth');
    });

    it('returns null for unused frequency', () => {
      expect(getFrequencySephirot(444)).toBeNull();
    });

    it('returns first sephirah when multiple share frequency', () => {
      // Both Chesed and Netzach use 639 Hz
      // getFrequencySephirot returns first match
      const result = getFrequencySephirot(639);
      expect(result).not.toBeNull();
      expect(['Chesed', 'Netzach']).toContain(result);
    });
  });

  // ─── getAllSephirotFrequencies ─────────────────────────────────────────────

  describe('getAllSephirotFrequencies', () => {
    it('returns all 10 sephiroth mappings', () => {
      const result = getAllSephirotFrequencies();
      expect(result).toHaveLength(10);
    });

    it('contains all sephiroth names', () => {
      const result = getAllSephirotFrequencies();
      const names = result.map((m) => m.sephirah);
      expect(names).toContain('Kether');
      expect(names).toContain('Chokmah');
      expect(names).toContain('Binah');
      expect(names).toContain('Chesed');
      expect(names).toContain('Geburah');
      expect(names).toContain('Tiphereth');
      expect(names).toContain('Netzach');
      expect(names).toContain('Hod');
      expect(names).toContain('Yesod');
      expect(names).toContain('Malkuth');
    });

    it('each mapping has valid frequency', () => {
      const result = getAllSephirotFrequencies();
      for (const mapping of result) {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
        expect(mapping.frequencia).toBeGreaterThan(0);
      }
    });

    it('each mapping has valid chakra number', () => {
      const result = getAllSephirotFrequencies();
      for (const mapping of result) {
        expect(mapping.chakra_numero).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra_numero).toBeLessThanOrEqual(7);
      }
    });
  });

  // ─── getAllSephiroth ───────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns all 10 sephiroth names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('returns sephiroth names as keys', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Malkuth');
    });
  });

  // ─── hasSephirotFrequency ─────────────────────────────────────────────────

  describe('hasSephirotFrequency', () => {
    it('returns true for known sephiroth', () => {
      expect(hasSephirotFrequency('Kether')).toBe(true);
      expect(hasSephirotFrequency('Malkuth')).toBe(true);
      expect(hasSephirotFrequency('Tiphereth')).toBe(true);
    });

    it('returns false for unknown sephiroth', () => {
      expect(hasSephirotFrequency('Unknown')).toBe(false);
      expect(hasSephirotFrequency('DAATH')).toBe(false);
    });
  });

  // ─── getChakraBySephirah ──────────────────────────────────────────────────

  describe('getChakraBySephirah', () => {
    it('returns correct chakra for each sephirah', () => {
      expect(getChakraBySephirah('Kether')).toBe(7);
      expect(getChakraBySephirah('Chokmah')).toBe(6);
      expect(getChakraBySephirah('Binah')).toBe(6);
      expect(getChakraBySephirah('Chesed')).toBe(4);
      expect(getChakraBySephirah('Geburah')).toBe(3);
      expect(getChakraBySephirah('Tiphereth')).toBe(4);
      expect(getChakraBySephirah('Netzach')).toBe(4);
      expect(getChakraBySephirah('Hod')).toBe(5);
      expect(getChakraBySephirah('Yesod')).toBe(2);
      expect(getChakraBySephirah('Malkuth')).toBe(1);
    });

    it('returns null for unknown sephirah', () => {
      expect(getChakraBySephirah('Unknown')).toBeNull();
    });
  });

  // ─── getElementBySephirah ─────────────────────────────────────────────────

  describe('getElementBySephirah', () => {
    it('returns correct element for each sephirah', () => {
      expect(getElementBySephirah('Kether')).toBe('Éter');
      expect(getElementBySephirah('Chokmah')).toBe('Éter');
      expect(getElementBySephirah('Binah')).toBe('Ar');
      expect(getElementBySephirah('Chesed')).toBe('Água');
      expect(getElementBySephirah('Geburah')).toBe('Fogo');
      expect(getElementBySephirah('Tiphereth')).toBe('Fogo');
      expect(getElementBySephirah('Netzach')).toBe('Água');
      expect(getElementBySephirah('Hod')).toBe('Ar');
      expect(getElementBySephirah('Yesod')).toBe('Água');
      expect(getElementBySephirah('Malkuth')).toBe('Terra');
    });

    it('returns null for unknown sephirah', () => {
      expect(getElementBySephirah('Unknown')).toBeNull();
    });
  });

  // ─── getSephirothByFrequency ─────────────────────────────────────────────

  describe('getSephirothByFrequency', () => {
    it('returns correct sephiroth for each frequency', () => {
      const kether = getSephirothByFrequency(963);
      expect(kether).toHaveLength(1);
      expect(kether[0].sephirah).toBe('Kether');

      const chokmah = getSephirothByFrequency(852);
      expect(chokmah).toHaveLength(1);
      expect(chokmah[0].sephirah).toBe('Chokmah');

      const geburah = getSephirothByFrequency(417);
      expect(geburah).toHaveLength(1);
      expect(geburah[0].sephirah).toBe('Geburah');

      const tiphereth = getSephirothByFrequency(528);
      expect(tiphereth).toHaveLength(1);
      expect(tiphereth[0].sephirah).toBe('Tiphereth');
    });

    it('returns multiple sephiroth for shared frequencies', () => {
      const freq639 = getSephirothByFrequency(639);
      expect(freq639.length).toBe(2);
      const sephiroth = freq639.map((m) => m.sephirah);
      expect(sephiroth).toContain('Chesed');
      expect(sephiroth).toContain('Netzach');

      const freq741 = getSephirothByFrequency(741);
      expect(freq741.length).toBe(2);
      const seph741 = freq741.map((m) => m.sephirah);
      expect(seph741).toContain('Binah');
      expect(seph741).toContain('Hod');

      const freq396 = getSephirothByFrequency(396);
      expect(freq396.length).toBe(2);
      const seph396 = freq396.map((m) => m.sephirah);
      expect(seph396).toContain('Yesod');
      expect(seph396).toContain('Malkuth');
    });

    it('returns empty array for unused frequency', () => {
      expect(getSephirothByFrequency(444)).toEqual([]);
    });
  });

  // ─── getAllFrequencies ────────────────────────────────────────────────────

  describe('getAllFrequencies', () => {
    it('returns all 7 Solfeggio frequencies', () => {
      const result = getAllFrequencies();
      expect(result).toHaveLength(7);
      expect(result).toContain(396);
      expect(result).toContain(417);
      expect(result).toContain(528);
      expect(result).toContain(639);
      expect(result).toContain(741);
      expect(result).toContain(852);
      expect(result).toContain(963);
    });

    it('returns a copy, not the original', () => {
      const result = getAllFrequencies();
      result.push(999);
      expect(getAllFrequencies()).toHaveLength(7);
    });
  });

  // ─── SOLFEGGIO_FREQUENCIES constant ───────────────────────────────────────

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('contains all expected frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('has exactly 7 frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(7);
    });
  });

  // ─── SEPHIROT_FREQUENCY_MAPPINGS constant ──────────────────────────────────

  describe('SEPHIROT_FREQUENCY_MAPPINGS constant', () => {
    it('has 10 sephiroth entries', () => {
      expect(Object.keys(SEPHIROT_FREQUENCY_MAPPINGS)).toHaveLength(10);
    });

    it('all entries have valid structure', () => {
      for (const [name, mapping] of Object.entries(SEPHIROT_FREQUENCY_MAPPINGS)) {
        expect(mapping.sephirah).toBe(name);
        expect(typeof mapping.frequencia).toBe('number');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.chakra_numero).toBe('number');
        expect(typeof mapping.significado_espiritual).toBe('string');
      }
    });

    it('is frozen to prevent modification', () => {
      expect(Object.isFrozen(SEPHIROT_FREQUENCY_MAPPINGS)).toBe(true);
    });
  });

  // ─── SephirotFrequency interface completeness ─────────────────────────────

  describe('SephirotFrequency interface completeness', () => {
    it('contains all required properties', () => {
      const kether = getSephirotFrequency('Kether')!;
      expect(kether).toHaveProperty('sephirah');
      expect(kether).toHaveProperty('frequencia');
      expect(kether).toHaveProperty('elemento');
      expect(kether).toHaveProperty('chakra_numero');
      expect(kether).toHaveProperty('significado_espiritual');
    });

    it('each mapping has spiritual meaning', () => {
      const all = getAllSephirotFrequencies();
      for (const mapping of all) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Chakra distribution ─────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('all sephiroth map to valid chakras (1-7)', () => {
      const all = getAllSephirotFrequencies();
      for (const mapping of all) {
        expect(mapping.chakra_numero).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra_numero).toBeLessThanOrEqual(7);
      }
    });

    it('Kether is crown chakra (7)', () => {
      const kether = getSephirotFrequency('Kether');
      expect(kether?.chakra_numero).toBe(7);
    });

    it('Malkuth is root chakra (1)', () => {
      const malkuth = getSephirotFrequency('Malkuth');
      expect(malkuth?.chakra_numero).toBe(1);
    });
  });

  // ─── Frequency distribution ────────────────────────────────────────────────

  describe('Frequency distribution', () => {
    it('963 Hz is Kether only (highest frequency)', () => {
      const kether = getSephirothByFrequency(963);
      expect(kether).toHaveLength(1);
      expect(kether[0].sephirah).toBe('Kether');
    });

    it('396 Hz has Yesod and Malkuth (foundation/ground)', () => {
      const foundation = getSephirothByFrequency(396);
      expect(foundation).toHaveLength(2);
      const names = foundation.map((m) => m.sephirah);
      expect(names).toContain('Yesod');
      expect(names).toContain('Malkuth');
    });

    it('Tiphereth has 528 Hz (miracle frequency)', () => {
      const tiphereth = getSephirotFrequency('Tiphereth');
      expect(tiphereth?.frequencia).toBe(528);
    });
  });
});
import { describe, it, expect } from 'vitest';
import {
  getSephirotFrequency,
  getFrequencySephirot,
  getAllSephirotFrequencies,
  SEPHIROT_FREQUENCY_MAPPINGS,
  getFrequencyHz,
  getAllSephiroth,
  getSephirotByPath,
  getSephirotElement,
  getFrequenciesByElement,
  hasFrequency,
  hasSephirotFrequency,
  type SephirotFrequency,
} from '@/lib/correlation/sephirot-frequency';

describe('sephirot-frequency', () => {
  // ─── getSephirotFrequency: valid Sephiroth ─────────────────────────────────

  describe('getSephirotFrequency', () => {
    it('returns Kether mapping with 963 Hz and Éter element', () => {
      const result = getSephirotFrequency('Kether');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.nome_portugues).toBe('Coroa Divina');
      expect(result!.frequencia_hz).toBe(963);
      expect(result!.elemento).toBe('Eter');
      expect(result!.numero_caminho).toBe(1);
      expect(result!.significado_espiritual).toBeTruthy();
    });

    it('returns Chokmah mapping with 852 Hz and Éter element', () => {
      const result = getSephirotFrequency('Chokmah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.nome_portugues).toBe('Sabedoria');
      expect(result!.frequencia_hz).toBe(852);
      expect(result!.elemento).toBe('Eter');
      expect(result!.numero_caminho).toBe(2);
    });

    it('returns Binah mapping with 741 Hz and Ar element', () => {
      const result = getSephirotFrequency('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.nome_portugues).toBe('Entendimento');
      expect(result!.frequencia_hz).toBe(741);
      expect(result!.elemento).toBe('Ar');
      expect(result!.numero_caminho).toBe(3);
    });

    it('returns Chesed mapping with 639 Hz and Água element', () => {
      const result = getSephirotFrequency('Chesed');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.nome_portugues).toBe('Misericordia');
      expect(result!.frequencia_hz).toBe(639);
      expect(result!.elemento).toBe('Agua');
      expect(result!.numero_caminho).toBe(4);
    });

    it('returns Geburah mapping with 528 Hz and Fogo element', () => {
      const result = getSephirotFrequency('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.nome_portugues).toBe('Severidade');
      expect(result!.frequencia_hz).toBe(528);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(5);
    });

    it('returns Tiphereth mapping with 528 Hz and Fogo element', () => {
      const result = getSephirotFrequency('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.nome_portugues).toBe('Beleza');
      expect(result!.frequencia_hz).toBe(528);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(6);
    });

    it('returns Netzach mapping with 417 Hz and Água element', () => {
      const result = getSephirotFrequency('Netzach');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.nome_portugues).toBe('Vitoria');
      expect(result!.frequencia_hz).toBe(417);
      expect(result!.elemento).toBe('Agua');
      expect(result!.numero_caminho).toBe(7);
    });

    it('returns Hod mapping with 396 Hz and Ar element', () => {
      const result = getSephirotFrequency('Hod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.nome_portugues).toBe('Gloria');
      expect(result!.frequencia_hz).toBe(396);
      expect(result!.elemento).toBe('Ar');
      expect(result!.numero_caminho).toBe(8);
    });

    it('returns Yesod mapping with 285 Hz and Água element', () => {
      const result = getSephirotFrequency('Yesod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.nome_portugues).toBe('Fundacao');
      expect(result!.frequencia_hz).toBe(285);
      expect(result!.elemento).toBe('Agua');
      expect(result!.numero_caminho).toBe(9);
    });

    it('returns Malkuth mapping with 174 Hz and Terra element', () => {
      const result = getSephirotFrequency('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.nome_portugues).toBe('Reino');
      expect(result!.frequencia_hz).toBe(174);
      expect(result!.elemento).toBe('Terra');
      expect(result!.numero_caminho).toBe(10);
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotFrequency('UnknownSephirah');
      expect(result).toBeNull();
    });
  });

  // ─── getFrequencySephirot ───────────────────────────────────────────────────

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

    it('returns Geburah for 528 Hz', () => {
      expect(getFrequencySephirot(528)).toBe('Geburah');
    });

    it('returns Tiphereth for 528 Hz (same as Geburah)', () => {
      expect(getFrequencySephirot(528)).toBe('Geburah');
    });

    it('returns Netzach for 417 Hz', () => {
      expect(getFrequencySephirot(417)).toBe('Netzach');
    });

    it('returns Hod for 396 Hz', () => {
      expect(getFrequencySephirot(396)).toBe('Hod');
    });

    it('returns Yesod for 285 Hz', () => {
      expect(getFrequencySephirot(285)).toBe('Yesod');
    });

    it('returns Malkuth for 174 Hz', () => {
      expect(getFrequencySephirot(174)).toBe('Malkuth');
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencySephirot(1000)).toBeNull();
    });
  });

  // ─── getAllSephirotFrequencies ──────────────────────────────────────────────

  describe('getAllSephirotFrequencies', () => {
    it('returns all 10 Sephirot-Frequency mappings', () => {
      const result = getAllSephirotFrequencies();
      expect(result).toHaveLength(10);
    });

    it('contains all expected Sephiroth', () => {
      const result = getAllSephirotFrequencies();
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

    it('each mapping has required properties', () => {
      const result = getAllSephirotFrequencies();
      for (const mapping of result) {
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.nome_portugues).toBeTruthy();
        expect(typeof mapping.frequencia_hz).toBe('number');
        expect(mapping.elemento).toBeTruthy();
        expect(typeof mapping.numero_caminho).toBe('number');
        expect(mapping.significado_espiritual).toBeTruthy();
      }
    });
  });

  // ─── SEPHIROT_FREQUENCY_MAPPINGS constant ──────────────────────────────────

  describe('SEPHIROT_FREQUENCY_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_FREQUENCY_MAPPINGS)).toBe(true);
    });

    it('has exactly 10 entries', () => {
      expect(Object.keys(SEPHIROT_FREQUENCY_MAPPINGS)).toHaveLength(10);
    });

    it('contains all expected Sephiroth keys', () => {
      const keys = Object.keys(SEPHIROT_FREQUENCY_MAPPINGS);
      expect(keys).toContain('Kether');
      expect(keys).toContain('Chokmah');
      expect(keys).toContain('Binah');
      expect(keys).toContain('Chesed');
      expect(keys).toContain('Geburah');
      expect(keys).toContain('Tiphereth');
      expect(keys).toContain('Netzach');
      expect(keys).toContain('Hod');
      expect(keys).toContain('Yesod');
      expect(keys).toContain('Malkuth');
    });
  });

  // ─── getFrequencyHz ─────────────────────────────────────────────────────────

  describe('getFrequencyHz', () => {
    it('returns 963 for Kether', () => {
      expect(getFrequencyHz('Kether')).toBe(963);
    });

    it('returns 852 for Chokmah', () => {
      expect(getFrequencyHz('Chokmah')).toBe(852);
    });

    it('returns null for unknown Sephirah', () => {
      expect(getFrequencyHz('Unknown')).toBeNull();
    });
  });

  // ─── getAllSephiroth ─────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns all 10 Sephirah names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('contains the expected Sephiroth names', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Chesed');
      expect(result).toContain('Geburah');
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Netzach');
      expect(result).toContain('Hod');
      expect(result).toContain('Yesod');
      expect(result).toContain('Malkuth');
    });
  });

  // ─── getSephirotByPath ──────────────────────────────────────────────────────

  describe('getSephirotByPath', () => {
    it('returns Kether for path 1', () => {
      const result = getSephirotByPath(1);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns Malkuth for path 10', () => {
      const result = getSephirotByPath(10);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('returns null for invalid path', () => {
      expect(getSephirotByPath(11)).toBeNull();
      expect(getSephirotByPath(0)).toBeNull();
    });
  });

  // ─── getSephirotElement ─────────────────────────────────────────────────────

  describe('getSephirotElement', () => {
    it('returns Éter for Kether', () => {
      expect(getSephirotElement('Kether')).toBe('Eter');
    });

    it('returns Ar for Binah', () => {
      expect(getSephirotElement('Binah')).toBe('Ar');
    });

    it('returns Fogo for Geburah', () => {
      expect(getSephirotElement('Geburah')).toBe('Fogo');
    });

    it('returns Terra for Malkuth', () => {
      expect(getSephirotElement('Malkuth')).toBe('Terra');
    });

    it('returns null for unknown Sephirah', () => {
      expect(getSephirotElement('Unknown')).toBeNull();
    });
  });

  // ─── getFrequenciesByElement ────────────────────────────────────────────────

  describe('getFrequenciesByElement', () => {
    it('groups frequencies by element', () => {
      const result = getFrequenciesByElement();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('contains Eter frequencies', () => {
      const result = getFrequenciesByElement();
      expect(result['Eter']).toBeTruthy();
      expect(result['Eter'].length).toBe(2);
      expect(result['Eter']).toContain(963);
      expect(result['Eter']).toContain(852);
    });

    it('contains Ar frequencies', () => {
      const result = getFrequenciesByElement();
      expect(result['Ar']).toBeTruthy();
      expect(result['Ar'].length).toBe(2);
      expect(result['Ar']).toContain(741);
      expect(result['Ar']).toContain(396);
    });

    it('contains Agua frequencies', () => {
      const result = getFrequenciesByElement();
      expect(result['Agua']).toBeTruthy();
      expect(result['Agua'].length).toBe(3);
      expect(result['Agua']).toContain(639);
      expect(result['Agua']).toContain(417);
      expect(result['Agua']).toContain(285);
    });

    it('contains Fogo frequencies', () => {
      const result = getFrequenciesByElement();
      expect(result['Fogo']).toBeTruthy();
      expect(result['Fogo'].length).toBe(2);
      expect(result['Fogo']).toContain(528);
    });

    it('contains Terra frequencies', () => {
      const result = getFrequenciesByElement();
      expect(result['Terra']).toBeTruthy();
      expect(result['Terra'].length).toBe(1);
      expect(result['Terra']).toContain(174);
    });
  });

  // ─── hasFrequency ───────────────────────────────────────────────────────────

  describe('hasFrequency', () => {
    it('returns true for 963 Hz', () => {
      expect(hasFrequency(963)).toBe(true);
    });

    it('returns false for unknown frequency', () => {
      expect(hasFrequency(999)).toBe(false);
    });
  });

  // ─── hasSephirotFrequency ──────────────────────────────────────────────────

  describe('hasSephirotFrequency', () => {
    it('returns true for Kether', () => {
      expect(hasSephirotFrequency('Kether')).toBe(true);
    });

    it('returns false for unknown Sephirah', () => {
      expect(hasSephirotFrequency('Unknown')).toBe(false);
    });
  });

  // ─── Interface completeness ────────────────────────────────────────────────

  describe('SephirotFrequency interface completeness', () => {
    it('all mappings have Portuguese names', () => {
      const mappings = getAllSephirotFrequencies();
      for (const mapping of mappings) {
        expect(mapping.nome_portugues).toBeTruthy();
        expect(typeof mapping.nome_portugues).toBe('string');
      }
    });

    it('all mappings have valid frequencies within Solfeggio range', () => {
      const mappings = getAllSephirotFrequencies();
      for (const mapping of mappings) {
        expect(mapping.frequencia_hz).toBeGreaterThan(100);
        expect(mapping.frequencia_hz).toBeLessThan(1000);
      }
    });

    it('all mappings have path numbers from 1 to 10', () => {
      const mappings = getAllSephirotFrequencies();
      const paths = mappings.map(m => m.numero_caminho).sort((a, b) => a - b);
      expect(paths).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('all mappings have spiritual meanings', () => {
      const mappings = getAllSephirotFrequencies();
      for (const mapping of mappings) {
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });
  });

  // ─── Frequency distribution ───────────────────────────────────────────────

  describe('Frequency distribution', () => {
    it('covers the full Solfeggio spectrum', () => {
      const mappings = getAllSephirotFrequencies();
      const frequencies = mappings.map(m => m.frequencia_hz).sort((a, b) => a - b);
      
      // Should include frequencies from 174 to 963
      expect(frequencies[0]).toBe(174);
      expect(frequencies[frequencies.length - 1]).toBe(963);
    });

    it('each frequency is unique (no duplicates except for 528 Hz)', () => {
      const mappings = getAllSephirotFrequencies();
      const frequencyCounts: Record<number, number> = {};
      
      for (const mapping of mappings) {
        frequencyCounts[mapping.frequencia_hz] = (frequencyCounts[mapping.frequencia_hz] || 0) + 1;
      }
      
      // 528 Hz should be shared by Geburah and Tiphereth
      expect(frequencyCounts[528]).toBe(2);
      
      // All other frequencies should be unique
      for (const [freq, count] of Object.entries(frequencyCounts)) {
        if (parseInt(freq) !== 528) {
          expect(count).toBe(1);
        }
      }
    });
  });
});
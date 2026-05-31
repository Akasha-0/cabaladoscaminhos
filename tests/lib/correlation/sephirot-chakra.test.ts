import { describe, it, expect } from 'vitest';
import {
  getSephirotChakra,
  getChakraSephirot,
  getAllSephirotChakras,
  getAllSephiroth,
  hasSephirotChakra,
  SEPHIROT_CHAKRA_MAPPINGS,
  type SephirotChakra,
} from '@/lib/correlation/sephirot-chakra';

describe('sephirot-chakra', () => {
  // ─── getSephirotChakra: valid Sephiroth ────────────────────────────────────

  describe('getSephirotChakra', () => {
    it('returns Kether mapping with Sahasrara chakra', () => {
      const result = getSephirotChakra('Kether');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_sanskrit).toBe('Sahasrara (Coroa)');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(1);
    });

    it('returns Chokmah mapping with Ajna chakra', () => {
      const result = getSephirotChakra('Chokmah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_sanskrit).toBe('Ajna (Terceiro Olho)');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(2);
    });

    it('returns Binah mapping with Vishuddha chakra', () => {
      const result = getSephirotChakra('Binah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_sanskrit).toBe('Vishuddha (Garganta)');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
    });

    it('returns Chesed mapping with Anahata chakra', () => {
      const result = getSephirotChakra('Chesed');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_sanskrit).toBe('Anahata (Coração)');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
    });

    it('returns Geburah mapping with Manipura chakra', () => {
      const result = getSephirotChakra('Geburah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_sanskrit).toBe('Manipura (Plexo Solar)');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
    });

    it('returns Tiphereth mapping with Anahata chakra', () => {
      const result = getSephirotChakra('Tiphereth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_sanskrit).toBe('Anahata (Coração)');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
    });

    it('returns Netzach mapping with Anahata chakra', () => {
      const result = getSephirotChakra('Netzach');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_sanskrit).toBe('Anahata (Coração)');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
    });

    it('returns Hod mapping with Vishuddha chakra', () => {
      const result = getSephirotChakra('Hod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_sanskrit).toBe('Vishuddha (Garganta)');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
    });

    it('returns Yesod mapping with Svadhisthana chakra', () => {
      const result = getSephirotChakra('Yesod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_sanskrit).toBe('Svadhisthana (Sacro)');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
    });

    it('returns Malkuth mapping with Muladhara chakra', () => {
      const result = getSephirotChakra('Malkuth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_sanskrit).toBe('Muladhara (Raiz)');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotChakra('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getSephirotChakra('');
      expect(result).toBeNull();
    });
  });

  // ─── getChakraSephirot ────────────────────────────────────────────────────────

  describe('getChakraSephirot', () => {
    it('returns Kether for Sahasrara chakra', () => {
      const result = getChakraSephirot('Sahasrara');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Kether');
      expect(result[0].chakra).toBe('Sahasrara');
    });

    it('returns Chokmah for Ajna chakra', () => {
      const result = getChakraSephirot('Ajna');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Chokmah');
      expect(result[0].chakra).toBe('Ajna');
    });

    it('returns Chesed, Tiphereth, Netzach for Anahata (heart) chakra', () => {
      const result = getChakraSephirot('Anahata');
      expect(result).toHaveLength(3);
      expect(result.map(r => r.sephirah)).toContain('Chesed');
      expect(result.map(r => r.sephirah)).toContain('Tiphereth');
      expect(result.map(r => r.sephirah)).toContain('Netzach');
    });

    it('returns Binah and Hod for Vishuddha (throat) chakra', () => {
      const result = getChakraSephirot('Vishuddha');
      expect(result).toHaveLength(2);
      expect(result.map(r => r.sephirah)).toContain('Binah');
      expect(result.map(r => r.sephirah)).toContain('Hod');
    });

    it('returns Yesod for Svadhisthana (sacro) chakra', () => {
      const result = getChakraSephirot('Svadhisthana');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Yesod');
      expect(result[0].chakra).toBe('Svadhisthana');
    });

    it('returns Malkuth for Muladhara (root) chakra', () => {
      const result = getChakraSephirot('Muladhara');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Malkuth');
      expect(result[0].chakra).toBe('Muladhara');
    });

    it('returns empty array for non-existent chakra', () => {
      const result = getChakraSephirot('NonExistent');
      expect(result).toHaveLength(0);
    });

    it('handles case-insensitive chakra names', () => {
      const result = getChakraSephirot('anahata');
      expect(result).toHaveLength(3);
    });

    it('handles English chakra names (root, heart, etc.)', () => {
      const rootResult = getChakraSephirot('root');
      expect(rootResult).toHaveLength(1);
      expect(rootResult[0].sephirah).toBe('Malkuth');

      const heartResult = getChakraSephirot('heart');
      expect(heartResult).toHaveLength(3);
    });
  });

  // ─── getAllSephirotChakras ──────────────────────────────────────────────────

  describe('getAllSephirotChakras', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotChakras();
      expect(result).toHaveLength(10);
    });

    it('returns array of SephirotChakra objects', () => {
      const result = getAllSephirotChakras();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      });
    });

    it('contains all expected Sephiroth names', () => {
      const result = getAllSephirotChakras();
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

    it('each mapping has unique sephirah name', () => {
      const result = getAllSephirotChakras();
      const sephiroth = result.map(r => r.sephirah);
      const unique = new Set(sephiroth);
      expect(unique.size).toBe(sephiroth.length);
    });
  });

  // ─── SEPHIROT_CHAKRA_MAPPINGS constant ─────────────────────────────────────

  describe('SEPHIROT_CHAKRA_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_CHAKRA_MAPPINGS)).toBe(true);
    });

    it('has exactly 10 entries', () => {
      expect(Object.keys(SEPHIROT_CHAKRA_MAPPINGS)).toHaveLength(10);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('SephirotChakra interface completeness', () => {
    it('all mappings have all required interface fields', () => {
      const allMappings = getAllSephirotChakras();
      allMappings.forEach(mapping => {
        expect(typeof mapping.sephirah).toBe('string');
        expect(typeof mapping.chakra).toBe('string');
        expect(typeof mapping.chakra_sanskrit).toBe('string');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.numero_caminho).toBe('number');
        expect(typeof mapping.energia_espiritual).toBe('string');
      });
    });

    it('numeros_caminho are unique within their respective elements', () => {
      const allMappings = getAllSephirotChakras();
      const pathNumbers = allMappings.map(m => m.numero_caminho);
      const unique = new Set(pathNumbers);
      expect(unique.size).toBe(pathNumbers.length);
    });

    it('chakras cover the full spectrum from root to crown', () => {
      const allMappings = getAllSephirotChakras();
      const chakras = allMappings.map(m => m.chakra);
      const unique = new Set(chakras);
      expect(unique.size).toBeGreaterThanOrEqual(6);
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('maps Elemento types correctly based on sephirot-element system', () => {
      // Éter Sephiroth (Kether, Chokmah)
      const kether = getSephirotChakra('Kether');
      expect(kether?.elemento).toBe('Éter');

      const chokmah = getSephirotChakra('Chokmah');
      expect(chokmah?.elemento).toBe('Éter');

      // Ar Sephiroth (Binah, Hod)
      const binah = getSephirotChakra('Binah');
      expect(binah?.elemento).toBe('Ar');

      const hod = getSephirotChakra('Hod');
      expect(hod?.elemento).toBe('Ar');

      // Fogo Sephiroth (Geburah, Tiphereth)
      const geburah = getSephirotChakra('Geburah');
      expect(geburah?.elemento).toBe('Fogo');

      const tiphereth = getSephirotChakra('Tiphereth');
      expect(tiphereth?.elemento).toBe('Fogo');

      // Água Sephiroth (Chesed, Netzach, Yesod)
      const chesed = getSephirotChakra('Chesed');
      expect(chesed?.elemento).toBe('Água');

      const netzach = getSephirotChakra('Netzach');
      expect(netzach?.elemento).toBe('Água');

      const yesod = getSephirotChakra('Yesod');
      expect(yesod?.elemento).toBe('Água');

      // Terra Sephiroth (Malkuth)
      const malkuth = getSephirotChakra('Malkuth');
      expect(malkuth?.elemento).toBe('Terra');
    });
  });

  // ─── Chakra to Sephirot bidirectional consistency ──────────────────────────

  describe('Bidirectional consistency', () => {
    it('Sephiroth that references a chakra can be found by that chakra', () => {
      const allMappings = getAllSephirotChakras();
      allMappings.forEach(mapping => {
        const reverseLookup = getChakraSephirot(mapping.chakra);
        expect(reverseLookup.some(r => r.sephirah === mapping.sephirah)).toBe(true);
      });
    });
  });


  // ─── getAllSephiroth ──────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns all 10 Sephiroth names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('returns array of strings', () => {
      const result = getAllSephiroth();
      result.forEach(name => {
        expect(typeof name).toBe('string');
      });
    });

    it('contains expected sephiroth in correct order', () => {
      const result = getAllSephiroth();
      expect(result).toEqual([
        'Kether',
        'Chokmah',
        'Binah',
        'Chesed',
        'Geburah',
        'Tiphereth',
        'Netzach',
        'Hod',
        'Yesod',
        'Malkuth',
      ]);
    });
  });

  // ─── hasSephirotChakra ────────────────────────────────────────────────────

  describe('hasSephirotChakra', () => {
    it('returns true for existing Sephiroth', () => {
      expect(hasSephirotChakra('Kether')).toBe(true);
      expect(hasSephirotChakra('Malkuth')).toBe(true);
    });

    it('returns false for non-existing Sephiroth', () => {
      expect(hasSephirotChakra('Unknown')).toBe(false);
      expect(hasSephirotChakra('')).toBe(false);
    });
  });
});

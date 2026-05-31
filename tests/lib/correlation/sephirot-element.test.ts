import { describe, it, expect } from 'vitest';
import {
  getSephirotElement,
  getElementSephirot,
  getAllSephirotElements,
  getAllSephiroth,
  hasSephirotElement,
  getElementBySephirah,
  getElementNameBySephirah,
  getSephirothByElement,
  getAllElements,
  getSpiritualMeaning,
  SEPHIROT_ELEMENT_MAPPINGS,
  ELEMENTOS,
  type SephirotElement,
} from '@/lib/correlation/sephirot-element';

describe('sephirot-element', () => {
  // ─── getSephirotElement: valid Sephiroth ──────────────────────────────────

  describe('getSephirotElement', () => {
    it('returns Kether mapping with Éter element', () => {
      const result = getSephirotElement('Kether');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.elemento).toBe('éter');
      expect(result!.elemento_nome).toBe('Éter');
    });

    it('returns Chokmah mapping with Éter element', () => {
      const result = getSephirotElement('Chokmah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.elemento).toBe('éter');
      expect(result!.elemento_nome).toBe('Éter');
    });

    it('returns Binah mapping with Ar element', () => {
      const result = getSephirotElement('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.elemento).toBe('ar');
      expect(result!.elemento_nome).toBe('Ar');
    });

    it('returns Chesed mapping with Água element', () => {
      const result = getSephirotElement('Chesed');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.elemento).toBe('água');
      expect(result!.elemento_nome).toBe('Água');
    });

    it('returns Geburah mapping with Fogo element', () => {
      const result = getSephirotElement('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.elemento).toBe('fogo');
      expect(result!.elemento_nome).toBe('Fogo');
    });

    it('returns Tiphereth mapping with Fogo element', () => {
      const result = getSephirotElement('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.elemento).toBe('fogo');
      expect(result!.elemento_nome).toBe('Fogo');
    });

    it('returns Netzach mapping with Água element', () => {
      const result = getSephirotElement('Netzach');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.elemento).toBe('água');
      expect(result!.elemento_nome).toBe('Água');
    });

    it('returns Hod mapping with Ar element', () => {
      const result = getSephirotElement('Hod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.elemento).toBe('ar');
      expect(result!.elemento_nome).toBe('Ar');
    });

    it('returns Yesod mapping with Água element', () => {
      const result = getSephirotElement('Yesod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.elemento).toBe('água');
      expect(result!.elemento_nome).toBe('Água');
    });

    it('returns Malkuth mapping with Terra element', () => {
      const result = getSephirotElement('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('terra');
      expect(result!.elemento_nome).toBe('Terra');
    });

    it('returns null for unknown sephirah', () => {
      const result = getSephirotElement('Unknown');
      expect(result).toBeNull();
    });

    it('is case-sensitive', () => {
      const result = getSephirotElement('kether');
      expect(result).toBeNull();
    });
  });

  // ─── getElementSephirot ────────────────────────────────────────────────────

  describe('getElementSephirot', () => {
    it('returns all Sephiroth for Éter element', () => {
      const result = getElementSephirot('éter');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Kether');
      expect(result.map((r) => r.sephirah)).toContain('Chokmah');
    });

    it('returns all Sephiroth for Ar element', () => {
      const result = getElementSephirot('ar');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Binah');
      expect(result.map((r) => r.sephirah)).toContain('Hod');
    });

    it('returns all Sephiroth for Água element', () => {
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.sephirah)).toContain('Chesed');
      expect(result.map((r) => r.sephirah)).toContain('Netzach');
      expect(result.map((r) => r.sephirah)).toContain('Yesod');
    });

    it('returns all Sephiroth for Fogo element', () => {
      const result = getElementSephirot('fogo');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Geburah');
      expect(result.map((r) => r.sephirah)).toContain('Tiphereth');
    });

    it('returns all Sephiroth for Terra element', () => {
      const result = getElementSephirot('terra');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Malkuth');
    });

    it('returns empty array for unknown element', () => {
      const result = getElementSephirot('unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllSephirotElements ───────────────────────────────────────────────

  describe('getAllSephirotElements', () => {
    it('returns all 10 Sephirot-element mappings', () => {
      const result = getAllSephirotElements();
      expect(result).toHaveLength(10);
    });

    it('returns array with correct structure', () => {
      const result = getAllSephirotElements();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('elemento_nome');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('contains all expected sephiroth names', () => {
      const result = getAllSephirotElements();
      const sephirothNames = result.map((r) => r.sephirah);
      expect(sephirothNames).toContain('Kether');
      expect(sephirothNames).toContain('Chokmah');
      expect(sephirothNames).toContain('Binah');
      expect(sephirothNames).toContain('Chesed');
      expect(sephirothNames).toContain('Geburah');
      expect(sephirothNames).toContain('Tiphereth');
      expect(sephirothNames).toContain('Netzach');
      expect(sephirothNames).toContain('Hod');
      expect(sephirothNames).toContain('Yesod');
      expect(sephirothNames).toContain('Malkuth');
    });
  });

  // ─── getAllSephiroth ───────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns array of 10 sephirah names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('contains all canonical sephiroth names in order', () => {
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

  // ─── hasSephirotElement ────────────────────────────────────────────────────

  describe('hasSephirotElement', () => {
    it('returns true for all valid Sephiroth', () => {
      expect(hasSephirotElement('Kether')).toBe(true);
      expect(hasSephirotElement('Chokmah')).toBe(true);
      expect(hasSephirotElement('Binah')).toBe(true);
      expect(hasSephirotElement('Chesed')).toBe(true);
      expect(hasSephirotElement('Geburah')).toBe(true);
      expect(hasSephirotElement('Tiphereth')).toBe(true);
      expect(hasSephirotElement('Netzach')).toBe(true);
      expect(hasSephirotElement('Hod')).toBe(true);
      expect(hasSephirotElement('Yesod')).toBe(true);
      expect(hasSephirotElement('Malkuth')).toBe(true);
    });

    it('returns false for unknown sephirah', () => {
      expect(hasSephirotElement('Unknown')).toBe(false);
      expect(hasSephirotElement('Daath')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(hasSephirotElement('kether')).toBe(false);
      expect(hasSephirotElement('KETHER')).toBe(false);
    });
  });

  // ─── getElementBySephirah ─────────────────────────────────────────────────

  describe('getElementBySephirah', () => {
    it('returns correct element type for each sephirah', () => {
      expect(getElementBySephirah('Kether')).toBe('éter');
      expect(getElementBySephirah('Chokmah')).toBe('éter');
      expect(getElementBySephirah('Binah')).toBe('ar');
      expect(getElementBySephirah('Chesed')).toBe('água');
      expect(getElementBySephirah('Geburah')).toBe('fogo');
      expect(getElementBySephirah('Tiphereth')).toBe('fogo');
      expect(getElementBySephirah('Netzach')).toBe('água');
      expect(getElementBySephirah('Hod')).toBe('ar');
      expect(getElementBySephirah('Yesod')).toBe('água');
      expect(getElementBySephirah('Malkuth')).toBe('terra');
    });

    it('returns null for unknown sephirah', () => {
      expect(getElementBySephirah('Unknown')).toBeNull();
    });
  });

  // ─── getElementNameBySephirah ─────────────────────────────────────────────

  describe('getElementNameBySephirah', () => {
    it('returns correct element display name for each sephirah', () => {
      expect(getElementNameBySephirah('Kether')).toBe('Éter');
      expect(getElementNameBySephirah('Chokmah')).toBe('Éter');
      expect(getElementNameBySephirah('Binah')).toBe('Ar');
      expect(getElementNameBySephirah('Chesed')).toBe('Água');
      expect(getElementNameBySephirah('Geburah')).toBe('Fogo');
      expect(getElementNameBySephirah('Tiphereth')).toBe('Fogo');
      expect(getElementNameBySephirah('Netzach')).toBe('Água');
      expect(getElementNameBySephirah('Hod')).toBe('Ar');
      expect(getElementNameBySephirah('Yesod')).toBe('Água');
      expect(getElementNameBySephirah('Malkuth')).toBe('Terra');
    });

    it('returns null for unknown sephirah', () => {
      expect(getElementNameBySephirah('Unknown')).toBeNull();
    });
  });

  // ─── getSephirothByElement ─────────────────────────────────────────────────

  describe('getSephirothByElement', () => {
    it('returns correct Sephiroth for Éter', () => {
      const result = getSephirothByElement('éter');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Kether');
      expect(result.map((r) => r.sephirah)).toContain('Chokmah');
    });

    it('returns correct Sephiroth for Ar', () => {
      const result = getSephirothByElement('ar');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Binah');
      expect(result.map((r) => r.sephirah)).toContain('Hod');
    });

    it('returns correct Sephiroth for Água', () => {
      it('returns correct Sephiroth for Água', () => {
        const result = getSephirothByElement('água');
        expect(result).toHaveLength(3);
      });
    it('returns correct Sephiroth for Fogo', () => {
      const result = getSephirothByElement('fogo');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Geburah');
      expect(result.map((r) => r.sephirah)).toContain('Tiphereth');
    });

    it('returns correct Sephiroth for Terra', () => {
      const result = getSephirothByElement('terra');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Malkuth');
    });

    it('returns empty array for unknown element', () => {
      const result = getSephirothByElement('unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllElements ────────────────────────────────────────────────────────

  describe('getAllElements', () => {
    it('returns array of 5 elements', () => {
      const result = getAllElements();
      expect(result).toHaveLength(5);
    });

    it('contains all standard elements', () => {
      const result = getAllElements();
      expect(result).toContain('fogo');
      expect(result).toContain('água');
      expect(result).toContain('ar');
      expect(result).toContain('terra');
      expect(result).toContain('éter');
    });
  });

  // ─── getSpiritualMeaning ──────────────────────────────────────────────────

  describe('getSpiritualMeaning', () => {
    it('returns spiritual meaning for all valid Sephiroth', () => {
      expect(getSpiritualMeaning('Kether')).not.toBeNull();
      expect(getSpiritualMeaning('Chokmah')).not.toBeNull();
      expect(getSpiritualMeaning('Binah')).not.toBeNull();
      expect(getSpiritualMeaning('Chesed')).not.toBeNull();
      expect(getSpiritualMeaning('Geburah')).not.toBeNull();
      expect(getSpiritualMeaning('Tiphereth')).not.toBeNull();
      expect(getSpiritualMeaning('Netzach')).not.toBeNull();
      expect(getSpiritualMeaning('Hod')).not.toBeNull();
      expect(getSpiritualMeaning('Yesod')).not.toBeNull();
      expect(getSpiritualMeaning('Malkuth')).not.toBeNull();
    });

    it('returns null for unknown sephirah', () => {
      expect(getSpiritualMeaning('Unknown')).toBeNull();
    });

    it('returns non-empty spiritual meaning strings', () => {
      const sephiroth = getAllSephiroth();
      sephiroth.forEach((sephirah) => {
        const meaning = getSpiritualMeaning(sephirah);
        expect(meaning).not.toBeNull();
        expect(meaning!.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── SEPHIROT_ELEMENT_MAPPINGS constant ───────────────────────────────────

  describe('SEPHIROT_ELEMENT_MAPPINGS constant', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_ELEMENT_MAPPINGS)).toBe(true);
    });

    it('contains 10 sephiroth entries', () => {
      expect(Object.keys(SEPHIROT_ELEMENT_MAPPINGS)).toHaveLength(10);
    });

    it('has frozen inner mapping objects', () => {
      Object.values(SEPHIROT_ELEMENT_MAPPINGS).forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });

    it('matches getAllSephirotElements output', () => {
      const directMappings = Object.values(SEPHIROT_ELEMENT_MAPPINGS);
      const functionMappings = getAllSephirotElements();
      expect(directMappings.length).toBe(functionMappings.length);
    });
  });

  // ─── ELEMENTOS constant ───────────────────────────────────────────────────

    it('is an array of 5 elements', () => {
      expect(ELEMENTOS.length).toBe(5);
    });

    it('contains all standard elements', () => {
      expect(ELEMENTOS).toContain('fogo');
      expect(ELEMENTOS).toContain('água');
      expect(ELEMENTOS).toContain('ar');
      expect(ELEMENTOS).toContain('terra');
      expect(ELEMENTOS).toContain('éter');
    });

    it('matches getAllElements output', () => {
      expect(ELEMENTOS).toEqual(getAllElements());
    });
  });

  // ─── SephirotElement interface completeness ─────────────────────────────

  describe('SephirotElement interface completeness', () => {
    it('has all required properties for each sephirah', () => {
      const sephiroth = getAllSephiroth();
      sephiroth.forEach((sephirah) => {
        const mapping = getSephirotElement(sephirah);
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('elemento_nome');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('elemento and elemento_nome are consistent', () => {
      const sephiroth = getAllSephiroth();
      sephiroth.forEach((sephirah) => {
        const mapping = getSephirotElement(sephirah)!;
        const expectedNome = mapping.elemento.charAt(0).toUpperCase() + mapping.elemento.slice(1);
        expect(mapping.elemento_nome).toBe(expectedNome);
      });
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('maps exactly 10 Sephiroth to elements', () => {
      const all = getAllSephirotElements();
      expect(all).toHaveLength(10);
    });

    it('covers all 5 elements', () => {
      const elements = getAllElements();
      elements.forEach((elemento) => {
        const sephiroth = getElementSephirot(elemento);
        expect(sephiroth.length).toBeGreaterThan(0);
      });
    });

    it('has correct element distribution', () => {
      expect(getElementSephirot('éter')).toHaveLength(2); // Kether, Chokmah
      expect(getElementSephirot('ar')).toHaveLength(2);   // Binah, Hod
      expect(getElementSephirot('fogo')).toHaveLength(2);   // Geburah, Tiphereth
      expect(getElementSephirot('água')).toHaveLength(3);  // Chesed, Netzach, Yesod
      expect(getElementSephirot('terra')).toHaveLength(1); // Malkuth
    });
  });

  // ─── Reverse mapping consistency ───────────────────────────────────────────

  describe('Reverse mapping consistency', () => {
    it('getElementSephirot and getSephirothByElement return same results', () => {
      ELEMENTOS.forEach((elemento) => {
        expect(getElementSephirot(elemento)).toEqual(getSephirothByElement(elemento));
      });
    });

    it('getSephirotElement can retrieve each sephirah', () => {
      const sephiroth = getAllSephiroth();
      sephiroth.forEach((sephirah) => {
        const result = getSephirotElement(sephirah);
        expect(result).not.toBeNull();
        expect(result!.sephirah).toBe(sephirah);
      });
    });
  });
});
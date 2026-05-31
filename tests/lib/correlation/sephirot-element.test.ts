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
} from '@/lib/correlation/sephirot-element';

describe('sephirot-element', () => {
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
    });

    it('returns Binah mapping with Ar element', () => {
      const result = getSephirotElement('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.elemento).toBe('ar');
    });

    it('returns Chesed mapping with Água element', () => {
      const result = getSephirotElement('Chesed');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.elemento).toBe('água');
    });

    it('returns Geburah mapping with Fogo element', () => {
      const result = getSephirotElement('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.elemento).toBe('fogo');
    });

    it('returns Tiphereth mapping with Fogo element', () => {
      const result = getSephirotElement('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.elemento).toBe('fogo');
    });

    it('returns Netzach mapping with Água element', () => {
      const result = getSephirotElement('Netzach');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.elemento).toBe('água');
    });

    it('returns Hod mapping with Ar element', () => {
      const result = getSephirotElement('Hod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.elemento).toBe('ar');
    });

    it('returns Yesod mapping with Água element', () => {
      const result = getSephirotElement('Yesod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.elemento).toBe('água');
    });

    it('returns Malkuth mapping with Terra element', () => {
      const result = getSephirotElement('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('terra');
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
      const result = getElementSephirot('água');
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
      const names = result.map((r) => r.sephirah);
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
  });

  describe('getAllSephiroth', () => {
    it('returns array of 10 sephirah names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('contains all canonical sephiroth names', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Malkuth');
    });
  });

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
    });
  });

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

  describe('getElementNameBySephirah', () => {
    it('returns correct element display name for each sephirah', () => {
      expect(getElementNameBySephirah('Kether')).toBe('Éter');
      expect(getElementNameBySephirah('Malkuth')).toBe('Terra');
    });

    it('returns null for unknown sephirah', () => {
      expect(getElementNameBySephirah('Unknown')).toBeNull();
    });
  });

  describe('getSephirothByElement', () => {
    it('returns correct Sephiroth for Éter', () => {
      const result = getSephirothByElement('éter');
      expect(result).toHaveLength(2);
    });

    it('returns correct Sephiroth for Ar', () => {
      const result = getSephirothByElement('ar');
      expect(result).toHaveLength(2);
    });

    it('returns correct Sephiroth for Água', () => {
      const result = getSephirothByElement('água');
      expect(result).toHaveLength(3);
    });

    it('returns correct Sephiroth for Fogo', () => {
      const result = getSephirothByElement('fogo');
      expect(result).toHaveLength(2);
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

  describe('getSpiritualMeaning', () => {
    it('returns spiritual meaning for all valid Sephiroth', () => {
      const sephiroth = getAllSephiroth();
      sephiroth.forEach((sephirah) => {
        const meaning = getSpiritualMeaning(sephirah);
        expect(meaning).not.toBeNull();
        expect(meaning!.length).toBeGreaterThan(0);
      });
    });

    it('returns null for unknown sephirah', () => {
      expect(getSpiritualMeaning('Unknown')).toBeNull();
    });
  });

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
  });

  describe('ELEMENTOS constant', () => {
    it('has 5 elements', () => {
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
      expect(getElementSephirot('éter')).toHaveLength(2);
      expect(getElementSephirot('ar')).toHaveLength(2);
      expect(getElementSephirot('fogo')).toHaveLength(2);
      expect(getElementSephirot('água')).toHaveLength(3);
      expect(getElementSephirot('terra')).toHaveLength(1);
    });
  });

  describe('Reverse mapping consistency', () => {
    it('getElementSephirot and getSephirothByElement return same results', () => {
      const elements = getAllElements();
      elements.forEach((elemento) => {
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
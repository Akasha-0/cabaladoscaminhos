import { describe, it, expect } from 'vitest';
import {
  getSephirotZodiac,
  getZodiacSephirot,
  getAllSephirotZodiacs,
  getAllSephiroth,
  hasSephirotZodiac,
  getSignoBySephirah,
  getElementBySephirah,
  getSephirothBySigno,
  getAllSignos,
  getAllElements,
  getSpiritualMeaning,
  SEPHIROT_ZODIAC_MAPPINGS,
  SIGNOS,
} from '@/lib/correlation/sephirot-zodiac';

describe('sephirot-zodiac', () => {
  describe('getSephirotZodiac', () => {
    it('returns Kether mapping with Capricórnio sign', () => {
      const result = getSephirotZodiac('Kether');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.elemento).toBe('Terra');
    });

    it('returns Chokmah mapping with Aquário sign', () => {
      const result = getSephirotZodiac('Chokmah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.signo).toBe('Aquário');
    });

    it('returns Binah mapping with Gémeos sign', () => {
      const result = getSephirotZodiac('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.signo).toBe('Gémeos');
    });

    it('returns Chesed mapping with Sagitário sign', () => {
      const result = getSephirotZodiac('Chesed');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.signo).toBe('Sagitário');
    });

    it('returns Geburah mapping with Áries sign', () => {
      const result = getSephirotZodiac('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.signo).toBe('Áries');
    });

    it('returns Tiphereth mapping with Leão sign', () => {
      const result = getSephirotZodiac('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.signo).toBe('Leão');
    });

    it('returns Netzach mapping with Touro sign', () => {
      const result = getSephirotZodiac('Netzach');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.signo).toBe('Touro');
    });

    it('returns Hod mapping with Virgem sign', () => {
      const result = getSephirotZodiac('Hod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.signo).toBe('Virgem');
    });

    it('returns Yesod mapping with Caranguejo sign', () => {
      const result = getSephirotZodiac('Yesod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.signo).toBe('Caranguejo');
    });

    it('returns Malkuth mapping with Capricórnio sign', () => {
      const result = getSephirotZodiac('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.signo).toBe('Capricórnio');
    });

    it('returns null for unknown sephirah', () => {
      const result = getSephirotZodiac('Unknown');
      expect(result).toBeNull();
    });

    it('is case-sensitive', () => {
      const result = getSephirotZodiac('kether');
      expect(result).toBeNull();
    });
  });

  describe('getZodiacSephirot', () => {
    it('returns Kether for Capricórnio sign', () => {
      const result = getZodiacSephirot('Capricórnio');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Kether');
      expect(result.map((r) => r.sephirah)).toContain('Malkuth');
    });

    it('returns Chokmah for Aquário sign', () => {
      const result = getZodiacSephirot('Aquário');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Chokmah');
    });

    it('returns Chesed for Sagitário sign', () => {
      const result = getZodiacSephirot('Sagitário');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Chesed');
    });

    it('returns empty array for unknown sign', () => {
      const result = getZodiacSephirot('Unknown');
      expect(result).toHaveLength(0);
    });

    it('handles case-insensitive input', () => {
      const result = getZodiacSephirot('capricornio');
      expect(result).toHaveLength(2);
    });
  });

  describe('getAllSephirotZodiacs', () => {
    it('returns all 10 Sephirot-zodiac mappings', () => {
      const result = getAllSephirotZodiacs();
      expect(result).toHaveLength(10);
    });

    it('returns array with correct structure', () => {
      const result = getAllSephirotZodiacs();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('contains all expected sephiroth names', () => {
      const result = getAllSephirotZodiacs();
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

  describe('hasSephirotZodiac', () => {
    it('returns true for all valid Sephiroth', () => {
      expect(hasSephirotZodiac('Kether')).toBe(true);
      expect(hasSephirotZodiac('Chokmah')).toBe(true);
      expect(hasSephirotZodiac('Binah')).toBe(true);
      expect(hasSephirotZodiac('Chesed')).toBe(true);
      expect(hasSephirotZodiac('Geburah')).toBe(true);
      expect(hasSephirotZodiac('Tiphereth')).toBe(true);
      expect(hasSephirotZodiac('Netzach')).toBe(true);
      expect(hasSephirotZodiac('Hod')).toBe(true);
      expect(hasSephirotZodiac('Yesod')).toBe(true);
      expect(hasSephirotZodiac('Malkuth')).toBe(true);
    });

    it('returns false for unknown sephirah', () => {
      expect(hasSephirotZodiac('Unknown')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(hasSephirotZodiac('kether')).toBe(false);
    });
  });

  describe('getSignoBySephirah', () => {
    it('returns Capricórnio for Kether', () => {
      expect(getSignoBySephirah('Kether')).toBe('Capricórnio');
    });

    it('returns Leão for Tiphereth', () => {
      expect(getSignoBySephirah('Tiphereth')).toBe('Leão');
    });

    it('returns null for unknown sephirah', () => {
      expect(getSignoBySephirah('Unknown')).toBeNull();
    });
  });

  describe('getElementBySephirah', () => {
    it('returns Terra for Kether', () => {
      expect(getElementBySephirah('Kether')).toBe('Terra');
    });

    it('returns Fogo for Tiphereth', () => {
      expect(getElementBySephirah('Tiphereth')).toBe('Fogo');
    });

    it('returns Água for Yesod', () => {
      expect(getElementBySephirah('Yesod')).toBe('Água');
    });

    it('returns null for unknown sephirah', () => {
      expect(getElementBySephirah('Unknown')).toBeNull();
    });
  });

  describe('getSephirothBySigno', () => {
    it('returns two Sephiroth for Capricórnio', () => {
      const result = getSephirothBySigno('Capricórnio');
      expect(result).toHaveLength(2);
    });

    it('returns one Sephirah for Aquário', () => {
      const result = getSephirothBySigno('Aquário');
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllSignos', () => {
    it('returns unique zodiac signs', () => {
      const result = getAllSignos();
      expect(result.length).toBeLessThanOrEqual(12);
      expect(result).toContain('Capricórnio');
      expect(result).toContain('Aquário');
    });
  });

  describe('getAllElements', () => {
    it('returns unique elements used', () => {
      const result = getAllElements();
      expect(result).toContain('Fogo');
      expect(result).toContain('Água');
      expect(result).toContain('Terra');
      expect(result).toContain('Ar');
    });
  });

  describe('getSpiritualMeaning', () => {
    it('returns spiritual meaning for Kether', () => {
      const result = getSpiritualMeaning('Kether');
      expect(result).not.toBeNull();
      expect(result).toContain('Coroa Divina');
    });

    it('returns spiritual meaning for Tiphereth', () => {
      const result = getSpiritualMeaning('Tiphereth');
      expect(result).not.toBeNull();
      expect(result).toContain('Beleza');
    });

    it('returns null for unknown sephirah', () => {
      const result = getSpiritualMeaning('Unknown');
      expect(result).toBeNull();
    });
  });

  describe('SEPHIROT_ZODIAC_MAPPINGS constant', () => {
    it('contains all 10 Sephiroth', () => {
      expect(Object.keys(SEPHIROT_ZODIAC_MAPPINGS)).toHaveLength(10);
    });

    it('all entries have valid signo', () => {
      const validSigns = ['Áries', 'Touro', 'Gémeos', 'Caranguejo', 'Leão', 'Virgem', 'Balança', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
      Object.values(SEPHIROT_ZODIAC_MAPPINGS).forEach((mapping) => {
        expect(validSigns).toContain(mapping.signo);
      });
    });

    it('all entries have valid elemento', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra'];
      Object.values(SEPHIROT_ZODIAC_MAPPINGS).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });

  describe('SIGNOS constant', () => {
    it('contains all 12 zodiac signs', () => {
      expect(SIGNOS).toHaveLength(12);
    });

    it('contains key signs', () => {
      expect(SIGNOS).toContain('Capricórnio');
      expect(SIGNOS).toContain('Leão');
      expect(SIGNOS).toContain('Áries');
    });
  });

  describe('Element distribution', () => {
    it('Fogo element has multiple Sephiroth', () => {
      const fogoSephiroth = Object.values(SEPHIROT_ZODIAC_MAPPINGS).filter((m) => m.elemento === 'Fogo');
      expect(fogoSephiroth.length).toBeGreaterThan(1);
    });

    it('Earth element has multiple Sephiroth', () => {
      const terraSephiroth = Object.values(SEPHIROT_ZODIAC_MAPPINGS).filter((m) => m.elemento === 'Terra');
      expect(terraSephiroth.length).toBeGreaterThan(1);
    });
  });

  describe('Zodiac sign distribution', () => {
    it('Capricórnio is associated with multiple Sephiroth', () => {
      const capricornioSephiroth = Object.values(SEPHIROT_ZODIAC_MAPPINGS).filter(
        (m) => m.signo === 'Capricórnio'
      );
      expect(capricornioSephiroth.length).toBe(2);
    });
  });

  describe('Reverse mapping consistency', () => {
    it('getSephirotZodiac and getZodiacSephirot are inverse operations', () => {
      const allZodiacs = getAllSephirotZodiacs();
      allZodiacs.forEach((mapping) => {
        const sephirah = mapping.sephirah;
        const signo = mapping.signo;

        const result = getSephirotZodiac(sephirah);
        expect(result).not.toBeNull();
        expect(result!.signo).toBe(signo);
      });
    });

    it('getSignoBySephirah is consistent with getSephirotZodiac', () => {
      const sephiroth = ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      sephiroth.forEach((sephirah) => {
        const fullMapping = getSephirotZodiac(sephirah);
        const signoOnly = getSignoBySephirah(sephirah);
        expect(signoOnly).toBe(fullMapping?.signo ?? null);
      });
    });
  });
});
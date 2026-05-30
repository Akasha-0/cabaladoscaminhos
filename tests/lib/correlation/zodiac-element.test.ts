import { describe, it, expect } from 'vitest';
import {
  getZodiacElement,
  getElementZodiac,
  getAllZodiacElements,
  getElementFromZodiac,
  getQualidadesFromZodiac,
  getPraticasFromZodiac,
  getSignosByElement,
  getSignosByPolaridade,
  getCabalaFromZodiac,
  ZODIAC_ELEMENT_MAPPINGS,
  type ZodiacElementMapping,
  type Signo,
} from '@/lib/correlation/zodiac-element';

describe('zodiac-element', () => {
  // ─── ZODIAC_ELEMENT_MAPPINGS: all 12 signs ────────────────────────────────

  describe('ZODIAC_ELEMENT_MAPPINGS', () => {
    const expectedSigns: readonly Signo[] = [
      'Áries', 'Touro', 'Gémeos', 'Câncer',
      'Leão', 'Virgem', 'Libra', 'Escorpião',
      'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
    ];

    it('contains all 12 zodiac signs', () => {
      const keys = Object.keys(ZODIAC_ELEMENT_MAPPINGS);
      expect(keys).toHaveLength(12);
      expectedSigns.forEach((sign) => {
        expect(keys).toContain(sign);
      });
    });

    it('each sign has required fields', () => {
      expectedSigns.forEach((sign) => {
        const mapping = ZODIAC_ELEMENT_MAPPINGS[sign];
        expect(mapping.signo).toBe(sign);
        expect(mapping.elemento).toBeDefined();
        expect(mapping.qualidades_elementares).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
        expect(mapping.correspondencia_cabala).toBeDefined();
      });
    });

    it('element distribution is correct: 3 fire, 3 earth, 3 air, 3 water', () => {
      const elements = Object.values(ZODIAC_ELEMENT_MAPPINGS).map((m) => m.elemento);
      const fireCount = elements.filter((e) => e === 'Fogo').length;
      const earthCount = elements.filter((e) => e === 'Terra').length;
      const airCount = elements.filter((e) => e === 'Ar').length;
      const waterCount = elements.filter((e) => e === 'Água').length;
      expect(fireCount).toBe(3);
      expect(earthCount).toBe(3);
      expect(airCount).toBe(3);
      expect(waterCount).toBe(3);
    });

    it('each sign has valid element qualities', () => {
      Object.values(ZODIAC_ELEMENT_MAPPINGS).forEach((mapping) => {
        expect(['Quente', 'Frio', 'Neutro']).toContain(mapping.qualidades_elementares.quente_frio);
        expect(['Húmido', 'Seco', 'Neutro']).toContain(mapping.qualidades_elementares.humido_seco);
        expect(['Yang', 'Yin']).toContain(mapping.qualidades_elementares.polaridade);
        expect(mapping.qualidades_elementares.vibração).toBeDefined();
      });
    });

    it('each sign has spiritual practices with non-empty arrays', () => {
      Object.values(ZODIAC_ELEMENT_MAPPINGS).forEach((mapping) => {
        expect(mapping.praticas_espirituais.ebos.length).toBeGreaterThan(0);
        expect(mapping.praticas_espirituais.banhos.length).toBeGreaterThan(0);
        expect(mapping.praticas_espirituais.defumacoes.length).toBeGreaterThan(0);
        expect(mapping.praticas_espirituais.mantras.length).toBeGreaterThan(0);
        expect(mapping.praticas_espirituais.horarios_rituais.length).toBeGreaterThan(0);
        expect(mapping.praticas_espirituais.cores_rituais.length).toBeGreaterThan(0);
        expect(mapping.praticas_espirituais.ofertas.length).toBeGreaterThan(0);
      });
    });

    it('each sign has Cabala correspondence with sefirot and arcanjo', () => {
      Object.values(ZODIAC_ELEMENT_MAPPINGS).forEach((mapping) => {
        expect(mapping.correspondencia_cabala.sefirot).toBeDefined();
        expect(mapping.correspondencia_cabala.arcanjo).toBeDefined();
      });
    });
  });

  // ─── getZodiacElement: lookup by sign ───────────────────────────────────────

  describe('getZodiacElement', () => {
    it('returns mapping for each of the 12 signs', () => {
      const signs = ['Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
                     'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
      signs.forEach((sign) => {
        const result = getZodiacElement(sign);
        expect(result).not.toBeNull();
        expect(result?.signo).toBe(sign);
      });
    });

    it('handles case-insensitive lookup', () => {
      expect(getZodiacElement('aries')?.signo).toBe('Áries');
      expect(getZodiacElement('ARIES')?.signo).toBe('Áries');
      expect(getZodiacElement('aries')?.signo).toBe('Áries');
    });

    it('handles accented characters', () => {
      expect(getZodiacElement('touro')?.signo).toBe('Touro');
      expect(getZodiacElement('gêmeos')?.signo).toBe('Gémeos');
      expect(getZodiacElement('escorpião')?.signo).toBe('Escorpião');
      expect(getZodiacElement('sagitário')?.signo).toBe('Sagitário');
      expect(getZodiacElement('capricórnio')?.signo).toBe('Capricórnio');
      expect(getZodiacElement('aquário')?.signo).toBe('Aquário');
    });

    it('handles whitespace trimming', () => {
      expect(getZodiacElement('  Áries  ')?.signo).toBe('Áries');
    });

    it('returns null for unknown sign', () => {
      expect(getZodiacElement('NonExistent')).toBeNull();
      expect(getZodiacElement('')).toBeNull();
    });

    it('returns correct element for each sign', () => {
      expect(getZodiacElement('Áries')?.elemento).toBe('Fogo');
      expect(getZodiacElement('Touro')?.elemento).toBe('Terra');
      expect(getZodiacElement('Gémeos')?.elemento).toBe('Ar');
      expect(getZodiacElement('Câncer')?.elemento).toBe('Água');
      expect(getZodiacElement('Leão')?.elemento).toBe('Fogo');
      expect(getZodiacElement('Virgem')?.elemento).toBe('Terra');
      expect(getZodiacElement('Libra')?.elemento).toBe('Ar');
      expect(getZodiacElement('Escorpião')?.elemento).toBe('Água');
      expect(getZodiacElement('Sagitário')?.elemento).toBe('Fogo');
      expect(getZodiacElement('Capricórnio')?.elemento).toBe('Terra');
      expect(getZodiacElement('Aquário')?.elemento).toBe('Ar');
      expect(getZodiacElement('Peixes')?.elemento).toBe('Água');
    });
  });

  // ─── getElementZodiac: lookup by element ───────────────────────────────────

  describe('getElementZodiac', () => {
    it('returns 3 signs for each element', () => {
      expect(getElementZodiac('Fogo')?.length).toBe(3);
      expect(getElementZodiac('Terra')?.length).toBe(3);
      expect(getElementZodiac('Ar')?.length).toBe(3);
      expect(getElementZodiac('Água')?.length).toBe(3);
    });

    it('returns correct signs for Fogo', () => {
      const fogo = getElementZodiac('Fogo');
      expect(fogo?.map((m) => m.signo)).toEqual(expect.arrayContaining(['Áries', 'Leão', 'Sagitário']));
    });

    it('returns correct signs for Terra', () => {
      const terra = getElementZodiac('Terra');
      expect(terra?.map((m) => m.signo)).toEqual(expect.arrayContaining(['Touro', 'Virgem', 'Capricórnio']));
    });

    it('returns correct signs for Ar', () => {
      const ar = getElementZodiac('Ar');
      expect(ar?.map((m) => m.signo)).toEqual(expect.arrayContaining(['Gémeos', 'Libra', 'Aquário']));
    });

    it('returns correct signs for Água', () => {
      const agua = getElementZodiac('Água');
      expect(agua?.map((m) => m.signo)).toEqual(expect.arrayContaining(['Câncer', 'Escorpião', 'Peixes']));
    });

    it('handles case-insensitive lookup', () => {
      expect(getElementZodiac('fogo')?.length).toBe(3);
      expect(getElementZodiac('FOGO')?.length).toBe(3);
    });

    it('handles accented characters', () => {
      expect(getElementZodiac('Água')?.length).toBe(3);
      expect(getElementZodiac('agua')?.length).toBe(3);
    });

    it('returns null for invalid element', () => {
      expect(getElementZodiac('InvalidElement')).toBeNull();
      expect(getElementZodiac('')).toBeNull();
    });
  });

  // ─── getAllZodiacElements ──────────────────────────────────────────────────

  describe('getAllZodiacElements', () => {
    it('returns all 12 zodiac element mappings', () => {
      const all = getAllZodiacElements();
      expect(all).toHaveLength(12);
    });

    it('returns array of ZodiacElementMapping objects', () => {
      const all = getAllZodiacElements();
      all.forEach((mapping) => {
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('qualidades_elementares');
        expect(mapping).toHaveProperty('praticas_espirituais');
        expect(mapping).toHaveProperty('correspondencia_cabala');
      });
    });

    it('includes complete data for each mapping', () => {
      const all = getAllZodiacElements();
      all.forEach((mapping) => {
        expect(mapping.praticas_espirituais.ebos.length).toBeGreaterThan(0);
        expect(mapping.correspondencia_cabala.sefirot).toBeDefined();
      });
    });
  });

  // ─── getElementFromZodiac ───────────────────────────────────────────────────

  describe('getElementFromZodiac', () => {
    it('returns element for each sign', () => {
      expect(getElementFromZodiac('Áries')).toBe('Fogo');
      expect(getElementFromZodiac('Touro')).toBe('Terra');
      expect(getElementFromZodiac('Gémeos')).toBe('Ar');
      expect(getElementFromZodiac('Câncer')).toBe('Água');
      expect(getElementFromZodiac('Leão')).toBe('Fogo');
      expect(getElementFromZodiac('Virgem')).toBe('Terra');
      expect(getElementFromZodiac('Libra')).toBe('Ar');
      expect(getElementFromZodiac('Escorpião')).toBe('Água');
      expect(getElementFromZodiac('Sagitário')).toBe('Fogo');
      expect(getElementFromZodiac('Capricórnio')).toBe('Terra');
      expect(getElementFromZodiac('Aquário')).toBe('Ar');
      expect(getElementFromZodiac('Peixes')).toBe('Água');
    });

    it('returns null for unknown sign', () => {
      expect(getElementFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getQualidadesFromZodiac ───────────────────────────────────────────────

  describe('getQualidadesFromZodiac', () => {
    it('returns qualities for fire signs', () => {
      const aries = getQualidadesFromZodiac('Áries');
      expect(aries?.quente_frio).toBe('Quente');
      expect(aries?.humido_seco).toBe('Seco');
      expect(aries?.polaridade).toBe('Yang');
      expect(aries?.vibração).toBeDefined();
    });

    it('returns qualities for water signs', () => {
      const cancer = getQualidadesFromZodiac('Câncer');
      expect(cancer?.quente_frio).toBe('Frio');
      expect(cancer?.humido_seco).toBe('Húmido');
      expect(cancer?.polaridade).toBe('Yin');
    });

    it('returns null for unknown sign', () => {
      expect(getQualidadesFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getPraticasFromZodiac ──────────────────────────────────────────────────

  describe('getPraticasFromZodiac', () => {
    it('returns spiritual practices for each sign', () => {
      const aries = getPraticasFromZodiac('Áries');
      expect(aries).not.toBeNull();
      expect(aries?.ebos.length).toBeGreaterThan(0);
      expect(aries?.banhos.length).toBeGreaterThan(0);
      expect(aries?.defumacoes.length).toBeGreaterThan(0);
      expect(aries?.mantras.length).toBeGreaterThan(0);
      expect(aries?.horarios_rituais.length).toBeGreaterThan(0);
      expect(aries?.cores_rituais.length).toBeGreaterThan(0);
      expect(aries?.ofertas.length).toBeGreaterThan(0);
    });

    it('returns null for unknown sign', () => {
      expect(getPraticasFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getSignosByElement ────────────────────────────────────────────────────

  describe('getSignosByElement', () => {
    it('returns 3 signs for Fogo', () => {
      const signs = getSignosByElement('Fogo');
      expect(signs).toHaveLength(3);
      expect(signs).toContain('Áries');
      expect(signs).toContain('Leão');
      expect(signs).toContain('Sagitário');
    });

    it('returns 3 signs for Terra', () => {
      const signs = getSignosByElement('Terra');
      expect(signs).toHaveLength(3);
      expect(signs).toContain('Touro');
      expect(signs).toContain('Virgem');
      expect(signs).toContain('Capricórnio');
    });

    it('returns 3 signs for Ar', () => {
      const signs = getSignosByElement('Ar');
      expect(signs).toHaveLength(3);
      expect(signs).toContain('Gémeos');
      expect(signs).toContain('Libra');
      expect(signs).toContain('Aquário');
    });

    it('returns 3 signs for Água', () => {
      const signs = getSignosByElement('Água');
      expect(signs).toHaveLength(3);
      expect(signs).toContain('Câncer');
      expect(signs).toContain('Escorpião');
      expect(signs).toContain('Peixes');
    });

    it('returns empty array for invalid element', () => {
      expect(getSignosByElement('Invalid')).toEqual([]);
    });
  });

  // ─── getSignosByPolaridade ────────────────────────────────────────────────

  describe('getSignosByPolaridade', () => {
    it('returns 6 Yang signs (fire + air)', () => {
      const yang = getSignosByPolaridade('Yang');
      expect(yang).toHaveLength(6);
      expect(yang).toContain('Áries');
      expect(yang).toContain('Leão');
      expect(yang).toContain('Sagitário');
      expect(yang).toContain('Gémeos');
      expect(yang).toContain('Libra');
      expect(yang).toContain('Aquário');
    });

    it('returns 6 Yin signs (earth + water)', () => {
      const yin = getSignosByPolaridade('Yin');
      expect(yin).toHaveLength(6);
      expect(yin).toContain('Touro');
      expect(yin).toContain('Virgem');
      expect(yin).toContain('Capricórnio');
      expect(yin).toContain('Câncer');
      expect(yin).toContain('Escorpião');
      expect(yin).toContain('Peixes');
    });
  });

  // ─── getCabalaFromZodiac ────────────────────────────────────────────────────

  describe('getCabalaFromZodiac', () => {
    it('returns Cabala correspondence for each sign', () => {
      const aries = getCabalaFromZodiac('Áries');
      expect(aries).not.toBeNull();
      expect(aries?.sefirot).toBeDefined();
      expect(aries?.caminho_sefirotico).toBeDefined();
      expect(aries?.arcanjo).toBeDefined();
    });

    it('returns null for unknown sign', () => {
      expect(getCabalaFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── Integration: element-polarity relationships ───────────────────────────

  describe('element-polarity integration', () => {
    it('fire signs are Yang', () => {
      const fogo = getElementZodiac('Fogo');
      fogo?.forEach((m) => {
        expect(m.qualidades_elementares.polaridade).toBe('Yang');
      });
    });

    it('earth signs are Yin', () => {
      const terra = getElementZodiac('Terra');
      terra?.forEach((m) => {
        expect(m.qualidades_elementares.polaridade).toBe('Yin');
      });
    });

    it('air signs are Yang', () => {
      const ar = getElementZodiac('Ar');
      ar?.forEach((m) => {
        expect(m.qualidades_elementares.polaridade).toBe('Yang');
      });
    });

    it('water signs are Yin', () => {
      const agua = getElementZodiac('Água');
      agua?.forEach((m) => {
        expect(m.qualidades_elementares.polaridade).toBe('Yin');
      });
    });

    it('fire signs are Quente and Seco', () => {
      const fogo = getElementZodiac('Fogo');
      fogo?.forEach((m) => {
        expect(m.qualidades_elementares.quente_frio).toBe('Quente');
        expect(m.qualidades_elementares.humido_seco).toBe('Seco');
      });
    });

    it('earth signs are Frio and Seco', () => {
      const terra = getElementZodiac('Terra');
      terra?.forEach((m) => {
        expect(m.qualidades_elementares.quente_frio).toBe('Frio');
        expect(m.qualidades_elementares.humido_seco).toBe('Seco');
      });
    });

    it('air signs are Quente and Húmido', () => {
      const ar = getElementZodiac('Ar');
      ar?.forEach((m) => {
        expect(m.qualidades_elementares.quente_frio).toBe('Quente');
        expect(m.qualidades_elementares.humido_seco).toBe('Húmido');
      });
    });

    it('water signs are Frio and Húmido', () => {
      const agua = getElementZodiac('Água');
      agua?.forEach((m) => {
        expect(m.qualidades_elementares.quente_frio).toBe('Frio');
        expect(m.qualidades_elementares.humido_seco).toBe('Húmido');
      });
    });
  });

  // ─── Type exports ──────────────────────────────────────────────────────────

  describe('type exports', () => {
    it('ZodiacElementMapping interface is exported', () => {
      const mapping: ZodiacElementMapping = {
        signo: 'Áries',
        elemento: 'Fogo',
        qualidades_elementares: {
          quente_frio: 'Quente',
          humido_seco: 'Seco',
          polaridade: 'Yang',
          vibração: 'Test',
        },
        praticas_espirituais: {
          ebos: ['Test'],
          banhos: ['Test'],
          defumacoes: ['Test'],
          mantras: ['Test'],
          horarios_rituais: ['Test'],
          cores_rituais: ['Test'],
          ofertas: ['Test'],
        },
        correspondencia_cabala: {
          sefirot: 'Test',
          caminho_sefirotico: 'Test',
          arcanjo: 'Test',
        },
      };
      expect(mapping.signo).toBe('Áries');
    });

    it('Signo type is exported', () => {
      const sign: Signo = 'Áries';
      expect(sign).toBe('Áries');
    });
  });
});
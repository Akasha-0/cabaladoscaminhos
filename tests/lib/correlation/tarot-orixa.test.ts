/**
 * Tarot-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOrixa,
  getOrixaTarot,
  getArcanoNumber,
  getOrixaByNumber,
  getArcanoByNumber,
  getAllTarotOrixas,
  getAllArcanos,
  getAllOrixaNames,
  hasTarotOrixa,
  hasOrixaTarot,
  getArcanoElement,
  getArcanoOrixa,
  getArcanosByElement,
  getOrixasByElement,
  getArcanoEnergia,
  getArcanoInterpretacao,
  TAROT_ORIXA_MAPPINGS,
  type TarotOrixaMapping,
} from '@/lib/correlation/tarot-orixa';
import { ORIXA_TAROT_MAPPINGS } from '@/lib/correlation/orixa-tarot';

describe('Tarot-Orixá Correlation', () => {
  describe('getTarotOrixa', () => {
    it('should return O Louco mapping with Eshu', () => {
      const mapping = getTarotOrixa('O Louco');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Eshu');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return O Mago mapping with Exu', () => {
      const mapping = getTarotOrixa('O Mago');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Exu');
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return A Sacerdotisa mapping with Nanã', () => {
      const mapping = getTarotOrixa('A Sacerdotisa');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Nanã');
      expect(mapping?.numero_carta).toBe(2);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return A Imperatriz mapping with Oxum', () => {
      const mapping = getTarotOrixa('A Imperatriz');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxum');
      expect(mapping?.numero_carta).toBe(3);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return O Imperador mapping with Oxalá', () => {
      const mapping = getTarotOrixa('O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxalá');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Hierofante mapping with Oxóssi', () => {
      const mapping = getTarotOrixa('O Hierofante');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxóssi');
      expect(mapping?.numero_carta).toBe(5);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return Os Enamorados mapping with Logun Edé', () => {
      const mapping = getTarotOrixa('Os Enamorados');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Logun Edé');
      expect(mapping?.numero_carta).toBe(6);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return O Carro mapping with Ogum', () => {
      const mapping = getTarotOrixa('O Carro');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Ogum');
      expect(mapping?.numero_carta).toBe(7);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Torre mapping with Iansã', () => {
      const mapping = getTarotOrixa('A Torre');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iansã');
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Estrela mapping with Iemanjá', () => {
      const mapping = getTarotOrixa('A Estrela');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iemanjá');
      expect(mapping?.numero_carta).toBe(17);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return O Sol mapping with Xangô', () => {
      const mapping = getTarotOrixa('O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Xangô');
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Mundo mapping with Omolu', () => {
      const mapping = getTarotOrixa('O Mundo');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Omolu');
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return null for non-existent arcano', () => {
      const mapping = getTarotOrixa('Non Existent');
      expect(mapping).toBeNull();
    });
  });

  describe('getOrixaTarot', () => {
    it('should return O Louco for Eshu', () => {
      const arcano = getOrixaTarot('Eshu');
      expect(arcano).toBe('O Louco');
    });

    it('should return O Mago for Exu', () => {
      const arcano = getOrixaTarot('Exu');
      expect(arcano).toBe('O Mago');
    });

    it('should return A Sacerdotisa for Nanã', () => {
      const arcano = getOrixaTarot('Nanã');
      expect(arcano).toBe('A Sacerdotisa');
    });

    it('should return A Imperatriz for Oxum', () => {
      const arcano = getOrixaTarot('Oxum');
      expect(arcano).toBe('A Imperatriz');
    });

    it('should return O Imperador for Oxalá', () => {
      const arcano = getOrixaTarot('Oxalá');
      expect(arcano).toBe('O Imperador');
    });

    it('should return O Hierofante for Oxóssi', () => {
      const arcano = getOrixaTarot('Oxóssi');
      expect(arcano).toBe('O Hierofante');
    });

    it('should return Os Enamorados for Logun Edé', () => {
      const arcano = getOrixaTarot('Logun Edé');
      expect(arcano).toBe('Os Enamorados');
    });

    it('should return O Carro for Ogum', () => {
      const arcano = getOrixaTarot('Ogum');
      expect(arcano).toBe('O Carro');
    });

    it('should return A Torre for Iansã', () => {
      const arcano = getOrixaTarot('Iansã');
      expect(arcano).toBe('A Torre');
    });

    it('should return A Estrela for Iemanjá', () => {
      const arcano = getOrixaTarot('Iemanjá');
      expect(arcano).toBe('A Estrela');
    });

    it('should return O Sol for Xangô', () => {
      const arcano = getOrixaTarot('Xangô');
      expect(arcano).toBe('O Sol');
    });

    it('should return O Mundo for Omolu', () => {
      const arcano = getOrixaTarot('Omolu');
      expect(arcano).toBe('O Mundo');
    });

    it('should return null for non-existent Orixá', () => {
      const arcano = getOrixaTarot('Non Existent');
      expect(arcano).toBeNull();
    });

    it('should be case-insensitive for Orixá lookup', () => {
      expect(getOrixaTarot('eshu')).toBe('O Louco');
      expect(getOrixaTarot('ESHU')).toBe('O Louco');
      expect(getOrixaTarot('Eshu')).toBe('O Louco');
    });
  });

  describe('getArcanoNumber', () => {
    it('should return correct arcano numbers', () => {
      expect(getArcanoNumber('O Louco')).toBe(0);
      expect(getArcanoNumber('O Mago')).toBe(1);
      expect(getArcanoNumber('A Sacerdotisa')).toBe(2);
      expect(getArcanoNumber('A Imperatriz')).toBe(3);
      expect(getArcanoNumber('O Imperador')).toBe(4);
      expect(getArcanoNumber('O Hierofante')).toBe(5);
      expect(getArcanoNumber('Os Enamorados')).toBe(6);
      expect(getArcanoNumber('O Carro')).toBe(7);
      expect(getArcanoNumber('A Torre')).toBe(16);
      expect(getArcanoNumber('A Estrela')).toBe(17);
      expect(getArcanoNumber('O Sol')).toBe(19);
      expect(getArcanoNumber('O Mundo')).toBe(21);
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoNumber('Non Existent')).toBeNull();
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return Eshu for card 0', () => {
      expect(getOrixaByNumber(0)).toBe('Eshu');
    });

    it('should return Exu for card 1', () => {
      expect(getOrixaByNumber(1)).toBe('Exu');
    });

    it('should return Nanã for card 2', () => {
      expect(getOrixaByNumber(2)).toBe('Nanã');
    });

    it('should return Oxum for card 3', () => {
      expect(getOrixaByNumber(3)).toBe('Oxum');
    });

    it('should return Oxalá for card 4', () => {
      expect(getOrixaByNumber(4)).toBe('Oxalá');
    });

    it('should return Oxóssi for card 5', () => {
      expect(getOrixaByNumber(5)).toBe('Oxóssi');
    });

    it('should return Logun Edé for card 6', () => {
      expect(getOrixaByNumber(6)).toBe('Logun Edé');
    });

    it('should return Ogum for card 7', () => {
      expect(getOrixaByNumber(7)).toBe('Ogum');
    });

    it('should return Iansã for card 16', () => {
      expect(getOrixaByNumber(16)).toBe('Iansã');
    });

    it('should return Iemanjá for card 17', () => {
      expect(getOrixaByNumber(17)).toBe('Iemanjá');
    });

    it('should return Xangô for card 19', () => {
      expect(getOrixaByNumber(19)).toBe('Xangô');
    });

    it('should return Omolu for card 21', () => {
      expect(getOrixaByNumber(21)).toBe('Omolu');
    });

    it('should return null for non-existent card number', () => {
      expect(getOrixaByNumber(99)).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return correct arcano by number', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(4)).toBe('O Imperador');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for non-existent card number', () => {
      expect(getArcanoByNumber(99)).toBeNull();
    });
  });

  describe('getAllTarotOrixas', () => {
    it('should return all mappings', () => {
      const allMappings = getAllTarotOrixas();
      expect(allMappings).toBeDefined();
      expect(allMappings.length).toBeGreaterThan(0);
      expect(allMappings.length).toBe(12);
    });

    it('should contain all expected arcano names', () => {
      const allMappings = getAllTarotOrixas();
      const arcanoNames = allMappings.map((m) => m.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('should contain all expected Orixá names', () => {
      const allMappings = getAllTarotOrixas();
      const orixaNames = allMappings.map((m) => m.orixa);
      expect(orixaNames).toContain('Eshu');
      expect(orixaNames).toContain('Exu');
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Omolu');
    });
  });

  describe('getAllArcanos', () => {
    it('should return all arcano names', () => {
      const arcanoNames = getAllArcanos();
      expect(arcanoNames).toBeDefined();
      expect(arcanoNames.length).toBe(12);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('A Imperatriz');
      expect(arcanoNames).toContain('O Sol');
    });
  });

  describe('getAllOrixaNames', () => {
    it('should return all unique Orixá names', () => {
      const orixaNames = getAllOrixaNames();
      expect(orixaNames).toBeDefined();
      expect(orixaNames.length).toBe(12);
      expect(orixaNames).toContain('Eshu');
      expect(orixaNames).toContain('Exu');
      expect(orixaNames).toContain('Oxalá');
      expect(orixaNames).toContain('Iemanjá');
    });

    it('should return sorted array', () => {
      const orixaNames = getAllOrixaNames();
      const sorted = [...orixaNames].sort();
      expect(orixaNames).toEqual(sorted);
    });
  });

  describe('hasTarotOrixa', () => {
    it('should return true for existing arcanos', () => {
      expect(hasTarotOrixa('O Louco')).toBe(true);
      expect(hasTarotOrixa('O Mago')).toBe(true);
      expect(hasTarotOrixa('O Sol')).toBe(true);
      expect(hasTarotOrixa('O Mundo')).toBe(true);
    });

    it('should return false for non-existent arcanos', () => {
      expect(hasTarotOrixa('Non Existent')).toBe(false);
    });
  });

  describe('hasOrixaTarot', () => {
    it('should return true for existing Orixás', () => {
      expect(hasOrixaTarot('Eshu')).toBe(true);
      expect(hasOrixaTarot('Exu')).toBe(true);
      expect(hasOrixaTarot('Xangô')).toBe(true);
      expect(hasOrixaTarot('Omolu')).toBe(true);
    });

    it('should return false for non-existent Orixás', () => {
      expect(hasOrixaTarot('Non Existent')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasOrixaTarot('eshu')).toBe(true);
      expect(hasOrixaTarot('ESHU')).toBe(true);
    });
  });

  describe('getArcanoElement', () => {
    it('should return correct elements', () => {
      expect(getArcanoElement('O Louco')).toBe('Ar');
      expect(getArcanoElement('O Mago')).toBe('Ar');
      expect(getArcanoElement('A Sacerdotisa')).toBe('Água');
      expect(getArcanoElement('A Imperatriz')).toBe('Terra');
      expect(getArcanoElement('O Imperador')).toBe('Fogo');
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoElement('Non Existent')).toBeNull();
    });
  });

  describe('getArcanoOrixa', () => {
    it('should return correct Orixá names', () => {
      expect(getArcanoOrixa('O Louco')).toBe('Eshu');
      expect(getArcanoOrixa('O Sol')).toBe('Xangô');
      expect(getArcanoOrixa('O Mundo')).toBe('Omolu');
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoOrixa('Non Existent')).toBeNull();
    });
  });

  describe('getArcanosByElement', () => {
    it('should return arcanos by element', () => {
      const fogoArcanos = getArcanosByElement('Fogo');
      expect(fogoArcanos).toContain('O Imperador');
      expect(fogoArcanos).toContain('O Carro');
      expect(fogoArcanos).toContain('A Torre');
      expect(fogoArcanos).toContain('O Sol');
      expect(fogoArcanos.length).toBe(4);
    });

    it('should return arcanos for Água element', () => {
      const aguaArcanos = getArcanosByElement('Água');
      expect(aguaArcanos).toContain('A Sacerdotisa');
      expect(aguaArcanos).toContain('A Estrela');
      expect(aguaArcanos.length).toBe(2);
    });

    it('should return arcanos for Terra element', () => {
      const terraArcanos = getArcanosByElement('Terra');
      expect(terraArcanos).toContain('A Imperatriz');
      expect(terraArcanos).toContain('O Mundo');
      expect(terraArcanos.length).toBe(2);
    });

    it('should return arcanos for Ar element', () => {
      const arArcanos = getArcanosByElement('Ar');
      expect(arArcanos).toContain('O Louco');
      expect(arArcanos).toContain('O Mago');
      expect(arArcanos).toContain('O Hierofante');
      expect(arArcanos).toContain('Os Enamorados');
      expect(arArcanos.length).toBe(4);
    });

    it('should be case-insensitive', () => {
      expect(getArcanosByElement('FOGO').length).toBe(4);
      expect(getArcanosByElement('fogo').length).toBe(4);
    });

    it('should return empty array for non-existent element', () => {
      expect(getArcanosByElement('Non Existent')).toEqual([]);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás by element', () => {
      const fogoOrixas = getOrixasByElement('Fogo');
      expect(fogoOrixas).toContain('Oxalá');
      expect(fogoOrixas).toContain('Ogum');
      expect(fogoOrixas).toContain('Iansã');
      expect(fogoOrixas).toContain('Xangô');
      expect(fogoOrixas.length).toBe(4);
    });

    it('should return Orixás for Água element', () => {
      const aguaOrixas = getOrixasByElement('Água');
      expect(aguaOrixas).toContain('Nanã');
      expect(aguaOrixas).toContain('Iemanjá');
      expect(aguaOrixas.length).toBe(2);
    });
  });

  describe('getArcanoEnergia', () => {
    it('should return espiritual energy', () => {
      const energia = getArcanoEnergia('O Sol');
      expect(energia).toBeDefined();
      expect(energia).toContain('Justiça divina');
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoEnergia('Non Existent')).toBeNull();
    });
  });

  describe('getArcanoInterpretacao', () => {
    it('should return interpretacao', () => {
      const interpretacao = getArcanoInterpretacao('O Sol');
      expect(interpretacao).toBeDefined();
      expect(interpretacao).toContain('Xangô');
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoInterpretacao('Non Existent')).toBeNull();
    });
  });

  describe('TAROT_ORIXA_MAPPINGS constant', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_ORIXA_MAPPINGS)).toBe(true);
    });

    it('should contain expected mappings', () => {
      expect(TAROT_ORIXA_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Mago']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Sol']).toBeDefined();
    });

    it('should have correct structure for each mapping', () => {
      const mapping = TAROT_ORIXA_MAPPINGS['O Sol'] as TarotOrixaMapping;
      expect(mapping.arcano).toBe('O Sol');
      expect(mapping.numero_carta).toBe(19);
      expect(mapping.orixa).toBe('Xangô');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.energia_espiritual).toBeDefined();
      expect(mapping.associacoes_rituais).toBeDefined();
      expect(mapping.interpretacao).toBeDefined();
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should be reverse of ORIXA_TAROT_MAPPINGS', () => {
      // Verify all tarot-orixa mappings have corresponding orixa-tarot mappings
      for (const arcano of getAllArcanos()) {
        const tarotMapping = getTarotOrixa(arcano);
        const orixaMapping = ORIXA_TAROT_MAPPINGS[tarotMapping.orixa];

        expect(orixaMapping).toBeDefined();
        expect(orixaMapping.arcano).toBe(arcano);
        expect(orixaMapping.numero_carta).toBe(tarotMapping.numero_carta);
      }
    });

    it('should have unique Orixás per arcano', () => {
      const allMappings = getAllTarotOrixas();
      const orixaSet = new Set(allMappings.map((m) => m.orixa));
      expect(orixaSet.size).toBe(allMappings.length);
    });

    it('should have unique arcano numbers', () => {
      const allMappings = getAllTarotOrixas();
      const numberSet = new Set(allMappings.map((m) => m.numero_carta));
      expect(numberSet.size).toBe(allMappings.length);
    });
  });
});
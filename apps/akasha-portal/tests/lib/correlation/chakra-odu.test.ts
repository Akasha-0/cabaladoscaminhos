import { describe, it, expect } from 'vitest';
import {
  getChakraOdu,
  getOduChakra,
  getAllChakraOdus,
  getOduNumbersByChakra,
  getPrimaryOdu,
  getSecondaryOdu,
  getChakrasByElement,
  CHAKRA_ODU_MAPPINGS,
  type ChakraOduMapping,
  type OduInfo,
} from '@/lib/correlation/chakra-odu';

describe('Chakra-Odu Correlation', () => {
  describe('getChakraOdu', () => {
    it('should return Muladhara (1º Básico) with Irosun and Okaran Odus', () => {
      const result = getChakraOdu('Muladhara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_numero).toBe(1);
      expect(result?.chakra_nome_portugues).toBe('1º Básico');
      expect(result?.odu.primario.numero).toBe(4);
      expect(result?.odu.primario.nome).toBe('Irosun');
      expect(result?.odu.secundario?.numero).toBe(1);
      expect(result?.odu.secundario?.nome).toBe('Okaran');
      expect(result?.elemento).toBe('Terra');
    });

    it('should return Svadhisthana (2º Sacro) with Oponla and Ogundá Odus', () => {
      const result = getChakraOdu('Svadhisthana');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_numero).toBe(2);
      expect(result?.odu.primario.numero).toBe(8);
      expect(result?.odu.primario.nome).toBe('Oponla');
      expect(result?.odu.secundario?.numero).toBe(11);
      expect(result?.odu.secundario?.nome).toBe('Ogundá');
      expect(result?.elemento).toBe('Água');
    });

    it('should return Manipura (3º Plexo Solar) with Ejilsebora and Obará Odus', () => {
      const result = getChakraOdu('Manipura');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.odu.primario.numero).toBe(12);
      expect(result?.odu.primario.nome).toBe('Ejilsebora');
      expect(result?.odu.secundario?.numero).toBe(6);
      expect(result?.odu.secundario?.nome).toBe('Obará');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return Anahata (4º Cardíaco) with Osá and Daí Odus', () => {
      const result = getChakraOdu('Anahata');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.odu.primario.numero).toBe(7);
      expect(result?.odu.primario.nome).toBe('Osá');
      expect(result?.odu.secundario?.numero).toBe(14);
      expect(result?.odu.secundario?.nome).toBe('Daí');
      expect(result?.elemento).toBe('Ar');
    });

    it('should return Vishuddha (5º Laríngeo) with Meí and Kanji Odus', () => {
      const result = getChakraOdu('Vishuddha');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_numero).toBe(5);
      expect(result?.odu.primario.numero).toBe(5);
      expect(result?.odu.primario.nome).toBe('Meí');
      expect(result?.odu.secundario?.numero).toBe(15);
      expect(result?.odu.secundario?.nome).toBe('Kanji');
      expect(result?.elemento).toBe('Ar');
    });

    it('should return Ajna (6º Frontal) with Ejiokô and Ocanha Odus', () => {
      const result = getChakraOdu('Ajna');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.odu.primario.numero).toBe(2);
      expect(result?.odu.primario.nome).toBe('Ejiokô');
      expect(result?.odu.secundario?.numero).toBe(10);
      expect(result?.odu.secundario?.nome).toBe('Ocanha');
      expect(result?.elemento).toBe('Éter');
    });

    it('should return Sahasrara (7º Coronário) with Oxumá and Ejiá Odus', () => {
      const result = getChakraOdu('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.odu.primario.numero).toBe(16);
      expect(result?.odu.primario.nome).toBe('Oxumá');
      expect(result?.odu.secundario?.numero).toBe(9);
      expect(result?.odu.secundario?.nome).toBe('Ejiá');
      expect(result?.elemento).toBe('Éter');
    });

    it('should accept chakra number format as input', () => {
      const result = getChakraOdu('1º Básico');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should accept Portuguese chakra names', () => {
      const result = getChakraOdu('4º Cardíaco');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Anahata');
    });

    it('should accept English chakra names', () => {
      const result = getChakraOdu('third eye');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Ajna');
    });

    it('should return null for unknown chakra', () => {
      const result = getChakraOdu('UnknownChakra');
      expect(result).toBeNull();
    });
  });

  describe('getOduChakra', () => {
    it('should return Muladhara for Odu 4 (Irosun)', () => {
      const result = getOduChakra(4);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should return Muladhara for Odu 1 (Okaran) as secondary', () => {
      const result = getOduChakra(1);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should return Svadhisthana for Odu 8 (Oponla)', () => {
      const result = getOduChakra(8);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Svadhisthana');
    });

    it('should return Manipura for Odu 12 (Ejilsebora)', () => {
      const result = getOduChakra(12);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Manipura');
    });

    it('should return Anahata for Odu 7 (Osá)', () => {
      const result = getOduChakra(7);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Anahata');
    });

    it('should return Vishuddha for Odu 5 (Meí)', () => {
      const result = getOduChakra(5);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Vishuddha');
    });

    it('should return Ajna for Odu 2 (Ejiokô)', () => {
      const result = getOduChakra(2);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Ajna');
    });

    it('should return Sahasrara for Odu 16 (Oxumá)', () => {
      const result = getOduChakra(16);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
    });

    it('should return null for non-existent Odu number', () => {
      const result = getOduChakra(99);
      expect(result).toBeNull();
    });
  });

  describe('getAllChakraOdus', () => {
    it('should return all 7 chakra-odu mappings', () => {
      const result = getAllChakraOdus();
      expect(result).toHaveLength(7);
    });

    it('should return mappings sorted by chakra number', () => {
      const result = getAllChakraOdus();
      expect(result[0].chakra_numero).toBe(1);
      expect(result[1].chakra_numero).toBe(2);
      expect(result[2].chakra_numero).toBe(3);
      expect(result[3].chakra_numero).toBe(4);
      expect(result[4].chakra_numero).toBe(5);
      expect(result[5].chakra_numero).toBe(6);
      expect(result[6].chakra_numero).toBe(7);
    });

    it('should contain all expected chakras', () => {
      const result = getAllChakraOdus();
      const chakraNames = result.map((m) => m.chakra);
      expect(chakraNames).toContain('Muladhara');
      expect(chakraNames).toContain('Svadhisthana');
      expect(chakraNames).toContain('Manipura');
      expect(chakraNames).toContain('Anahata');
      expect(chakraNames).toContain('Vishuddha');
      expect(chakraNames).toContain('Ajna');
      expect(chakraNames).toContain('Sahasrara');
    });

    it('should contain complete mapping data for each chakra', () => {
      const result = getAllChakraOdus();
      for (const mapping of result) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.chakra_nome_portugues).toBeDefined();
        expect(mapping.odu.primario).toBeDefined();
        expect(mapping.odu.primario.numero).toBeDefined();
        expect(mapping.odu.primario.nome).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.propriedades).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
      }
    });
  });

  describe('getOduNumbersByChakra', () => {
    it('should return [4, 1] for Muladhara', () => {
      const result = getOduNumbersByChakra('Muladhara');
      expect(result).toEqual([4, 1]);
    });

    it('should return [8, 11] for Svadhisthana', () => {
      const result = getOduNumbersByChakra('Svadhisthana');
      expect(result).toEqual([8, 11]);
    });

    it('should return [12, 6] for Manipura', () => {
      const result = getOduNumbersByChakra('Manipura');
      expect(result).toEqual([12, 6]);
    });

    it('should return empty array for unknown chakra', () => {
      const result = getOduNumbersByChakra('UnknownChakra');
      expect(result).toEqual([]);
    });
  });

  describe('getPrimaryOdu', () => {
    it('should return Irosun for Muladhara', () => {
      const result = getPrimaryOdu('Muladhara');
      expect(result).not.toBeNull();
      expect(result?.numero).toBe(4);
      expect(result?.nome).toBe('Irosun');
    });

    it('should return Oxumá for Sahasrara', () => {
      const result = getPrimaryOdu('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.numero).toBe(16);
      expect(result?.nome).toBe('Oxumá');
    });

    it('should return null for unknown chakra', () => {
      const result = getPrimaryOdu('UnknownChakra');
      expect(result).toBeNull();
    });
  });

  describe('getSecondaryOdu', () => {
    it('should return Okaran for Muladhara', () => {
      const result = getSecondaryOdu('Muladhara');
      expect(result).not.toBeNull();
      expect(result?.numero).toBe(1);
      expect(result?.nome).toBe('Okaran');
    });

    it('should return Ejiá for Sahasrara', () => {
      const result = getSecondaryOdu('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.numero).toBe(9);
      expect(result?.nome).toBe('Ejiá');
    });

    it('should return null for unknown chakra', () => {
      const result = getSecondaryOdu('UnknownChakra');
      expect(result).toBeNull();
    });
  });

  describe('getChakrasByElement', () => {
    it('should return only Muladhara for Terra element', () => {
      const result = getChakrasByElement('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('Muladhara');
    });

    it('should return only Svadhisthana for Água element', () => {
      const result = getChakrasByElement('Água');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('Svadhisthana');
    });

    it('should return only Manipura for Fogo element', () => {
      const result = getChakrasByElement('Fogo');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('Manipura');
    });

    it('should return Anahata and Vishuddha for Ar element', () => {
      const result = getChakrasByElement('Ar');
      expect(result).toHaveLength(2);
      const chakraNames = result.map((m) => m.chakra);
      expect(chakraNames).toContain('Anahata');
      expect(chakraNames).toContain('Vishuddha');
    });

    it('should return Ajna and Sahasrara for Éter element', () => {
      const result = getChakrasByElement('Éter');
      expect(result).toHaveLength(2);
      const chakraNames = result.map((m) => m.chakra);
      expect(chakraNames).toContain('Ajna');
      expect(chakraNames).toContain('Sahasrara');
    });

    it('should accept English element names', () => {
      const result = getChakrasByElement('water');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('Svadhisthana');
    });

    it('should return empty array for unknown element', () => {
      const result = getChakrasByElement('UnknownElement');
      expect(result).toEqual([]);
    });
  });

  describe('CHAKRA_ODU_MAPPINGS constant', () => {
    it('should have 7 entries', () => {
      expect(Object.keys(CHAKRA_ODU_MAPPINGS)).toHaveLength(7);
    });

    it('should have Muladhara as first entry', () => {
      expect(CHAKRA_ODU_MAPPINGS.Muladhara).toBeDefined();
      expect(CHAKRA_ODU_MAPPINGS.Muladhara.chakra_numero).toBe(1);
    });

    it('should have Sahasrara as last entry', () => {
      expect(CHAKRA_ODU_MAPPINGS.Sahasrara).toBeDefined();
      expect(CHAKRA_ODU_MAPPINGS.Sahasrara.chakra_numero).toBe(7);
    });

    it('should have all required properties for each mapping', () => {
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.chakra_nome_portugues).toBeDefined();
        expect(mapping.odu).toBeDefined();
        expect(mapping.odu.primario).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.propriedades).toBeDefined();
        expect(mapping.propriedades.qualidade).toBeDefined();
        expect(mapping.propriedades.direcao).toBeDefined();
        expect(mapping.propriedades.estacao).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
        expect(mapping.praticas_espirituais.tipo).toBeDefined();
        expect(mapping.praticas_espirituais.descricao).toBeDefined();
        expect(mapping.praticas_espirituais.mantras).toBeDefined();
        expect(Array.isArray(mapping.praticas_espirituais.mantras)).toBe(true);
        expect(mapping.praticas_espirituais.ebos).toBeDefined();
        expect(Array.isArray(mapping.praticas_espirituais.ebos)).toBe(true);
        expect(mapping.praticas_espirituais.cores).toBeDefined();
        expect(Array.isArray(mapping.praticas_espirituais.cores)).toBe(true);
      }
    });

    it('should have unique Odu numbers across primary Odus', () => {
      const primaryOduNumbers = Object.values(CHAKRA_ODU_MAPPINGS).map(
        (m) => m.odu.primario.numero
      );
      const uniqueNumbers = new Set(primaryOduNumbers);
      expect(uniqueNumbers.size).toBe(primaryOduNumbers.length);
    });

    it('should have all valid element types', () => {
      const validElements = ['Terra', 'Água', 'Fogo', 'Ar', 'Éter'];
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  describe('elemental properties', () => {
    it('should have correct directions for each chakra', () => {
      expect(getChakraOdu('Muladhara')?.propriedades.direcao).toBe('Norte');
      expect(getChakraOdu('Svadhisthana')?.propriedades.direcao).toBe('Oeste');
      expect(getChakraOdu('Anahata')?.propriedades.direcao).toBe('Leste');
      expect(getChakraOdu('Vishuddha')?.propriedades.direcao).toBe('Leste');
      expect(getChakraOdu('Ajna')?.propriedades.direcao).toBe('Centro');
      expect(getChakraOdu('Sahasrara')?.propriedades.direcao).toBe('Zênite');
    });

    it('should have correct seasons for each chakra', () => {
      expect(getChakraOdu('Muladhara')?.propriedades.estacao).toBe('Inverno');
      expect(getChakraOdu('Svadhisthana')?.propriedades.estacao).toBe('Outono');
      expect(getChakraOdu('Manipura')?.propriedades.estacao).toBe('Verão');
      expect(getChakraOdu('Anahata')?.propriedades.estacao).toBe('Primavera');
      expect(getChakraOdu('Ajna')?.propriedades.estacao).toBe('Todas');
      expect(getChakraOdu('Sahasrara')?.propriedades.estacao).toBe('Eterno');
    });
  });

  describe('spiritual practices', () => {
    it('should have mantras for each chakra', () => {
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(mapping.praticas_espirituais.mantras.length).toBeGreaterThan(0);
      }
    });

    it('should have ebos (ritual offerings) for each chakra', () => {
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(mapping.praticas_espirituais.ebos.length).toBeGreaterThan(0);
      }
    });

    it('should have colors for each chakra', () => {
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(mapping.praticas_espirituais.cores.length).toBeGreaterThan(0);
      }
    });

    it('should have a practice type for each chakra', () => {
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(mapping.praticas_espirituais.tipo).toBeDefined();
        expect(mapping.praticas_espirituais.tipo.length).toBeGreaterThan(0);
      }
    });

    it('should have a practice description for each chakra', () => {
      for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
        expect(mapping.praticas_espirituais.descricao).toBeDefined();
        expect(mapping.praticas_espirituais.descricao.length).toBeGreaterThan(0);
      }
    });
  });
});
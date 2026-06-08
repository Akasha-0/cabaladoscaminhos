/**
 * Chakra-Sephirot Correlation Tests
 * Tests the spiritual correlation between the 7 main chakras and the 10 Sephiroth
 */

import { describe, it, expect } from 'vitest';
import {
  getChakraSephirot,
  getSephirotChakra,
  getAllChakraSephiroth,
} from '@/lib/correlation/chakra-sephirot';

describe('Chakra-Sephirot Correlation', () => {
  describe('getChakraSephirot', () => {
    it('should return Muladhara (1º Básico) mapping with Malkuth as Sephirah', () => {
      const result = getChakraSephirot('Muladhara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_numero).toBe(1);
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.numero_caminho).toBe(32);
      expect(result?.elemento).toBe('Terra');
      expect(result?.letra_hebraica).toBe('Mem (מ)');
      expect(result?.arcano).toBe('O Mundo');
    });

    it('should return Svadhisthana (2º Sacro) mapping with Yesod as Sephirah', () => {
      const result = getChakraSephirot('Svadhisthana');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_numero).toBe(2);
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.numero_caminho).toBe(28);
      expect(result?.elemento).toBe('Água');
      expect(result?.letra_hebraica).toBe('Qoph (ק)');
      expect(result?.arcano).toBe('A Lua');
    });

    it('should return Manipura (3º Plexo Solar) mapping with Netzach as Sephirah', () => {
      const result = getChakraSephirot('Manipura');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.numero_caminho).toBe(23);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.letra_hebraica).toBe('Nun (נ)');
      expect(result?.arcano).toBe('A Temperança');
    });

    it('should return Anahata (4º Cardíaco) mapping with Tiphereth as Sephirah', () => {
      const result = getChakraSephirot('Anahata');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.numero_caminho).toBe(15);
      expect(result?.elemento).toBe('Ar');
      expect(result?.letra_hebraica).toBe('He (ה)');
      expect(result?.arcano).toBe('O Enforcado');
    });

    it('should return Vishuddha (5º Laríngeo) mapping with Hod as Sephirah', () => {
      const result = getChakraSephirot('Vishuddha');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_numero).toBe(5);
      expect(result?.sephirah).toBe('Hod');
      expect(result?.numero_caminho).toBe(19);
      expect(result?.elemento).toBe('Ar');
      expect(result?.letra_hebraica).toBe('Vav (ו)');
      expect(result?.arcano).toBe('O Sol');
    });

    it('should return Ajna (6º Frontal) mapping with Chesed as Sephirah', () => {
      const result = getChakraSephirot('Ajna');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.numero_caminho).toBe(13);
      expect(result?.elemento).toBe('Éter');
      expect(result?.letra_hebraica).toBe('Daleth (ד)');
      expect(result?.arcano).toBe('A Morte');
    });

    it('should return Sahasrara (7º Coronário) mapping with Kether as Sephirah', () => {
      const result = getChakraSephirot('Sahasrara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.sephirah).toBe('Kether');
      expect(result?.numero_caminho).toBe(1);
      expect(result?.elemento).toBe('Éter');
      expect(result?.letra_hebraica).toBe('Aleph (א)');
      expect(result?.arcano).toBe('O Louco');
    });

    it('should accept Portuguese chakra names', () => {
      const result = getChakraSephirot('1º Básico');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.sephirah).toBe('Malkuth');
    });

    it('should accept numeric chakra numbers', () => {
      const result = getChakraSephirot('7');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.sephirah).toBe('Kether');
    });

    it('should return null for unknown chakra', () => {
      const result = getChakraSephirot('Unknown Chakra');
      expect(result).toBeNull();
    });

    it('should be case-insensitive', () => {
      const result1 = getChakraSephirot('MULADHARA');
      const result2 = getChakraSephirot('muladhara');
      const result3 = getChakraSephirot('Muladhara');

      expect(result1).toEqual(result3);
      expect(result2).toEqual(result3);
    });

    it('should include spiritual energy description', () => {
      const result = getChakraSephirot('Muladhara');
      expect(result?.energia_espiritual).toBeDefined();
      expect(result?.energia_espiritual.length).toBeGreaterThan(0);
      expect(result?.energia_espiritual).toContain('Ancoramento');
    });
  });

  describe('getSephirotChakra', () => {
    it('should return all Sephiroth mapped to their chakras', () => {
      const result = getSephirotChakra();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBe(7);

      expect(result['Malkuth']).toBe('Muladhara');
      expect(result['Yesod']).toBe('Svadhisthana');
      expect(result['Netzach']).toBe('Manipura');
      expect(result['Tiphereth']).toBe('Anahata');
      expect(result['Hod']).toBe('Vishuddha');
      expect(result['Chesed']).toBe('Ajna');
      expect(result['Kether']).toBe('Sahasrara');
    });

    it('should map each Sephirah exactly once', () => {
      const result = getSephirotChakra();
      const values = Object.values(result);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('getAllChakraSephiroth', () => {
    it('should return all 7 chakra-sephirot mappings', () => {
      const result = getAllChakraSephiroth();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('should return mappings sorted by chakra number (ascending)', () => {
      const result = getAllChakraSephiroth();

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].chakra_numero).toBeLessThan(result[i + 1].chakra_numero);
      }
    });

    it('should include all required fields in each mapping', () => {
      const result = getAllChakraSephiroth();

      for (const mapping of result) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.chakra_nome_portugues).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.numero_caminho).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.energia_espiritual).toBeDefined();
        expect(mapping.letra_hebraica).toBeDefined();
        expect(mapping.arcano).toBeDefined();
      }
    });

    it('should have unique path numbers for each mapping', () => {
      const result = getAllChakraSephiroth();
      const pathNumbers = result.map(m => m.numero_caminho);
      const uniquePaths = new Set(pathNumbers);
      expect(uniquePaths.size).toBe(pathNumbers.length);
    });
  });

  describe('Element alignment consistency', () => {
    it('should align chakra elements correctly with sephirot correlations', () => {
      // Muladhara (Terra) - Malkuth is Earth
      const muladhara = getChakraSephirot('Muladhara');
      expect(muladhara?.elemento).toBe('Terra');

      // Svadhisthana (Água) - Yesod is Luna/Water
      const svadhisthana = getChakraSephirot('Svadhisthana');
      expect(svadhisthana?.elemento).toBe('Água');

      // Manipura (Fogo) - Netzach is Venus/Fire
      const manipura = getChakraSephirot('Manipura');
      expect(manipura?.elemento).toBe('Fogo');

      // Anahata (Ar) - Tiphereth is Sun/Air
      const anahata = getChakraSephirot('Anahata');
      expect(anahata?.elemento).toBe('Ar');

      // Vishuddha (Ar) - Hod is Mercury/Air
      const vishuddha = getChakraSephirot('Vishuddha');
      expect(vishuddha?.elemento).toBe('Ar');

      // Ajna (Éter) - Chesed is Jupiter/Spirit
      const ajna = getChakraSephirot('Ajna');
      expect(ajna?.elemento).toBe('Éter');

      // Sahasrara (Éter) - Kether is Crown/Spirit
      const sahasrara = getChakraSephirot('Sahasrara');
      expect(sahasrara?.elemento).toBe('Éter');
    });
  });

  describe('Chakra number format', () => {
    it('should return correct Portuguese names', () => {
      const result = getAllChakraSephiroth();

      expect(result[0].chakra_nome_portugues).toBe('1º Básico');
      expect(result[1].chakra_nome_portugues).toBe('2º Sacro');
      expect(result[2].chakra_nome_portugues).toBe('3º Plexo Solar');
      expect(result[3].chakra_nome_portugues).toBe('4º Cardíaco');
      expect(result[4].chakra_nome_portugues).toBe('5º Laríngeo');
      expect(result[5].chakra_nome_portugues).toBe('6º Frontal');
      expect(result[6].chakra_nome_portugues).toBe('7º Coronário');
    });

    it('should have correct chakra numbers from 1 to 7', () => {
      const result = getAllChakraSephiroth();

      for (let i = 0; i < result.length; i++) {
        expect(result[i].chakra_numero).toBe(i + 1);
      }
    });
  });

  describe('Tarot arcano alignment', () => {
    it('should have consistent Tarot Major Arcana correspondences', () => {
      const muladhara = getChakraSephirot('Muladhara');
      expect(muladhara?.arcano).toBe('O Mundo'); // 21 - completion

      const sahasrara = getChakraSephirot('Sahasrara');
      expect(sahasrara?.arcano).toBe('O Louco'); // 0 - beginning

      const ajna = getChakraSephirot('Ajna');
      expect(ajna?.arcano).toBe('A Morte'); // 13 - transformation
    });
  });
});
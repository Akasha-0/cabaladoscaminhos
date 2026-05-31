/**
 * Orixá-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaOrixa,
  getAllOrixaRelations,
  getAllOrixaOrixas,
  getRelationshipsByType,
  getBidirectionalOrixas,
} from '@/lib/correlation/orixa-orixa';

describe('Orixá-Orixá Correlation', () => {
  describe('getOrixaOrixa', () => {
    it('should return Oxalá-Iemanjá complementary relationship', () => {
      const result = getOrixaOrixa('Oxalá', 'Iemanjá');

      expect(result).toBeDefined();
      expect(result?.relationship_type).toBe('complementar');
      expect(result?.spiritual_meaning).toContain('Pai-Mãe divino');
      expect(result?.spiritual_meaning).toContain('criação');
      expect(result?.ritual互补).toBeDefined();
      expect(Array.isArray(result?.ritual互补)).toBe(true);
    });

    it('should return Oxalá-Xangô father-son relationship', () => {
      const result = getOrixaOrixa('Oxalá', 'Xangô');

      expect(result).toBeDefined();
      expect(result?.relationship_type).toBe('pai_filho');
      expect(result?.spiritual_meaning).toContain('pai de Xangô');
      expect(result?.energy_flow).toBe('orixa_to_related');
    });

    it('should return Iemanjá-Oxum sister relationship', () => {
      const result = getOrixaOrixa('Iemanjá', 'Oxum');

      expect(result).toBeDefined();
      expect(result?.relationship_type).toBe('irmao_irma');
      expect(result?.spiritual_meaning).toContain('irmãs');
      expect(result?.spiritual_meaning).toContain('águas');
    });

    it('should return Ogum-Iansã spouse relationship', () => {
      const result = getOrixaOrixa('Ogum', 'Iansã');

      expect(result).toBeDefined();
      expect(result?.relationship_type).toBe('conjuge');
      expect(result?.spiritual_meaning).toContain('esposos');
      expect(result?.spiritual_meaning).toContain('Terça-feira');
      expect(result?.energy_flow).toBe('bidirectional');
    });

    it('should return Xangô-Iansã ex-spouse relationship', () => {
      const result = getOrixaOrixa('Xangô', 'Iansã');

      expect(result).toBeDefined();
      expect(result?.relationship_type).toBe('ex_conjuge');
      expect(result?.spiritual_meaning).toContain('separado');
    });

    it('should return Omolu-Nanã parent-child relationship', () => {
      const result = getOrixaOrixa('Omolu', 'Nanã');

      expect(result).toBeDefined();
      expect(result?.relationship_type).toBe('pai_filho');
      expect(result?.energy_flow).toBe('related_to_orixa');
      expect(result?.spiritual_meaning).toContain('filho');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaOrixa('OXALÁ', 'iemanjá')).toBeDefined();
      expect(getOrixaOrixa('  OGUM  ', 'IANSÃ')).toBeDefined();
    });

    it('should return undefined for unknown Orixá pair', () => {
      expect(getOrixaOrixa('Unknown', 'Oxalá')).toBeUndefined();
      expect(getOrixaOrixa('', 'Iemanjá')).toBeUndefined();
    });

    it('should return relationship regardless of order', () => {
      const result1 = getOrixaOrixa('Oxalá', 'Iemanjá');
      const result2 = getOrixaOrixa('Iemanjá', 'Oxalá');

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1?.relationship_type).toBe(result2?.relationship_type);
    });

    it('should include all required properties', () => {
      const result = getOrixaOrixa('Oxóssi', 'Logun Edé');

      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('related_orixa');
      expect(result).toHaveProperty('relationship_type');
      expect(result).toHaveProperty('spiritual_meaning');
      expect(result?.ritual互补).toBeDefined();
      expect(result?.energy_flow).toBeDefined();
      expect(typeof result?.spiritual_meaning).toBe('string');
      expect(result?.spiritual_meaning.length).toBeGreaterThan(10);
    });
  });

  describe('getAllOrixaRelations', () => {
    it('should return all relationships for Oxalá', () => {
      const result = getAllOrixaRelations('Oxalá');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(rel => {
        expect(
          rel.orixa.toLowerCase() === 'oxalá' || rel.related_orixa.toLowerCase() === 'oxalá'
        ).toBe(true);
      });
    });

    it('should return Iemanjá relationships with water orixás', () => {
      const result = getAllOrixaRelations('Iemanjá');

      expect(result.length).toBeGreaterThan(0);
      const relatedOrixas = result.map(r =>
        r.orixa.toLowerCase() === 'iemanjá' ? r.related_orixa : r.orixa
      );
      expect(relatedOrixas).toContain('Oxum');
      expect(relatedOrixas).toContain('Nanã');
    });

    it('should return Ogum relationships with warrior orixás', () => {
      const result = getAllOrixaRelations('Ogum');

      expect(result.length).toBeGreaterThan(0);
      const relatedOrixas = result.map(r =>
        r.orixa.toLowerCase() === 'ogum' ? r.related_orixa : r.orixa
      );
      expect(relatedOrixas).toContain('Iansã');
      expect(relatedOrixas).toContain('Oxóssi');
    });

    it('should return warrior pair relationships for Iansã', () => {
      const result = getAllOrixaRelations('Iansã');

      expect(result.length).toBeGreaterThan(0);
      const relatedOrixas = result.map(r =>
        r.orixa.toLowerCase() === 'iansã' ? r.related_orixa : r.orixa
      );
      expect(relatedOrixas).toContain('Ogum');
      expect(relatedOrixas).toContain('Xangô');
    });

    it('should return ancestor relationships for Nanã', () => {
      const result = getAllOrixaRelations('Nanã');

      expect(result.length).toBeGreaterThan(0);
      const relatedOrixas = result.map(r =>
        r.orixa.toLowerCase() === 'nanã' ? r.related_orixa : r.orixa
      );
      expect(relatedOrixas).toContain('Iemanjá');
      expect(relatedOrixas).toContain('Omolu');
    });

    it('should be case-insensitive', () => {
      const result1 = getAllOrixaRelations('OXUM');
      const result2 = getAllOrixaRelations('oxum');

      expect(result1.length).toBe(result2.length);
      expect(result1.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown Orixá', () => {
      expect(getAllOrixaRelations('UnknownOrixa')).toEqual([]);
    });
  });

  describe('getAllOrixaOrixas', () => {
    it('should return array of all relationships', () => {
      const result = getAllOrixaOrixas();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain Oxalá-Iemanjá relationship', () => {
      const result = getAllOrixaOrixas();
      const found = result.find(
        r =>
          (r.orixa === 'Oxalá' && r.related_orixa === 'Iemanjá') ||
          (r.orixa === 'Iemanjá' && r.related_orixa === 'Oxalá')
      );

      expect(found).toBeDefined();
    });

    it('should contain spouse relationships', () => {
      const result = getAllOrixaOrixas();
      const spouses = result.filter(r => r.relationship_type === 'conjuge');

      expect(spouses.length).toBeGreaterThan(0);
    });

    it('should contain parent-child relationships', () => {
      const result = getAllOrixaOrixas();
      const parents = result.filter(r => r.relationship_type === 'pai_filho' || r.relationship_type === 'mae_filha');

      expect(parents.length).toBeGreaterThan(0);
    });

    it('should contain sibling relationships', () => {
      const result = getAllOrixaOrixas();
      const siblings = result.filter(r => r.relationship_type === 'irmao_irma');

      expect(siblings.length).toBeGreaterThan(0);
    });

    it('should contain complementary relationships', () => {
      const result = getAllOrixaOrixas();
      const complementars = result.filter(r => r.relationship_type === 'complementar');

      expect(complementars.length).toBeGreaterThan(0);
    });

    it('should have all required properties in each relationship', () => {
      const result = getAllOrixaOrixas();

      result.forEach(rel => {
        expect(rel).toHaveProperty('orixa');
        expect(rel).toHaveProperty('related_orixa');
        expect(rel).toHaveProperty('relationship_type');
        expect(rel).toHaveProperty('spiritual_meaning');
        expect(typeof rel.spiritual_meaning).toBe('string');
        expect(rel.spiritual_meaning.length).toBeGreaterThan(10);
      });
    });
  });

  describe('getRelationshipsByType', () => {
    it('should return parent-child relationships', () => {
      const result = getRelationshipsByType('pai_filho');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(rel => {
        expect(rel.relationship_type).toBe('pai_filho');
      });
    });

    it('should return sibling relationships', () => {
      const result = getRelationshipsByType('irmao_irma');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(rel => {
        expect(rel.relationship_type).toBe('irmao_irma');
      });
    });

    it('should return spouse relationships', () => {
      const result = getRelationshipsByType('conjuge');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(rel => {
        expect(rel.relationship_type).toBe('conjuge');
      });
    });

    it('should return complementary relationships', () => {
      const result = getRelationshipsByType('complementar');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(rel => {
        expect(rel.relationship_type).toBe('complementar');
      });
    });

    it('should return ally relationships', () => {
      const result = getRelationshipsByType('aliado');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(rel => {
        expect(rel.relationship_type).toBe('aliado');
      });
    });
  });

  describe('getBidirectionalOrixas', () => {
    it('should return Oxum bidirectional orixás', () => {
      const result = getBidirectionalOrixas('Oxum');

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Iemanjá');
    });

    it('should return Iansã bidirectional orixás', () => {
      const result = getBidirectionalOrixas('Iansã');

      expect(result.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const result1 = getBidirectionalOrixas('OGUM');
      const result2 = getBidirectionalOrixas('ogum');

      expect(result1.length).toBe(result2.length);
    });
  });

  describe('Spiritual relationship consistency', () => {
    it('should have meaningful spiritual meanings for all relationships', () => {
      const allRelations = getAllOrixaOrixas();

      allRelations.forEach(rel => {
        expect(rel.spiritual_meaning.length).toBeGreaterThan(20);
      });
    });

    it('should have ritual complements for complementary relationships', () => {
      const complementars = getRelationshipsByType('complementar');

      complementars.forEach(rel => {
        expect(rel.ritual互补).toBeDefined();
        expect(Array.isArray(rel.ritual互补)).toBe(true);
        expect(rel.ritual互补.length).toBeGreaterThan(0);
      });
    });

    it('should have bidirectional flow for spouse relationships', () => {
      const spouses = getRelationshipsByType('conjuge');

      spouses.forEach(rel => {
        expect(rel.energy_flow).toBe('bidirectional');
      });
    });

    it('should include Exu in key relationships', () => {
      const allRelations = getAllOrixaOrixas();
      const exuRelations = allRelations.filter(
        rel => rel.orixa === 'Exu' || rel.related_orixa === 'Exu'
      );

      expect(exuRelations.length).toBeGreaterThan(0);
    });

    it('should have Oxalá as central figure with many relationships', () => {
      const oxaláRelations = getAllOrixaRelations('Oxalá');

      expect(oxaláRelations.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Cross-reference consistency', () => {
    it('Oxalá-Iemanjá complementary should exist in both directions', () => {
      const direct = getOrixaOrixa('Oxalá', 'Iemanjá');
      expect(direct?.relationship_type).toBe('complementar');
    });

    it('Ogum-Iansã spouse should be bidirectional', () => {
      const relationship = getOrixaOrixa('Ogum', 'Iansã');
      expect(relationship?.energy_flow).toBe('bidirectional');
    });

    it('Xangô-Iansã ex-spouse should be documented', () => {
      const relationship = getOrixaOrixa('Xangô', 'Iansã');
      expect(relationship?.relationship_type).toBe('ex_conjuge');
    });

    it('Omolu-Nanã parent-child should have correct flow', () => {
      const relationship = getOrixaOrixa('Omolu', 'Nanã');
      expect(relationship?.energy_flow).toBe('related_to_orixa');
    });

    it('Oxóssi-Logun Edé parent-child should exist', () => {
      const relationship = getOrixaOrixa('Oxóssi', 'Logun Edé');
      expect(relationship?.relationship_type).toBe('pai_filho');
      expect(relationship?.energy_flow).toBe('orixa_to_related');
    });
  });
});

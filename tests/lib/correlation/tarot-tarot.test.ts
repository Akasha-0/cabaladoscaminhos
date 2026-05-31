/**
 * Tests for Tarot-Tarot Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getRelationBetweenArcanos,
  getRelationsByType,
  getAllArcanos,
  getElementoByArcano,
  getArquétipoByArcano,
  getSequentialJourney,
  getElementalRelationships,
  getOppositeRelationships,
  getNextArcano,
  getArcanoNumbers,
  hasArcano,
  getArcanoNumber,
  getArcanosByArquétipo,
  getArcanosByElemento,
  getRelationshipsFrom,
  getRelationshipsTo,
  TAROT_TAROT_MAP,
  ELEMENTO_ARCANO,
  ARQUÉTIPO_ARCANO,
} from '@/lib/correlation/tarot-tarot';

describe('TarotTarot Correlation Module', () => {
  describe('getTarotTarot', () => {
    it('should return relationships for O Louco', () => {
      const relationships = getTarotTarot('O Louco');
      expect(relationships.length).toBeGreaterThan(0);
      expect(relationships.some((r) => r.arcano_origem === 'O Louco' || r.arcano_destino === 'O Louco')).toBe(true);
    });

    it('should return relationships for O Mago', () => {
      const relationships = getTarotTarot('O Mago');
      expect(relationships.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent arcano', () => {
      const relationships = getTarotTarot('Não Existente');
      expect(relationships).toEqual([]);
    });

    it('should include both origin and destination relationships', () => {
      const relationships = getTarotTarot('A Morte');
      const hasOrigin = relationships.some((r) => r.arcano_origem === 'A Morte');
      const hasDestination = relationships.some((r) => r.arcano_destino === 'A Morte');
      expect(hasOrigin || hasDestination).toBe(true);
    });
  });

  describe('getRelationBetweenArcanos', () => {
    it('should return sequential relationship between O Louco and O Mago', () => {
      const relationships = getRelationBetweenArcanos('O Louco', 'O Mago');
      expect(relationships.length).toBeGreaterThan(0);
      expect(relationships[0].tipo_relação).toBe('sequencial');
    });

    it('should return relationship regardless of order', () => {
      const forward = getRelationBetweenArcanos('O Mago', 'A Sacerdotisa');
      const reverse = getRelationBetweenArcanos('A Sacerdotisa', 'O Mago');
      expect(forward.length).toBe(reverse.length);
    });

    it('should return empty array for unrelated arcanos', () => {
      const relationships = getRelationBetweenArcanos('O Louco', 'O Mundo');
      expect(relationships.length).toBe(0);
    });
  });

  describe('getRelationsByType', () => {
    it('should return all sequential relationships', () => {
      const sequential = getRelationsByType('sequencial');
      expect(sequential.length).toBeGreaterThan(0);
      sequential.forEach((r) => {
        expect(r.tipo_relação).toBe('sequencial');
      });
    });

    it('should return all elemental relationships', () => {
      const elemental = getRelationsByType('elemental');
      expect(elemental.length).toBeGreaterThan(0);
      elemental.forEach((r) => {
        expect(r.tipo_relação).toBe('elemental');
      });
    });

    it('should return all opposite relationships', () => {
      const opposite = getRelationsByType('oposto');
      expect(opposite.length).toBeGreaterThan(0);
      opposite.forEach((r) => {
        expect(r.tipo_relação).toBe('oposto');
      });
    });

    it('should return all arquétipo relationships', () => {
      const arquetipo = getRelationsByType('arquétipo');
      expect(arquetipo.length).toBeGreaterThan(0);
      arquetipo.forEach((r) => {
        expect(r.tipo_relação).toBe('arquétipo');
      });
    });

    it('should return all shadow relationships', () => {
      const sombra = getRelationsByType('sombra');
      sombra.forEach((r) => {
        expect(r.tipo_relação).toBe('sombra');
      });
    });

    it('should return all integração relationships', () => {
      const integracao = getRelationsByType('integração');
      integracao.forEach((r) => {
        expect(r.tipo_relação).toBe('integração');
      });
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 22 Major Arcana names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos.length).toBeGreaterThanOrEqual(22);
    });

    it('should include O Louco', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Louco');
    });

    it('should include O Mundo', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Mundo');
    });

    it('should be sorted by card number', () => {
      const arcanos = getAllArcanos();
      const numbers = arcanos.map((a) => getArcanoNumber(a) ?? 0);
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1]);
      }
    });
  });

  describe('getElementoByArcano', () => {
    it('should return Fogo for O Imperador', () => {
      const elemento = getElementoByArcano('O Imperador');
      expect(elemento).toBe('Fogo');
    });

    it('should return Água for A Sacerdotisa', () => {
      const elemento = getElementoByArcano('A Sacerdotisa');
      expect(elemento).toBe('Água');
    });

    it('should return Ar for Os Enamorados', () => {
      const elemento = getElementoByArcano('Os Enamorados');
      expect(elemento).toBe('Ar');
    });

    it('should return Terra for A Imperatriz', () => {
      const elemento = getElementoByArcano('A Imperatriz');
      expect(elemento).toBe('Terra');
    });

    it('should return Éter for O Louco', () => {
      const elemento = getElementoByArcano('O Louco');
      expect(elemento).toBe('Éter');
    });

    it('should return null for non-existent arcano', () => {
      const elemento = getElementoByArcano('Não Existente');
      expect(elemento).toBeNull();
    });
  });

  describe('getArquétipoByArcano', () => {
    it('should return Transição for O Louco', () => {
      const arquetipo = getArquétipoByArcano('O Louco');
      expect(arquetipo).toBe('Transição');
    });

    it('should return Iniciação for O Mago', () => {
      const arquetipo = getArquétipoByArcano('O Mago');
      expect(arquetipo).toBe('Iniciação');
    });

    it('should return Autoridade for O Imperador', () => {
      const arquetipo = getArquétipoByArcano('O Imperador');
      expect(arquetipo).toBe('Autoridade');
    });

    it('should return Conflito for O Carro', () => {
      const arquetipo = getArquétipoByArcano('O Carro');
      expect(arquetipo).toBe('Conflito');
    });

    it('should return Transformação for A Morte', () => {
      const arquetipo = getArquétipoByArcano('A Morte');
      expect(arquetipo).toBe('Transformação');
    });

    it('should return Libertação for A Torre', () => {
      const arquetipo = getArquétipoByArcano('A Torre');
      expect(arquetipo).toBe('Libertação');
    });

    it('should return Iluminação for O Sol', () => {
      const arquetipo = getArquétipoByArcano('O Sol');
      expect(arquetipo).toBe('Iluminação');
    });

    it('should return null for non-existent arcano', () => {
      const arquetipo = getArquétipoByArcano('Não Existente');
      expect(arquetipo).toBeNull();
    });
  });

  describe('getSequentialJourney', () => {
    it('should return all sequential relationships', () => {
      const journey = getSequentialJourney();
      expect(journey.length).toBeGreaterThan(0);
      journey.forEach((r) => {
        expect(r.tipo_relação).toBe('sequencial');
      });
    });

    it('should be sorted by card number', () => {
      const journey = getSequentialJourney();
      for (let i = 1; i < journey.length; i++) {
        expect(journey[i].número_origem).toBeGreaterThan(journey[i - 1].número_origem);
      }
    });

    it('should start with O Louco to O Mago', () => {
      const journey = getSequentialJourney();
      expect(journey[0].arcano_origem).toBe('O Louco');
      expect(journey[0].arcano_destino).toBe('O Mago');
    });

    it('should end with O Julgamento to O Mundo', () => {
      const journey = getSequentialJourney();
      const last = journey[journey.length - 1];
      expect(last.arcano_origem).toBe('O Julgamento');
      expect(last.arcano_destino).toBe('O Mundo');
    });
  });

  describe('getElementalRelationships', () => {
    it('should return only elemental relationships', () => {
      const elemental = getElementalRelationships();
      elemental.forEach((r) => {
        expect(r.tipo_relação).toBe('elemental');
      });
    });

    it('should include relationships between same-element cards', () => {
      const elemental = getElementalRelationships();
      expect(elemental.length).toBeGreaterThan(0);
    });
  });

  describe('getOppositeRelationships', () => {
    it('should return only opposite relationships', () => {
      const opposite = getOppositeRelationships();
      opposite.forEach((r) => {
        expect(r.tipo_relação).toBe('oposto');
      });
    });

    it('should include O Louco and O Mundo as opposites', () => {
      const opposite = getOppositeRelationships();
      const hasFoolWorld = opposite.some(
        (r) =>
          (r.arcano_origem === 'O Louco' && r.arcano_destino === 'O Mundo') ||
          (r.arcano_origem === 'O Mundo' && r.arcano_destino === 'O Louco')
      );
      expect(hasFoolWorld).toBe(true);
    });
  });

  describe('getNextArcano', () => {
    it('should return O Mago after O Louco', () => {
      const next = getNextArcano('O Louco');
      expect(next).toBe('O Mago');
    });

    it('should return A Sacerdotisa after O Mago', () => {
      const next = getNextArcano('O Mago');
      expect(next).toBe('A Sacerdotisa');
    });

    it('should return null after O Mundo', () => {
      const next = getNextArcano('O Mundo');
      expect(next).toBeNull();
    });
  });

  describe('getArcanoNumbers', () => {
    it('should return all arcano numbers', () => {
      const numbers = getArcanoNumbers();
      expect(Object.keys(numbers).length).toBeGreaterThanOrEqual(22);
    });

    it('should have O Louco as 0', () => {
      const numbers = getArcanoNumbers();
      expect(numbers['O Louco']).toBe(0);
    });

    it('should have O Mago as 1', () => {
      const numbers = getArcanoNumbers();
      expect(numbers['O Mago']).toBe(1);
    });

    it('should have O Mundo as 21', () => {
      const numbers = getArcanoNumbers();
      expect(numbers['O Mundo']).toBe(21);
    });
  });

  describe('hasArcano', () => {
    it('should return true for existing arcanos', () => {
      expect(hasArcano('O Louco')).toBe(true);
      expect(hasArcano('O Mago')).toBe(true);
      expect(hasArcano('A Morte')).toBe(true);
      expect(hasArcano('O Sol')).toBe(true);
    });

    it('should return false for non-existent arcanos', () => {
      expect(hasArcano('Não Existente')).toBe(false);
      expect(hasArcano('')).toBe(false);
    });
  });

  describe('getArcanoNumber', () => {
    it('should return 0 for O Louco', () => {
      const num = getArcanoNumber('O Louco');
      expect(num).toBe(0);
    });

    it('should return 21 for O Mundo', () => {
      const num = getArcanoNumber('O Mundo');
      expect(num).toBe(21);
    });

    it('should return null for non-existent arcano', () => {
      const num = getArcanoNumber('Não Existente');
      expect(num).toBeNull();
    });
  });

  describe('getArcanosByArquétipo', () => {
    it('should return all arcanos in Iniciação', () => {
      const arcanos = getArcanosByArquétipo('Iniciação');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('A Sacerdotisa');
      expect(arcanos).toContain('A Imperatriz');
    });

    it('should return all arcanos in Iluminação', () => {
      const arcanos = getArcanosByArquétipo('Iluminação');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('O Julgamento');
      expect(arcanos).toContain('O Mundo');
    });

    it('should return only O Louco for Transição', () => {
      const arcanos = getArcanosByArquétipo('Transição');
      expect(arcanos).toEqual(['O Louco']);
    });
  });

  describe('getArcanosByElemento', () => {
    it('should return all Fogo arcanos', () => {
      const arcanos = getArcanosByElemento('Fogo');
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('O Carro');
      expect(arcanos).toContain('A Força');
    });

    it('should return all Água arcanos', () => {
      const arcanos = getArcanosByElemento('Água');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('A Sacerdotisa');
      expect(arcanos).toContain('A Morte');
    });

    it('should return all Ar arcanos', () => {
      const arcanos = getArcanosByElemento('Ar');
      expect(arcanos).toContain('Os Enamorados');
      expect(arcanos).toContain('A Justiça');
    });

    it('should return all Terra arcanos', () => {
      const arcanos = getArcanosByElemento('Terra');
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('O Eremita');
      expect(arcanos).toContain('O Diabo');
 });

    it('should return only O Louco for Éter', () => {
      const arcanos = getArcanosByElemento('Éter');
      expect(arcanos).toEqual(['O Louco']);
    });
  });

  describe('getRelationshipsFrom', () => {
    it('should return only relationships where arcano is origin', () => {
      const relationships = getRelationshipsFrom('O Louco');
      relationships.forEach((r) => {
        expect(r.arcano_origem).toBe('O Louco');
      });
    });

    it('should include sequential relationship to O Mago', () => {
      const relationships = getRelationshipsFrom('O Louco');
      const hasMago = relationships.some((r) => r.arcano_destino === 'O Mago');
      expect(hasMago).toBe(true);
    });
  });

  describe('getRelationshipsTo', () => {
    it('should return only relationships where arcano is destination', () => {
      const relationships = getRelationshipsTo('O Mago');
      relationships.forEach((r) => {
        expect(r.arcano_destino).toBe('O Mago');
      });
    });

    it('should include sequential relationship from O Louco', () => {
      const relationships = getRelationshipsTo('O Mago');
      const hasLouco = relationships.some((r) => r.arcano_origem === 'O Louco');
      expect(hasLouco).toBe(true);
    });
  });

  describe('TAROT_TAROT_MAP constant', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });

    it('should have at least 50 relationships', () => {
      expect(TAROT_TAROT_MAP.length).toBeGreaterThanOrEqual(50);
    });

    it('should have valid arcano names', () => {
      TAROT_TAROT_MAP.forEach((m) => {
        expect(hasArcano(m.arcano_origem)).toBe(true);
        expect(hasArcano(m.arcano_destino)).toBe(true);
      });
    });

    it('should have valid card numbers', () => {
      TAROT_TAROT_MAP.forEach((m) => {
        expect(m.número_origem).toBeGreaterThanOrEqual(0);
        expect(m.número_origem).toBeLessThanOrEqual(21);
        expect(m.número_destino).toBeGreaterThanOrEqual(0);
        expect(m.número_destino).toBeLessThanOrEqual(21);
      });
    });

    it('should have non-empty spiritual connections', () => {
      TAROT_TAROT_MAP.forEach((m) => {
        expect(m.conexão_espiritual.length).toBeGreaterThan(0);
        expect(m.lição_principal.length).toBeGreaterThan(0);
        expect(m.prática_ritual.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ELEMENTO_ARCANO constant', () => {
    it('should have all 22 arcanos', () => {
      expect(Object.keys(ELEMENTO_ARCANO).length).toBe(22);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(ELEMENTO_ARCANO)).toBe(true);
    });

    it('should have valid elements only', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(ELEMENTO_ARCANO).forEach((elem) => {
        expect(validElements).toContain(elem);
      });
    });
  });

  describe('ARQUÉTIPO_ARCANO constant', () => {
    it('should have all 22 arcanos', () => {
      expect(Object.keys(ARQUÉTIPO_ARCANO).length).toBe(22);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(ARQUÉTIPO_ARCANO)).toBe(true);
    });

    it('should have valid arquétipos only', () => {
      const validArquétipos = ['Iniciação', 'Autoridade', 'Conflito', 'Transformação', 'Libertação', 'Iluminação', 'Transição'];
      Object.values(ARQUÉTIPO_ARCANO).forEach((arch) => {
        expect(validArquétipos).toContain(arch);
      });
    });
  });

  describe('Relationship structure validation', () => {
    it('should have valid relationship types', () => {
      const validTypes = ['sequencial', 'elemental', 'oposto', 'arquétipo', 'complementar', 'sombra', 'integração', 'númerológico'];
      TAROT_TAROT_MAP.forEach((m) => {
        expect(validTypes).toContain(m.tipo_relação);
      });
    });

    it('should have sequential journey covering all 22 cards', () => {
      const journey = getSequentialJourney();
      const coveredNumbers = new Set<number>();
      journey.forEach((r) => {
        coveredNumbers.add(r.número_origem);
        coveredNumbers.add(r.número_destino);
      });
      // Journey should cover cards 0-21
      for (let i = 0; i <= 21; i++) {
        expect(coveredNumbers.has(i)).toBe(true);
      }
    });
  });
});

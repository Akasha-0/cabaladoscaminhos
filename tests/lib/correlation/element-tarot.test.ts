import { describe, it, expect } from 'vitest';
import {
  getElementTarot,
  getTarotElement,
  getElementByNumber,
  getArcanoByElement,
  getAllElementTarots,
  getAllElements,
  hasElementTarot,
  getAllArcanos,
  getCardNumberByElement,
  getConexaoElemental,
  ELEMENT_TAROT_MAP,
  ELEMENTOS,
} from '@/lib/correlation/element-tarot';

describe('ElementTarot Correlation', () => {
  describe('getElementTarot', () => {
    it('returns the correct mapping for Terra', () => {
      const mapping = getElementTarot('Terra');
      expect(mapping).not.toBeNull();
      expect(mapping?.elemento).toBe('Terra');
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.numero_carta).toBe(4);
    });

    it('returns the correct mapping for Água', () => {
      const mapping = getElementTarot('Água');
      expect(mapping).not.toBeNull();
      expect(mapping?.elemento).toBe('Água');
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.numero_carta).toBe(3);
    });

    it('returns the correct mapping for Fogo', () => {
      const mapping = getElementTarot('Fogo');
      expect(mapping).not.toBeNull();
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.numero_carta).toBe(16);
    });

    it('returns the correct mapping for Ar', () => {
      const mapping = getElementTarot('Ar');
      expect(mapping).not.toBeNull();
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.numero_carta).toBe(5);
    });

    it('returns the correct mapping for Éter', () => {
      const mapping = getElementTarot('Éter');
      expect(mapping).not.toBeNull();
      expect(mapping?.elemento).toBe('Éter');
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.numero_carta).toBe(0);
    });

    it('returns null for unknown element', () => {
      const mapping = getElementTarot('Desconhecido');
      expect(mapping).toBeNull();
    });

    it('includes all required fields in mapping', () => {
      const mapping = getElementTarot('Terra');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('conexao_elemental');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('ritual');
    });
  });

  describe('ELEMENT_TAROT_MAP', () => {
    it('has 5 elements mapped', () => {
      expect(Object.keys(ELEMENT_TAROT_MAP)).toHaveLength(5);
    });

    it('contains all expected elements', () => {
      expect(ELEMENT_TAROT_MAP).toHaveProperty('Terra');
      expect(ELEMENT_TAROT_MAP).toHaveProperty('Água');
      expect(ELEMENT_TAROT_MAP).toHaveProperty('Fogo');
      expect(ELEMENT_TAROT_MAP).toHaveProperty('Ar');
      expect(ELEMENT_TAROT_MAP).toHaveProperty('Éter');
    });

    it('each mapping has valid card numbers', () => {
      for (const mapping of Object.values(ELEMENT_TAROT_MAP)) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('each mapping has non-empty descriptions', () => {
      for (const mapping of Object.values(ELEMENT_TAROT_MAP)) {
        expect(mapping.conexao_elemental.length).toBeGreaterThan(0);
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
        expect(mapping.ritual.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getTarotElement', () => {
    it('returns Terra for O Imperador', () => {
      const elemento = getTarotElement('O Imperador');
      expect(elemento).toBe('Terra');
    });

    it('returns Água for A Imperatriz', () => {
      const elemento = getTarotElement('A Imperatriz');
      expect(elemento).toBe('Água');
    });

    it('returns Fogo for A Torre', () => {
      const elemento = getTarotElement('A Torre');
      expect(elemento).toBe('Fogo');
    });

    it('returns Ar for O Hierofante', () => {
      const elemento = getTarotElement('O Hierofante');
      expect(elemento).toBe('Ar');
    });

    it('returns Éter for O Louco', () => {
      const elemento = getTarotElement('O Louco');
      expect(elemento).toBe('Éter');
    });

    it('returns null for unknown arcano', () => {
      const elemento = getTarotElement('Arcano Desconhecido');
      expect(elemento).toBeNull();
    });
  });

  describe('getElementByNumber', () => {
    it('returns Terra for card 4', () => {
      const elemento = getElementByNumber(4);
      expect(elemento).toBe('Terra');
    });

    it('returns Água for card 3', () => {
      const elemento = getElementByNumber(3);
      expect(elemento).toBe('Água');
    });

    it('returns Fogo for card 16', () => {
      const elemento = getElementByNumber(16);
      expect(elemento).toBe('Fogo');
    });

    it('returns Ar for card 5', () => {
      const elemento = getElementByNumber(5);
      expect(elemento).toBe('Ar');
    });

    it('returns Éter for card 0', () => {
      const elemento = getElementByNumber(0);
      expect(elemento).toBe('Éter');
    });

    it('returns null for unassigned card numbers', () => {
      // Major Arcana card 1 (O Mago) is not mapped
      const elemento = getElementByNumber(1);
      expect(elemento).toBeNull();
    });
  });

  describe('getArcanoByElement', () => {
    it('returns O Imperador for Terra', () => {
      const arcano = getArcanoByElement('Terra');
      expect(arcano).toBe('O Imperador');
    });

    it('returns A Imperatriz for Água', () => {
      const arcano = getArcanoByElement('Água');
      expect(arcano).toBe('A Imperatriz');
    });

    it('returns null for unknown element', () => {
      const arcano = getArcanoByElement('Elemento Desconhecido');
      expect(arcano).toBeNull();
    });
  });

  describe('getAllElementTarots', () => {
    it('returns array of all mappings', () => {
      const mappings = getAllElementTarots();
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings).toHaveLength(5);
    });

    it('returns mappings with all required fields', () => {
      const mappings = getAllElementTarots();
      for (const mapping of mappings) {
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('conexao_elemental');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('ritual');
      }
    });

    it('each element in result has unique arcano', () => {
      const mappings = getAllElementTarots();
      const arcanos = mappings.map((m) => m.arcano);
      const uniqueArcanos = new Set(arcanos);
      expect(uniqueArcanos.size).toBe(arcanos.length);
    });
  });

  describe('getAllElements', () => {
    it('returns array of all element names', () => {
      const elements = getAllElements();
      expect(Array.isArray(elements)).toBe(true);
      expect(elements).toHaveLength(5);
    });

    it('contains all expected elements', () => {
      const elements = getAllElements();
      expect(elements).toContain('Terra');
      expect(elements).toContain('Água');
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Ar');
      expect(elements).toContain('Éter');
    });
  });

  describe('hasElementTarot', () => {
    it('returns true for known elements', () => {
      expect(hasElementTarot('Terra')).toBe(true);
      expect(hasElementTarot('Água')).toBe(true);
      expect(hasElementTarot('Fogo')).toBe(true);
      expect(hasElementTarot('Ar')).toBe(true);
      expect(hasElementTarot('Éter')).toBe(true);
    });

    it('returns false for unknown elements', () => {
      expect(hasElementTarot('Desconhecido')).toBe(false);
      expect(hasElementTarot('Vento')).toBe(false);
      expect(hasElementTarot('Pedra')).toBe(false);
    });
  });

  describe('getAllArcanos', () => {
    it('returns array of all arcano names', () => {
      const arcanos = getAllArcanos();
      expect(Array.isArray(arcanos)).toBe(true);
      expect(arcanos).toHaveLength(5);
    });

    it('contains all expected arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('A Torre');
      expect(arcanos).toContain('O Hierofante');
      expect(arcanos).toContain('O Louco');
    });
  });

  describe('getCardNumberByElement', () => {
    it('returns 4 for Terra', () => {
      const numero = getCardNumberByElement('Terra');
      expect(numero).toBe(4);
    });

    it('returns 3 for Água', () => {
      const numero = getCardNumberByElement('Água');
      expect(numero).toBe(3);
    });

    it('returns 16 for Fogo', () => {
      const numero = getCardNumberByElement('Fogo');
      expect(numero).toBe(16);
    });

    it('returns 5 for Ar', () => {
      const numero = getCardNumberByElement('Ar');
      expect(numero).toBe(5);
    });

    it('returns 0 for Éter', () => {
      const numero = getCardNumberByElement('Éter');
      expect(numero).toBe(0);
    });

    it('returns null for unknown element', () => {
      const numero = getCardNumberByElement('Desconhecido');
      expect(numero).toBeNull();
    });
  });

  describe('getConexaoElemental', () => {
    it('returns connection description for known elements', () => {
      const conexao = getConexaoElemental('Terra');
      expect(conexao).not.toBeNull();
      expect(typeof conexao).toBe('string');
      expect(conexao.length).toBeGreaterThan(0);
    });

    it('returns null for unknown element', () => {
      const conexao = getConexaoElemental('Desconhecido');
      expect(conexao).toBeNull();
    });
  });

  describe('Elemental Archetypes', () => {
    it('Terra corresponds to O Imperador (structure and authority)', () => {
      const mapping = getElementTarot('Terra');
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.significado_espiritual).toContain('materialização');
    });

    it('Água corresponds to A Imperatriz (nurturing and fertility)', () => {
      const mapping = getElementTarot('Água');
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.significado_espiritual).toContain('amor');
    });

    it('Fogo corresponds to A Torre (transformation)', () => {
      const mapping = getElementTarot('Fogo');
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.significado_espiritual).toContain('catarse');
    });

    it('Ar corresponds to O Hierofante (wisdom and teaching)', () => {
      const mapping = getElementTarot('Ar');
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.significado_espiritual).toContain('sabedoria');
    });

    it('Éter corresponds to O Louco (divine essence and freedom)', () => {
      const mapping = getElementTarot('Éter');
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.significado_espiritual).toContain('liberdade');
    });
  });
});
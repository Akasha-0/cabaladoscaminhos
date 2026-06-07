import { describe, it, expect } from 'vitest';
import {
  getMoonElement,
  getElementMoon,
  getAllMoonElements,
  getNaturezaElemental,
  getSignificadoCore,
  getOrixaByMoon,
  getChakraByMoon,
  getDirecaoByMoon,
  getEstacaoByMoon,
  getMoonsByElement,
  getAvailablePhases,
  getAvailableElements,
  MOON_ELEMENT_MAP,
  type Elemento,
  type FaseLua,
} from '@/lib/correlation/moon-element';

describe('correlation/moon-element', () => {
  describe('getMoonElement', () => {
    it('returns mapping for valid phase', () => {
      const result = getMoonElement('lua-nova');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-nova');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns null for invalid phase', () => {
      const result = getMoonElement('fase-invalida');
      expect(result).toBeNull();
    });

    it('handles case-insensitive input', () => {
      const result = getMoonElement('LUA-NOVA');
      expect(result?.fase).toBe('lua-nova');
    });

    it('handles phase with spaces', () => {
      const result = getMoonElement(' lua-nova ');
      expect(result?.fase).toBe('lua-nova');
    });

    it('each mapping has all required fields', () => {
      const result = getMoonElement('lua-cheia');
      expect(result?.fase).toBeTruthy();
      expect(result?.nome_fase).toBeTruthy();
      expect(result?.elemento).toBeTruthy();
      expect(result?.qualidade_elemental).toBeTruthy();
      expect(result?.significado_espiritual).toBeTruthy();
      expect(result?.correspondencias).toBeTruthy();
    });
  });

  describe('getElementMoon', () => {
    it('returns element for valid phase', () => {
      expect(getElementMoon('lua-nova')).toBe('Terra');
      expect(getElementMoon('lua-crescente')).toBe('Água');
      expect(getElementMoon('quarto-crescente')).toBe('Fogo');
      expect(getElementMoon('lua-cheia')).toBe('Ar');
      expect(getElementMoon('lua-minguante')).toBe('Éter');
    });

    it('returns null for invalid phase', () => {
      expect(getElementMoon('fase-inexistente')).toBeNull();
    });
  });

  describe('getAllMoonElements', () => {
    it('returns array of all mappings', () => {
      const result = getAllMoonElements();
      expect(result).toHaveLength(8);
    });

    it('all phases are included', () => {
      const result = getAllMoonElements();
      const phases = result.map((m) => m.fase);
      expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('quarto-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('quarto-minguante');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
    });
  });

  describe('getNaturezaElemental', () => {
    it('returns natureza for valid phase', () => {
      expect(getNaturezaElemental('lua-nova')).toBe('Ancoradora e fecunda');
      expect(getNaturezaElemental('lua-cheia')).toBe('Iluminada e expansiva');
    });

    it('returns null for invalid phase', () => {
      expect(getNaturezaElemental('fase-invalida')).toBeNull();
    });
  });

  describe('getSignificadoCore', () => {
    it('returns core meaning for valid phase', () => {
      const result = getSignificadoCore('lua-cheia');
      expect(result).toContain('espelho');
    });

    it('returns null for invalid phase', () => {
      expect(getSignificadoCore('fase-invalida')).toBeNull();
    });
  });

  describe('getOrixaByMoon', () => {
    it('returns Orixá for valid phase', () => {
      expect(getOrixaByMoon('lua-nova')).toBe('Exu');
      expect(getOrixaByMoon('lua-crescente')).toBe('Oxóssi');
      expect(getOrixaByMoon('lua-cheia')).toBe('Oxalá');
    });

    it('returns null for invalid phase', () => {
      expect(getOrixaByMoon('fase-invalida')).toBeNull();
    });
  });

  describe('getChakraByMoon', () => {
    it('returns chakra for valid phase', () => {
      expect(getChakraByMoon('lua-nova')).toContain('Básico');
      expect(getChakraByMoon('lua-cheia')).toContain('Cardíaco');
    });

    it('returns null for invalid phase', () => {
      expect(getChakraByMoon('fase-invalida')).toBeNull();
    });
  });

  describe('getDirecaoByMoon', () => {
    it('returns cardinal direction for valid phase', () => {
      expect(getDirecaoByMoon('lua-nova')).toBe('Norte');
      expect(getDirecaoByMoon('lua-cheia')).toBe('Sul');
    });

    it('returns null for invalid phase', () => {
      expect(getDirecaoByMoon('fase-invalida')).toBeNull();
    });
  });

  describe('getEstacaoByMoon', () => {
    it('returns season for valid phase', () => {
      expect(getEstacaoByMoon('lua-nova')).toBe('Inverno');
      expect(getEstacaoByMoon('lua-cheia')).toBe('Verão');
    });

    it('returns null for invalid phase', () => {
      expect(getEstacaoByMoon('fase-invalida')).toBeNull();
    });
  });

  describe('getMoonsByElement', () => {
    it('returns phases for Éter element', () => {
      const result = getMoonsByElement('Éter');
      expect(result).toHaveLength(3);
      const phases = result.map((m) => m.fase);
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
    });

    it('returns phases for Terra element', () => {
      const result = getMoonsByElement('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('lua-nova');
    });

    it('returns empty array for unknown element', () => {
      const result = getMoonsByElement('ElementoInvalido');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAvailablePhases', () => {
    it('returns all phase identifiers', () => {
      const result = getAvailablePhases();
      expect(result).toHaveLength(8);
    });
  });

  describe('getAvailableElements', () => {
    it('returns unique elements', () => {
      const result = getAvailableElements();
      expect(result).toContain('Terra');
      expect(result).toContain('Água');
      expect(result).toContain('Fogo');
      expect(result).toContain('Ar');
      expect(result).toContain('Éter');
    });
  });

  describe('MOON_ELEMENT_MAP', () => {
    it('is frozen and immutable', () => {
      expect(Object.isFrozen(MOON_ELEMENT_MAP)).toBe(true);
    });

    it('contains all 8 lunar phases', () => {
      expect(Object.keys(MOON_ELEMENT_MAP)).toHaveLength(8);
    });

    it('each phase has complete spiritual structure', () => {
      for (const mapping of Object.values(MOON_ELEMENT_MAP)) {
        expect(mapping.qualidade_elemental.natureza).toBeTruthy();
        expect(mapping.qualidade_elemental.energia).toBeTruthy();
        expect(mapping.qualidade_elemental.manifesto_em.length).toBeGreaterThan(0);
        expect(mapping.significado_espiritual.core).toBeTruthy();
        expect(mapping.significado_espiritual.aprendizado).toBeTruthy();
        expect(mapping.significado_espiritual.advertencia).toBeTruthy();
        expect(mapping.significado_espiritual.ritual_sugerido).toBeTruthy();
        expect(mapping.correspondencias.orixa_regente).toBeTruthy();
        expect(mapping.correspondencias.chakra).toBeTruthy();
        expect(mapping.correspondencias.direcao_cardinal).toBeTruthy();
        expect(mapping.correspondencias.estacao).toBeTruthy();
      }
    });
  });
});
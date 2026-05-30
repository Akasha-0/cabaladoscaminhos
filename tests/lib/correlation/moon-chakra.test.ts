import { describe, it, expect } from 'vitest';
import {
  getMoonChakra,
  getChakraMoon,
  getAllMoonChakras,
  getEnergyFlowMoon,
  getPracticeMoon,
  getMoonPhasesByChakra,
  getIntentionMoon,
  getMoonPhasesByEnergyFlow,
  getElementMoon,
  MOON_CHAKRA_MAP,
  type MoonChakra,
} from '@/lib/correlation/moon-chakra';

describe('Moon-Chakra Correlation', () => {
  describe('getMoonChakra', () => {
    it('should return 1º Básico (Muladhara) mapping for lua-nova', () => {
      const result = getMoonChakra('lua-nova');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Lua Nova');
      expect(result?.chakra).toBe('1º Básico');
      expect(result?.chakra_numero).toBe(1);
      expect(result?.chakra_sanskrito).toBe('Muladhara');
      expect(result?.fluxo_energetico).toBe('centripeto');
      expect(result?.elemento).toBe('terra');
    });

    it('should return 2º Sacro (Svadhisthana) mapping for lua-crescente', () => {
      const result = getMoonChakra('lua-crescente');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Lua Crescente');
      expect(result?.chakra).toBe('2º Sacro');
      expect(result?.chakra_numero).toBe(2);
      expect(result?.chakra_sanskrito).toBe('Svadhisthana');
      expect(result?.fluxo_energetico).toBe('ascendente');
      expect(result?.elemento).toBe('água');
    });

    it('should return 3º Plexo Solar (Manipura) mapping for quarto-crescente', () => {
      const result = getMoonChakra('quarto-crescente');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Quarto Crescente');
      expect(result?.chakra).toBe('3º Plexo Solar');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.chakra_sanskrito).toBe('Manipura');
      expect(result?.fluxo_energetico).toBe('ascendente');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return 4º Cardíaco (Anahata) mapping for lua-cheia', () => {
      const result = getMoonChakra('lua-cheia');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Lua Cheia');
      expect(result?.chakra).toBe('4º Cardíaco');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.chakra_numero).toBe(5);
    });

    it('should return 5º Laríngeo (Vishuddha) mapping for quarto-minguante', () => {
      const result = getMoonChakra('quarto-minguante');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Quarto Minguante');
      expect(result?.chakra).toBe('5º Laríngeo');
      expect(result?.chakra_numero). 5;
      expect(result?.chakra_sanskrito).toBe('Vishuddha');
      expect(result?.fluxo_energetico).toBe('descendente');
      expect(result?.elemento).toBe('éter');
    });

    it('should return 6º Frontal (Ajna) mapping for lua-minguante', () => {
      const result = getMoonChakra('lua-minguante');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Lua Minguante');
      expect(result?.chakra).toBe('6º Frontal');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.chakra_sanskrito).toBe('Ajna');
      expect(result?.fluxo_energetico).toBe('descendente');
      expect(result?.elemento).toBe('ar');
    });

    it('should return 7º Coronário (Sahasrara) mapping for quarto-descrescente', () => {
      const result = getMoonChakra('quarto-descrescente');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Quarto Descrescente');
      expect(result?.chakra).toBe('7º Coronário');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.chakra_sanskrito).toBe('Sahasrara');
      expect(result?.fluxo_energetico).toBe('descendente');
      expect(result?.elemento).toBe('luz');
    });

    it('should return Integration mapping for lua-velha', () => {
      const result = getMoonChakra('lua-velha');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('Lua Velha (Balsâmica)');
      expect(result?.chakra).toBe('Integração de Todos os Chakras');
      expect(result?.chakra_numero).toBe(0);
      expect(result?.chakra_sanskrito).toBe('Samhara');
      expect(result?.fluxo_energetico).toBe('integrado');
      expect(result?.elemento).toBe('espírito');
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonChakra('LUA-CHEIA');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('4º Cardíaco');
    });

    it('should handle input with extra whitespace', () => {
      const result = getMoonChakra('  lua-cheia  ');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('4º Cardíaco');
    });

    it('should return null for unknown phase', () => {
      const result = getMoonChakra('unknown-phase');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getMoonChakra('');
      expect(result).toBeNull();
    });
  });

  describe('getChakraMoon', () => {
    it('should return chakra name for lua-nova', () => {
      expect(getChakraMoon('lua-nova')).toBe('1º Básico');
    });

    it('should return chakra name for lua-crescente', () => {
      expect(getChakraMoon('lua-crescente')).toBe('2º Sacro');
    });

    it('should return chakra name for quarto-crescente', () => {
      expect(getChakraMoon('quarto-crescente')).toBe('3º Plexo Solar');
    });

    it('should return chakra name for lua-cheia', () => {
      expect(getChakraMoon('lua-cheia')).toBe('4º Cardíaco');
    });

    it('should return chakra name for quarto-minguante', () => {
      expect(getChakraMoon('quarto-minguante')).toBe('5º Laríngeo');
    });

    it('should return chakra name for lua-minguante', () => {
      expect(getChakraMoon('lua-minguante')).toBe('6º Frontal');
    });

    it('should return chakra name for quarto-descrescente', () => {
      expect(getChakraMoon('quarto-descrescente')).toBe('7º Coronário');
    });

    it('should return integration chakra for lua-velha', () => {
      expect(getChakraMoon('lua-velha')).toBe('Integração de Todos os Chakras');
    });

    it('should return null for unknown phase', () => {
      expect(getChakraMoon('invalid-phase')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getChakraMoon('LUA-CHEIA')).toBe('4º Cardíaco');
    });
  });

  describe('getAllMoonChakras', () => {
    it('should return all 8 moon-chakra mappings', () => {
      const result = getAllMoonChakras();
      expect(result).toHaveLength(8);
    });

    it('should include all expected phases', () => {
      const result = getAllMoonChakras();
      const phases = result.map((r) => r.fase);
      expect(phases).toContain('Lua Nova');
      expect(phases).toContain('Lua Crescente');
      expect(phases).toContain('Quarto Crescente');
      expect(phases).toContain('Lua Cheia');
      expect(phases).toContain('Quarto Minguante');
      expect(phases).toContain('Lua Minguante');
      expect(phases).toContain('Quarto Descrescente');
      expect(phases).toContain('Lua Velha (Balsâmica)');
    });

    it('should include all chakra numbers from 0 to 7', () => {
      const result = getAllMoonChakras();
      const numbers = result.map((r) => r.chakra_numero).sort((a, b) => a - b);
      expect(numbers).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('should include all energy flow types', () => {
      const result = getAllMoonChakras();
      const flows = new Set(result.map((r) => r.fluxo_energetico));
      expect(flows.has('centripeto')).toBe(true);
      expect(flows.has('ascendente')).toBe(true);
      expect(flows.has('centrifugo')).toBe(true);
      expect(flows.has('descendente')).toBe(true);
      expect(flows.has('integrado')).toBe(true);
    });
  });

  describe('getEnergyFlowMoon', () => {
    it('should return centripeto for lua-nova', () => {
      expect(getEnergyFlowMoon('lua-nova')).toBe('centripeto');
    });

    it('should return ascendente for lua-crescente', () => {
      expect(getEnergyFlowMoon('lua-crescente')).toBe('ascendente');
    });

    it('should return ascendente for quarto-crescente', () => {
      expect(getEnergyFlowMoon('quarto-crescente')).toBe('ascendente');
    });

    it('should return centrifugo for lua-cheia', () => {
      expect(getEnergyFlowMoon('lua-cheia')).toBe('centrifugo');
    });

    it('should return descendente for quarto-minguante', () => {
      expect(getEnergyFlowMoon('quarto-minguante')).toBe('descendente');
    });

    it('should return descendente for lua-minguante', () => {
      expect(getEnergyFlowMoon('lua-minguante')).toBe('descendente');
    });

    it('should return descendente for quarto-descrescente', () => {
      expect(getEnergyFlowMoon('quarto-descrescente')).toBe('descendente');
    });

    it('should return integrado for lua-velha', () => {
      expect(getEnergyFlowMoon('lua-velha')).toBe('integrado');
    });

    it('should return null for unknown phase', () => {
      expect(getEnergyFlowMoon('unknown')).toBeNull();
    });
  });

  describe('getPracticeMoon', () => {
    it('should return primary practice for lua-cheia', () => {
      const practice = getPracticeMoon('lua-cheia');
      expect(practice).toContain('Iluminação emocional');
    });

    it('should return primary practice for lua-nova', () => {
      const practice = getPracticeMoon('lua-nova');
      expect(practice).toContain('Meditação profunda');
    });

    it('should return null for unknown phase', () => {
      expect(getPracticeMoon('invalid')).toBeNull();
    });
  });

  describe('getMoonPhasesByChakra', () => {
    it('should return phases for chakra 1 (Root)', () => {
      const result = getMoonPhasesByChakra(1);
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Nova');
    });

    it('should return phases for chakra 4 (Heart)', () => {
      const result = getMoonPhasesByChakra(4);
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Cheia');
    });

    it('should return phases for chakra 0 (Integration)', () => {
      const result = getMoonPhasesByChakra(0);
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Velha (Balsâmica)');
    });

    it('should return empty array for non-existent chakra', () => {
      const result = getMoonPhasesByChakra(8);
      expect(result).toHaveLength(0);
    });
  });

  describe('getIntentionMoon', () => {
    it('should return intention for lua-cheia', () => {
      const intention = getIntentionMoon('lua-cheia');
      expect(intention).toContain('Iluminar as emoções');
    });

    it('should return intention for lua-nova', () => {
      const intention = getIntentionMoon('lua-nova');
      expect(intention).toContain('Renovar as bases');
    });

    it('should return null for unknown phase', () => {
      expect(getIntentionMoon('invalid')).toBeNull();
    });
  });

  describe('getMoonPhasesByEnergyFlow', () => {
    it('should return phases with ascendente flow', () => {
      const result = getMoonPhasesByEnergyFlow('ascendente');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.fase)).toContain('Lua Crescente');
      expect(result.map((r) => r.fase)).toContain('Quarto Crescente');
    });

    it('should return phases with descendente flow', () => {
      const result = getMoonPhasesByEnergyFlow('descendente');
      expect(result).toHaveLength(3);
    });

    it('should return phases with integrado flow', () => {
      const result = getMoonPhasesByEnergyFlow('integrado');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Velha (Balsâmica)');
    });
  });

  describe('getElementMoon', () => {
    it('should return terra for lua-nova', () => {
      expect(getElementMoon('lua-nova')).toBe('terra');
    });

    it('should return água for lua-crescente', () => {
      expect(getElementMoon('lua-crescente')).toBe('água');
    });

    it('should return fogo for quarto-crescente', () => {
      expect(getElementMoon('quarto-crescente')).toBe('fogo');
    });

    it('should return água for lua-cheia', () => {
      expect(getElementMoon('lua-cheia')).toBe('água');
    });

    it('should return null for unknown phase', () => {
      expect(getElementMoon('invalid')).toBeNull();
    });
  });

  describe('MOON_CHAKRA_MAP structure', () => {
    it('should have 8 moon phase keys', () => {
      expect(Object.keys(MOON_CHAKRA_MAP)).toHaveLength(8);
    });

    it('should have all required moon phase keys', () => {
      const expectedKeys = [
        'lua-nova',
        'lua-crescente',
        'quarto-crescente',
        'lua-cheia',
        'quarto-minguante',
        'lua-minguante',
        'quarto-descrescente',
        'lua-velha',
      ];
      expectedKeys.forEach((key) => {
        expect(MOON_CHAKRA_MAP).toHaveProperty(key);
      });
    });

    it('should have proper practices array for all phases', () => {
      Object.values(MOON_CHAKRA_MAP).forEach((mapping: MoonChakra) => {
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.praticas.length).toBeGreaterThan(0);
      });
    });

    it('should have valid chakra numbers (0-7)', () => {
      Object.values(MOON_CHAKRA_MAP).forEach((mapping: MoonChakra) => {
        expect(mapping.chakra_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.chakra_numero).toBeLessThanOrEqual(7);
      });
    });
  });
});
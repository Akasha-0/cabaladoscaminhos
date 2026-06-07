import { describe, it, expect } from 'vitest';
import {
  getMoonZodiac,
  getAllMoonZodiacs,
  getZodiacMoon,
  getMoonPhasesByElement,
  getMoonPhasesByQuality,
  getElementByPhase,
  getEnergyByPhase,
  MOON_ZODIAC_MAP,
  type MoonZodiac,
} from '@/lib/correlation/moon-zodiac';

describe('Moon-Zodiac Correlation', () => {
  describe('getMoonZodiac', () => {
    it('should return Escorpião mapping for lua-nova', () => {
      const result = getMoonZodiac('lua-nova');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Nova');
      expect(result?.signo).toBe('Escorpião');
      expect(result?.elemento).toBe('água');
      expect(result?.qualidade).toBe('fixed');
      expect(result?.energia).toBe('receptiva');
      expect(result?.praticas).toContain('Iniciação de projetos secretos');
      expect(result?.caracteristicas).toContain('Transformação interior');
    });

    it('should return Sagitário mapping for lua-crescente', () => {
      const result = getMoonZodiac('lua-crescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Crescente');
      expect(result?.signo).toBe('Sagitário');
      expect(result?.elemento).toBe('fogo');
      expect(result?.qualidade).toBe('mutable');
      expect(result?.energia).toBe('ativa');
      expect(result?.praticas).toContain('Expansão de projetos');
    });

    it('should return Áries mapping for quarto-crescente', () => {
      const result = getMoonZodiac('quarto-crescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Quarto Crescente');
      expect(result?.signo).toBe('Áries');
      expect(result?.elemento).toBe('fogo');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.energia).toBe('ativa');
    });

    it('should return Câncer mapping for lua-cheia', () => {
      const result = getMoonZodiac('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Cheia');
      expect(result?.signo).toBe('Câncer');
      expect(result?.elemento).toBe('água');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.energia).toBe('ativa');
      expect(result?.praticas).toContain('Manifestação de desejos');
    });

    it('should return Capricórnio mapping for quarto-minguante', () => {
      const result = getMoonZodiac('quarto-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Quarto Minguante');
      expect(result?.signo).toBe('Capricórnio');
      expect(result?.elemento).toBe('terra');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.energia).toBe('transmutadora');
    });

    it('should return Libra mapping for lua-minguante', () => {
      const result = getMoonZodiac('lua-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Minguante');
      expect(result?.signo).toBe('Libra');
      expect(result?.elemento).toBe('ar');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.energia).toBe('dissolutiva');
      expect(result?.praticas).toContain('Harmonização de relacionamentos');
    });

    it('should return Aquário mapping for quarto-descrescente', () => {
      const result = getMoonZodiac('quarto-descrescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Quarto Descrescente');
      expect(result?.signo).toBe('Aquário');
      expect(result?.elemento).toBe('ar');
      expect(result?.qualidade).toBe('fixed');
      expect(result?.energia).toBe('dissolutiva');
    });

    it('should return Virgem mapping for lua-velha', () => {
      const result = getMoonZodiac('lua-velha');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Velha (Bals\u00e2mica)');
      expect(result?.signo).toBe('Virgem');
      expect(result?.elemento).toBe('terra');
      expect(result?.qualidade).toBe('mutable');
      expect(result?.energia).toBe('dissolutiva');
    });

    it('should handle case-insensitive input', () => {
      expect(getMoonZodiac('LUA-NOVA')).toBeDefined();
      expect(getMoonZodiac('Lua Cheia')).toBeDefined();
      expect(getMoonZodiac('  lua-nova  ')).toBeDefined();
    });

    it('should return null for unknown phase', () => {
      expect(getMoonZodiac('invalid-phase')).toBeNull();
      expect(getMoonZodiac('')).toBeNull();
      expect(getMoonZodiac('super-lua')).toBeNull();
    });
  });

  describe('getZodiacMoon', () => {
    it('should return the correct zodiac sign for each phase', () => {
      expect(getZodiacMoon('lua-nova')).toBe('Escorpião');
      expect(getZodiacMoon('lua-crescente')).toBe('Sagitário');
      expect(getZodiacMoon('quarto-crescente')).toBe('Áries');
      expect(getZodiacMoon('lua-cheia')).toBe('Câncer');
      expect(getZodiacMoon('quarto-minguante')).toBe('Capricórnio');
      expect(getZodiacMoon('lua-minguante')).toBe('Libra');
      expect(getZodiacMoon('quarto-descrescente')).toBe('Aquário');
      expect(getZodiacMoon('lua-velha')).toBe('Virgem');
    });

    it('should return null for unknown phase', () => {
      expect(getZodiacMoon('invalid')).toBeNull();
    });
  });

  describe('getAllMoonZodiacs', () => {
    it('should return all 8 moon-zodiac mappings', () => {
      const result = getAllMoonZodiacs();
      expect(result).toHaveLength(8);
    });

    it('should return an array with all phases', () => {
      const result = getAllMoonZodiacs();
      const fases = result.map((m) => m.fase);
      expect(fases).toContain('Lua Nova');
      expect(fases).toContain('Lua Crescente');
      expect(fases).toContain('Quarto Crescente');
      expect(fases).toContain('Lua Cheia');
      expect(fases).toContain('Quarto Minguante');
      expect(fases).toContain('Lua Minguante');
      expect(fases).toContain('Quarto Descrescente');
      expect(fases).toContain('Lua Velha (Bals\u00e2mica)');
    });
  });

  describe('getMoonPhasesByElement', () => {
    it('should return phases with água element', () => {
      const results = getMoonPhasesByElement('água');
      expect(results).toHaveLength(2);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Câncer');
    });

    it('should return phases with fogo element', () => {
      const results = getMoonPhasesByElement('fogo');
      expect(results).toHaveLength(2);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Áries');
    });

    it('should return phases with terra element', () => {
      const results = getMoonPhasesByElement('terra');
      expect(results).toHaveLength(2);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Virgem');
    });

    it('should return phases with ar element', () => {
      const results = getMoonPhasesByElement('ar');
      expect(results).toHaveLength(2);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Libra');
      expect(signos).toContain('Aquário');
    });
  });

  describe('getMoonPhasesByQuality', () => {
    it('should return phases with cardinal quality', () => {
      const results = getMoonPhasesByQuality('cardinal');
      expect(results).toHaveLength(4);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Libra');
    });

    it('should return phases with fixed quality', () => {
      const results = getMoonPhasesByQuality('fixed');
      expect(results).toHaveLength(2);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Aquário');
    });

    it('should return phases with mutable quality', () => {
      const results = getMoonPhasesByQuality('mutable');
      expect(results).toHaveLength(2);
      const signos = results.map((r) => r.signo);
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Virgem');
    });
  });

  describe('getElementByPhase', () => {
    it('should return the correct element for each phase', () => {
      expect(getElementByPhase('lua-nova')).toBe('água');
      expect(getElementByPhase('lua-crescente')).toBe('fogo');
      expect(getElementByPhase('quarto-crescente')).toBe('fogo');
      expect(getElementByPhase('lua-cheia')).toBe('água');
      expect(getElementByPhase('quarto-minguante')).toBe('terra');
      expect(getElementByPhase('lua-minguante')).toBe('ar');
      expect(getElementByPhase('quarto-descrescente')).toBe('ar');
      expect(getElementByPhase('lua-velha')).toBe('terra');
    });

    it('should return null for unknown phase', () => {
      expect(getElementByPhase('invalid')).toBeNull();
    });
  });

  describe('getEnergyByPhase', () => {
    it('should return the correct energy type for each phase', () => {
      expect(getEnergyByPhase('lua-nova')).toBe('receptiva');
      expect(getEnergyByPhase('lua-crescente')).toBe('ativa');
      expect(getEnergyByPhase('quarto-crescente')).toBe('ativa');
      expect(getEnergyByPhase('lua-cheia')).toBe('ativa');
      expect(getEnergyByPhase('quarto-minguante')).toBe('transmutadora');
      expect(getEnergyByPhase('lua-minguante')).toBe('dissolutiva');
      expect(getEnergyByPhase('quarto-descrescente')).toBe('dissolutiva');
      expect(getEnergyByPhase('lua-velha')).toBe('dissolutiva');
    });

    it('should return null for unknown phase', () => {
      expect(getEnergyByPhase('invalid')).toBeNull();
    });
  });

  describe('MOON_ZODIAC_MAP structure', () => {
    it('should have all required fields in each mapping', () => {
      const requiredFields: (keyof MoonZodiac)[] = [
        'fase',
        'signo',
        'elemento',
        'qualidade',
        'energia',
        'praticas',
        'caracteristicas',
      ];

      for (const [phase, mapping] of Object.entries(MOON_ZODIAC_MAP)) {
        for (const field of requiredFields) {
          expect(mapping[field]).toBeDefined();
        }
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.praticas.length).toBeGreaterThan(0);
        expect(Array.isArray(mapping.caracteristicas)).toBe(true);
        expect(mapping.caracteristicas.length).toBeGreaterThan(0);
      }
    });

    it('should have valid elemento values', () => {
      const validElementos: MoonZodiac['elemento'][] = [
        'fogo',
        'terra',
        'ar',
        'água',
      ];

      for (const mapping of Object.values(MOON_ZODIAC_MAP)) {
        expect(validElementos).toContain(mapping.elemento);
      }
    });

    it('should have valid qualidade values', () => {
      const validQualidades: MoonZodiac['qualidade'][] = [
        'cardinal',
        'fixed',
        'mutable',
      ];

      for (const mapping of Object.values(MOON_ZODIAC_MAP)) {
        expect(validQualidades).toContain(mapping.qualidade);
      }
    });

    it('should have valid energia values', () => {
      const validEnergias: MoonZodiac['energia'][] = [
        'receptiva',
        'ativa',
        'transmutadora',
        'dissolutiva',
      ];

      for (const mapping of Object.values(MOON_ZODIAC_MAP)) {
        expect(validEnergias).toContain(mapping.energia);
      }
    });

    it('should have unique zodiac signs', () => {
      const allSignos = Object.values(MOON_ZODIAC_MAP).map((m) => m.signo);
      const uniqueSignos = new Set(allSignos);
      expect(uniqueSignos.size).toBe(8);
    });
  });
});
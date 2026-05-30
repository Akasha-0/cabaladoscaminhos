import { describe, it, expect } from 'vitest';
import {
  getMoonOrixa,
  getOrixaMoon,
  getAllMoonOrixas,
  getAvailablePhases,
  getOrixaByEnergy,
  getElementMoon,
  getPracticeMoon,
  MOON_ORIXA_MAP,
  type MoonOrixa,
} from '@/lib/correlation/moon-orixa';

describe('Moon-Orixá Correlation', () => {
  describe('getMoonOrixa', () => {
    it('should return Exu/Omolu mapping for lua-nova', () => {
      const result = getMoonOrixa('lua-nova');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Nova');
      expect(result?.orixa_principal).toBe('Exu');
      expect(result?.orixa_secundario).toBe('Omolu');
      expect(result?.energia).toBe('receptiva');
      expect(result?.praticas).toContain('Início de projetos secretos');
      expect(result?.ebó).toContain('encruzilhadas');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Oxóssi/Ogum mapping for lua-crescente', () => {
      const result = getMoonOrixa('lua-crescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Crescente');
      expect(result?.orixa_principal).toBe('Oxóssi');
      expect(result?.orixa_secundario).toBe('Ogum');
      expect(result?.energia).toBe('ativa');
      expect(result?.praticas).toContain('Rituais de abertura de caminhos comerciais');
      expect(result?.ebó).toMatch(/prosperidade|Prosperidade/);
      expect(result?.elemento).toBe('água');
    });

    it('should return Ogum/Xangô mapping for quarto-crescente', () => {
      const result = getMoonOrixa('quarto-crescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Quarto Crescente');
      expect(result?.orixa_principal).toBe('Ogum');
      expect(result?.orixa_secundario).toBe('Xangô');
      expect(result?.energia).toBe('ativa');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Oxalá/Oxum mapping for lua-cheia', () => {
      const result = getMoonOrixa('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Cheia');
      expect(result?.orixa_principal).toBe('Oxalá');
      expect(result?.orixa_secundario).toBe('Oxum');
      expect(result?.energia).toBe('ativa');
      expect(result?.praticas).toContain('Alta magia de atração');
      expect(result?.ebó).toContain('girassóis');
      expect(result?.elemento).toBe('água');
    });

    it('should return Iansã/Omolu mapping for quarto-minguante', () => {
      const result = getMoonOrixa('quarto-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Quarto Minguante');
      expect(result?.orixa_principal).toBe('Iansã');
      expect(result?.orixa_secundario).toBe('Omolu');
      expect(result?.energia).toBe('transmutadora');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Omolu/Nanã mapping for lua-minguante', () => {
      const result = getMoonOrixa('lua-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Minguante');
      expect(result?.orixa_principal).toBe('Omolu');
      expect(result?.orixa_secundario).toBe('Nanã');
      expect(result?.energia).toBe('dissolutiva');
      expect(result?.praticas).toContain('Descarrego pesado');
      expect(result?.ebó).toMatch(/pipoca|Pipoca/);
      expect(result?.elemento).toBe('terra');
    });

    it('should return Nanã/Iansã mapping for quarto-descrescente', () => {
      const result = getMoonOrixa('quarto-descrescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Quarto Descrescente');
      expect(result?.orixa_principal).toBe('Nanã');
      expect(result?.orixa_secundario).toBe('Iansã');
      expect(result?.energia).toBe('dissolutiva');
      expect(result?.elemento).toBe('ar');
    });

    it('should return Omolu/Exu mapping for lua-velha', () => {
      const result = getMoonOrixa('lua-velha');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('Lua Velha (Balsâmica)');
      expect(result?.orixa_principal).toBe('Omolu');
      expect(result?.orixa_secundario).toBe('Exu');
      expect(result?.energia).toBe('dissolutiva');
      expect(result?.elemento).toBe('éter');
    });

    it('should handle case-insensitive input', () => {
      expect(getMoonOrixa('LUA-NOVA')).toBeDefined();
      expect(getMoonOrixa('Lua Cheia')).toBeDefined();
      expect(getMoonOrixa('  lua-nova  ')).toBeDefined();
    });

    it('should return null for unknown phase', () => {
      expect(getMoonOrixa('invalid-phase')).toBeNull();
      expect(getMoonOrixa('')).toBeNull();
      expect(getMoonOrixa('super-lua')).toBeNull();
    });
  });

  describe('getOrixaMoon', () => {
    it('should return Exu for lua-nova', () => {
      expect(getOrixaMoon('lua-nova')).toBe('Exu');
    });

    it('should return Oxóssi for lua-crescente', () => {
      expect(getOrixaMoon('lua-crescente')).toBe('Oxóssi');
    });

    it('should return Ogum for quarto-crescente', () => {
      expect(getOrixaMoon('quarto-crescente')).toBe('Ogum');
    });

    it('should return Oxalá for lua-cheia', () => {
      expect(getOrixaMoon('lua-cheia')).toBe('Oxalá');
    });

    it('should return Iansã for quarto-minguante', () => {
      expect(getOrixaMoon('quarto-minguante')).toBe('Iansã');
    });

    it('should return Omolu for lua-minguante', () => {
      expect(getOrixaMoon('lua-minguante')).toBe('Omolu');
    });

    it('should return Nanã for quarto-descrescente', () => {
      expect(getOrixaMoon('quarto-descrescente')).toBe('Nanã');
    });

    it('should return Omolu for lua-velha', () => {
      expect(getOrixaMoon('lua-velha')).toBe('Omolu');
    });

    it('should return null for unknown phase', () => {
      expect(getOrixaMoon('invalid')).toBeNull();
    });

    it('should handle case-insensitive input', () => {
      expect(getOrixaMoon('LUA-CHEIA')).toBe('Oxalá');
      expect(getOrixaMoon('  lua-nova  ')).toBe('Exu');
    });
  });

  describe('getAllMoonOrixas', () => {
    it('should return all 8 moon-orixá mappings', () => {
      const result = getAllMoonOrixas();
      expect(result).toHaveLength(8);
    });

    it('should return array with all expected phases', () => {
      const result = getAllMoonOrixas();
      const fases = result.map(m => m.fase);
      expect(fases).toContain('Lua Nova');
      expect(fases).toContain('Lua Crescente');
      expect(fases).toContain('Quarto Crescente');
      expect(fases).toContain('Lua Cheia');
      expect(fases).toContain('Quarto Minguante');
      expect(fases).toContain('Lua Minguante');
      expect(fases).toContain('Quarto Descrescente');
      expect(fases).toContain('Lua Velha (Balsâmica)');
    });

    it('should return mappings with all required fields', () => {
      const result = getAllMoonOrixas();
      for (const mapping of result) {
        expect(mapping.fase).toBeDefined();
        expect(mapping.orixa_principal).toBeDefined();
        expect(mapping.orixa_secundario).toBeDefined();
        expect(mapping.energia).toBeDefined();
        expect(mapping.praticas).toBeDefined();
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.ebó).toBeDefined();
        expect(mapping.elemento).toBeDefined();
      }
    });
  });

  describe('getAvailablePhases', () => {
    it('should return all 8 lunar phases', () => {
      const phases = getAvailablePhases();
      expect(phases).toHaveLength(8);
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

  describe('getOrixaByEnergy', () => {
    it('should return phases with receptiva energy', () => {
      const results = getOrixaByEnergy('receptiva');
      expect(results).toHaveLength(1);
      expect(results[0].fase).toBe('Lua Nova');
    });

    it('should return phases with ativa energy', () => {
      const results = getOrixaByEnergy('ativa');
      expect(results).toHaveLength(3);
      const fases = results.map((r) => r.fase);
      expect(fases).toContain('Lua Crescente');
      expect(fases).toContain('Quarto Crescente');
      expect(fases).toContain('Lua Cheia');
    });

    it('should return phases with transmutadora energy', () => {
      const results = getOrixaByEnergy('transmutadora');
      expect(results).toHaveLength(1);
      expect(results[0].fase).toBe('Quarto Minguante');
    });

    it('should return phases with dissolutiva energy', () => {
      const results = getOrixaByEnergy('dissolutiva');
      expect(results).toHaveLength(3);
      const fases = results.map((r) => r.fase);
      expect(fases).toContain('Lua Minguante');
      expect(fases).toContain('Quarto Descrescente');
      expect(fases).toContain('Lua Velha (Balsâmica)');
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

    it('should return fogo for quarto-minguante', () => {
      expect(getElementMoon('quarto-minguante')).toBe('fogo');
    });

    it('should return terra for lua-minguante', () => {
      expect(getElementMoon('lua-minguante')).toBe('terra');
    });

    it('should return ar for quarto-descrescente', () => {
      expect(getElementMoon('quarto-descrescente')).toBe('ar');
    });

    it('should return éter for lua-velha', () => {
      expect(getElementMoon('lua-velha')).toBe('éter');
    });

    it('should return null for unknown phase', () => {
      expect(getElementMoon('invalid')).toBeNull();
    });
  });

  describe('getPracticeMoon', () => {
    it('should return first practice for lua-nova', () => {
      expect(getPracticeMoon('lua-nova')).toBe('Início de projetos secretos');
    });

    it('should return first practice for lua-cheia', () => {
      expect(getPracticeMoon('lua-cheia')).toBe('Alta magia de atração');
    });

    it('should return first practice for lua-minguante', () => {
      expect(getPracticeMoon('lua-minguante')).toBe('Descarrego pesado');
    });

    it('should return null for unknown phase', () => {
      expect(getPracticeMoon('invalid')).toBeNull();
    });
  });

  describe('MOON_ORIXA_MAP structure', () => {
    it('should have all required fields in each mapping', () => {
      const requiredFields: (keyof MoonOrixa)[] = [
        'fase',
        'orixa_principal',
        'orixa_secundario',
        'energia',
        'praticas',
        'ebó',
        'elemento',
      ];

      for (const [phase, mapping] of Object.entries(MOON_ORIXA_MAP)) {
        for (const field of requiredFields) {
          expect(mapping[field]).toBeDefined();
        }
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.praticas.length).toBeGreaterThan(0);
      }
    });

    it('should have valid energia values', () => {
      const validEnergias: MoonOrixa['energia'][] = [
        'receptiva',
        'ativa',
        'transmutadora',
        'dissolutiva',
      ];

      for (const mapping of Object.values(MOON_ORIXA_MAP)) {
        expect(validEnergias).toContain(mapping.energia);
      }
    });

    it('should have valid elemento values', () => {
      const validElementos = ['terra', 'água', 'fogo', 'ar', 'éter'];

      for (const mapping of Object.values(MOON_ORIXA_MAP)) {
        expect(validElementos).toContain(mapping.elemento);
      }
    });

    it('should have 8 unique phases', () => {
      const phases = Object.keys(MOON_ORIXA_MAP);
      expect(phases).toHaveLength(8);
      const uniqueFases = new Set(Object.values(MOON_ORIXA_MAP).map(m => m.fase));
      expect(uniqueFases.size).toBe(8);
    });
  });
});
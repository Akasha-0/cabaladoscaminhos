import { describe, it, expect } from 'vitest';
import {
  getOrixaZodiac,
  getZodiacOrixa,
  getAllOrixaZodiacs,
  getAllOrixas,
  getOrixasByElement,
  getOrixasByDay,
  getOrixasByPlaneta,
  ORIXA_ZODIAC_MAP,
  type OrixaZodiac,
} from '@/lib/correlation/orixa-zodiac';

describe('orixa-zodiac', () => {
  // ─── ORIXA_ZODIAC_MAP: all Orixás ─────────────────────────────────────────────
  describe('ORIXA_ZODIAC_MAP', () => {
    it('should contain all 10 Orixás', () => {
      const orixas = Object.keys(ORIXA_ZODIAC_MAP);
      expect(orixas).toHaveLength(10);
    });

    it('should include all major Orixás', () => {
      const expectedOrixas = [
        'Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Oxóssi',
        'Xangô', 'Iansã', 'Omolu', 'Nanã', 'Oxumaré'
      ];
      const actualOrixas = Object.keys(ORIXA_ZODIAC_MAP);
      expectedOrixas.forEach(orixa => {
        expect(actualOrixas).toContain(orixa);
      });
    });

    it('should have valid zodiac signs for all Orixás', () => {
      Object.values(ORIXA_ZODIAC_MAP).forEach(mapping => {
        expect(mapping.signo).toBeDefined();
        expect(typeof mapping.signo).toBe('string');
        expect(mapping.signo.length).toBeGreaterThan(0);
      });
    });

    it('should have valid elements for all Orixás', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(ORIXA_ZODIAC_MAP).forEach(mapping => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('should have spiritual meanings for all Orixás', () => {
      Object.values(ORIXA_ZODIAC_MAP).forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('should have sacred days for all Orixás', () => {
      const validDays = [
        'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
      ];
      Object.values(ORIXA_ZODIAC_MAP).forEach(mapping => {
        expect(validDays).toContain(mapping.dia_sagrado);
      });
    });

    it('should have planets for all Orixás', () => {
      Object.values(ORIXA_ZODIAC_MAP).forEach(mapping => {
        expect(mapping.planeta_regente).toBeDefined();
        expect(mapping.planeta_regente.length).toBeGreaterThan(0);
      });
    });

    it('should be immutable', () => {
      expect(() => {
        (ORIXA_ZODIAC_MAP as Record<string, OrixaZodiac>)['test'] = {} as OrixaZodiac;
      }).toThrow();
    });
  });

  // ─── getOrixaZodiac: lookup function ─────────────────────────────────────────
  describe('getOrixaZodiac', () => {
    it('should return Oxalá with Capricórnio mapping', () => {
      const result = getOrixaZodiac('Oxalá');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.elemento).toBe('Éter');
    });

    it('should return Iemanjá with Caranguejo mapping', () => {
      const result = getOrixaZodiac('Iemanjá');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.signo).toBe('Caranguejo');
      expect(result!.elemento).toBe('Água');
    });
    it('should return Oxum with Touro mapping', () => {
      const result = getOrixaZodiac('Oxum');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxum');
      expect(result!.signo).toBe('Touro');
      expect(result!.elemento).toBe('Água');
    });

    it('should return Ogum with Áries mapping', () => {
      const result = getOrixaZodiac('Ogum');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Ogum');
      expect(result!.signo).toBe('Áries');
      expect(result!.elemento).toBe('Terra');
    });

    it('should return Oxóssi with Virgem mapping', () => {
      const result = getOrixaZodiac('Oxóssi');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxóssi');
      expect(result!.signo).toBe('Virgem');
      expect(result!.elemento).toBe('Terra');
    });

    it('should return Xangô with Leão mapping', () => {
      const result = getOrixaZodiac('Xangô');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Xangô');
      expect(result!.signo).toBe('Leão');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return Iansã with Escorpião mapping', () => {
      const result = getOrixaZodiac('Iansã');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Iansã');
      expect(result!.signo).toBe('Escorpião');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return Omolu with Capricórnio mapping', () => {
      const result = getOrixaZodiac('Omolu');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Omolu');
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.elemento).toBe('Terra');
    });

    it('should return Nanã with Peixes mapping', () => {
      const result = getOrixaZodiac('Nanã');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Nanã');
      expect(result!.signo).toBe('Peixes');
      expect(result!.elemento).toBe('Água');
    });

    it('should return Oxumaré with Gémeos mapping', () => {
      const result = getOrixaZodiac('Oxumaré');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxumaré');
      expect(result!.signo).toBe('Gémeos');
      expect(result!.elemento).toBe('Ar');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaZodiac('oxalá')?.signo).toBe('Capricórnio');
      expect(getOrixaZodiac('OXUM')?.signo).toBe('Touro');
      expect(getOrixaZodiac('iemanja')?.signo).toBe('Caranguejo');
    });
    it('should return Touro mapped to Oxum', () => {
      const result = getZodiacOrixa('Touro');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Touro');
      expect(result!.orixa).toBe('Oxum');
    });

    it('should return Áries mapped to Ogum', () => {
      const result = getZodiacOrixa('Áries');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Áries');
      expect(result!.orixa).toBe('Ogum');
    });

    it('should return Virgem mapped to Oxóssi', () => {
      const result = getZodiacOrixa('Virgem');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Virgem');
      expect(result!.orixa).toBe('Oxóssi');
    });

    it('should return Leão mapped to Xangô', () => {
      const result = getZodiacOrixa('Leão');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Leão');
      expect(result!.orixa).toBe('Xangô');
    });

    it('should return Escorpião mapped to Iansã', () => {
      const result = getZodiacOrixa('Escorpião');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Escorpião');
      expect(result!.orixa).toBe('Iansã');
    });

    it('should return Peixes mapped to Nanã', () => {
      const result = getZodiacOrixa('Peixes');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Peixes');
      expect(result!.orixa).toBe('Nanã');
    });

    it('should return Gémeos mapped to Oxumaré', () => {
      const result = getZodiacOrixa('Gémeos');
      expect(result).toBeDefined();
      expect(result!.signo).toBe('Gémeos');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('should be case-insensitive', () => {
      expect(getZodiacOrixa('cÂNCER')?.orixa).toBe('Iemanjá');
      expect(getZodiacOrixa('TOURO')?.orixa).toBe('Oxum');
    });

    it('should return undefined for unknown sign', () => {
      expect(getZodiacOrixa('UnknownSign')).toBeUndefined();
    });
  });

  // ─── getAllOrixaZodiacs: collection function ─────────────────────────────────
  describe('getAllOrixaZodiacs', () => {
    it('should return all mappings', () => {
      const all = getAllOrixaZodiacs();
      expect(all).toHaveLength(10);
    });

    it('should contain all Orixás with zodiac signs', () => {
      const all = getAllOrixaZodiacs();
      const orixaNames = all.map(m => m.orixa);
      const signNames = all.map(m => m.signo);
      
      expect(orixaNames).toContain('Oxalá');
      expect(orixaNames).toContain('Iemanjá');
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Oxóssi');
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Iansã');
      expect(orixaNames).toContain('Omolu');
      expect(orixaNames).toContain('Nanã');
      expect(orixaNames).toContain('Oxumaré');
      
      expect(signNames).toContain('Capricórnio');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Peixes');
      expect(signNames).toContain('Gémeos');
    });

    it('should return fresh array each call', () => {
      const all1 = getAllOrixaZodiacs();
      const all2 = getAllOrixaZodiacs();
      expect(all1).not.toBe(all2);
    });

    it('should have valid structure for all entries', () => {
      const all = getAllOrixaZodiacs();
      all.forEach(mapping => {
        expect(mapping.orixa).toBeDefined();
        expect(mapping.signo).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
      });
    });
  });

  // ─── getAllOrixas: Orixá names collection ────────────────────────────────────
  describe('getAllOrixas', () => {
    it('should return all 10 Orixá names', () => {
      const orixas = getAllOrixas();
      expect(orixas).toHaveLength(10);
    });

    it('should include all major Orixás', () => {
      const orixas = getAllOrixas();
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Omolu');
      expect(orixas).toContain('Nanã');
      expect(orixas).toContain('Oxumaré');
    });
  });

  // ─── getOrixasByElement ─────────────────────────────────────────────────────
  describe('getOrixasByElement', () => {
    it('should return fire Orixás', () => {
      const fire = getOrixasByElement('Fogo');
      expect(fire.length).toBeGreaterThan(0);
      fire.forEach(orixa => {
        expect(orixa.elemento).toBe('Fogo');
      });
    });

    it('should return water Orixás', () => {
      const water = getOrixasByElement('Água');
      expect(water.length).toBeGreaterThan(0);
      water.forEach(orixa => {
        expect(orixa.elemento).toBe('Água');
      });
    });

    it('should return earth Orixás', () => {
      const earth = getOrixasByElement('Terra');
      expect(earth.length).toBeGreaterThan(0);
      earth.forEach(orixa => {
        expect(orixa.elemento).toBe('Terra');
      });
    });

    it('should return air Orixás', () => {
      const air = getOrixasByElement('Ar');
      expect(air.length).toBeGreaterThan(0);
      air.forEach(orixa => {
        expect(orixa.elemento).toBe('Ar');
      });
    });

    it('should return ether Orixás', () => {
      const ether = getOrixasByElement('Éter');
      expect(ether.length).toBeGreaterThan(0);
      ether.forEach(orixa => {
        expect(orixa.elemento).toBe('Éter');
      });
    });

    it('should return empty array for invalid element', () => {
      const invalid = getOrixasByElement('InvalidElement' as any);
      expect(invalid).toHaveLength(0);
    });
  });

  // ─── getOrixasByDay ─────────────────────────────────────────────────────────
  describe('getOrixasByDay', () => {
    it('should return Tuesday Orixás', () => {
      const tuesday = getOrixasByDay('Terça-feira');
      expect(tuesday.length).toBeGreaterThan(0);
      tuesday.forEach(orixa => {
        expect(orixa.dia_sagrado).toBe('Terça-feira');
      });
    });

    it('should return Saturday Orixás', () => {
      const saturday = getOrixasByDay('Sábado');
      expect(saturday.length).toBeGreaterThan(0);
      saturday.forEach(orixa => {
        expect(orixa.dia_sagrado).toBe('Sábado');
      });
    });

    it('should be case-insensitive', () => {
      const tuesday = getOrixasByDay('terça-feira');
      const upper = getOrixasByDay('TERÇA-FEIRA');
      expect(tuesday.length).toBe(upper.length);
    });

    it('should return empty array for invalid day', () => {
      const invalid = getOrixasByDay('InvalidDay');
      expect(invalid).toHaveLength(0);
    });
  });

  // ─── getOrixasByPlaneta ─────────────────────────────────────────────────────
  describe('getOrixasByPlaneta', () => {
    it('should return Sol-ruled Orixás', () => {
      const sol = getOrixasByPlaneta('Sol');
      expect(sol.length).toBeGreaterThan(0);
      sol.forEach(orixa => {
        expect(orixa.planeta_regente).toBe('Sol');
      });
    });

    it('should return Lua-ruled Orixás', () => {
      const lua = getOrixasByPlaneta('Lua');
      expect(lua.length).toBeGreaterThan(0);
      lua.forEach(orixa => {
        expect(lua[0].planeta_regente).toBe('Lua');
      });
    });

    it('should return Marte-ruled Orixás', () => {
      const marte = getOrixasByPlaneta('Marte');
      expect(marte.length).toBeGreaterThan(0);
      marte.forEach(orixa => {
        expect(orixa.planeta_regente).toBe('Marte');
      });
    });

    it('should be case-insensitive', () => {
      const sol1 = getOrixasByPlaneta('sol');
      const sol2 = getOrixasByPlaneta('SOL');
      expect(sol1.length).toBe(sol2.length);
    });

    it('should return empty array for invalid planet', () => {
      const invalid = getOrixasByPlaneta('InvalidPlanet');
      expect(invalid).toHaveLength(0);
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('should export OrixaZodiac interface', () => {
      const mapping: OrixaZodiac = {
        orixa: 'Test',
        signo: 'Áries',
        elemento: 'Fogo',
        significado_espiritual: 'Test meaning',
        dia_sagrado: 'Terça-feira',
        planeta_regente: 'Marte',
      };
      expect(mapping.orixa).toBe('Test');
    });
  });

  // ─── Default export ─────────────────────────────────────────────────────────
  describe('default export', () => {
    it('should export all functions', async () => {
      const module = await import('@/lib/correlation/orixa-zodiac');
      expect(module.default).toBeDefined();
      expect(typeof module.default.getOrixaZodiac).toBe('function');
      expect(typeof module.default.getZodiacOrixa).toBe('function');
      expect(typeof module.default.getAllOrixaZodiacs).toBe('function');
      expect(typeof module.default.getAllOrixas).toBe('function');
      expect(typeof module.default.getOrixasByElement).toBe('function');
      expect(typeof module.default.getOrixasByDay).toBe('function');
      expect(typeof module.default.getOrixasByPlaneta).toBe('function');
    });
  });
});
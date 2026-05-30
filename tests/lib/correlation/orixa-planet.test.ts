import { describe, it, expect } from 'vitest';
import {
  getOrixaPlanet,
  getPlanetOrixa,
  getAllOrixaPlanets,
  getAllOrixas,
  hasOrixaPlanet,
  ORIXA_PLANET_MAPPINGS,
  getOrixasByElement,
  getOrixasByPlanet,
  type OrixaPlanetMapping,
} from '@/lib/correlation/orixa-planet';

describe('orixa-planet', () => {
  // ─── getOrixaPlanet: primary lookup ────────────────────────────────────────

  describe('getOrixaPlanet', () => {
    it('returns Xangô mapping with Sol', () => {
      const mapping = getOrixaPlanet('Xangô');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Xangô');
      expect(mapping!.planet).toBe('Sol');
      expect(mapping!.dia).toContain('Quarta-feira');
      expect(mapping!.cores).toContain('Amarelo');
      expect(mapping!.elemento).toBe('Fogo');
      expect(mapping!.qualidade_energetica).toBe('Quente / Radiante');
      expect(mapping!.significado_espiritual).toContain('Justiça');
    });

    it('returns Iemanjá mapping with Lua', () => {
      const mapping = getOrixaPlanet('Iemanjá');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Iemanjá');
      expect(mapping!.planet).toBe('Lua');
      expect(mapping!.dia).toBe('Segunda-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Azul Escuro', 'Branco']));
      expect(mapping!.elemento).toBe('Água');
      expect(mapping!.qualidade_energetica).toBe('Fria / Receptiva');
      expect(mapping!.significado_espiritual).toContain('Maternidade');
    });

    it('returns Ogum mapping with Marte', () => {
      const mapping = getOrixaPlanet('Ogum');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Ogum');
      expect(mapping!.planet).toBe('Marte');
      expect(mapping!.dia).toBe('Terça-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Azul Claro', 'Vermelho', 'Verde']));
      expect(mapping!.elemento).toBe('Fogo');
    });

    it('returns Oxumaré mapping with Mercúrio', () => {
      const mapping = getOrixaPlanet('Oxumaré');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Oxumaré');
      expect(mapping!.planet).toBe('Mercúrio');
      expect(mapping!.dia).toBe('Quarta-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Arco-íris', 'Amarelo', 'Verde']));
      expect(mapping!.elemento).toBe('Ar / Água');
      expect(mapping!.qualidade_energetica).toBe('Neutra / Volátil');
    });

    it('returns Oxóssi mapping with Júpiter', () => {
      const mapping = getOrixaPlanet('Oxóssi');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Oxóssi');
      expect(mapping!.planet).toBe('Júpiter');
      expect(mapping!.dia).toBe('Quinta-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Verde', 'Azul-turquesa']));
      expect(mapping!.elemento).toBe('Terra / Fogo');
    });

    it('returns Oxum mapping with Vênus', () => {
      const mapping = getOrixaPlanet('Oxum');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Oxum');
      expect(mapping!.planet).toBe('Vênus');
      expect(mapping!.dia).toContain('Sexta-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Rosa', 'Amarelo-ouro']));
      expect(mapping!.elemento).toBe('Água');
      expect(mapping!.qualidade_energetica).toBe('Fria / Magnética');
    });

    it('returns Omolu mapping with Saturno', () => {
      const mapping = getOrixaPlanet('Omolu');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Omolu');
      expect(mapping!.planet).toBe('Saturno');
      expect(mapping!.dia).toBe('Segunda-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Preto e Branco']));
      expect(mapping!.elemento).toBe('Terra');
      expect(mapping!.qualidade_energetica).toBe('Quente / Densa');
    });

    it('returns Nanã mapping with Saturno', () => {
      const mapping = getOrixaPlanet('Nanã');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Nanã');
      expect(mapping!.planet).toBe('Saturno');
      expect(mapping!.significado_espiritual).toContain('Velhice');
    });

    it('returns Iansã mapping with Marte', () => {
      const mapping = getOrixaPlanet('Iansã');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Iansã');
      expect(mapping!.planet).toBe('Marte');
      expect(mapping!.significado_espiritual).toContain('Tempestades');
    });

    it('returns Obá mapping with Vênus', () => {
      const mapping = getOrixaPlanet('Obá');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Obá');
      expect(mapping!.planet).toBe('Vênus');
    });

    it('returns Ossaim mapping with Mercúrio', () => {
      const mapping = getOrixaPlanet('Ossaim');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Ossaim');
      expect(mapping!.planet).toBe('Mercúrio');
      expect(mapping!.significado_espiritual).toContain('ervas medicinais');
    });

    it('returns Logunedé mapping with Júpiter', () => {
      const mapping = getOrixaPlanet('Logunedé');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Logunedé');
      expect(mapping!.planet).toBe('Júpiter');
    });

    it('returns Aeremi mapping with Netuno', () => {
      const mapping = getOrixaPlanet('Aeremi');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Aeremi');
      expect(mapping!.planet).toBe('Netuno');
    });

    it('returns Inhana mapping with Plutão', () => {
      const mapping = getOrixaPlanet('Inhana');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Inhana');
      expect(mapping!.planet).toBe('Plutão');
    });

    it('returns null for unknown Orixá', () => {
      expect(getOrixaPlanet('Terezinha')).toBeNull();
      expect(getOrixaPlanet('Unknown')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getOrixaPlanet('')).toBeNull();
    });

    it('is case-insensitive for lowercase lookups', () => {
      expect(getOrixaPlanet('xangô')?.planet).toBe('Sol');
      expect(getOrixaPlanet('XANGÔ')?.planet).toBe('Sol');
      expect(getOrixaPlanet('iemanjá')?.planet).toBe('Lua');
      expect(getOrixaPlanet('ogum')?.planet).toBe('Marte');
      expect(getOrixaPlanet('oxum')?.planet).toBe('Vênus');
    });
  });

  // ─── getPlanetOrixa: reverse lookup ─────────────────────────────────────────

  describe('getPlanetOrixa', () => {
    it('returns Xangô mapping for Sol', () => {
      const mapping = getPlanetOrixa('Sol');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Sol');
      expect(mapping!.orixa).toBe('Xangô');
      expect(mapping!.elemento).toBe('Fogo');
    });

    it('returns Iemanjá mapping for Lua', () => {
      const mapping = getPlanetOrixa('Lua');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Lua');
      expect(mapping!.orixa).toBe('Iemanjá');
      expect(mapping!.elemento).toBe('Água');
    });

    it('returns Ogum mapping for Marte', () => {
      const mapping = getPlanetOrixa('Marte');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Marte');
      expect(mapping!.orixa).toBe('Ogum');
    });

    it('returns Oxumaré mapping for Mercúrio', () => {
      const mapping = getPlanetOrixa('Mercúrio');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Mercúrio');
      expect(mapping!.orixa).toBe('Oxumaré');
    });

    it('returns Oxóssi mapping for Júpiter', () => {
      const mapping = getPlanetOrixa('Júpiter');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Júpiter');
      expect(mapping!.orixa).toBe('Oxóssi');
    });

    it('returns Oxum mapping for Vênus', () => {
      const mapping = getPlanetOrixa('Vênus');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Vênus');
      expect(mapping!.orixa).toBe('Oxum');
    });

    it('returns Omolu mapping for Saturno', () => {
      const mapping = getPlanetOrixa('Saturno');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Saturno');
      expect(mapping!.orixa).toBe('Omolu');
    });

    it('is case-insensitive', () => {
      expect(getPlanetOrixa('sol')?.orixa).toBe('Xangô');
      expect(getPlanetOrixa('SOL')?.orixa).toBe('Xangô');
      expect(getPlanetOrixa('lua')?.orixa).toBe('Iemanjá');
    });

    it('accepts lowercase planet names without accents', () => {
      expect(getPlanetOrixa('mercurio')?.orixa).toBe('Oxumaré');
      expect(getPlanetOrixa('jupiter')?.orixa).toBe('Oxóssi');
      expect(getPlanetOrixa('venus')?.orixa).toBe('Oxum');
      expect(getPlanetOrixa('saturno')?.orixa).toBe('Omolu');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetOrixa('Urano')).toBeNull();
      expect(getPlanetOrixa('Sol')).not.toBeNull(); // Sol is known
      expect(getPlanetOrixa('Netuno')).not.toBeNull(); // Netuno has Aeremi
    });
    it('returns null for empty string', () => {
      expect(getPlanetOrixa('')).toBeNull();
    });

    it('is inverse of getOrixaPlanet', () => {
      for (const orixa of ['Xangô', 'Iemanjá', 'Ogum', 'Oxumaré', 'Oxóssi', 'Oxum', 'Omolu']) {
        const fromOrixa = getOrixaPlanet(orixa);
        expect(fromOrixa).not.toBeNull();
        const backToPlanet = getPlanetOrixa(fromOrixa!.planet);
        expect(backToPlanet?.orixa).toBe(orixa);
      }
    });
  });

  // ─── getAllOrixaPlanets ──────────────────────────────────────────────────────

  describe('getAllOrixaPlanets', () => {
    it('returns all orixá-planet mappings', () => {
      const all = getAllOrixaPlanets();
      expect(all.length).toBeGreaterThan(7);
    });

    it('contains all expected Orixás', () => {
      const all = getAllOrixaPlanets();
      const orixas = all.map((m) => m.orixa);
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Oxumaré');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Omolu');
      expect(orixas).toContain('Nanã');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Obá');
      expect(orixas).toContain('Ossaim');
      expect(orixas).toContain('Logunedé');
      expect(orixas).toContain('Aeremi');
      expect(orixas).toContain('Inhana');
    });

    it('contains all expected planets', () => {
      const all = getAllOrixaPlanets();
      const planets = all.map((m) => m.planet);
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Saturno');
      expect(planets).toContain('Netuno');
      expect(planets).toContain('Plutão');
    });

    it('each mapping has all required fields', () => {
      const all = getAllOrixaPlanets();
      all.forEach((mapping) => {
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('planet');
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('cores');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(typeof mapping.orixa).toBe('string');
        expect(typeof mapping.planet).toBe('string');
        expect(Array.isArray(mapping.cores)).toBe(true);
        expect(mapping.cores.length).toBeGreaterThan(0);
        expect(typeof mapping.significado_espiritual).toBe('string');
      });
    });
  });

  // ─── getAllOrixas ───────────────────────────────────────────────────────────

  describe('getAllOrixas', () => {
    it('returns array of Orixá names', () => {
      const orixas = getAllOrixas();
      expect(Array.isArray(orixas)).toBe(true);
      expect(orixas.length).toBeGreaterThan(0);
    });

    it('returns same count as getAllOrixaPlanets', () => {
      expect(getAllOrixas().length).toBe(getAllOrixaPlanets().length);
    });

    it('contains all expected Orixás', () => {
      const orixas = getAllOrixas();
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Omolu');
    });
  });

  // ─── hasOrixaPlanet ─────────────────────────────────────────────────────────

  describe('hasOrixaPlanet', () => {
    it('returns true for all valid Orixás', () => {
      expect(hasOrixaPlanet('Xangô')).toBe(true);
      expect(hasOrixaPlanet('Iemanjá')).toBe(true);
      expect(hasOrixaPlanet('Ogum')).toBe(true);
      expect(hasOrixaPlanet('Oxumaré')).toBe(true);
      expect(hasOrixaPlanet('Oxóssi')).toBe(true);
      expect(hasOrixaPlanet('Oxum')).toBe(true);
      expect(hasOrixaPlanet('Omolu')).toBe(true);
      expect(hasOrixaPlanet('Nanã')).toBe(true);
      expect(hasOrixaPlanet('Iansã')).toBe(true);
      expect(hasOrixaPlanet('Obá')).toBe(true);
      expect(hasOrixaPlanet('Ossaim')).toBe(true);
      expect(hasOrixaPlanet('Logunedé')).toBe(true);
      expect(hasOrixaPlanet('Aeremi')).toBe(true);
      expect(hasOrixaPlanet('Inhana')).toBe(true);
    });

    it('returns false for unknown Orixás', () => {
      expect(hasOrixaPlanet('Terezinha')).toBe(false);
      expect(hasOrixaPlanet('Unknown')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasOrixaPlanet('')).toBe(false);
    });

    it('returns false for null/undefined-like input', () => {
      expect(hasOrixaPlanet('Null')).toBe(false);
    });
  });

  // ─── ORIXA_PLANET_MAPPINGS constant ─────────────────────────────────────────

  describe('ORIXA_PLANET_MAPPINGS', () => {
    it('is an object with all required Orixás', () => {
      expect(ORIXA_PLANET_MAPPINGS).toBeDefined();
      expect(typeof ORIXA_PLANET_MAPPINGS).toBe('object');
      expect(ORIXA_PLANET_MAPPINGS['Xangô']).toBeDefined();
      expect(ORIXA_PLANET_MAPPINGS['Xangô'].planet).toBe('Sol');
    });

    it('has frozen top-level object', () => {
      expect(Object.isFrozen(ORIXA_PLANET_MAPPINGS)).toBe(true);
    });

    it('has frozen nested objects', () => {
      Object.values(ORIXA_PLANET_MAPPINGS).forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });

    it('has no null/undefined values', () => {
      Object.entries(ORIXA_PLANET_MAPPINGS).forEach(([key, mapping]) => {
        expect(mapping, `Mapping for ${key} should not be null`).not.toBeNull();
        expect(mapping.orixa, `orixa for ${key}`).toBeDefined();
        expect(mapping.planet, `planet for ${key}`).toBeDefined();
      });
    });
  });

  // ─── OrixaPlanetMapping interface completeness ─────────────────────────────

  describe('OrixaPlanetMapping interface completeness', () => {
    it('has significado_espiritual field for all mappings', () => {
      const all = getAllOrixaPlanets();
      all.forEach((mapping) => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('all mappings have non-empty spiritual meanings', () => {
      const all = getAllOrixaPlanets();
      all.forEach((mapping) => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('all mappings have cores array with at least one color', () => {
      const all = getAllOrixaPlanets();
      all.forEach((mapping) => {
        expect(mapping.cores.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ─── getOrixasByElement ─────────────────────────────────────────────────────

  describe('getOrixasByElement', () => {
    it('returns Orixás associated with Fogo element', () => {
      const fogo = getOrixasByElement('Fogo');
      expect(fogo.length).toBeGreaterThan(0);
      fogo.forEach((m) => {
        expect(m.elemento).toContain('Fogo');
      });
      expect(fogo.find((m) => m.orixa === 'Xangô')).toBeDefined();
      expect(fogo.find((m) => m.orixa === 'Ogum')).toBeDefined();
    });

    it('returns Orixás associated with Água element', () => {
      const agua = getOrixasByElement('Água');
      expect(agua.length).toBeGreaterThan(0);
      agua.forEach((m) => {
        expect(m.elemento).toContain('Água');
      });
      expect(agua.find((m) => m.orixa === 'Iemanjá')).toBeDefined();
      expect(agua.find((m) => m.orixa === 'Oxum')).toBeDefined();
    });

    it('returns Orixás associated with Terra element', () => {
      const terra = getOrixasByElement('Terra');
      expect(terra.length).toBeGreaterThan(0);
      terra.forEach((m) => {
        expect(m.elemento).toContain('Terra');
      });
    });

    it('is case-insensitive', () => {
      const fogo1 = getOrixasByElement('Fogo');
      const fogo2 = getOrixasByElement('fogo');
      expect(fogo1.length).toBe(fogo2.length);
    });

    it('returns empty array for unknown element', () => {
      expect(getOrixasByElement('UnknownElement')).toEqual([]);
    });
  });

  // ─── getOrixasByPlanet ──────────────────────────────────────────────────────

  describe('getOrixasByPlanet', () => {
    it('returns Orixás associated with Sol', () => {
      const sol = getOrixasByPlanet('Sol');
      expect(sol.length).toBe(1);
      expect(sol[0].orixa).toBe('Xangô');
    });

    it('returns Orixás associated with Lua', () => {
      const lua = getOrixasByPlanet('Lua');
      expect(lua.length).toBe(1);
      expect(lua[0].orixa).toBe('Iemanjá');
    });

    it('returns Orixás associated with Marte', () => {
      const marte = getOrixasByPlanet('Marte');
      expect(marte.length).toBeGreaterThanOrEqual(2);
      const orixas = marte.map((m) => m.orixa);
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Iansã');
    });

    it('returns Orixás associated with Saturno', () => {
      const saturno = getOrixasByPlanet('Saturno');
      expect(saturno.length).toBeGreaterThanOrEqual(2);
      const orixas = saturno.map((m) => m.orixa);
      expect(orixas).toContain('Omolu');
      expect(orixas).toContain('Nanã');
    });

    it('returns Orixás associated with Vênus', () => {
      const venus = getOrixasByPlanet('Vênus');
      expect(venus.length).toBeGreaterThanOrEqual(2);
      const orixas = venus.map((m) => m.orixa);
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Obá');
    });

    it('is case-insensitive', () => {
      const sol1 = getOrixasByPlanet('Sol');
      const sol2 = getOrixasByPlanet('sol');
      expect(sol1.length).toBe(sol2.length);
    });

    it('returns empty array for unknown planet', () => {
      expect(getOrixasByPlanet('Urano')).toEqual([]);
    });
  });

  // ─── Integration: bidirectional lookups ─────────────────────────────────────

  describe('bidirectional orixá-planet lookups', () => {
    it('getOrixaPlanet and getPlanetOrixa are inverses for all mappings', () => {
      const all = getAllOrixaPlanets();
      all.forEach((mapping) => {
        const fromOrixa = getOrixaPlanet(mapping.orixa);
        expect(fromOrixa).not.toBeNull();
        expect(fromOrixa!.orixa).toBe(mapping.orixa);
        expect(fromOrixa!.planet).toBe(mapping.planet);

        const fromPlanet = getPlanetOrixa(mapping.planet);
        expect(fromPlanet).not.toBeNull();
        expect(fromPlanet!.planet).toBe(mapping.planet);
        // fromPlanet.orixa may differ if multiple Orixás share the planet
      });
    });

    it('consistency between getAllOrixas and getAllOrixaPlanets', () => {
      const orixNames = getAllOrixas();
      const mappings = getAllOrixaPlanets();
      expect(orixNames.length).toBe(mappings.length);
      orixNames.forEach((name) => {
        const mapping = getOrixaPlanet(name);
        expect(mapping).not.toBeNull();
      });
    });
  });
});
});